"""Skill registry: parse SKILL.md frontmatter into a machine-readable index."""
import os
import re

from . import util

REQUIRED = ("name", "description")
LIST_FIELDS = ("agents", "domains", "triggers", "dependencies", "conflicts")


def parse_frontmatter(text):
    """Minimal frontmatter parser (key: value, [a, b] lists). No YAML dependency."""
    if not text.startswith("---"):
        return {}, text
    end = text.find("\n---", 3)
    if end == -1:
        return {}, text
    head = text[3:end].strip("\n")
    body = text[end + 4:]
    data = {}
    for line in head.split("\n"):
        line = line.rstrip()
        if not line.strip() or line.lstrip().startswith("#") or ":" not in line:
            continue
        key, _, val = line.partition(":")
        key = key.strip()
        val = val.strip()
        if val.startswith("[") and val.endswith("]"):
            inner = val[1:-1].strip()
            data[key] = [v.strip().strip("'\"") for v in inner.split(",") if v.strip()]
        elif val.isdigit():
            data[key] = int(val)
        else:
            data[key] = val.strip("'\"")
    return data, body


def scan(skills_dir):
    """Walk skills_dir and return {name: meta}. Raises ValueError on malformed skills."""
    out = {}
    problems = []
    for dirpath, _dirs, files in os.walk(skills_dir):
        if "SKILL.md" not in files:
            continue
        path = os.path.join(dirpath, "SKILL.md")
        with open(path, "r", errors="replace") as fh:
            text = fh.read()
        meta, body = parse_frontmatter(text)
        rel = os.path.relpath(dirpath, skills_dir).replace(os.sep, "/")
        for field in REQUIRED:
            if not meta.get(field):
                problems.append("%s: missing '%s'" % (rel, field))
        if meta.get("name") and meta["name"] != rel:
            problems.append("%s: name '%s' does not match its folder" % (rel, meta["name"]))
        if len(body.strip()) < 400:
            problems.append("%s: body too short to be an operational skill" % rel)
        entry = {
            "name": meta.get("name", rel),
            "description": meta.get("description", ""),
            "path": os.path.join("skills", rel, "SKILL.md"),
            "priority": int(meta.get("priority", 5)),
            "version": str(meta.get("version", "1.0.0")),
            "words": len(body.split()),
            "has_tests": os.path.isdir(os.path.join(dirpath, "tests")),
        }
        for field in LIST_FIELDS:
            entry[field] = meta.get(field, []) or []
        out[entry["name"]] = entry
    if problems:
        raise ValueError("; ".join(problems))
    return out


STOP = {"this", "that", "when", "with", "from", "your", "should", "skill", "using", "used",
        "into", "which", "them", "they", "also", "does", "make", "user", "agent", "claude",
        "code", "task", "tasks", "work", "will", "than", "then", "these", "those", "what",
        "have", "been", "must", "only", "each", "more", "most", "like", "such", "over"}
DOMAIN_WORDS = {
    "frontend": ("ui", "css", "component", "react", "layout", "page", "frontend", "web"),
    "visual": ("design", "visual", "brand", "typography", "color", "aesthetic", "style"),
    "backend": ("api", "server", "database", "backend", "query", "endpoint"),
    "testing": ("test", "testing", "coverage", "spec", "e2e"),
    "security": ("security", "auth", "vulnerab", "secret", "permission"),
    "quality": ("review", "audit", "quality", "lint", "refactor"),
}


def scan_project(skills_dir, exclude=("agentic-os",)):
    """Discover the project's own skills so the router can reach them too.

    These are not Agentic OS skills: they carry no triggers, domains, or priorities, and
    their content is unvetted. Triggers are inferred from the folder name and description,
    priority sits below the OS library so a tie goes to the vetted skill, and a malformed
    file is skipped rather than failing the scan.
    """
    out = {}
    if not os.path.isdir(skills_dir):
        return out
    for entry in sorted(os.listdir(skills_dir)):
        if entry in exclude or entry.startswith("."):
            continue
        path = os.path.join(skills_dir, entry, "SKILL.md")
        if not os.path.isfile(path):
            continue
        try:
            with open(path, errors="replace") as fh:
                text = fh.read()
            meta, body = parse_frontmatter(text)
        except (IOError, OSError):
            continue
        desc = str(meta.get("description", ""))[:600]
        words = re.findall(r"[a-z][a-z-]{3,}", (entry + " " + desc).lower())
        triggers, seen = [], set()
        for w in words:
            w = w.strip("-")
            if w in STOP or w in seen or len(w) < 4:
                continue
            seen.add(w)
            triggers.append(w)
            if len(triggers) >= 14:
                break
        blob = (entry + " " + desc).lower()
        domains = [d for d, keys in DOMAIN_WORDS.items() if any(k in blob for k in keys)]
        name = "project/" + entry
        out[name] = {
            "name": name, "description": desc or entry, "path": path,
            "priority": 4, "version": "project", "source": "project",
            "agents": [], "domains": domains, "triggers": triggers,
            "dependencies": [], "conflicts": [],
            "words": len(body.split()), "has_tests": False,
        }
    return out


def build_project(skills_dir, out_path):
    skills = scan_project(skills_dir)
    util.save_json(out_path, {"schema_version": 1, "source": skills_dir,
                              "count": len(skills), "skills": skills})
    return skills


def build(skills_dir, out_path):
    skills = scan(skills_dir)
    registry = {"schema_version": 1, "generated_from": "skills/**/SKILL.md",
                "count": len(skills), "skills": skills}
    util.save_json(out_path, registry)
    return registry


def load(path):
    return util.load_json(path, default={"skills": {}})


def validate(registry):
    """Return a list of problems: unresolved dependencies, self conflicts, cycles."""
    problems = []
    skills = registry.get("skills", {})
    for name, meta in sorted(skills.items()):
        for dep in meta.get("dependencies", []):
            if dep not in skills:
                problems.append("%s: unresolved dependency '%s'" % (name, dep))
        for con in meta.get("conflicts", []):
            if con == name:
                problems.append("%s: conflicts with itself" % name)
    # cycle detection over dependencies
    state = {}

    def visit(node, stack):
        if state.get(node) == "done":
            return
        if node in stack:
            problems.append("dependency cycle: %s" % " -> ".join(stack + [node]))
            return
        for dep in skills.get(node, {}).get("dependencies", []):
            if dep in skills:
                visit(dep, stack + [node])
        state[node] = "done"

    for name in sorted(skills):
        visit(name, [])
    return problems
