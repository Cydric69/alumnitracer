"""Structured artifact handoff between agents.

Agents exchange artifacts, not transcripts. Every agent result is validated against
the output contract before the next stage may consume it.
"""
import json
import os

from . import paths, util

REQUIRED = ["status", "summary"]
OPTIONAL_DEFAULTS = {
    "files_changed": [], "tests_run": 0, "tests_passed": 0, "tests_failed": 0,
    "evidence": [], "risks": [], "remaining_work": [], "next_action": None,
    "skills_loaded": [], "uncertainties": [],
}
VALID_STATUS = {"ok", "partial", "failed", "blocked", "needs_review"}


def validate(payload):
    problems = []
    for field in REQUIRED:
        if not payload.get(field):
            problems.append("missing required field '%s'" % field)
    status = payload.get("status")
    if status and status not in VALID_STATUS:
        problems.append("status '%s' not in %s" % (status, sorted(VALID_STATUS)))
    if payload.get("status") == "ok" and payload.get("tests_failed", 0):
        problems.append("status 'ok' with %s failing tests" % payload["tests_failed"])
    if payload.get("status") == "ok" and payload.get("remaining_work"):
        problems.append("status 'ok' while remaining_work is non-empty")
    return problems


def write(task_id, agent, payload, root=None):
    doc = dict(OPTIONAL_DEFAULTS)
    doc.update(payload or {})
    problems = validate(doc)
    if problems:
        raise ValueError("invalid artifact from %s: %s" % (agent, "; ".join(problems)))
    doc["agent"] = agent
    doc["task_id"] = task_id
    doc["at"] = util.now()
    base = root or paths.state("artifacts")
    d = os.path.join(base, str(task_id))
    os.makedirs(d, exist_ok=True)
    path = os.path.join(d, "%s.json" % agent)
    util.save_json(path, doc)
    return path


def read(task_id, agent=None, root=None):
    base = root or paths.state("artifacts")
    d = os.path.join(base, str(task_id))
    if not os.path.isdir(d):
        return {} if agent else []
    if agent:
        return util.load_json(os.path.join(d, "%s.json" % agent), default={})
    return [util.load_json(os.path.join(d, f)) for f in sorted(os.listdir(d)) if f.endswith(".json")]


def context_pack(task, artifacts, max_chars=6000):
    """Minimum sufficient context for the next agent: spec, criteria, evidence - not transcripts."""
    pack = {
        "task": {"id": task.get("id"), "title": task.get("title"), "body": task.get("body")},
        "acceptance_criteria": task.get("acceptance_criteria") or [],
        "prior": [{"agent": a.get("agent"), "status": a.get("status"), "summary": a.get("summary"),
                   "files_changed": a.get("files_changed", [])[:20],
                   "tests_failed": a.get("tests_failed", 0),
                   "risks": a.get("risks", [])[:5],
                   "next_action": a.get("next_action")} for a in artifacts],
    }
    def size():
        return len(json.dumps(pack))

    # Shed detail in order of expendability, and stop the moment a pass stops helping.
    # (An earlier version halved summaries with a floor of 80 and a "..." suffix, so it
    # oscillated at 83 chars forever.)
    if size() > max_chars:
        for p in pack["prior"]:
            p.pop("files_changed", None)
    if size() > max_chars:
        for p in pack["prior"]:
            p["risks"] = p.get("risks", [])[:1]
    for _ in range(64):
        if size() <= max_chars:
            break
        before = size()
        longest = max(pack["prior"], key=lambda p: len(str(p.get("summary", ""))),
                      default=None)
        body = str(longest.get("summary", "")) if longest else ""
        if len(body) > 40:
            longest["summary"] = body[:max(40, len(body) // 2)]
        else:
            pack["task"]["body"] = str(pack["task"].get("body", ""))[:120]
            pack["acceptance_criteria"] = pack["acceptance_criteria"][:3]
        if size() >= before:
            break
    return pack
