"""Project adapter: discover the target project's stack without assuming one."""
import json
import os

from . import util

SIGNS = [
    # (marker file, language, framework hint, package manager, test cmd, build cmd)
    ("package.json", "javascript", None, "npm", "npm test", "npm run build"),
    ("pnpm-lock.yaml", "javascript", None, "pnpm", "pnpm test", "pnpm build"),
    ("yarn.lock", "javascript", None, "yarn", "yarn test", "yarn build"),
    ("bun.lockb", "javascript", None, "bun", "bun test", "bun run build"),
    ("pyproject.toml", "python", None, "uv|poetry|pip", "pytest", None),
    ("requirements.txt", "python", None, "pip", "pytest", None),
    ("Pipfile", "python", None, "pipenv", "pytest", None),
    ("go.mod", "go", None, "go", "go test ./...", "go build ./..."),
    ("Cargo.toml", "rust", None, "cargo", "cargo test", "cargo build"),
    ("pom.xml", "java", None, "maven", "mvn test", "mvn package"),
    ("build.gradle", "java", None, "gradle", "gradle test", "gradle build"),
    ("Gemfile", "ruby", None, "bundler", "bundle exec rspec", None),
    ("composer.json", "php", None, "composer", "vendor/bin/phpunit", None),
    ("mix.exs", "elixir", None, "mix", "mix test", "mix compile"),
    ("CMakeLists.txt", "c/c++", None, "cmake", "ctest", "cmake --build build"),
]

FRAMEWORK_DEPS = {
    "next": "next.js", "react": "react", "vue": "vue", "svelte": "svelte",
    "@angular/core": "angular", "express": "express", "fastify": "fastify",
    "nestjs": "nestjs", "@nestjs/core": "nestjs", "astro": "astro", "remix": "remix",
    "django": "django", "flask": "flask", "fastapi": "fastapi", "starlette": "starlette",
    "sqlalchemy": "sqlalchemy", "rails": "rails",
}
DB_HINTS = ["postgres", "psycopg", "mysql", "sqlite", "mongodb", "mongoose", "prisma",
            "drizzle", "supabase", "redis"]
TEST_RUNNERS = ["vitest", "jest", "playwright", "cypress", "mocha", "pytest", "unittest",
                "rspec", "phpunit", "go test", "cargo test"]


def _read(path, limit=200000):
    try:
        with open(path, "r", errors="replace") as fh:
            return fh.read(limit)
    except (IOError, OSError):
        return ""


def detect(root):
    root = os.path.abspath(root)
    found = {"root": root, "languages": [], "frameworks": [], "package_manager": None,
             "test_command": None, "build_command": None, "lint_command": None,
             "format_command": None, "databases": [], "test_runners": [], "monorepo": False,
             "ci": [], "frontend": False, "backend": False, "vcs": None}
    entries = set(os.listdir(root)) if os.path.isdir(root) else set()
    for marker, lang, _fw, pm, test, build in SIGNS:
        if marker in entries:
            if lang not in found["languages"]:
                found["languages"].append(lang)
            found["package_manager"] = found["package_manager"] or pm
            found["test_command"] = found["test_command"] or test
            found["build_command"] = found["build_command"] or build

    pkg = os.path.join(root, "package.json")
    if os.path.isfile(pkg):
        try:
            data = json.loads(_read(pkg) or "{}")
        except ValueError:
            data = {}
        deps = {}
        deps.update(data.get("dependencies") or {})
        deps.update(data.get("devDependencies") or {})
        for dep, name in FRAMEWORK_DEPS.items():
            if dep in deps and name not in found["frameworks"]:
                found["frameworks"].append(name)
        scripts = data.get("scripts") or {}
        for key, field in (("test", "test_command"), ("build", "build_command"),
                           ("lint", "lint_command"), ("format", "format_command")):
            if key in scripts:
                pm = found["package_manager"] or "npm"
                found[field] = ("%s run %s" % (pm, key)) if key != "test" else ("%s test" % pm)
        if data.get("workspaces"):
            found["monorepo"] = True
        blob = json.dumps(deps).lower()
        for db in DB_HINTS:
            if db in blob and db not in found["databases"]:
                found["databases"].append(db)
        for tr in TEST_RUNNERS:
            if tr in blob and tr not in found["test_runners"]:
                found["test_runners"].append(tr)

    pyproj = _read(os.path.join(root, "pyproject.toml")) + _read(os.path.join(root, "requirements.txt"))
    low = pyproj.lower()
    for dep, name in FRAMEWORK_DEPS.items():
        if dep in low and name not in found["frameworks"]:
            found["frameworks"].append(name)
    for db in DB_HINTS:
        if db in low and db not in found["databases"]:
            found["databases"].append(db)
    if "pytest" in low and "pytest" not in found["test_runners"]:
        found["test_runners"].append("pytest")
    if "ruff" in low:
        found["lint_command"] = found["lint_command"] or "ruff check ."
    if "black" in low:
        found["format_command"] = found["format_command"] or "black ."

    for name in ("pnpm-workspace.yaml", "lerna.json", "turbo.json", "nx.json"):
        if name in entries:
            found["monorepo"] = True
    if os.path.isdir(os.path.join(root, ".github", "workflows")):
        found["ci"].append("github-actions")
    for f, ci in ((".gitlab-ci.yml", "gitlab"), (".circleci", "circleci"), ("Jenkinsfile", "jenkins")):
        if f in entries:
            found["ci"].append(ci)
    if ".git" in entries:
        found["vcs"] = "git"
    front = {"next.js", "react", "vue", "svelte", "angular", "astro", "remix"}
    back = {"express", "fastify", "nestjs", "django", "flask", "fastapi", "rails"}
    found["frontend"] = bool(front.intersection(found["frameworks"])) or "index.html" in entries
    found["backend"] = bool(back.intersection(found["frameworks"])) or "go" in found["languages"]
    if not found["languages"]:
        found["languages"].append("unknown")
    return found


def write(root, out_path):
    data = detect(root)
    util.save_json(out_path, data)
    return data


def load(path):
    return util.load_json(path, default={"languages": ["unknown"], "frameworks": [],
                                         "frontend": False, "backend": False,
                                         "test_command": None})
