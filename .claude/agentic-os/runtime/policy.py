"""Learned-policy overlay plus the immutable safety floor.

Learning may bias routing, classification and workflow depth. It may never weaken
safety. Every candidate policy passes through `check_safe` before it can become a
challenger, and again before promotion.
"""
import re

ALLOWED_KINDS = ("skill_boost", "skill_suppress", "level_bump", "depth_floor", "tier_pref")

# A candidate touching any of these is rejected outright, whatever its metrics say.
FORBIDDEN_PATTERNS = [
    re.compile(r"guard", re.I),
    re.compile(r"safety", re.I),
    re.compile(r"approval|confirm|authoriz|permission", re.I),
    re.compile(r"skip.*test|disable.*test|no.?test", re.I),
    re.compile(r"hide|suppress.*(failure|error)", re.I),
    re.compile(r"privacy|credential|secret", re.I),
    re.compile(r"\brm -rf\b|force.?push|drop table", re.I),
]


def check_safe(kind, key, value):
    """Return (ok, reason). The safety floor - not overridable by evidence."""
    if kind not in ALLOWED_KINDS:
        return False, "policy kind '%s' is outside the learnable surface" % kind
    blob = "%s %s %s" % (kind, key, value)
    for pat in FORBIDDEN_PATTERNS:
        if pat.search(blob):
            return False, "candidate touches a safety-floor concept: %s" % pat.pattern
    if kind == "depth_floor":
        try:
            if int(value) < 1:
                return False, "depth_floor cannot go below 1"
        except (TypeError, ValueError):
            return False, "depth_floor must be an integer"
    if kind == "level_bump":
        try:
            if int(value) < 0:
                return False, "level_bump may only raise scrutiny, never lower it"
        except (TypeError, ValueError):
            return False, "level_bump must be an integer"
    if kind == "skill_suppress" and re.search(r"security|verification|evidence", str(key), re.I):
        return False, "safety-relevant skills may not be suppressed by learning"
    return True, "ok"


def apply_skill_scores(scores, task_text, policies):
    """Apply champion skill_boost / skill_suppress policies to a score dict."""
    text = (task_text or "").lower()
    for pol in policies:
        if pol["kind"] not in ("skill_boost", "skill_suppress"):
            continue
        trigger = (pol.get("scope") or "").lower()
        if trigger and trigger not in text:
            continue
        skill = pol["key"]
        if skill not in scores:
            continue
        delta = float(pol["value"])
        scores[skill] += delta if pol["kind"] == "skill_boost" else -abs(delta)
    return scores


def apply_level(level, task_text, policies):
    text = (task_text or "").lower()
    for pol in policies:
        if pol["kind"] != "level_bump":
            continue
        scope = (pol.get("scope") or "").lower()
        if scope and scope not in text:
            continue
        level = min(5, level + int(pol["value"]))
    return level


def apply_depth(depth, task_text, policies):
    text = (task_text or "").lower()
    for pol in policies:
        if pol["kind"] != "depth_floor":
            continue
        scope = (pol.get("scope") or "").lower()
        if scope and scope not in text:
            continue
        depth = max(depth, int(pol["value"]))
    return depth
