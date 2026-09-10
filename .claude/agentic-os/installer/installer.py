#!/usr/bin/env python3
"""Agentic OS installer.

Deploys the canonical distribution in ../payload into a target project. Everything it
creates is recorded in a manifest with a hash, so update, clean install and uninstall can
touch exactly what the installer owns and nothing else.
"""
import argparse
import hashlib
import json
import os
import shutil
import sys
import time
import uuid

SCHEMA = {"installation": 1, "configuration": 1, "queue": 1, "skill": 1, "learning": 1}
BEGIN = "<!-- AGENTIC-OS:BEGIN -->"
END = "<!-- AGENTIC-OS:END -->"
PAYLOAD_DIRS = ["runtime", "config", "skills", "hooks", "bin"]
PAYLOAD_FILES = ["VERSION", "CLAUDE.block.md"]
HOOK_MARKER = ".claude/agentic-os/hooks"
PRESERVE_ON_UPDATE = ["state", "adapter.json", "config"]


def dist_root():
    return os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def sha(path):
    h = hashlib.sha256()
    with open(path, "rb") as fh:
        for chunk in iter(lambda: fh.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def log(msg, quiet=False):
    if not quiet:
        print(msg)


class Install(object):
    def __init__(self, project, quiet=False):
        self.project = os.path.abspath(project)
        self.claude = os.path.join(self.project, ".claude")
        self.root = os.path.join(self.claude, "agentic-os")
        self.manifest_path = os.path.join(self.root, "manifest.json")
        self.quiet = quiet

    # ---------- manifest ----------
    def manifest(self):
        try:
            with open(self.manifest_path) as fh:
                return json.load(fh)
        except (IOError, OSError, ValueError):
            return None

    def exists(self):
        if self.manifest():
            return True
        # marker-free detection: known directories still count as an installation
        return os.path.isdir(os.path.join(self.root, "runtime"))

    def owned_paths(self):
        m = self.manifest() or {}
        return list(m.get("files", {}).keys())

    def abs_owned(self, rel):
        return os.path.join(self.project, rel)

    # ---------- installation ----------
    def install(self, clean=False, update=False):
        src = os.path.join(dist_root(), "payload")
        if not os.path.isdir(src):
            raise SystemExit("distribution payload not found at %s" % src)
        prior = self.manifest()
        if clean:
            self.remove_owned(keep_state=False, note="clean install")
        elif update and prior:
            self.remove_owned(keep_state=True, note="update", keep_manifest=True)

        os.makedirs(self.root, exist_ok=True)
        files = {}

        for d in PAYLOAD_DIRS:
            s = os.path.join(src, d)
            for dirpath, _dirs, names in os.walk(s):
                for n in names:
                    if n.endswith(".pyc") or "__pycache__" in dirpath:
                        continue
                    sp = os.path.join(dirpath, n)
                    rel = os.path.relpath(sp, src)
                    dp = os.path.join(self.root, rel)
                    os.makedirs(os.path.dirname(dp), exist_ok=True)
                    is_config = rel.startswith("config" + os.sep)
                    recorded = prior.get("files", {}).get(self._rel(dp)) if prior else None
                    keep_user_edit = (update and prior and is_config and os.path.exists(dp)
                                      and recorded not in (None, sha(dp)))
                    if keep_user_edit:
                        shutil.copy2(sp, dp + ".new")
                        files[self._rel(dp + ".new")] = sha(dp + ".new")
                        log("  kept user-modified %s (new version at %s.new)" % (rel, rel), self.quiet)
                    else:
                        shutil.copy2(sp, dp)
                    if os.path.basename(dp) == "aos" or dp.endswith(".py") and "/hooks/" in dp:
                        os.chmod(dp, 0o755)
                    # For a kept edit, record the hash of the version we *shipped*, not the
                    # one on disk. Recording the user's own hash makes the next update read
                    # the file as pristine and overwrite it - the edit survives one update
                    # and dies on the second.
                    files[self._rel(dp)] = sha(sp) if keep_user_edit else sha(dp)

        for f in PAYLOAD_FILES:
            sp, dp = os.path.join(src, f), os.path.join(self.root, f)
            shutil.copy2(sp, dp)
            files[self._rel(dp)] = sha(dp)

        # installer CLI inside the installation, so update/doctor work from the project
        inst_dir = os.path.join(self.root, "installer")
        os.makedirs(inst_dir, exist_ok=True)
        shutil.copy2(os.path.abspath(__file__), os.path.join(inst_dir, "installer.py"))
        files[self._rel(os.path.join(inst_dir, "installer.py"))] = sha(os.path.join(inst_dir, "installer.py"))
        wrapper = os.path.join(self.root, "bin", "agentic-os")
        with open(wrapper, "w") as fh:
            fh.write('#!/usr/bin/env bash\nset -euo pipefail\n'
                     'HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"\n'
                     'exec python3 "$HERE/installer/installer.py" "$@" '
                     '--project "$(cd "$HERE/../.." && pwd)"\n')
        os.chmod(wrapper, 0o755)
        files[self._rel(wrapper)] = sha(wrapper)

        # agents (native subagents)
        agents_dir = os.path.join(self.claude, "agents")
        os.makedirs(agents_dir, exist_ok=True)
        for n in sorted(os.listdir(os.path.join(src, "agents"))):
            if not n.endswith(".md"):
                continue
            dp = os.path.join(agents_dir, n)
            shutil.copy2(os.path.join(src, "agents", n), dp)
            files[self._rel(dp)] = sha(dp)

        # native entry skill
        skill_dir = os.path.join(self.claude, "skills", "agentic-os")
        os.makedirs(skill_dir, exist_ok=True)
        dp = os.path.join(skill_dir, "SKILL.md")
        shutil.copy2(os.path.join(src, "entry-skill", "SKILL.md"), dp)
        files[self._rel(dp)] = sha(dp)

        version = open(os.path.join(src, "VERSION")).read().strip()
        install_id = (prior or {}).get("install_id") or str(uuid.uuid4())

        self.write_claude_md(version)
        hooks_written = self.write_hooks()
        adapter = self.init_state(fresh=clean or not prior)
        # generated artifacts are hashed after generation, not from the payload copy
        for gen in (os.path.join(self.root, "skills", "registry.json"),
                    os.path.join(self.root, "adapter.json")):
            if os.path.exists(gen):
                files[self._rel(gen)] = sha(gen)

        m = {"install_id": install_id, "version": version, "schema": SCHEMA,
             "installed_at": time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime()),
             "project": self.project, "distribution": dist_root(),
             "files": files,
             "directories": [self._rel(self.root), self._rel(skill_dir)],
             "claude_md": {"path": self._rel(self.claude_md_path()), "marker": BEGIN},
             "settings_hooks": hooks_written,
             "adapter": adapter}
        with open(self.manifest_path, "w") as fh:
            json.dump(m, fh, indent=2, sort_keys=True)
        files[self._rel(self.manifest_path)] = "self"
        return m

    def _rel(self, path):
        return os.path.relpath(path, self.project)

    # ---------- CLAUDE.md ----------
    def claude_md_path(self):
        """Where this project's memory actually lives.

        Claude Code loads a project's CLAUDE.md from the repository root and the user's
        from ~/.claude/CLAUDE.md. Write into whichever applies rather than creating a file
        nothing reads.
        """
        root_md = os.path.join(self.project, "CLAUDE.md")
        claude_md = os.path.join(self.claude, "CLAUDE.md")
        if os.path.exists(root_md):
            return root_md
        if os.path.exists(claude_md):
            return claude_md
        if os.path.abspath(self.project) == os.path.abspath(os.path.expanduser("~")):
            return claude_md
        return root_md

    def write_claude_md(self, version):
        block_src = os.path.join(self.root, "CLAUDE.block.md")
        with open(block_src) as fh:
            block = fh.read().replace("{{AOS_HOME}}", self.root).replace("{{AOS_VERSION}}", version)
        path = self.claude_md_path()
        existing = ""
        if os.path.exists(path):
            with open(path) as fh:
                existing = fh.read()
        payload = "%s\n%s\n%s\n" % (BEGIN, block.strip(), END)
        if BEGIN in existing and END in existing:
            pre = existing.split(BEGIN)[0]
            post = existing.split(END, 1)[1]
            new = pre + payload + post
        else:
            sep = "" if existing.endswith("\n") or not existing else "\n"
            new = existing + sep + ("\n" if existing else "") + payload
        if new != existing:
            if existing:
                shutil.copy2(path, path + ".aos-backup")
            os.makedirs(os.path.dirname(path), exist_ok=True)
            with open(path, "w") as fh:
                fh.write(new)

    def strip_claude_md(self):
        m = self.manifest() or {}
        rel = (m.get("claude_md") or {}).get("path")
        path = os.path.join(self.project, rel) if rel else self.claude_md_path()
        if not os.path.exists(path):
            return
        with open(path) as fh:
            text = fh.read()
        if BEGIN not in text or END not in text:
            return
        new = (text.split(BEGIN)[0] + text.split(END, 1)[1]).strip()
        if not new:
            os.remove(path)  # the file existed only to carry our block
            return
        with open(path, "w") as fh:
            fh.write(new + "\n")

    # ---------- settings hooks ----------
    def settings_path(self):
        return os.path.join(self.claude, "settings.json")

    def write_hooks(self):
        path = self.settings_path()
        data = {}
        if os.path.exists(path):
            try:
                with open(path) as fh:
                    data = json.load(fh)
            except ValueError:
                log("  settings.json is not valid JSON - hooks not installed", self.quiet)
                return []
            shutil.copy2(path, path + ".aos-backup")
        hooks = data.setdefault("hooks", {})
        wanted = [
            ("PreToolUse", "Bash|Write|Edit|MultiEdit|NotebookEdit", "pre_tool_use.py"),
            ("PostToolUse", "Bash|Write|Edit|MultiEdit|NotebookEdit", "post_tool_use.py"),
            ("SessionStart", None, "session_start.py"),
            ("UserPromptSubmit", None, "user_prompt_submit.py"),
            ("Stop", None, "stop.py"),
        ]
        written = []
        for event, matcher, script in wanted:
            cmd = "python3 %s" % os.path.join(self.root, "hooks", script)
            entries = hooks.setdefault(event, [])
            entries[:] = [e for e in entries
                          if HOOK_MARKER not in json.dumps(e)]  # idempotent: drop ours, re-add
            entry = {"hooks": [{"type": "command", "command": cmd, "timeout": 15}]}
            if matcher:
                entry["matcher"] = matcher
            entries.append(entry)
            written.append({"event": event, "command": cmd})
        os.makedirs(self.claude, exist_ok=True)
        with open(path, "w") as fh:
            json.dump(data, fh, indent=2)
            fh.write("\n")
        return written

    def strip_hooks(self):
        path = self.settings_path()
        if not os.path.exists(path):
            return
        try:
            with open(path) as fh:
                data = json.load(fh)
        except ValueError:
            return
        hooks = data.get("hooks", {})
        for event in list(hooks):
            hooks[event] = [e for e in hooks[event] if HOOK_MARKER not in json.dumps(e)]
            if not hooks[event]:
                del hooks[event]
        if not hooks:
            data.pop("hooks", None)
        with open(path, "w") as fh:
            json.dump(data, fh, indent=2)
            fh.write("\n")

    # ---------- state ----------
    def init_state(self, fresh=True):
        sys.path.insert(0, self.root)
        os.environ["AOS_HOME"] = self.root
        for mod in [m for m in list(sys.modules) if m == "runtime" or m.startswith("runtime.")]:
            del sys.modules[mod]
        from runtime import adapter, learning, metrics, queue, registry  # noqa: E402
        state = os.path.join(self.root, "state")
        if fresh and os.path.isdir(state):
            shutil.rmtree(state)
        os.makedirs(state, exist_ok=True)
        registry.build(os.path.join(self.root, "skills"),
                       os.path.join(self.root, "skills", "registry.json"))
        # the project's own skills, so the router can reach them too
        registry.build_project(os.path.join(self.claude, "skills"),
                               os.path.join(self.root, "skills", "project-registry.json"))
        data = adapter.write(self.project, os.path.join(self.root, "adapter.json"))
        queue.connect().close()
        learning.connect().close()
        metrics.connect().close()
        return {"languages": data.get("languages"), "frameworks": data.get("frameworks"),
                "test_command": data.get("test_command")}

    # ---------- removal ----------
    def remove_owned(self, keep_state=False, note="", keep_manifest=False):
        m = self.manifest()
        if not m:
            if os.path.isdir(self.root) and not keep_state:
                shutil.rmtree(self.root)
            return {"removed": ["(unmanifested installation directory)"] if os.path.isdir(self.root) else []}
        removed, skipped = [], []
        for rel, digest in sorted(m.get("files", {}).items()):
            if keep_state and any(rel.startswith(os.path.join(".claude", "agentic-os", p))
                                  for p in PRESERVE_ON_UPDATE):
                continue
            path = self.abs_owned(rel)
            if not self._safe_to_delete(path):
                skipped.append(rel)
                continue
            if os.path.exists(path):
                os.remove(path)
                removed.append(rel)
        if not keep_state and os.path.isdir(self.root):
            # the installation directory is owned in full - including files left by an
            # older version that this manifest never listed
            shutil.rmtree(self.root)
            removed.append(self._rel(self.root) + "/ (whole installation directory)")
        # prune empty directories inside the installation only
        for dirpath, _dirs, _files in sorted(os.walk(self.root, topdown=False)):
            if keep_manifest and dirpath == self.root:
                continue
            try:
                if not os.listdir(dirpath):
                    os.rmdir(dirpath)
            except OSError:
                pass
        return {"removed": removed, "skipped_unsafe": skipped, "note": note}

    def _safe_to_delete(self, path):
        """Only delete inside the installation, or a tracked file under .claude we created."""
        path = os.path.abspath(path)
        if path.startswith(self.root + os.sep):
            return True
        allowed_prefixes = [os.path.join(self.claude, "agents", "aos-"),
                            os.path.join(self.claude, "skills", "agentic-os") + os.sep]
        return any(path.startswith(p) for p in allowed_prefixes)

    def uninstall(self):
        res = self.remove_owned(keep_state=False, note="uninstall")
        self.strip_claude_md()
        self.strip_hooks()
        skill_dir = os.path.join(self.claude, "skills", "agentic-os")
        if os.path.isdir(skill_dir) and not os.listdir(skill_dir):
            os.rmdir(skill_dir)
        if os.path.isdir(self.root):
            leftovers = []
            for dp, _d, fs in os.walk(self.root):
                leftovers.extend(os.path.join(dp, f) for f in fs)
            if not leftovers:
                shutil.rmtree(self.root)
            else:
                res["left_behind"] = [self._rel(p) for p in leftovers]
        return res

    # ---------- diagnostics ----------
    def doctor(self):
        checks = []

        def chk(name, ok, detail=""):
            checks.append({"check": name, "ok": bool(ok), "detail": detail})
            return ok

        m = self.manifest()
        if not chk("manifest", m is not None, self.manifest_path):
            return {"ok": False, "checks": checks}
        chk("schema versions", m.get("schema") == SCHEMA, json.dumps(m.get("schema")))
        missing = [r for r in m["files"] if not os.path.exists(self.abs_owned(r))]
        chk("owned files present", not missing, "missing: %s" % missing[:5])
        modified = [r for r, d in m["files"].items()
                    if d != "self" and os.path.exists(self.abs_owned(r))
                    and sha(self.abs_owned(r)) != d]
        cfg_edits = [r for r in modified if os.path.join("agentic-os", "config") in r]
        other = [r for r in modified if r not in cfg_edits]
        # Editing config is the supported way to tune the OS, and update preserves those
        # edits - reporting them as a fault trains people to ignore doctor. Only changes
        # the next update would silently overwrite are a problem.
        chk("owned files unmodified", not other, "locally modified: %s" % other[:5])
        if cfg_edits:
            chk("local config edits", True,
                "preserved across update: %s" % [os.path.basename(r) for r in cfg_edits])
        agents = [f for f in os.listdir(os.path.join(self.claude, "agents"))
                  if f.startswith("aos-")] if os.path.isdir(os.path.join(self.claude, "agents")) else []
        chk("agents installed", len(agents) == 9, "%d found" % len(agents))

        sys.path.insert(0, self.root)
        os.environ["AOS_HOME"] = self.root
        for mod in [k for k in list(sys.modules) if k == "runtime" or k.startswith("runtime.")]:
            del sys.modules[mod]
        try:
            from runtime import (classify, guards, learning, metrics, models, queue,  # noqa
                                 registry, router)
        except Exception as exc:
            chk("runtime importable", False, str(exc))
            return {"ok": False, "checks": checks}
        chk("runtime importable", True)
        reg = registry.load(os.path.join(self.root, "skills", "registry.json"))
        proj = registry.load(os.path.join(self.root, "skills", "project-registry.json"))
        chk("skill registry", len(reg.get("skills", {})) >= 40,
            "%d OS skills + %d project skills discovered"
            % (len(reg.get("skills", {})), len(proj.get("skills") or {})))
        problems = registry.validate(reg)
        chk("skill dependencies resolve", not problems, "; ".join(problems[:3]))
        disk = registry.scan(os.path.join(self.root, "skills"))
        chk("registry matches disk", set(disk) == set(reg.get("skills", {})),
            "disk=%d registry=%d" % (len(disk), len(reg.get("skills", {}))))
        try:
            mv = models.validate()
            chk("model mapping", all(mv[t]["model"] for t in mv),
                ", ".join("%s->%s%s" % (t, mv[t]["model"], "" if mv[t]["confirmed"] else " (unconfirmed)")
                          for t in mv))
        except Exception as exc:
            chk("model mapping", False, str(exc))
        try:
            con = queue.connect(os.path.join(self.root, "state", "queue.db"))
            v = con.execute("SELECT value FROM meta WHERE key='schema_version'").fetchone()[0]
            chk("queue", int(v) == SCHEMA["queue"], "schema %s, %d tasks" % (v, queue.stats(con)["total"]))
        except Exception as exc:
            chk("queue", False, str(exc))
        try:
            g = guards.check("rm -rf /")
            chk("guards", g["action"] == "BLOCK", "rm -rf / -> %s" % g["action"])
        except Exception as exc:
            chk("guards", False, str(exc))
        try:
            c = classify.classify("deploy the payment service to production")
            chk("classifier", c["risk"]["level"] in ("high", "critical"),
                "risk=%s depth=%s" % (c["risk"]["level"], c["depth"]))
        except Exception as exc:
            chk("classifier", False, str(exc))
        try:
            r = router.route("fix the css on the pricing page", agent="builder")
            chk("skill router", 0 < len(r["loaded"]) < len(reg["skills"]),
                "%d of %d loaded" % (len(r["loaded"]), len(reg["skills"])))
        except Exception as exc:
            chk("skill router", False, str(exc))
        try:
            learning.connect(os.path.join(self.root, "state", "learning.db"))
            metrics.connect(os.path.join(self.root, "state", "metrics.db"))
            chk("learning store", True)
        except Exception as exc:
            chk("learning store", False, str(exc))
        hooks_ok = False
        try:
            with open(self.settings_path()) as fh:
                hooks_ok = HOOK_MARKER in fh.read()
        except (IOError, OSError):
            pass
        chk("hooks wired", hooks_ok, self.settings_path())
        md = self.claude_md_path()
        cmd_ok = os.path.exists(md) and BEGIN in open(md).read()
        chk("CLAUDE.md block", cmd_ok, md)
        chk("project adapter", os.path.exists(os.path.join(self.root, "adapter.json")))
        return {"ok": all(c["ok"] for c in checks), "checks": checks}

    def status(self):
        m = self.manifest()
        if not m:
            return {"installed": False, "project": self.project}
        sys.path.insert(0, self.root)
        os.environ["AOS_HOME"] = self.root
        for mod in [k for k in list(sys.modules) if k == "runtime" or k.startswith("runtime.")]:
            del sys.modules[mod]
        from runtime import learning, metrics, queue, registry
        reg = registry.load(os.path.join(self.root, "skills", "registry.json"))
        agents_dir = os.path.join(self.claude, "agents")
        agents = sorted(f[:-3] for f in os.listdir(agents_dir)
                        if f.startswith("aos-")) if os.path.isdir(agents_dir) else []
        con = queue.connect(os.path.join(self.root, "state", "queue.db"))
        lcon = learning.connect(os.path.join(self.root, "state", "learning.db"))
        mcon = metrics.connect(os.path.join(self.root, "state", "metrics.db"))
        try:
            with open(self.settings_path()) as fh:
                hook_events = [e for e in json.load(fh).get("hooks", {})
                               if HOOK_MARKER in json.dumps(json.load(open(self.settings_path()))
                                                            .get("hooks", {}).get(e, []))]
        except (IOError, OSError, ValueError):
            hook_events = []
        return {
            "installed": True, "version": m["version"], "install_id": m["install_id"],
            "installed_at": m["installed_at"], "location": self.root,
            "project": self.project, "owned_files": len(m["files"]),
            "agents": agents, "skills_installed": len(reg.get("skills", {})),
            "project_skills_discovered": len(
                registry.load(os.path.join(self.root, "skills",
                                           "project-registry.json")).get("skills") or {}),
            "queue": queue.stats(con),
            "hooks": hook_events,
            "adapter": m.get("adapter"),
            "learning": {"champion_policies": len(learning.active(lcon)),
                         "challengers": len(learning.challengers(lcon)),
                         "observations": lcon.execute("SELECT COUNT(*) FROM observations").fetchone()[0]},
            "metrics": {"runs": mcon.execute("SELECT COUNT(*) FROM runs").fetchone()[0]},
            "schema": m["schema"],
        }


def validate_distribution():
    """Refuse to ship a distribution with empty skills, unresolved refs, or bad configs."""
    src = os.path.join(dist_root(), "payload")
    problems = []
    sys.path.insert(0, src)
    from runtime import registry  # noqa: E402
    skills = {}
    try:
        skills = registry.scan(os.path.join(src, "skills"))
    except ValueError as exc:
        problems.append("skills: %s" % exc)
    problems.extend(registry.validate({"skills": skills}))
    if len(skills) < 45:
        problems.append("only %d skills in the distribution" % len(skills))
    agents = sorted(f for f in os.listdir(os.path.join(src, "agents")) if f.endswith(".md"))
    if len(agents) != 9:
        problems.append("expected 9 agents, found %d" % len(agents))
    agent_names = set(a[4:-3] for a in agents)
    for a in agents:
        meta, body = registry.parse_frontmatter(open(os.path.join(src, "agents", a)).read())
        if not meta.get("name") or not meta.get("description"):
            problems.append("%s: invalid frontmatter" % a)
        if len(body.split()) < 150:
            problems.append("%s: placeholder agent body" % a)
    for name, meta in skills.items():
        for agent in meta.get("agents", []):
            if agent not in agent_names and agent != "router":
                problems.append("%s references unknown agent '%s'" % (name, agent))
    for cfg in os.listdir(os.path.join(src, "config")):
        try:
            json.load(open(os.path.join(src, "config", cfg)))
        except ValueError as exc:
            problems.append("config/%s: %s" % (cfg, exc))
    for required in ("runtime/cli.py", "hooks/pre_tool_use.py", "bin/aos", "VERSION",
                     "CLAUDE.block.md", "entry-skill/SKILL.md"):
        if not os.path.exists(os.path.join(src, required)):
            problems.append("missing payload file: %s" % required)
    return {"ok": not problems, "skills": len(skills), "agents": len(agents),
            "problems": problems}


def main(argv=None):
    ap = argparse.ArgumentParser(prog="agentic-os", description="Agentic OS installer")
    ap.add_argument("command", choices=["install", "update", "uninstall", "doctor", "status",
                                        "validate", "version"])
    ap.add_argument("--project", default=os.getcwd())
    ap.add_argument("--clean", action="store_true", help="remove the existing installation first")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--quiet", action="store_true")
    a = ap.parse_args(argv)
    inst = Install(a.project, quiet=a.quiet or a.json)

    if a.command == "version":
        print(open(os.path.join(dist_root(), "payload", "VERSION")).read().strip())
        return 0

    if a.command == "validate":
        res = validate_distribution()
        print(json.dumps(res, indent=2))
        return 0 if res["ok"] else 1

    if a.command == "install":
        existing = inst.exists()
        log("Agentic OS: %s into %s" % ("clean install" if a.clean else
                                        ("reinstall" if existing else "install"), inst.project), inst.quiet)
        m = inst.install(clean=a.clean)
        skill_count = sum(1 for dp, _d, fs in os.walk(os.path.join(inst.root, "skills"))
                          if "SKILL.md" in fs)
        log("  version %s, %d owned files, %d skills, 9 agents" %
            (m["version"], len(m["files"]), skill_count), inst.quiet)
        res = inst.doctor()
        if a.json:
            print(json.dumps({"install": m["install_id"], "doctor": res}, indent=2))
        else:
            for c in res["checks"]:
                log("  [%s] %s %s" % ("ok" if c["ok"] else "FAIL", c["check"], c["detail"]), inst.quiet)
            log("Done. Run `%s/bin/agentic-os status`." % inst.root, inst.quiet)
        return 0 if res["ok"] else 1

    if a.command == "update":
        if not inst.exists():
            raise SystemExit("no Agentic OS installation found in %s" % inst.project)
        m = inst.install(update=True)
        res = inst.doctor()
        print(json.dumps({"updated_to": m["version"], "doctor_ok": res["ok"]}, indent=2))
        return 0 if res["ok"] else 1

    if a.command == "uninstall":
        if not inst.exists():
            raise SystemExit("no Agentic OS installation found in %s" % inst.project)
        res = inst.uninstall()
        print(json.dumps({"removed_files": len(res.get("removed", [])),
                          "left_behind": res.get("left_behind", []),
                          "skipped_unsafe": res.get("skipped_unsafe", [])}, indent=2))
        return 0

    if a.command == "doctor":
        res = inst.doctor()
        if a.json:
            print(json.dumps(res, indent=2))
        else:
            for c in res["checks"]:
                print("[%s] %-28s %s" % ("ok" if c["ok"] else "FAIL", c["check"], c["detail"]))
            print("doctor: %s" % ("healthy" if res["ok"] else "problems found"))
        return 0 if res["ok"] else 1

    if a.command == "status":
        print(json.dumps(inst.status(), indent=2, sort_keys=True))
        return 0
    return 2


if __name__ == "__main__":
    sys.exit(main())
