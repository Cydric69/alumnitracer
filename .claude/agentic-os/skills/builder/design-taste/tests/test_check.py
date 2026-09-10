"""Behavioural tests for the design-system counter. Run: python3 test_check.py"""
import os
import sys
import tempfile

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import check  # noqa: E402

SPRAWL = """
:root { --a: #ff0000; --b: #00ff00; --c: #0000ff; --d: #ff00ff; --e: #ffff00;
        --f: #00ffff; --g: #ff8800; }
h1 { font-family: Inter; font-size: 41px; box-shadow: 0 4px 6px rgba(0,0,0,.3); }
h2 { font-family: Georgia; font-size: 33px; box-shadow: 0 2px 3px rgba(0,0,0,.2); }
h3 { font-family: Courier; font-size: 27px; box-shadow: 0 9px 8px rgba(0,0,0,.1); }
.x { border-radius: 3px } .y { border-radius: 7px } .z { border-radius: 11px }
.w { border-radius: 19px }
.p { padding: 0 } /* utility soup below */
.a { } .b { }
"""
SPRAWL += "<div class='p-7 m-13 px-5 py-9 mt-3'></div>\n"

RESTRAINED = """
:root { --ink: #17171a; --paper: #faf9f7; --accent: #2f5bea; }
body { font-family: var(--sans); }
h1 { font-size: 3rem } p { font-size: 1rem } small { font-size: .875rem }
.card { border-radius: 12px; box-shadow: 0 1px 2px rgba(0,0,0,.04); }
"""


def run(src, suffix=".css"):
    fd, path = tempfile.mkstemp(suffix=suffix)
    with os.fdopen(fd, "w") as fh:
        fh.write(src)
    try:
        return check.analyse([path])
    finally:
        os.unlink(path)


def test_flags_sprawl():
    rep = run(SPRAWL)
    assert rep["verdict"] == "sprawling", rep
    assert "hues" in rep["over_budget"], rep
    assert rep["off_scale_spacing"], rep


def test_passes_restrained_system():
    rep = run(RESTRAINED)
    assert rep["verdict"] == "restrained", rep


def test_hue_grouping_ignores_neutrals():
    rep = run(":root{--a:#111111;--b:#222222;--c:#f5f5f5;--d:#e8e8e8;}")
    assert rep["counts"]["hues"] == 0, rep


if __name__ == "__main__":
    for name, fn in sorted(globals().items()):
        if name.startswith("test_"):
            fn()
            print("ok", name)
    print("design-taste: all tests passed")
