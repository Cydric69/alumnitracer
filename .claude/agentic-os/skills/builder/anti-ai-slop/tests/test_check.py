"""Behavioural tests for the slop detector. Run: python3 test_check.py"""
import os
import sys
import tempfile

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import check  # noqa: E402

SLOP = """
<section class="text-center bg-gradient-to-r from-purple-600 to-blue-500">
  <h1 class="text-center">Streamline your workflow</h1>
  <p class="mx-auto">Powerful yet simple. Built for modern teams.</p>
  <a class="mx-auto shadow-lg" href="#">Learn more</a>
  <div class="grid grid-cols-3 justify-center">
    <div class="card shadow-xl"><svg/><h3>Analytics</h3><p>Company Name</p></div>
    <div class="card shadow-xl"><svg/><h3>Automation</h3><p>Lorem ipsum dolor</p></div>
    <div class="card shadow-2xl"><svg/><h3>Insights</h3><p>Sample data</p></div>
  </div>
  <div class="card"><div class="card"><div class="card">x</div></div></div>
  <p class="text-center mx-auto">🚀 ⚡ 🎯 📊</p>
</section>
"""

GOOD = """
<section class="pt-32 pb-24">
  <h1 class="text-5xl tracking-tight">Reconcile 40,000 invoices in one pass</h1>
  <p class="mt-6 max-w-[62ch] text-lg">Ledger diffs every line against the bank feed and
     shows you only the 12 that disagree.</p>
  <a class="mt-8 inline-block" href="/import">Import a statement</a>
  <table><tr><td>Row</td></tr></table>
</section>
"""


def run(source):
    fd, path = tempfile.mkstemp(suffix=".html")
    with os.fdopen(fd, "w") as fh:
        fh.write(source)
    try:
        return check.analyse(path)
    finally:
        os.unlink(path)


def test_detects_slop():
    rep = run(SLOP)
    ids = {f["tell"] for f in rep["findings"]}
    assert rep["verdict"] == "needs work", rep
    for expected in ("gradient-default", "copy-cliche", "weak-cta", "placeholder-content",
                     "shadow-everywhere", "triple-feature-grid", "emoji-as-icons",
                     "everything-centered", "card-nesting"):
        assert expected in ids, "missed %s (got %s)" % (expected, sorted(ids))


def test_accepts_specific_design():
    rep = run(GOOD)
    assert rep["verdict"] == "acceptable", rep
    assert rep["score"] < 3, rep


def test_findings_cite_lines():
    for f in run(SLOP)["findings"]:
        assert f["lines"], f
        assert f["instead"], f


if __name__ == "__main__":
    for name, fn in sorted(globals().items()):
        if name.startswith("test_"):
            fn()
            print("ok", name)
    print("anti-ai-slop: all tests passed")
