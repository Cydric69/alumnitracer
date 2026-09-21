#!/usr/bin/env node
// content-filters.mjs — pins the public/admin boundary on the events and
// announcements read filter.
//
// WHY THIS EXISTS. `getEvents` / `getAnnouncements` are public server actions
// that ALSO serve the dashboard, and the only thing separating the two views is
// an argument the caller supplies. That shape has failed twice here:
//
//   1. `status` was taken straight from the caller, so an anonymous request
//      with `{"status":"inactive"}` — or `{}` — read unpublished content.
//   2. The filter builder returned `{}` when the input failed to parse, so ONE
//      bad field widened the query to every row, discarding the `isActive:true`
//      the public page had explicitly asked for. Reachable with ordinary data:
//      `year` is free text on the create form, and a stored "2024-2025" was
//      rejected by a read schema that demanded /^\d{4}$/.
//
// The invariant, which no type can express: for a non-admin caller the filter
// must ALWAYS pin isActive:true, whatever the input and whether or not it
// parses. Failing to parse must never produce a broader result set than
// succeeding.
//
// Run: node scripts/verify/content-filters.mjs   (exit 0 = invariant holds)

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const ACTIONS = path.join(ROOT, "app/actions/events-announcements.actions.ts");
const SCHEMA = path.join(ROOT, "lib/validations/events-announcements.ts");

const ts = (await import(path.join(ROOT, "node_modules/typescript/lib/typescript.js"))).default;

// Transpile the real schema module and import it — no hand-copied duplicate,
// so this check follows the schema when it changes.
const out = path.join(ROOT, "node_modules/.cache/content-filters.schema.mjs");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(
  out,
  ts
    .transpileModule(fs.readFileSync(SCHEMA, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    })
    .outputText.replace(/from ["']zod["']/g, `from "${path.join(ROOT, "node_modules/zod/index.js")}"`),
);
const mod = await import(out);
const { eventFiltersSchema } = mod;

// THE REAL FUNCTION, imported — not a copy. A previous version of this script
// re-implemented buildContentFilters inline and checked the source with regexes.
// A reviewer defeated it: adding `if (params.status === "inactive")
// filters.isActive = false;` after the pin reopened the vulnerability in full
// and this script still printed `failures: 0`. A guard that tests its own copy
// of the code tests nothing.
const { buildContentFilters } = mod;

let failures = 0;
const check = (name, ok) => {
  console.log(`  ${ok ? "ok  " : "FAIL"}  ${name}`);
  if (!ok) failures++;
};

console.log("\nA public caller can never widen past isActive:true:");
for (const params of [
  { status: "inactive" },
  {},
  { status: "all" },
  { status: "active" },
  { year: "20" },
  { year: { $ne: null } },
  { status: { $ne: null } },
  { status: "inactive", year: "2024-2025" },
  { status: "nonsense" },
  { year: "" },
  { year: "x".repeat(999) },
]) {
  const { filters: f } = buildContentFilters(params, { allowInactive: false });
  check(`${JSON.stringify(params)} -> ${JSON.stringify(f)}`, f.isActive === true);
}

console.log("\nNo mongo operator reaches the filter:");
for (const params of [{ year: { $ne: null } }, { year: { $gt: "" } }, { status: { $ne: null } }]) {
  const { filters: f } = buildContentFilters(params, { allowInactive: true });
  check(
    `${JSON.stringify(params)} -> ${JSON.stringify(f)}`,
    Object.values(f).every((v) => typeof v !== "object"),
  );
}

console.log("\nAn admin keeps the full view:");
check("inactive -> isActive:false", buildContentFilters({ status: "inactive" }, { allowInactive: true }).filters.isActive === false);
check("all -> unfiltered", !("isActive" in buildContentFilters({ status: "all" }, { allowInactive: true }).filters));

console.log("\nThe read schema accepts what the write side can store:");
check('"2024-2025" parses', eventFiltersSchema.safeParse({ status: "active", year: "2024-2025" }).success);
check(
  "and is applied rather than silently dropped",
  buildContentFilters({ status: "active", year: "2024-2025" }, { allowInactive: true }).filters.year === "2024-2025",
);

console.log("\nThe call sites resolve allowInactive from the session:");
const actions = fs.readFileSync(ACTIONS, "utf8");
// The imported function above proves the LOGIC. These prove the two public
// getters actually feed it a session-derived value instead of a literal —
// the exact regression the previous structural regexes let through.
const callSites = [...actions.matchAll(/buildContentFilters\(\s*params\s*,\s*\{\s*allowInactive\s*\}\s*\)/g)];
check(`both public getters call it with the session-derived flag (found ${callSites.length})`, callSites.length === 2);
check(
  "allowInactive is assigned from isAdminSession(), never a literal",
  (actions.match(/const allowInactive = await isAdminSession\(\);/g) || []).length === 2,
);
check(
  "no call site hardcodes allowInactive",
  !/allowInactive:\s*(true|false)/.test(actions),
);
check(
  "the filter builder is not redefined locally (it must be the imported one)",
  !/function buildContentFilters\s*\(/.test(actions),
);

console.log(`\nfailures: ${failures}`);
process.exit(failures ? 1 : 0);
