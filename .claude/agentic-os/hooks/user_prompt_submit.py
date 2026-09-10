#!/usr/bin/env python3
"""UserPromptSubmit: run the Agentic OS on every prompt, automatically.

Classifies the prompt, routes the minimum sufficient skill set, and injects the plan plus
the skill content as context - so no one has to remember to call `aos plan`. Trivial
prompts get one line; everything else gets the workflow it needs.

Fails open and silent: a broken runtime must never block a prompt.
"""
import hashlib
import json
import os
import sys
import time

import _boot

FRONT = "---"


def _cfg(root):
    try:
        with open(os.path.join(root, "config", "auto.json")) as fh:
            return json.load(fh)
    except (IOError, OSError, ValueError):
        return {"enabled": True, "min_prompt_chars": 12, "skip_prefixes": ["/"],
                "quiet_below_level": 2, "inline_skill_budget_chars": 14000,
                "max_inlined_skills": 5}


PASTE_MARKERS = ("\u23fa", "\u23bf", "\u2387", "Loaded .claude/", "$ ", "  \u23bf  ",
                 "User answered Claude's questions", "Searched for", "\u2192")


def task_text(prompt, cfg):
    """What the user is asking for, not everything they pasted.

    A pasted transcript or log is context: it is full of nouns from other tasks and it
    inflates both the level and the skill set. Classify on the parts a person actually
    typed - the opening and the closing lines - and cap what is considered.
    """
    text = (prompt or "").strip()
    cap = int(cfg.get("classify_char_cap", 600))
    if len(text) <= cap:
        return text
    looks_pasted = sum(text.count(m) for m in PASTE_MARKERS) >= 2
    lines = [ln for ln in text.split("\n") if ln.strip()]
    if looks_pasted:
        # The ask leads; the paste follows. Keep the opening line, and a trailing line only
        # when it reads like something a person typed rather than transcript tail.
        keep = lines[:1]
        for ln in reversed(lines[1:]):
            body = ln.strip()
            if ln[:1].isspace() or len(body) > 200 or body.startswith(("-", "$", "\u23fa", "\u23bf")):
                continue
            if body.endswith(("?", ".", "!")):
                keep.append(body)
            break
        return "\n".join(keep)[:cap]
    return (text[:cap // 2] + " " + text[-cap // 2:])


def _body(path):
    """Skill text without its frontmatter."""
    try:
        with open(path, errors="replace") as fh:
            text = fh.read()
    except (IOError, OSError):
        return ""
    if text.startswith(FRONT):
        end = text.find("\n---", 3)
        if end != -1:
            text = text[end + 4:]
    return text.strip()


def build_context(root, prompt):
    sys.path.insert(0, root)
    os.environ.setdefault("AOS_HOME", root)
    from runtime import adapter, learning, paths, workflow  # noqa: E402

    cfg = _cfg(root)
    if not cfg.get("enabled", True):
        return None
    text = (prompt or "").strip()
    if len(text) < cfg.get("min_prompt_chars", 12):
        return None
    if any(text.startswith(p) for p in cfg.get("skip_prefixes", [])):
        return None

    arm, policy_id = "champion", None
    try:
        lcon = learning.connect()
        policies = learning.active(lcon)
        # Challenger sampling: half the turns run the candidate policy, so the
        # comparison has two real arms instead of one arm and a hypothesis.
        pending = learning.challengers(lcon)
        if pending:
            cand = pending[0]
            bucket = int(hashlib.sha1(text.encode("utf-8")).hexdigest(), 16) % 2
            if bucket == 0:
                policies = policies + [cand]
                arm, policy_id = "challenger", cand["id"]
    except Exception:
        policies = []
    try:
        adapter_data = adapter.load(os.path.join(root, "adapter.json"))
    except Exception:
        adapter_data = {}

    subject = task_text(text, cfg)
    plan = workflow.plan(subject, policies=policies, adapter_data=adapter_data)
    c = plan["classification"]
    level = c["difficulty"]["level"]
    risk = c["risk"]

    skills_planned = []
    for stage in plan["stages"]:
        for name in stage["skills"]:
            if name not in skills_planned:
                skills_planned.append(name)
    try:
        with open(os.path.join(root, "state", "current_turn.json"), "w") as fh:
            json.dump({"started": time.time(), "prompt": subject[:300], "level": level,
                       "risk": risk["level"], "depth": c["depth"], "skills": skills_planned,
                       "agents": [s["agent"] for s in plan["stages"]],
                       "arm": arm, "policy_id": policy_id}, fh)
    except (IOError, OSError):
        pass

    head = ["[Agentic OS] level %d/5, risk %s, workflow depth %d."
            % (level, risk["level"], c["depth"])]
    if risk["factors"]:
        head.append("Risk factors: %s." % ", ".join(risk["factors"][:4]))

    if level < cfg.get("quiet_below_level", 2) and risk["level"] == "normal":
        head.append("Trivial: do it directly, no delegation, no ceremony. "
                    "Still: evidence for any claim, and finish the whole request.")
        return " ".join(head)

    lines = list(head)
    lines.append("Workflow: %s." % " -> ".join(plan["workflow"]))
    if plan["delegate"]:
        named = ", ".join("aos-%s (%s)" % (s["agent"], s["tier"]) for s in plan["stages"])
        if level >= 3:
            lines.append("DISPATCH, do not implement directly: %s. One Task call per agent, "
                         "each with MISSION / CONTEXT / SUCCESS / FORBIDDEN / EVIDENCE. "
                         "You stay accountable for the result; you do not do the typing." % named)
        else:
            lines.append("Delegate with the Task tool to: %s." % named)
    else:
        lines.append("Do not delegate: %s" % plan["direct_execution_reason"])
    if plan["test_first"]:
        lines.append("Test-first: write the failing test and watch it fail before implementing.")

    # union of the routed skills across stages, best-scoring first
    best, where = {}, {}
    for stage in plan["stages"]:
        scores = stage.get("skill_scores") or {}
        for i, name in enumerate(stage["skills"]):
            score = float(scores.get(name, 0.0))
            if score >= best.get(name, -1):
                best[name] = score
                where[name] = stage["skill_paths"][i]
    # highest-scoring first: what gets inlined should be what matters most, not whichever
    # stage happened to be listed first
    ordered = [(-best[n], n, where[n]) for n in sorted(best, key=lambda n: -best[n])]
    by_depth = cfg.get("inline_budget_by_depth") or {}
    budget = int(by_depth.get(str(c["depth"]), cfg.get("inline_skill_budget_chars", 10000)))
    max_inline = int((cfg.get("max_inlined_by_depth") or {}).get(
        str(c["depth"]), cfg.get("max_inlined_skills", 4)))
    inlined, listed = [], []
    for _i, name, rel in ordered[:max_inline]:
        body = _body(rel if os.path.isabs(rel) else os.path.join(root, rel))
        if body and len(body) <= budget:
            budget -= len(body)
            inlined.append((name, body))
        else:
            listed.append((name, rel))
    for _i, name, rel in ordered[max_inline:]:
        listed.append((name, rel))

    out = [" ".join(lines)]
    if inlined:
        out.append("\nSkills routed for this task (%d loaded, the rest of the library stays "
                   "out of context) - follow them:" % (len(inlined) + len(listed)))
        for name, body in inlined:
            out.append("\n<skill name=\"%s\">\n%s\n</skill>" % (name, body))
    if listed:
        out.append("\nAlso relevant, read if needed: %s"
                   % ", ".join("%s (%s)" % (n, p) for n, p in listed))
    out.append("\nGuards run automatically on every command and write. "
               "Before reporting done, run the completion audit.")
    return "\n".join(out)


def main():
    root = _boot.load()
    data = _boot.payload()
    ctx = build_context(root, data.get("prompt", ""))
    if not ctx:
        return 0
    _boot.emit({"hookSpecificOutput": {"hookEventName": "UserPromptSubmit",
                                       "additionalContext": ctx}})
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception:
        sys.exit(0)
