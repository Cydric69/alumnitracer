"""Difficulty and risk classification."""
import re

from . import paths, policy, util


def _load(name, cache={}):
    if name not in cache:
        cache[name] = util.load_json(paths.config(name))
    return cache[name]


def difficulty(task_text, file_count=0, policies=(), cfg=None):
    cfg = cfg or _load("classifier.json")
    text = util.norm(task_text)
    scores = {}
    hits = []
    for dim, signals in cfg["signals"].items():
        raw = 0
        for phrase, points in signals.items():
            if phrase in text:
                raw += points
                hits.append("%s:%s(%+d)" % (dim, phrase, points))
        weight = cfg["dimensions"].get(dim, {}).get("weight", 1.0)
        scores[dim] = max(0.0, raw) * weight
    total = sum(scores.values())
    for threshold, points in sorted(cfg["file_count_points"].items(), key=lambda kv: int(kv[0])):
        if file_count >= int(threshold):
            total += points
    thresholds = cfg["level_thresholds"]
    level = 1
    for t in thresholds:
        if total >= t:
            level += 1
    level = policy.apply_level(level, task_text, policies)
    return {"level": level, "score": round(total, 2), "dimensions":
            {k: round(v, 2) for k, v in scores.items()}, "signals": hits}


def risk(task_text, cfg=None):
    cfg = cfg or _load("risk.json")
    text = util.norm(task_text)
    points = 0
    factors = []
    for name, spec in cfg["factors"].items():
        for pat in spec["patterns"]:
            if pat in text:
                points += spec["points"]
                factors.append("%s:%s" % (name, pat.strip()))
                break
    th = cfg["level_thresholds"]
    level = "normal"
    if points >= th["critical"]:
        level = "critical"
    elif points >= th["high"]:
        level = "high"
    elif points >= th["elevated"]:
        level = "elevated"
    return {"level": level, "points": points, "factors": factors,
            "workflow_floor": cfg["workflow_floor"].get(level)}


def classify(task_text, file_count=0, policies=()):
    d = difficulty(task_text, file_count, policies)
    r = risk(task_text)
    depth = d["level"]
    if r["workflow_floor"]:
        depth = max(depth, int(r["workflow_floor"]))
    depth = policy.apply_depth(depth, task_text, policies)
    wf = _load("workflow.json")
    return {
        "difficulty": d, "risk": r, "depth": depth,
        "workflow": wf["depths"][str(depth)],
        "agents": wf["agents_by_depth"][str(depth)],
        "skill_budget": wf["skill_budget_by_depth"][str(depth)],
        "delegate": depth >= wf["delegation_threshold_level"],
    }


def reclassify(previous, reason, task_text, file_count=0, extra_level=1, policies=()):
    """Raise a task's classification mid-flight. Reclassification only ever escalates."""
    fresh = classify(task_text, file_count, policies)
    fresh["depth"] = max(fresh["depth"], min(5, int(previous.get("depth", 1)) + extra_level))
    wf = _load("workflow.json")
    fresh["workflow"] = wf["depths"][str(fresh["depth"])]
    fresh["agents"] = wf["agents_by_depth"][str(fresh["depth"])]
    fresh["skill_budget"] = wf["skill_budget_by_depth"][str(fresh["depth"])]
    fresh["reclassified_from"] = previous.get("depth")
    fresh["reclassification_reason"] = reason
    return fresh
