"""Learning system: observe -> pattern -> hypothesis -> candidate -> experiment ->
measure -> promote/reject, with versioned, reversible policies.

Memory tiers:
  WORKING  - in-flight task context (queue.tasks)
  EPISODIC - observations table (what happened, per task)
  SEMANTIC - patterns table (recurring generalisations)
  POLICY   - policies table (behaviour that actually changes future decisions)
"""
import json
import os
import sqlite3
from collections import Counter

from . import metrics, paths, policy, util

MIN_OBSERVATIONS = 3
MIN_EXPERIMENT_RUNS = 3
COST_TOLERANCE = 1.20  # a challenger may cost up to 20% more if quality clearly improves


def connect(db_path=None):
    path = db_path or paths.state("learning.db")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    con = sqlite3.connect(path)
    con.row_factory = sqlite3.Row
    con.executescript("""
    CREATE TABLE IF NOT EXISTS observations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_id INTEGER, kind TEXT, key TEXT, value TEXT, at TEXT);
    CREATE TABLE IF NOT EXISTS patterns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        kind TEXT, key TEXT, count INTEGER, first_seen TEXT, last_seen TEXT,
        UNIQUE(kind, key));
    CREATE TABLE IF NOT EXISTS policies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        kind TEXT, key TEXT, scope TEXT, value TEXT,
        status TEXT,              -- challenger | champion | rejected | rolled_back
        version INTEGER DEFAULT 1,
        reason TEXT, evidence TEXT, source_task INTEGER,
        prev_id INTEGER, created_at TEXT, decided_at TEXT);
    """)
    con.commit()
    return con


def observe(con, task_id, kind, key, value=None):
    con.execute("INSERT INTO observations (task_id, kind, key, value, at) VALUES (?,?,?,?,?)",
                (task_id, kind, key, json.dumps(value) if value is not None else None, util.now()))
    con.execute("""INSERT INTO patterns (kind, key, count, first_seen, last_seen) VALUES (?,?,1,?,?)
                   ON CONFLICT(kind, key) DO UPDATE SET count=count+1, last_seen=excluded.last_seen""",
                (kind, key, util.now(), util.now()))
    con.commit()


def patterns(con, min_count=MIN_OBSERVATIONS):
    return [dict(r) for r in con.execute(
        "SELECT * FROM patterns WHERE count >= ? ORDER BY count DESC", (min_count,))]


def hypothesize(con, min_count=MIN_OBSERVATIONS):
    """Turn recurring observations into candidate policies (not yet applied)."""
    out = []
    for pat in patterns(con, min_count):
        kind, key = pat["kind"], pat["key"]
        if kind == "missing_skill":
            scope, _, skill = key.partition("|")
            out.append({"kind": "skill_boost", "key": skill, "scope": scope, "value": 4.0,
                        "reason": "'%s' tasks needed '%s' %d times but it was not routed"
                                  % (scope, skill, pat["count"]), "evidence": pat})
        elif kind == "unused_skill":
            scope, _, skill = key.partition("|")
            out.append({"kind": "skill_suppress", "key": skill, "scope": scope, "value": 2.0,
                        "reason": "'%s' loaded '%s' %d times without using it" % (scope, skill, pat["count"]),
                        "evidence": pat})
        elif kind == "underclassified":
            out.append({"kind": "level_bump", "key": key, "scope": key, "value": 1,
                        "reason": "'%s' tasks were reclassified upward %d times" % (key, pat["count"]),
                        "evidence": pat})
        elif kind == "repair_loop":
            out.append({"kind": "depth_floor", "key": key, "scope": key, "value": 3,
                        "reason": "'%s' tasks needed repeated repair %d times" % (key, pat["count"]),
                        "evidence": pat})
    return out


def propose(con, kind, key, scope, value, reason, evidence=None, source_task=None):
    """Register a challenger. The safety floor rejects unsafe candidates outright."""
    ok, why = policy.check_safe(kind, key, value)
    if not ok:
        con.execute("""INSERT INTO policies (kind,key,scope,value,status,reason,evidence,source_task,created_at,decided_at)
                       VALUES (?,?,?,?,'rejected',?,?,?,?,?)""",
                    (kind, key, scope, json.dumps(value), "SAFETY FLOOR: " + why,
                     json.dumps(evidence or {}), source_task, util.now(), util.now()))
        con.commit()
        return {"accepted": False, "reason": why}
    champ = con.execute("SELECT * FROM policies WHERE kind=? AND key=? AND scope=? AND status='champion'",
                        (kind, key, scope)).fetchone()
    cur = con.execute("""INSERT INTO policies (kind,key,scope,value,status,version,reason,evidence,source_task,prev_id,created_at)
                         VALUES (?,?,?,?,'challenger',?,?,?,?,?,?)""",
                      (kind, key, scope, json.dumps(value),
                       (champ["version"] + 1) if champ else 1, reason,
                       json.dumps(evidence or {}), source_task,
                       champ["id"] if champ else None, util.now()))
    con.commit()
    return {"accepted": True, "policy_id": cur.lastrowid, "reason": reason}


def active(con):
    """Champion policies - the ones that actually change behaviour right now."""
    out = []
    for r in con.execute("SELECT * FROM policies WHERE status='champion' ORDER BY id"):
        d = dict(r)
        d["value"] = json.loads(d["value"])
        out.append(d)
    return out


def challengers(con):
    out = []
    for r in con.execute("SELECT * FROM policies WHERE status='challenger' ORDER BY id"):
        d = dict(r)
        d["value"] = json.loads(d["value"])
        out.append(d)
    return out


def _quality(agg):
    """Higher is better. Missing fields are treated neutrally."""
    g = lambda k, d: agg.get(k, d)
    return (g("success", 0.0) * 3.0 + g("first_pass_success", 0.0) * 2.0
            - g("repairs", 0.0) * 0.5 - g("review_rejected", 0.0) * 1.0
            - g("regressions", 0.0) * 2.0 - g("tests_failed", 0.0) * 0.2)


def compare(mcon, policy_id):
    champ = metrics.aggregate(mcon, arm="champion")
    chal = metrics.aggregate(mcon, arm="challenger", policy_id=policy_id)
    if chal.get("n", 0) < MIN_EXPERIMENT_RUNS or champ.get("n", 0) < 1:
        return {"decision": "insufficient_evidence", "champion": champ, "challenger": chal}
    qc, qk = _quality(champ), _quality(chal)
    cost_c = champ.get("tokens") or champ.get("latency_ms") or 1.0
    cost_k = chal.get("tokens") or chal.get("latency_ms") or 1.0
    decision = "reject"
    if qk > qc and cost_k <= cost_c * COST_TOLERANCE:
        decision = "promote"
    elif qk == qc and cost_k < cost_c:
        decision = "promote"
    return {"decision": decision, "champion": champ, "challenger": chal,
            "quality": {"champion": round(qc, 3), "challenger": round(qk, 3)},
            "cost": {"champion": cost_c, "challenger": cost_k}}


def promote(con, policy_id, evidence=None):
    row = con.execute("SELECT * FROM policies WHERE id=?", (policy_id,)).fetchone()
    if not row:
        raise ValueError("no such policy %s" % policy_id)
    ok, why = policy.check_safe(row["kind"], row["key"], json.loads(row["value"]))
    if not ok:
        con.execute("UPDATE policies SET status='rejected', reason=?, decided_at=? WHERE id=?",
                    ("SAFETY FLOOR: " + why, util.now(), policy_id))
        con.commit()
        return {"promoted": False, "reason": why}
    if row["prev_id"]:
        con.execute("UPDATE policies SET status='rolled_back', decided_at=? WHERE id=?",
                    (util.now(), row["prev_id"]))
    con.execute("UPDATE policies SET status='champion', decided_at=?, evidence=? WHERE id=?",
                (util.now(), json.dumps(evidence or json.loads(row["evidence"] or "{}")), policy_id))
    con.commit()
    return {"promoted": True, "policy_id": policy_id}


def reject(con, policy_id, reason="evidence did not support promotion"):
    con.execute("UPDATE policies SET status='rejected', reason=?, decided_at=? WHERE id=?",
                (reason, util.now(), policy_id))
    con.commit()
    return {"rejected": True, "policy_id": policy_id, "reason": reason}


def rollback(con, policy_id, reason="manual rollback"):
    """Every learned policy is reversible: demote it and restore its predecessor."""
    row = con.execute("SELECT * FROM policies WHERE id=?", (policy_id,)).fetchone()
    if not row:
        raise ValueError("no such policy %s" % policy_id)
    con.execute("UPDATE policies SET status='rolled_back', reason=?, decided_at=? WHERE id=?",
                (reason, util.now(), policy_id))
    restored = None
    if row["prev_id"]:
        con.execute("UPDATE policies SET status='champion', decided_at=? WHERE id=?",
                    (util.now(), row["prev_id"]))
        restored = row["prev_id"]
    con.commit()
    return {"rolled_back": policy_id, "restored": restored, "reason": reason}


def cycle(con, mcon, auto_promote=True, min_count=MIN_OBSERVATIONS):
    """One turn of the whole loop, from recorded evidence to a behaviour change.

    observe (already done by the hooks) -> pattern -> hypothesis -> challenger ->
    experiment (the prompt hook samples arms) -> measure -> promote or reject.
    Returns exactly what happened, including why nothing happened.
    """
    report = {"proposed": [], "rejected_unsafe": [], "decisions": [], "pending": [],
              "patterns": len(patterns(con, min_count))}

    existing = set((p["kind"], p["key"], p["scope"]) for p in
                   active(con) + challengers(con))
    for cand in hypothesize(con, min_count):
        sig = (cand["kind"], cand["key"], cand.get("scope", ""))
        if sig in existing:
            continue
        res = propose(con, cand["kind"], cand["key"], cand.get("scope", ""), cand["value"],
                      cand["reason"], cand.get("evidence"))
        if res["accepted"]:
            report["proposed"].append({"policy_id": res["policy_id"], "kind": cand["kind"],
                                       "key": cand["key"], "reason": cand["reason"]})
            existing.add(sig)
        else:
            report["rejected_unsafe"].append({"kind": cand["kind"], "key": cand["key"],
                                              "reason": res["reason"]})

    for chal in challengers(con):
        cmp_ = compare(mcon, chal["id"])
        entry = {"policy_id": chal["id"], "kind": chal["kind"], "key": chal["key"],
                 "decision": cmp_["decision"], "runs": cmp_.get("challenger", {}).get("n", 0)}
        if cmp_["decision"] == "promote" and auto_promote:
            entry["result"] = promote(con, chal["id"], cmp_)
        elif cmp_["decision"] == "reject":
            entry["result"] = reject(con, chal["id"], "challenger lost on measured evidence")
        else:
            report["pending"].append(entry)
            continue
        report["decisions"].append(entry)
    report["champions"] = [{"id": p["id"], "kind": p["kind"], "key": p["key"],
                            "scope": p["scope"], "value": p["value"]} for p in active(con)]
    return report


def history(con):
    return [dict(r) for r in con.execute("SELECT * FROM policies ORDER BY id")]
