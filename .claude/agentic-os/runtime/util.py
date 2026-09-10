"""Small shared helpers."""
import json
import os
import time


def load_json(path, default=None):
    try:
        with open(path, "r") as fh:
            return json.load(fh)
    except (IOError, OSError, ValueError):
        if default is None:
            raise
        return default


def save_json(path, data):
    d = os.path.dirname(path)
    if d:
        os.makedirs(d, exist_ok=True)
    tmp = path + ".tmp"
    with open(tmp, "w") as fh:
        json.dump(data, fh, indent=2, sort_keys=True)
        fh.write("\n")
    os.replace(tmp, path)


def now():
    return time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime())


def norm(text):
    return (text or "").lower()
