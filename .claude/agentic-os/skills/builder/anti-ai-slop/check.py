#!/usr/bin/env python3
"""Slop detector: scores HTML/JSX/markup and copy against the tells in SKILL.md.

Usage: python3 check.py <file> [...]   ->  JSON report, exit 1 if score >= 3.
It is a heuristic aid to review, not a replacement for it: it reports *tells*, each
with the line that triggered it, so a human can judge.
"""
import json
import re
import sys

COPY_CLICHES = [
    "streamline your workflow", "take your", "to the next level", "powerful yet simple",
    "seamlessly integrate", "unlock the power", "built for modern teams", "in seconds",
    "lorem ipsum", "supercharge", "game-changing", "revolutionize", "elevate your",
    "cutting-edge", "best-in-class", "one-stop", "empower your",
]
WEAK_CTA = ["learn more", "get started", "submit", "click here", "read more"]
PLACEHOLDER = ["company name", "your logo", "john doe", "jane doe", "example.com",
               "placeholder", "sample data", "coming soon"]

TELLS = []


def tell(id_, why, fix):
    def deco(fn):
        TELLS.append((id_, why, fix, fn))
        return fn
    return deco


@tell("gradient-default", "Purple/indigo-to-blue gradient as the visual system",
      "Choose a palette from the product's personality; keep one accent")
def _gradient(text, lines):
    pat = re.compile(r"(from-(purple|indigo|violet|blue)-\d00[^\"']*to-(blue|purple|indigo|pink)-\d00)"
                     r"|linear-gradient\([^)]*(#?[68][0-9a-f]{2}[0-9a-f]{3}|purple|indigo)[^)]*\)", re.I)
    return [i for i, ln in lines if pat.search(ln)]


@tell("shadow-everywhere", "Heavy or ubiquitous drop shadows",
      "Separate with space, then a 1px hairline; shadow last and nearly invisible")
def _shadow(text, lines):
    hits = [i for i, ln in lines if re.search(r"shadow-(lg|xl|2xl)|box-shadow:\s*0 \d{2,}px", ln, re.I)]
    return hits if len(hits) >= 3 else []


@tell("card-nesting", "Cards nested inside cards",
      "One container level; use space and type to group instead")
def _cards(text, lines):
    pat = re.compile(r"(class|className)=[\"'][^\"']*\bcard\b", re.I)
    nested = re.compile(r"(class|className)=[\"'][^\"']*\bcard\b[^<]*>\s*<[^>]*(class|className)=[\"'][^\"']*\bcard\b", re.I)
    hits = [i for i, ln in lines if pat.search(ln)]
    occurrences = len(pat.findall(text))
    if nested.search(text) or occurrences >= 6:
        return hits or [1]
    return []


@tell("triple-feature-grid", "Three/four identical icon-title-sentence feature cards",
      "Differentiate by importance, or use a list/table if they are comparable")
def _grid(text, lines):
    pat = re.compile(r"grid-cols-3|grid-cols-4|repeat\(3,\s*1fr\)", re.I)
    icons = len(re.findall(r"<(svg|Icon|i class=\"fa)", text, re.I))
    return [i for i, ln in lines if pat.search(ln)] if icons >= 3 else []


@tell("copy-cliche", "Generic marketing copy that could describe any product",
      "Replace each adjective with a verifiable fact about this product")
def _cliche(text, lines):
    low = text.lower()
    return [i for i, ln in lines if any(c in ln.lower() for c in COPY_CLICHES)] if \
        any(c in low for c in COPY_CLICHES) else []


@tell("weak-cta", "Buttons labelled with a generic verb",
      "Name the action: 'Create invoice', 'Start 14-day trial'")
def _cta(text, lines):
    hits = []
    for i, ln in lines:
        for c in WEAK_CTA:
            if re.search(r">\s*%s\s*<" % re.escape(c), ln, re.I):
                hits.append(i)
    return hits


@tell("placeholder-content", "Placeholder or sample content still present",
      "Write the real content first, then design around it")
def _placeholder(text, lines):
    return [i for i, ln in lines if any(p in ln.lower() for p in PLACEHOLDER)]


@tell("emoji-as-icons", "Emoji used as iconography",
      "One icon family, one weight, sized to cap height")
def _emoji(text, lines):
    pat = re.compile("[\U0001F300-\U0001FAFF✀-➿]")
    hits = [i for i, ln in lines if pat.search(ln)]
    return hits if len(pat.findall(text)) >= 3 else []


@tell("uniform-spacing", "One padding value used at every level",
      "Use a space scale; increase between groups, decrease within them")
def _spacing(text, lines):
    vals = re.findall(r"\b[pm][xytblr]?-(\d+)\b", text)
    if len(vals) < 8:
        return []
    from collections import Counter
    common, n = Counter(vals).most_common(1)[0]
    return [0] if n / float(len(vals)) > 0.7 else []


@tell("everything-centered", "Symmetric, centred layout throughout",
      "Break the symmetry: asymmetric split, off-centre focal point, a full-bleed element")
def _centered(text, lines):
    hits = [i for i, ln in lines if re.search(r"text-center|mx-auto|justify-center", ln)]
    return hits if len(hits) >= 6 else []


def analyse(path):
    with open(path, "r", errors="replace") as fh:
        text = fh.read()
    lines = list(enumerate(text.split("\n"), 1))
    findings = []
    for id_, why, fix, fn in TELLS:
        hits = fn(text, lines)
        if hits:
            findings.append({"tell": id_, "why": why, "instead": fix,
                             "lines": sorted(set(hits))[:8], "count": len(hits)})
    return {"file": path, "score": len(findings), "findings": findings,
            "verdict": "needs work" if len(findings) >= 3 else "acceptable"}


def main(argv):
    if not argv:
        print("usage: check.py <file> [...]")
        return 2
    reports = [analyse(p) for p in argv]
    worst = max(r["score"] for r in reports)
    print(json.dumps({"reports": reports, "max_score": worst,
                      "threshold": 3}, indent=2))
    return 1 if worst >= 3 else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
