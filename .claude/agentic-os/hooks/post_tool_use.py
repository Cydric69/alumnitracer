#!/usr/bin/env python3
"""PostToolUse logging: an append-only record used by self-evaluation."""
import json
import os
import sys
import time

import _boot


def main():
    root = _boot.load()
    data = _boot.payload()
    resp = data.get("tool_response")
    ti = data.get("tool_input") or {}
    rec = {"tool": data.get("tool_name"),
           "ok": not resp.get("is_error", False) if isinstance(resp, dict) else True,
           "session": data.get("session_id"),
           "at": time.time()}
    path = ti.get("file_path") or ti.get("notebook_path")
    if path:
        rec["path"] = str(path)[-120:]
    if data.get("tool_name") == "Bash":
        rec["cmd"] = str(ti.get("command", ""))[:160]
    if data.get("tool_name") == "Task":
        rec["agent"] = ti.get("subagent_type")
    d = os.path.join(root, "state")
    os.makedirs(d, exist_ok=True)
    path = os.path.join(d, "events.jsonl")
    with open(path, "a") as fh:
        fh.write(json.dumps(rec) + "\n")
    _rotate(path)
    return 0


MAX_EVENTS = 2000
KEEP_EVENTS = 1000


def _rotate(path):
    """Keep the log bounded. Two hooks read it end-to-end on every tool call, so an
    unbounded file turns into latency that grows with the age of the installation."""
    try:
        if os.path.getsize(path) < 200 * MAX_EVENTS:
            return
        with open(path) as fh:
            lines = fh.readlines()
        if len(lines) <= MAX_EVENTS:
            return
        with open(path + ".tmp", "w") as fh:
            fh.writelines(lines[-KEEP_EVENTS:])
        os.replace(path + ".tmp", path)
    except (IOError, OSError):
        pass


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception:
        sys.exit(0)
