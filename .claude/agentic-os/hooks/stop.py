#!/usr/bin/env python3
"""Stop hook: turn a finished turn into measurements and observations.

Without this the OS observes everything and records nothing - the queue and metrics stay
empty and the learning loop never has an input. Here every turn produces one metrics row
(for whichever experiment arm the prompt hook picked) and any observations the evidence
actually supports.

Only measurable facts are recorded. `success` is an explicit proxy - "no tool call in this
turn returned an error" - not a judgement about whether the work was right.
"""
import json
import os
import re
import sys
import time

import _boot

FRONTEND_EXT = (".tsx", ".jsx", ".css", ".scss", ".vue", ".svelte", ".html")
BACKEND_HINT = re.compile(r"(/api/|route\.ts|server|handler|\.sql$|schema|migration|drizzle|prisma)", re.I)
TEST_HINT = re.compile(r"(test|spec)[./_-]|__tests__|\.test\.|\.spec\.", re.I)
TEST_CMD = re.compile(r"\b(pytest|vitest|jest|npm (run )?test|yarn test|pnpm test|go test|cargo test|mix test|rspec)\b", re.I)

DOMAIN_SKILL = [
    ("frontend", "builder/frontend-engineering"),
    ("backend", "builder/backend-engineering"),
    ("testing", "tester/test-design"),
]


def _read_turn(root):
    try:
        with open(os.path.join(root, "state", "current_turn.json")) as fh:
            return json.load(fh)
    except (IOError, OSError, ValueError):
        return None


def _events_since(root, started):
    out = []
    path = os.path.join(root, "state", "events.jsonl")
    try:
        with open(path) as fh:
            for line in fh:
                try:
                    rec = json.loads(line)
                except ValueError:
                    continue
                if rec.get("at", 0) >= started:
                    out.append(rec)
    except (IOError, OSError):
        pass
    return out


def summarize(turn, events):
    paths = [e.get("path", "") for e in events if e.get("path")]
    cmds = [e.get("cmd", "") for e in events if e.get("cmd")]
    errors = [e for e in events if not e.get("ok", True)]
    return {
        "tool_calls": len(events),
        "errors": len(errors),
        "files_touched": sorted(set(paths)),
        "agents_used": len(set(e.get("agent") for e in events if e.get("agent"))),
        "test_runs": len([c for c in cmds if TEST_CMD.search(c)]),
        "domains": {
            "frontend": any(p.endswith(FRONTEND_EXT) for p in paths),
            "backend": any(BACKEND_HINT.search(p) for p in paths),
            "testing": any(TEST_HINT.search(p) for p in paths),
        },
    }


STOPWORDS = {"the", "this", "that", "with", "from", "into", "make", "made", "please",
             "should", "would", "could", "there", "these", "those", "your", "have"}


def scope_for(turn, s):
    """A policy scope that will actually match future prompts.

    The domain word ("frontend") rarely appears in what people type, so a policy scoped to
    it would never fire. Prefer a token the prompt and the touched files share - "dashboard",
    "repairs", "invoice" - which is exactly the recurring shape worth learning about.
    """
    words = [w.strip(".,;:()/-") for w in turn["prompt"].lower().split()]
    words = [w for w in words if len(w) > 4 and w not in STOPWORDS]
    blob = " ".join(s["files_touched"]).lower()
    for w in words:
        if w[:6] in blob or w.rstrip("s") in blob:
            return w
    return words[0] if words else ""


def observations(turn, s):
    """Only signals the evidence supports. Each becomes a learning pattern."""
    out = []
    tag = "-".join(turn["prompt"].lower().split()[:3])[:40] or "untitled"
    loaded = set(turn.get("skills", []))
    scope = scope_for(turn, s)

    if turn["level"] <= 1 and (len(s["files_touched"]) >= 3 or s["tool_calls"] >= 15):
        out.append(("underclassified", tag))
    if s["errors"] >= 3:
        out.append(("repair_loop", tag))
    for domain, skill in DOMAIN_SKILL:
        if s["domains"][domain] and skill not in loaded:
            out.append(("missing_skill", "%s|%s" % (scope, skill)))
        if skill in loaded and not s["domains"][domain] and s["files_touched"]:
            out.append(("unused_skill", "%s|%s" % (scope, skill)))
    if s["test_runs"] == 0 and s["files_touched"] and turn["depth"] >= 2:
        out.append(("no_verification", tag))
    if turn["depth"] >= 3 and s["agents_used"] == 0 and s["files_touched"]:
        out.append(("no_delegation", tag))
    return out


def main():
    root = _boot.load()
    _boot.payload()
    turn = _read_turn(root)
    if not turn:
        return 0
    try:
        from runtime import learning, metrics
    except Exception:
        return 0
    events = _events_since(root, turn.get("started", 0))
    if not events:
        os.remove(os.path.join(root, "state", "current_turn.json"))
        return 0
    s = summarize(turn, events)

    metrics.record(
        metrics.connect(), None,
        arm=turn.get("arm", "champion"), policy_id=turn.get("policy_id"),
        depth=turn.get("depth"), risk=turn.get("risk"),
        success=0.0 if s["errors"] else 1.0,
        first_pass_success=1.0 if not s["errors"] and s["tool_calls"] else 0.0,
        repairs=float(s["errors"]),
        tests_run=s["test_runs"], tests_failed=0,
        agents_used=s["agents_used"], skills_loaded=len(turn.get("skills", [])),
        latency_ms=int((time.time() - turn.get("started", time.time())) * 1000),
    )
    lcon = learning.connect()
    for kind, key in observations(turn, s):
        learning.observe(lcon, None, kind, key)
    try:
        os.remove(os.path.join(root, "state", "current_turn.json"))
    except OSError:
        pass
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception:
        sys.exit(0)
