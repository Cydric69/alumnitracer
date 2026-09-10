"""Skill router: task -> minimum sufficient set of loaded skills.

Installed skills are not loaded skills. Scoring is trigger-based, filtered by the
acting agent, biased by the project adapter and by learned policies, then trimmed
to the depth's skill budget after dependency and conflict resolution.
"""
from . import paths, policy, registry, util

STACK_DOMAIN_HINTS = {
    "frontend": ["frontend", "visual", "ui"],
    "backend": ["backend", "data"],
}


def load_registry():
    """The OS library plus whatever skills the project already had."""
    reg = registry.load(paths.p("skills", "registry.json"))
    proj = registry.load(paths.p("skills", "project-registry.json"), )
    merged = dict(reg.get("skills", {}))
    for name, meta in (proj.get("skills") or {}).items():
        merged.setdefault(name, meta)
    return {"skills": merged, "os_count": len(reg.get("skills", {})),
            "project_count": len(proj.get("skills") or {})}


def score(task_text, agent=None, reg=None, adapter=None, policies=()):
    reg = reg or load_registry()
    text = util.norm(task_text)
    scores = {}
    why = {}
    for name, meta in reg.get("skills", {}).items():
        if agent and meta.get("agents") and agent not in meta["agents"]:
            continue
        s = 0.0
        reasons = []
        # A curated trigger is a deliberate claim; one inferred from a project skill's
        # prose is a guess, and "Design, write and run tests" should not make a test skill
        # win a redesign. Weight them accordingly.
        weight = 1.5 if meta.get("source") == "project" else 3.0
        for trig in meta.get("triggers", []):
            t = trig.lower()
            if t and t in text:
                s += weight
                reasons.append("trigger:%s" % t)
        for dom in meta.get("domains", []):
            if dom.lower() in text:
                s += 1.5
                reasons.append("domain:%s" % dom)
        if adapter:
            for key, domains in STACK_DOMAIN_HINTS.items():
                if adapter.get(key) and set(domains) & set(d.lower() for d in meta.get("domains", [])):
                    s += 0.5
                    reasons.append("stack:%s" % key)
            for fw in adapter.get("frameworks", []) + adapter.get("languages", []):
                if fw and fw.lower() in [t.lower() for t in meta.get("triggers", [])]:
                    s += 1.0
                    reasons.append("stack:%s" % fw)
        if s > 0:
            s += meta.get("priority", 5) / 10.0
        scores[name] = s
        why[name] = reasons
    policy.apply_skill_scores(scores, task_text, policies)
    return scores, why


def resolve(selected, reg):
    """Pull in dependencies, then drop lower-priority sides of conflicts."""
    skills = reg.get("skills", {})
    out = list(selected)
    i = 0
    while i < len(out):
        for dep in skills.get(out[i], {}).get("dependencies", []):
            if dep in skills and dep not in out:
                out.append(dep)
        i += 1
    dropped = []
    for name in list(out):
        for other in list(out):
            if other == name or name not in out or other not in out:
                continue
            if other in skills.get(name, {}).get("conflicts", []):
                loser = min((name, other), key=lambda n: skills.get(n, {}).get("priority", 5))
                if loser in out:
                    out.remove(loser)
                    dropped.append(loser)
    return out, dropped


def route(task_text, agent=None, budget=6, reg=None, adapter=None, policies=(), min_score=2.5):
    reg = reg or load_registry()
    scores, why = score(task_text, agent, reg, adapter, policies)
    ranked = sorted([(s, n) for n, s in scores.items() if s >= min_score], reverse=True)
    picked = [n for _s, n in ranked[:budget]]
    resolved, dropped = resolve(picked, reg)
    # dependencies may push past budget; keep them (they are the minimum sufficient set)
    return {
        "loaded": resolved,
        "dropped_conflicts": dropped,
        "considered": len(scores),
        "budget": budget,
        "scores": {n: round(s, 2) for s, n in ranked},
        "why": {n: why.get(n, []) for n in resolved},
        "paths": [reg["skills"][n]["path"] for n in resolved if n in reg.get("skills", {})],
    }
