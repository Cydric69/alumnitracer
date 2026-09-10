"""Dangerous-action guards.

Every shell command is normalized (quote stripping, whitespace collapse, obvious
obfuscation undone), split into its constituent commands across ; | && || $() `` and
newlines, then matched against config/guards.json. The strictest verdict wins.
"""
import base64
import re

from . import paths, util

RANK = {"ALLOW": 0, "CONFIRM": 1, "REVIEW_REQUIRED": 2, "BLOCK": 3}
SPLIT = re.compile(r"(?:\|\||&&|[;|\n])")
SUBSHELL = re.compile(r"\$\(([^()]*)\)|`([^`]*)`")
# A heredoc redirected into a file is data being written, not commands being run.
# `cat > f <<'EOF' ... EOF` is a file write; `cat <<EOF | bash` is not, and is left alone.
HEREDOC_TO_FILE = re.compile(
    r"^[^\n|]*>[^\n|]*<<-?\s*['\"]?(\w+)['\"]?[^\n|]*\n(.*?)^\1\s*$",
    re.S | re.M)


def _rules(cache={}):
    if "r" not in cache:
        cfg = util.load_json(paths.config("guards.json"))
        cache["r"] = [(r, re.compile(r["regex"], re.I)) for r in cfg["rules"]]
        cache["cfg"] = cfg
    return cache["r"], cache["cfg"]


def normalize(cmd):
    """Undo cheap evasion: quoting inside words, backslash escapes, extra whitespace."""
    s = cmd or ""
    s = s.replace("\\\n", " ")
    # r"m" -> rm, 'r'm -> rm : strip quotes that sit inside a word
    s = re.sub(r"(?<=\w)['\"]|['\"](?=\w)", "", s)
    s = re.sub(r"\\(?=[a-zA-Z*/.-])", "", s)
    s = re.sub(r"\$\{?IFS\}?", " ", s)
    s = re.sub(r"[ \t]+", " ", s)
    return s.strip()


def _decoded_payloads(cmd):
    """Surface base64 blobs so an encoded dangerous command is still inspected."""
    out = []
    for blob in re.findall(r"[A-Za-z0-9+/=]{16,}", cmd):
        try:
            dec = base64.b64decode(blob + "=" * (-len(blob) % 4)).decode("utf-8", "ignore")
        except Exception:
            continue
        if dec and sum(c.isprintable() for c in dec) > len(dec) * 0.9:
            out.append(dec)
    return out


def strip_file_heredocs(cmd):
    """Remove heredoc bodies that are written to a file.

    Without this, writing a test fixture or a document that merely *mentions* a dangerous
    command is blocked as if it were running one - a false positive that teaches people to
    work around the guard, which is worse than the risk it prevents. Heredocs that are
    piped or executed keep their body and are still inspected.
    """
    out, last = [], 0
    for m in HEREDOC_TO_FILE.finditer(cmd):
        tail = cmd[m.end():m.end() + 40]
        if tail.lstrip().startswith("|"):      # piped onward: still executable
            continue
        out.append(cmd[last:m.start(2)])
        last = m.end(2)
    out.append(cmd[last:])
    return "".join(out)


def segments(cmd):
    """Return every command fragment worth inspecting, including nested ones."""
    s = normalize(strip_file_heredocs(cmd))
    out = [s]
    for part in SPLIT.split(s):
        part = part.strip()
        if part:
            out.append(part)
    for m in SUBSHELL.finditer(s):
        inner = m.group(1) or m.group(2) or ""
        if inner.strip():
            out.extend(segments(inner))
    for dec in _decoded_payloads(s):
        out.append(dec)
        out.extend(p.strip() for p in SPLIT.split(dec) if p.strip())
    return out


def check(cmd, context=None):
    rules, cfg = _rules()
    verdict = cfg.get("default_action", "ALLOW")
    matched = []
    for seg in segments(cmd):
        for rule, pat in rules:
            if pat.search(seg):
                matched.append({"id": rule["id"], "action": rule["action"], "why": rule["why"],
                                "segment": seg[:200]})
                if RANK[rule["action"]] > RANK[verdict]:
                    verdict = rule["action"]
    return {"action": verdict, "command": cmd, "matches": matched,
            "context": context or {},
            "reason": "; ".join(sorted(set(m["why"] for m in matched))) or "no dangerous pattern matched"}


def check_path_write(path):
    """Guard writes to protected files regardless of the tool used."""
    _rules_, cfg = _rules()
    import fnmatch
    import os
    p = os.path.expanduser(path or "")
    for pattern in cfg.get("protected_paths", []):
        pat = os.path.expanduser(pattern)
        if fnmatch.fnmatch(p, pat) or fnmatch.fnmatch(p, "*/" + pattern.lstrip("*/")):
            return {"action": "CONFIRM", "reason": "protected path: %s" % pattern, "path": p}
    return {"action": "ALLOW", "reason": "unprotected path", "path": p}
