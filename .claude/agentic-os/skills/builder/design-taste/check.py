#!/usr/bin/env python3
"""Design-system consistency counter.

Counts the things a restrained visual system keeps small: font families, font sizes,
hues, shadow depths, border radii, and off-scale spacing values. Exits 1 when a count
exceeds the budget from SKILL.md.

Usage: python3 check.py <css/tsx/html file> [...]
"""
import json
import re
import sys

BUDGET = {"font_families": 2, "font_sizes": 8, "hues": 6, "shadows": 2, "radii": 3}
SPACE_SCALE = {0, 1, 2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128}


def _hex_to_hue(h):
    h = h.lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    try:
        r, g, b = (int(h[i:i + 2], 16) / 255.0 for i in (0, 2, 4))
    except ValueError:
        return None
    mx, mn = max(r, g, b), min(r, g, b)
    if mx == mn:
        return "neutral"
    d = mx - mn
    if mx == r:
        hue = (60 * ((g - b) / d) + 360) % 360
    elif mx == g:
        hue = 60 * ((b - r) / d) + 120
    else:
        hue = 60 * ((r - g) / d) + 240
    if d < 0.08:
        return "neutral"
    return "h%d" % (int(hue) // 30 * 30)


def analyse(paths):
    text = ""
    for p in paths:
        with open(p, "r", errors="replace") as fh:
            text += fh.read() + "\n"
    families = set(re.findall(r"font-family:\s*([^;\n]+)", text, re.I))
    families |= set(re.findall(r"font-(?:sans|serif|mono)\b", text))
    sizes = set(re.findall(r"font-size:\s*([\d.]+(?:px|rem|em))", text, re.I))
    sizes |= set(re.findall(r"\btext-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl)\b", text))
    hexes = re.findall(r"#[0-9a-fA-F]{3,8}\b", text)
    hues = set(filter(None, (_hex_to_hue(h) for h in hexes)))
    hues.discard("neutral")
    shadows = set(re.findall(r"box-shadow:\s*([^;\n]+)", text, re.I))
    shadows |= set(re.findall(r"\bshadow-(sm|md|lg|xl|2xl|inner)\b", text))
    radii = set(re.findall(r"border-radius:\s*([^;\n]+)", text, re.I))
    radii |= set(re.findall(r"\brounded-(sm|md|lg|xl|2xl|3xl|full)\b", text))
    spaces = [int(v) for v in re.findall(r"\b[pm][xytblr]?-(\d+)\b", text)]
    off_scale = sorted(set(v for v in spaces if v not in SPACE_SCALE))

    counts = {"font_families": len(families), "font_sizes": len(sizes), "hues": len(hues),
              "shadows": len(shadows), "radii": len(radii)}
    over = {k: {"count": v, "budget": BUDGET[k]} for k, v in counts.items() if v > BUDGET[k]}
    return {"files": paths, "counts": counts, "over_budget": over,
            "off_scale_spacing": off_scale,
            "verdict": "restrained" if not over and not off_scale else "sprawling",
            "detail": {"families": sorted(families)[:10], "hues": sorted(hues)}}


def main(argv):
    if not argv:
        print("usage: check.py <file> [...]")
        return 2
    rep = analyse(argv)
    print(json.dumps(rep, indent=2))
    return 1 if rep["verdict"] != "restrained" else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
