"""`aos` - the Agentic OS runtime command line. Everything prints JSON."""
import argparse
import json
import os
import sys

if __package__ in (None, ""):  # allow `python3 runtime/cli.py`
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    __package__ = "runtime"

from . import (adapter, artifacts, classify, guards, learning, metrics, models,  # noqa: E402
               paths, queue, registry, router, util, workflow)


def out(obj):
    print(json.dumps(obj, indent=2, sort_keys=True, default=str))


def _policies():
    try:
        con = learning.connect()
        return learning.active(con)
    except Exception:
        return []


def _adapter():
    try:
        return adapter.load(paths.p("adapter.json"))
    except Exception:
        return {}


def main(argv=None):
    ap = argparse.ArgumentParser(prog="aos", description="Agentic OS runtime")
    sub = ap.add_subparsers(dest="cmd")

    p = sub.add_parser("classify", help="difficulty + risk + workflow depth")
    p.add_argument("task")
    p.add_argument("--files", type=int, default=0)

    p = sub.add_parser("route", help="select the minimum sufficient skill set")
    p.add_argument("task")
    p.add_argument("--agent")
    p.add_argument("--budget", type=int, default=6)

    p = sub.add_parser("plan", help="full execution plan for a task")
    p.add_argument("task")
    p.add_argument("--files", type=int, default=0)

    p = sub.add_parser("guard", help="evaluate a shell command against the guards")
    p.add_argument("command")

    p = sub.add_parser("guard-path", help="evaluate a write to a path")
    p.add_argument("path")

    p = sub.add_parser("audit", help="completion audit")
    p.add_argument("task_id", type=int)
    p.add_argument("--criteria", default="")

    p = sub.add_parser("queue")
    p.add_argument("action", choices=["add", "list", "ready", "set", "get", "stats", "record"])
    p.add_argument("args", nargs="*")
    p.add_argument("--depends-on", default="")
    p.add_argument("--body", default="")

    p = sub.add_parser("artifact")
    p.add_argument("action", choices=["write", "read"])
    p.add_argument("task_id", type=int)
    p.add_argument("agent", nargs="?")
    p.add_argument("--json", default="{}")

    p = sub.add_parser("learn")
    p.add_argument("action", choices=["observe", "patterns", "hypothesize", "propose", "active",
                                      "challengers", "compare", "promote", "reject", "rollback",
                                      "history", "record-metric", "cycle"])
    p.add_argument("args", nargs="*")
    p.add_argument("--json", default="{}")
    p.add_argument("--dry-run", dest="dry_run", action="store_true",
                   help="learn cycle: report what it would do, promote nothing")

    sub.add_parser("models", help="show tier -> model mapping and availability")
    p = sub.add_parser("adapter")
    p.add_argument("action", choices=["show", "refresh"], nargs="?", default="show")
    p = sub.add_parser("registry")
    p.add_argument("action", choices=["show", "build", "validate"], nargs="?", default="show")
    sub.add_parser("metrics")

    a = ap.parse_args(argv)
    if not a.cmd:
        ap.print_help()
        return 2

    if a.cmd == "classify":
        return out(classify.classify(a.task, a.files, _policies()))
    if a.cmd == "route":
        return out(router.route(a.task, agent=a.agent, budget=a.budget,
                                adapter=_adapter(), policies=_policies()))
    if a.cmd == "plan":
        return out(workflow.plan(a.task, a.files, policies=_policies(), adapter_data=_adapter()))
    if a.cmd == "guard":
        res = guards.check(a.command)
        out(res)
        return 0 if res["action"] in ("ALLOW", "CONFIRM") else 1
    if a.cmd == "guard-path":
        return out(guards.check_path_write(a.path))
    if a.cmd == "models":
        return out({"validation": models.validate(),
                    "example": {lvl: models.route(lvl) for lvl in range(1, 6)}})
    if a.cmd == "adapter":
        if a.action == "refresh":
            return out(adapter.write(paths.project_root(), paths.p("adapter.json")))
        return out(_adapter())
    if a.cmd == "registry":
        reg_path = paths.p("skills", "registry.json")
        if a.action == "build":
            return out({"built": registry.build(paths.p("skills"), reg_path)["count"]})
        reg = registry.load(reg_path)
        if a.action == "validate":
            return out({"problems": registry.validate(reg), "count": len(reg.get("skills", {}))})
        return out({"count": len(reg.get("skills", {})), "skills": sorted(reg.get("skills", {}))})
    if a.cmd == "metrics":
        con = metrics.connect()
        return out({"champion": metrics.aggregate(con, arm="champion"),
                    "challenger": metrics.aggregate(con, arm="challenger")})

    if a.cmd == "queue":
        con = queue.connect()
        act, args = a.action, a.args
        if act == "add":
            title = args[0]
            cls = classify.classify(title, policies=_policies())
            deps = [int(x) for x in a.depends_on.split(",") if x.strip()]
            tid = queue.add(con, title, a.body, deps, cls["depth"], cls["risk"]["level"],
                            classification=cls)
            return out({"id": tid, "depth": cls["depth"], "risk": cls["risk"]["level"],
                        "blockers": [b["id"] for b in queue.blockers(con, tid)]})
        if act == "list":
            return out(queue.listing(con, args[0] if args else None))
        if act == "ready":
            return out(queue.ready(con))
        if act == "get":
            return out(queue.get(con, int(args[0])))
        if act == "set":
            queue.set_status(con, int(args[0]), args[1], " ".join(args[2:]))
            return out(queue.get(con, int(args[0])))
        if act == "record":
            queue.record(con, int(args[0]), **json.loads(a.body or "{}"))
            return out(queue.get(con, int(args[0])))
        return out(queue.stats(con))

    if a.cmd == "artifact":
        if a.action == "write":
            path = artifacts.write(a.task_id, a.agent, json.loads(a.json))
            return out({"written": path})
        return out(artifacts.read(a.task_id, a.agent))

    if a.cmd == "audit":
        con = queue.connect()
        task = queue.get(con, a.task_id) or {"id": a.task_id, "title": ""}
        crit = [c.strip() for c in a.criteria.split("|") if c.strip()]
        res = workflow.completion_audit(task, artifacts.read(a.task_id), crit)
        out(res)
        return 0 if res["verdict"] == "COMPLETED" else 1

    if a.cmd == "learn":
        con = learning.connect()
        act, args = a.action, a.args
        if act == "observe":
            learning.observe(con, int(args[0]) if args[0].isdigit() else None, args[1], args[2],
                             json.loads(a.json))
            return out({"observed": args[1:3]})
        if act == "cycle":
            return out(learning.cycle(con, metrics.connect(), auto_promote=not a.dry_run))
        if act == "patterns":
            return out(learning.patterns(con))
        if act == "hypothesize":
            return out(learning.hypothesize(con))
        if act == "propose":
            d = json.loads(a.json)
            return out(learning.propose(con, d["kind"], d["key"], d.get("scope", ""), d["value"],
                                        d.get("reason", ""), d.get("evidence"), d.get("source_task")))
        if act == "active":
            return out(learning.active(con))
        if act == "challengers":
            return out(learning.challengers(con))
        if act == "compare":
            return out(learning.compare(metrics.connect(), int(args[0])))
        if act == "promote":
            cmp_ = learning.compare(metrics.connect(), int(args[0]))
            if cmp_["decision"] != "promote" and "--force" not in args:
                return out({"promoted": False, "comparison": cmp_})
            return out(learning.promote(con, int(args[0]), cmp_))
        if act == "reject":
            return out(learning.reject(con, int(args[0]), " ".join(args[1:]) or "rejected"))
        if act == "rollback":
            return out(learning.rollback(con, int(args[0]), " ".join(args[1:]) or "manual rollback"))
        if act == "record-metric":
            d = json.loads(a.json)
            return out(metrics.record(metrics.connect(), int(args[0]), **d))
        return out(learning.history(con))
    return 0


if __name__ == "__main__":
    sys.exit(main() or 0)
