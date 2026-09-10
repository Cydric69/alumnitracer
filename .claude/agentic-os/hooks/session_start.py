#!/usr/bin/env python3
"""SessionStart: inject verified Agentic OS state (never fabricated) as context."""
import os
import sys

import _boot


def main():
    root = _boot.load()
    _boot.payload()
    try:
        from runtime import learning, queue
    except Exception:
        return 0
    bits = []
    try:
        version = open(os.path.join(root, "VERSION")).read().strip()
        bits.append("Agentic OS %s active (%s)." % (version, root))
    except Exception:
        return 0
    try:
        st = queue.stats(queue.connect())
        if st["total"]:
            bits.append("Queue: %d tasks %s." % (st["total"], st["by_status"]))
    except Exception:
        pass
    try:
        pols = learning.active(learning.connect())
        if pols:
            bits.append("Learned policies in force: %s." %
                        ", ".join("%s %s(%s)" % (p["kind"], p["key"], p["value"]) for p in pols[:5]))
    except Exception:
        pass
    bits.append("Run `aos plan \"<task>\"` before non-trivial work; guards run automatically.")
    _boot.emit({"hookSpecificOutput": {"hookEventName": "SessionStart",
                                       "additionalContext": " ".join(bits)}})
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception:
        sys.exit(0)
