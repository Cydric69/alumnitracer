"""Self-evaluation: measurable outcomes per task, aggregated per strategy arm."""
import json
import os
import sqlite3

from . import paths, util

FIELDS = ["success", "first_pass_success", "repairs", "tests_run", "tests_failed",
          "review_rejected", "regressions", "latency_ms", "tokens", "agents_used",
          "skills_loaded", "delegation_overhead_ms"]


def connect(db_path=None):
    path = db_path or paths.state("metrics.db")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    con = sqlite3.connect(path)
    con.row_factory = sqlite3.Row
    con.executescript("""
    CREATE TABLE IF NOT EXISTS runs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_id INTEGER, arm TEXT DEFAULT 'champion', policy_id INTEGER,
        depth INTEGER, risk TEXT, payload TEXT, at TEXT);
    """)
    con.commit()
    return con


def record(con, task_id, arm="champion", policy_id=None, depth=None, risk=None, **kw):
    payload = {k: kw.get(k) for k in FIELDS if k in kw}
    con.execute("INSERT INTO runs (task_id, arm, policy_id, depth, risk, payload, at) VALUES (?,?,?,?,?,?,?)",
                (task_id, arm, policy_id, depth, risk, json.dumps(payload), util.now()))
    con.commit()
    return payload


def aggregate(con, arm=None, policy_id=None):
    q = "SELECT payload FROM runs WHERE 1=1"
    args = []
    if arm:
        q += " AND arm=?"
        args.append(arm)
    if policy_id is not None:
        q += " AND policy_id=?"
        args.append(policy_id)
    rows = [json.loads(r["payload"]) for r in con.execute(q, args)]
    if not rows:
        return {"n": 0}
    out = {"n": len(rows)}
    for f in FIELDS:
        vals = [r[f] for r in rows if isinstance(r.get(f), (int, float))]
        if vals:
            out[f] = round(sum(vals) / float(len(vals)), 4)
    return out
