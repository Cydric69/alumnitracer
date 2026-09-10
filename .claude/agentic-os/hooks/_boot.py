"""Shared hook bootstrap: locate the installation and import the runtime safely."""
import json
import os
import sys


def load():
    root = os.environ.get("AOS_HOME") or os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    if root not in sys.path:
        sys.path.insert(0, root)
    os.environ.setdefault("AOS_HOME", root)
    return root


def payload():
    try:
        raw = sys.stdin.read()
        return json.loads(raw) if raw.strip() else {}
    except Exception:
        return {}


def emit(obj):
    sys.stdout.write(json.dumps(obj))
    sys.stdout.flush()
