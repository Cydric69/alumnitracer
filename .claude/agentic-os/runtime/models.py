"""Logical model tiers mapped to whatever models the environment actually offers."""
import json
import os
import subprocess
import time

from . import paths, util

ORDER = ["FAST", "BALANCED", "DEEP"]


def _cfg():
    return util.load_json(paths.config("models.json"))


_CACHE = {}
CACHE_TTL_S = 3600


def available_models(refresh=False):
    """Best-effort discovery. Returns [] when the environment cannot tell us.

    Cached in-process and on disk: this used to shell out to `claude --help` once per
    workflow stage, which cost ~365ms of a 419ms prompt hook on a five-stage plan.
    """
    env = os.environ.get("AOS_AVAILABLE_MODELS")
    if env:
        return [m.strip() for m in env.split(",") if m.strip()]
    now = time.time()
    if not refresh and _CACHE.get("at", 0) + CACHE_TTL_S > now:
        return _CACHE["models"]
    if not refresh:
        try:
            disk = util.load_json(paths.state("models-cache.json"), default={})
            if disk.get("at", 0) + CACHE_TTL_S > now:
                _CACHE.update(disk)
                return disk["models"]
        except Exception:
            pass
    try:
        out = subprocess.run(["claude", "--help"], capture_output=True, text=True, timeout=10)
        blob = (out.stdout or "") + (out.stderr or "")
    except (OSError, subprocess.SubprocessError):
        blob = ""
    found = [t for t in ("opus", "sonnet", "haiku") if t in blob.lower()]
    _CACHE.update({"models": found, "at": now})
    try:
        util.save_json(paths.state("models-cache.json"), {"models": found, "at": now})
    except Exception:
        pass
    return found


def resolve(tier, cfg=None, available=None):
    cfg = cfg or _cfg()
    spec = cfg["tiers"][tier]
    if available is None:
        available = available_models()
    for cand in spec["candidates"]:
        if not available:
            return cand
        for a in available:
            if a in cand or cand in a:
                return cand
    return spec["candidates"][-1]


def route(level, risk_level="normal", agent=None, cfg=None):
    cfg = cfg or _cfg()
    tier = cfg["level_to_tier"][str(level)]
    floor = cfg["risk_floor_tier"].get(risk_level)
    if floor and ORDER.index(floor) > ORDER.index(tier):
        tier = floor
    if agent:
        pref = cfg["agent_preferred_tier"].get(agent)
        if pref and ORDER.index(pref) > ORDER.index(tier):
            tier = pref
    return {"tier": tier, "model": resolve(tier, cfg)}


def validate(cfg=None):
    """Report tiers whose configured models are not visible in this environment."""
    cfg = cfg or _cfg()
    avail = available_models()
    report = {}
    for tier in ORDER:
        model = resolve(tier, cfg, avail)
        report[tier] = {"model": model,
                        "confirmed": bool(avail) and any(a in model for a in avail),
                        "detection": "environment" if avail else "unavailable (assumed)"}
    return report


if __name__ == "__main__":
    print(json.dumps(validate(), indent=2))
