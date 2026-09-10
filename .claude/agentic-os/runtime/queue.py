"""Persistent task queue (SQLite). Survives session loss.

Statuses form the task lifecycle; dependencies gate readiness; a failed task never
stops unrelated work.
"""
import json
import os
import sqlite3

from . import paths, util

STATUSES = ["QUEUED", "CLASSIFYING", "PLANNED", "READY", "RUNNING", "TESTING", "REPAIRING",
            "REVIEWING", "FINAL_VALIDATION", "COMPLETED", "PARTIAL", "WAITING_DEPENDENCY",
            "WAITING_APPROVAL", "BLOCKED", "PAUSED", "FAILED", "ESCALATED", "CANCELLED"]
TERMINAL = {"COMPLETED", "CANCELLED"}
UNSATISFIED = {"FAILED", "BLOCKED", "ESCALATED", "CANCELLED", "PARTIAL"}
SCHEMA_VERSION = 1


def connect(db_path=None):
    path = db_path or paths.state("queue.db")
    d = os.path.dirname(path)
    if d:
        os.makedirs(d, exist_ok=True)
    con = sqlite3.connect(path)
    con.row_factory = sqlite3.Row
    con.execute("PRAGMA journal_mode=WAL")
    con.execute("PRAGMA foreign_keys=ON")
    con.executescript("""
    CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT);
    CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        body TEXT DEFAULT '',
        status TEXT NOT NULL DEFAULT 'QUEUED',
        depth INTEGER DEFAULT 1,
        risk TEXT DEFAULT 'normal',
        agent TEXT,
        model TEXT,
        classification TEXT,
        skills TEXT,
        result TEXT,
        attempts INTEGER DEFAULT 0,
        created_at TEXT, updated_at TEXT
    );
    CREATE TABLE IF NOT EXISTS deps (
        task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        depends_on INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        kind TEXT DEFAULT 'explicit',
        PRIMARY KEY (task_id, depends_on)
    );
    CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_id INTEGER, kind TEXT, detail TEXT, at TEXT
    );
    """)
    con.execute("INSERT OR IGNORE INTO meta VALUES ('schema_version', ?)", (str(SCHEMA_VERSION),))
    con.commit()
    return con


def add(con, title, body="", depends_on=(), depth=1, risk="normal", agent=None, classification=None):
    cur = con.execute(
        "INSERT INTO tasks (title, body, status, depth, risk, agent, classification, created_at, updated_at)"
        " VALUES (?,?,?,?,?,?,?,?,?)",
        (title, body, "QUEUED", depth, risk, agent,
         json.dumps(classification) if classification else None, util.now(), util.now()))
    tid = cur.lastrowid
    for dep in depends_on:
        con.execute("INSERT OR IGNORE INTO deps VALUES (?,?,'explicit')", (tid, int(dep)))
    infer(con, tid, title)
    log(con, tid, "created", title)
    con.commit()
    return tid


INFER_RULES = [("test", ("build", "implement", "add", "create")),
               ("review", ("build", "implement", "test", "add")),
               ("deploy", ("test", "review"))]


def infer(con, task_id, title):
    """Infer dependencies: 'test X' waits on an open 'build X' with overlapping subject."""
    low = title.lower()
    words = set(w for w in low.replace("-", " ").split() if len(w) > 3)
    for verb, prereqs in INFER_RULES:
        if not low.startswith(verb) and (" %s " % verb) not in low:
            continue
        for row in con.execute("SELECT id, title FROM tasks WHERE id != ? AND status NOT IN ('COMPLETED','CANCELLED')",
                               (task_id,)):
            other = row["title"].lower()
            if not any(other.startswith(p) or (" %s " % p) in other for p in prereqs):
                continue
            ow = set(w for w in other.replace("-", " ").split() if len(w) > 3)
            if words & ow:
                con.execute("INSERT OR IGNORE INTO deps VALUES (?,?,'inferred')", (task_id, row["id"]))


def blockers(con, task_id):
    out = []
    for row in con.execute(
            "SELECT t.id, t.status FROM deps d JOIN tasks t ON t.id = d.depends_on WHERE d.task_id = ?",
            (task_id,)):
        if row["status"] != "COMPLETED":
            out.append({"id": row["id"], "status": row["status"],
                        "permanent": row["status"] == "CANCELLED"})
    return out


def ready(con):
    """Tasks that may run now. Failure of one task never hides an independent one."""
    out = []
    for row in con.execute("SELECT * FROM tasks WHERE status IN ('QUEUED','READY','PLANNED','PAUSED') ORDER BY id"):
        b = blockers(con, row["id"])
        if b:
            if row["status"] != "WAITING_DEPENDENCY":
                set_status(con, row["id"], "WAITING_DEPENDENCY",
                           "waiting on %s" % ",".join(str(x["id"]) for x in b))
            continue
        out.append(dict(row))
    return out


def set_status(con, task_id, status, detail=""):
    if status not in STATUSES:
        raise ValueError("unknown status %s" % status)
    con.execute("UPDATE tasks SET status=?, updated_at=? WHERE id=?", (status, util.now(), task_id))
    log(con, task_id, "status", "%s %s" % (status, detail))
    if status == "COMPLETED":
        # wake dependents that were parked
        for row in con.execute("SELECT task_id FROM deps WHERE depends_on=?", (task_id,)):
            dep_id = row["task_id"]
            if not blockers(con, dep_id):
                con.execute("UPDATE tasks SET status='READY', updated_at=? WHERE id=? AND status='WAITING_DEPENDENCY'",
                            (util.now(), dep_id))
    if status == "CANCELLED":
        # A cancelled prerequisite never completes, so a dependent waiting on it waits
        # forever. Mark it BLOCKED with the reason instead of leaving it silently parked.
        for row in con.execute("SELECT task_id FROM deps WHERE depends_on=?", (task_id,)):
            dep_id = row["task_id"]
            cur = con.execute("SELECT status FROM tasks WHERE id=?", (dep_id,)).fetchone()
            if cur and cur["status"] not in TERMINAL:
                con.execute("UPDATE tasks SET status='BLOCKED', updated_at=? WHERE id=?",
                            (util.now(), dep_id))
                log(con, dep_id, "status",
                    "BLOCKED prerequisite %s was cancelled" % task_id)
    if status in ("FAILED", "BLOCKED", "ESCALATED"):
        for row in con.execute("SELECT task_id FROM deps WHERE depends_on=?", (task_id,)):
            con.execute("UPDATE tasks SET status='WAITING_DEPENDENCY', updated_at=? WHERE id=? AND status NOT IN ('COMPLETED','CANCELLED')",
                        (util.now(), row["task_id"]))
    con.commit()


def record(con, task_id, **fields):
    allowed = {"agent", "model", "skills", "result", "classification", "depth", "risk", "attempts"}
    sets, vals = [], []
    for k, v in fields.items():
        if k not in allowed:
            continue
        sets.append("%s=?" % k)
        vals.append(json.dumps(v) if isinstance(v, (dict, list)) else v)
    if not sets:
        return
    vals.extend([util.now(), task_id])
    con.execute("UPDATE tasks SET %s, updated_at=? WHERE id=?" % ", ".join(sets), vals)
    con.commit()


def log(con, task_id, kind, detail):
    con.execute("INSERT INTO events (task_id, kind, detail, at) VALUES (?,?,?,?)",
                (task_id, kind, str(detail)[:2000], util.now()))


def get(con, task_id):
    row = con.execute("SELECT * FROM tasks WHERE id=?", (task_id,)).fetchone()
    return dict(row) if row else None


def listing(con, status=None):
    if status:
        rows = con.execute("SELECT * FROM tasks WHERE status=? ORDER BY id", (status,))
    else:
        rows = con.execute("SELECT * FROM tasks ORDER BY id")
    out = []
    for r in rows:
        d = dict(r)
        d["blockers"] = [b["id"] for b in blockers(con, r["id"])]
        out.append(d)
    return out


def stats(con):
    counts = {}
    for row in con.execute("SELECT status, COUNT(*) c FROM tasks GROUP BY status"):
        counts[row["status"]] = row["c"]
    return {"total": sum(counts.values()), "by_status": counts}
