"""Filesystem layout of an Agentic OS installation."""
import os


def install_root(start=None):
    """Return the installation root (.claude/agentic-os), searching upward."""
    env = os.environ.get("AOS_HOME")
    if env:
        return os.path.abspath(env)
    here = os.path.abspath(start or os.getcwd())
    # runtime lives at <root>/runtime/paths.py -> prefer that when importable
    mod_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    if os.path.isdir(os.path.join(mod_root, "config")):
        return mod_root
    while True:
        cand = os.path.join(here, ".claude", "agentic-os")
        if os.path.isdir(cand):
            return cand
        parent = os.path.dirname(here)
        if parent == here:
            return cand
        here = parent


def project_root(root=None):
    r = root or install_root()
    return os.path.dirname(os.path.dirname(r))


def p(*parts):
    return os.path.join(install_root(), *parts)


def state(*parts):
    d = p("state")
    if not os.path.isdir(d):
        os.makedirs(d, exist_ok=True)
    return os.path.join(d, *parts)


def config(name):
    return p("config", name)
