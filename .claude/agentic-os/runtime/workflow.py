"""Adaptive engineering workflow: planning, repair bounds and the completion audit.

This module is a planner and state machine. It decides *what* should happen and
records *what did*; the reasoning work itself is performed by the agents Claude Code
runs. It does not claim to execute agents on its own or in the background.
"""
from . import adapter, artifacts, classify, models, paths, router, util

TRIVIAL_MAX_LEVEL = 1


def plan(task_text, file_count=0, agent_hint=None, policies=(), adapter_data=None):
    c = classify.classify(task_text, file_count, policies)
    if adapter_data is None:
        try:
            adapter_data = adapter.load(paths.p("adapter.json"))
        except Exception:
            adapter_data = {}
    stages = []
    for agent in c["agents"]:
        r = router.route(task_text, agent=agent, budget=c["skill_budget"],
                         adapter=adapter_data, policies=policies)
        m = models.route(c["difficulty"]["level"], c["risk"]["level"], agent)
        stages.append({"agent": agent, "model": m["model"], "tier": m["tier"],
                       "skills": r["loaded"], "skill_paths": r["paths"],
                       "skill_scores": r["scores"]})
    wf = util.load_json(paths.config("workflow.json"))
    return {
        "classification": c,
        "workflow": c["workflow"],
        "stages": stages,
        "delegate": c["delegate"] and c["difficulty"]["level"] > TRIVIAL_MAX_LEVEL,
        "direct_execution_reason": None if c["delegate"] else
            "level %d task: delegation would cost more than it returns" % c["difficulty"]["level"],
        "max_repair_attempts": wf["max_repair_attempts"],
        "test_first": "RED" in c["workflow"],
    }


def repair_decision(attempts, max_attempts, same_failure):
    """Bounded repair. Repeated identical failure changes strategy rather than retrying."""
    if attempts >= max_attempts:
        return {"action": "ESCALATE", "why": "repair budget of %d exhausted" % max_attempts}
    if same_failure and attempts >= 2:
        return {"action": "CHANGE_STRATEGY",
                "why": "the same failure survived %d repairs; the diagnosis is wrong" % attempts}
    return {"action": "REPAIR", "why": "attempt %d of %d" % (attempts + 1, max_attempts)}


AUDIT_QUESTIONS = [
    ("request", "What did the user actually request?"),
    ("definition_of_done", "What defines done for this request?"),
    ("evidence", "What evidence proves each requirement is met?"),
    ("unverified", "What remains unverified?"),
    ("failures", "What failed?"),
    ("repairs", "What was repaired, and was the root cause fixed?"),
    ("avoidance", "Was any difficult part of the request quietly avoided?"),
    ("scope_creep", "Was work added that the user did not ask for?"),
]


def completion_audit(task, agent_artifacts, criteria=()):
    """Return a verdict. COMPLETED requires evidence for every acceptance criterion."""
    findings = []
    covered = []
    evidence_blob = " ".join(
        [str(a.get("summary", "")) for a in agent_artifacts]
        + [str(e) for a in agent_artifacts for e in a.get("evidence", [])]).lower()
    for crit in criteria:
        # ponytail: word-overlap heuristic; a majority of the criterion's significant
        # words must appear in the evidence. It flags gaps for a human, it does not judge.
        words = [w.strip(".,;:()") for w in crit.lower().split() if len(w) > 4]
        hits = [w for w in words if w in evidence_blob]
        if words and len(hits) >= max(2, int(len(words) * 0.5)):
            covered.append(crit)
        else:
            findings.append("no evidence for acceptance criterion: %s" % crit)
    for a in agent_artifacts:
        if a.get("tests_failed"):
            findings.append("%s reports %s failing tests" % (a.get("agent"), a["tests_failed"]))
        if a.get("remaining_work"):
            findings.append("%s reports remaining work: %s" % (a.get("agent"), a["remaining_work"][:3]))
        if a.get("status") in ("failed", "blocked"):
            findings.append("%s finished with status %s" % (a.get("agent"), a.get("status")))
        if a.get("uncertainties"):
            findings.append("%s left uncertainties unresolved: %s" % (a.get("agent"), a["uncertainties"][:3]))
    if criteria and not any(a.get("tests_run") for a in agent_artifacts):
        findings.append("no test was run for a task with acceptance criteria")
    verdict = "COMPLETED" if not findings else ("PARTIAL" if covered else "FAILED")
    return {"verdict": verdict, "criteria_covered": covered, "findings": findings,
            "questions": [q for _k, q in AUDIT_QUESTIONS], "audited_at": util.now()}


def summarize(task, agent_artifacts):
    return artifacts.context_pack(task, agent_artifacts)
