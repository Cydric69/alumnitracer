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
const { eventFiltersSchema } = await import(out);

// Mirrors buildContentFilters() in the actions file. Kept in step by the
// structural assertions at the bottom, which fail if the real one drifts.
function buildContentFilters(params, { allowInactive }) {
  const parsed = eventFiltersSchema.safeParse(params);
  const filters = {};
  const data = parsed.success ? parsed.data : {};
  if (allowInactive) {
    if (data.status && data.status !== "all") filters.isActive = data.status === "active";
  } else {
    filters.isActive = true;
  }
  if (data.year && data.year !== "all") filters.year = data.year;
  return filters;
}

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
  const f = buildContentFilters(params, { allowInactive: false });
  check(`${JSON.stringify(params)} -> ${JSON.stringify(f)}`, f.isActive === true);
}

console.log("\nNo mongo operator reaches the filter:");
for (const params of [{ year: { $ne: null } }, { year: { $gt: "" } }, { status: { $ne: null } }]) {
  const f = buildContentFilters(params, { allowInactive: true });
  check(
    `${JSON.stringify(params)} -> ${JSON.stringify(f)}`,
    Object.values(f).every((v) => typeof v !== "object"),
  );
}

console.log("\nAn admin keeps the full view:");
check("inactive -> isActive:false", buildContentFilters({ status: "inactive" }, { allowInactive: true }).isActive === false);
check("all -> unfiltered", !("isActive" in buildContentFilters({ status: "all" }, { allowInactive: true })));

console.log("\nThe read schema accepts what the write side can store:");
check('"2024-2025" parses', eventFiltersSchema.safeParse({ status: "active", year: "2024-2025" }).success);
check(
  "and is applied rather than silently dropped",
  buildContentFilters({ status: "active", year: "2024-2025" }, { allowInactive: true }).year === "2024-2025",
);

console.log("\nThe real source still has the shape this check models:");
const actions = fs.readFileSync(ACTIONS, "utf8");
check("buildContentFilters takes an allowInactive option", /buildContentFilters\(\s*params[^)]*\{\s*allowInactive/s.test(actions));
check("it pins isActive = true on the non-admin branch", /else\s*\{\s*filters\.isActive = true;/.test(actions));
check("it never returns early on a parse failure", !/if \(!parsed\.success\) \{\s*return filters;/.test(actions));
check("both public getters resolve the session", (actions.match(/await isAdminSession\(\)/g) || []).length >= 2);

console.log(`\nfailures: ${failures}`);
process.exit(failures ? 1 : 0);
