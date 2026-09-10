#!/usr/bin/env python3
"""PreToolUse guard. Dangerous actions are stopped or escalated; ordinary work passes.

Fails open on internal errors (never breaks the session) but never fails open on a
matched BLOCK rule.
"""
import hashlib
import json
import os
import sys
import time

import _boot

WRITE_TOOLS = ("Write", "Edit", "MultiEdit", "NotebookEdit")

CONTRACT = """TASK:        <what you are about to do>      AGENT: aos-builder
MISSION:     <one sentence - what done looks like>
CONTEXT:     <the paths you were about to edit, and why>
SUCCESS:     <numbered, individually checkable>
FORBIDDEN:   test files you did not write; deploy, migrate, push, install, delete;
             anything outside the files this task names
EVIDENCE:    <the exact commands to run and the output to return>
ESCALATE IF: <the condition that means stop and report rather than improvise>"""


def _cfg(root):
    try:
        with open(os.path.join(root, "config", "auto.json")) as fh:
            return json.load(fh)
    except (IOError, OSError, ValueError):
        return {}


def _turn(root):
    try:
        with open(os.path.join(root, "state", "current_turn.json")) as fh:
            return json.load(fh)
    except (IOError, OSError, ValueError):
        return None


def _mark_enforced(root, turn, sig):
    """Remember *which* call was intercepted, not merely that one was.

    The same tool call is evaluated more than once - this hook, plus any project
    auto-approval chain that runs it as a guard - and both must reach the same verdict or
    an `allow` from the other silently wins. A later, different edit in the same turn is
    still let through: the intent is one interception per turn, not a blockade.
    """
    turn["delegation_enforced"] = sig
    try:
        with open(os.path.join(root, "state", "current_turn.json"), "w") as fh:
            json.dump(turn, fh)
    except (IOError, OSError):
        pass


def _delegated_already(root, started):
    """Did this turn dispatch a subagent before reaching for the file?"""
    try:
        with open(os.path.join(root, "state", "events.jsonl")) as fh:
            for line in fh:
                try:
                    rec = json.loads(line)
                except ValueError:
                    continue
                if rec.get("at", 0) >= started and rec.get("tool") == "Task":
                    return True
    except (IOError, OSError):
        pass
    return False


def _signature(tool, tool_input):
    payload = json.dumps({"t": tool, "i": tool_input or {}}, sort_keys=True)
    return hashlib.sha1(payload.encode("utf-8")).hexdigest()[:16]


def delegation_check(root, tool, tool_input=None):
    """At high levels, the first direct edit of a turn is intercepted.

    The injected plan is prose and prose loses to convenience - measured: agents_used was
    0.0 across every recorded run. This is the mechanical half. It fires once per turn,
    only at or above the configured level, and never on a turn that already delegated.
    """
    if tool not in WRITE_TOOLS:
        return None
    cfg = _cfg(root)
    mode = cfg.get("enforce_mode", "ask")
    floor = cfg.get("enforce_delegation_from_level", 4)
    if mode == "off" or not cfg.get("enabled", True):
        return None
    turn = _turn(root)
    if not turn:
        return None
    sig = _signature(tool, tool_input)
    already = turn.get("delegation_enforced")
    if already and already != sig:
        return None                      # a different call, later in the same turn
    if int(turn.get("level", 1)) < int(floor):
        return None
    if not already and _delegated_already(root, turn.get("started", 0)):
        return None
    _mark_enforced(root, turn, sig)
    agents = [a for a in turn.get("agents", []) if a not in ("orchestrator", "router")]
    named = ", ".join("aos-%s" % a for a in agents) or "aos-builder"
    return {
        "action": "BLOCK" if mode == "deny" else "CONFIRM",
        "reason": ("this turn classified level %s (depth %s, risk %s) and no subagent has been "
                   "dispatched. Delegate to %s with a contract instead of editing directly:\n\n%s"
                   "\n\nOverride deliberately if delegation genuinely costs more than it returns."
                   % (turn.get("level"), turn.get("depth"), turn.get("risk"), named, CONTRACT)),
        "matches": [{"id": "delegation.not_dispatched"}],
    }


def main():
    """Hook mode (default): emit a JSON permission decision, exit 0.

    Guard mode (`--guard`): exit 2 when this call should not proceed, nothing on stdout.
    That is the convention a project's own auto-approval chain can consume - without it,
    another hook's `allow` suppresses this one's `ask` and the decision never surfaces.
    """
    guard_mode = "--guard" in sys.argv
    _boot.load()
    data = _boot.payload()
    tool = data.get("tool_name") or ""
    ti = data.get("tool_input") or {}
    try:
        from runtime import guards
    except Exception:
        return 0
    verdict = delegation_check(_boot.load(), tool, ti)
    if not verdict and tool == "Bash":
        verdict = guards.check(ti.get("command", ""), {"tool": tool})
    elif not verdict and tool in WRITE_TOOLS:
        verdict = guards.check_path_write(ti.get("file_path") or ti.get("notebook_path") or "")
        verdict.setdefault("matches", [])
    if not verdict:
        return 0
    action = verdict["action"]
    if action == "ALLOW":
        return 0
    if guard_mode:
        sys.stderr.write("[agentic-os] %s: %s\n" % (action, verdict.get("reason", "")))
        return 2
    decision = "deny" if action == "BLOCK" else "ask"
    reason = "[agentic-os guard: %s] %s" % (action, verdict.get("reason", ""))
    _boot.emit({"hookSpecificOutput": {"hookEventName": "PreToolUse",
                                       "permissionDecision": decision,
                                       "permissionDecisionReason": reason}})
    try:
        from runtime import learning
        con = learning.connect()
        learning.observe(con, None, "guard_%s" % action.lower(),
                         ",".join(m["id"] for m in verdict.get("matches", [])) or "path")
    except Exception:
        pass
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception:
        sys.exit(0)
