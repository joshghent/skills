---
name: gantarr
description: Turn a plan, roadmap, or the current conversation into a Gantarr timeline — a complete, valid GanttProject JSON file you can import at gantarr.joshghent.com to render a Gantt chart. Use when the user wants to visualise a project plan, roadmap, sprint schedule, or sequence of work as a timeline, or asks for "Gantarr JSON", a "Gantt chart", or to "import this plan into Gantarr".
---

# Gantarr: Plan → Importable Timeline JSON

Use this skill when the user has a plan (a roadmap, a phased delivery schedule,
a sprint breakdown, a list of milestones, or just the work discussed in this
conversation) and wants to see it as a timeline in
[Gantarr](https://gantarr.joshghent.com).

The deliverable is a single `.gantarr.json` file conforming exactly to Gantarr's
`GanttProject` schema. Gantarr imports it verbatim — it runs `JSON.parse` and
loads the object straight into the chart with **no validation, no migration, and
no ID regeneration**. So the file must be complete and internally consistent on
the first try: every reference must resolve, every date must parse, every
required field must be present. A malformed file fails silently or renders a
broken chart.

## The Schema (authoritative)

A Gantarr file is one `GanttProject` object. Every field below is required
unless marked optional.

```jsonc
{
  "id": "string",            // unique id for the project (any unique string)
  "name": "string",          // timeline title, shown in the app and filename
  "workstreams": [ ... ],    // the horizontal swimlanes (phases / teams / epics)
  "workItems": [ ... ],      // the task bars
  "dependencies": [ ... ],   // arrows linking one task to another
  "legend": [ ... ],         // colour-coded categories (e.g. Dev, Design, QA)
  "createdAt": "string",     // ISO 8601 datetime, e.g. "2026-06-17T09:00:00.000Z"
  "updatedAt": "string"      // ISO 8601 datetime
}
```

### Workstream — a horizontal swimlane

A workstream is a band running across the chart: a phase, a team, an epic, or a
track of work. Tasks live inside a workstream.

```jsonc
{
  "id": "string",      // unique
  "label": "string",   // shown on the left, e.g. "Phase 1 — Discovery"
  "order": 0,          // 0-based; controls top-to-bottom order of bands
  "color": "#2a9d8f"   // hex; the band's side colour AND the default bar colour
}
```

### WorkItem — a task bar

```jsonc
{
  "id": "string",                 // unique
  "workstreamId": "string",       // MUST equal a workstreams[].id
  "title": "string",              // the task label on the bar
  "startDate": "2026-06-17",      // "YYYY-MM-DD", inclusive
  "endDate": "2026-06-20",        // "YYYY-MM-DD", inclusive (same as start = 1 day)
  "legendEntryId": "string|null", // a legend[].id to colour by category, or null
  "order": 0,                     // 0-based position within its workstream
  "lane": 0                       // OPTIONAL: explicit row within the band; omit it
}
```

- `legendEntryId`: when set to a legend entry's id, the bar takes that
  category's colour (this **overrides** the workstream colour). Set `null` to
  inherit the workstream's colour.
- `lane`: **omit this by default.** Without a lane, Gantarr greedy-packs tasks
  into rows by date so non-overlapping tasks share a row and overlapping ones
  stack — which is what you want for a generated timeline. Only set an explicit
  `lane` (0 = first row) when the user wants a task pinned to a specific row.

### Dependency — an arrow between tasks

```jsonc
{
  "id": "string",          // unique
  "fromItemId": "string",  // MUST equal a workItems[].id (the predecessor)
  "toItemId": "string"     // MUST equal a workItems[].id (the successor)
}
```

Use dependencies to draw "X must finish before Y starts" relationships. They are
visual arrows — Gantarr does **not** auto-reschedule, so set the dates yourself
so a dependent task starts on or after its predecessor ends.

### LegendEntry — a colour-coded category

```jsonc
{
  "id": "string",      // unique
  "label": "string",   // e.g. "Development"
  "color": "#3b82f6"   // hex
}
```

## ID Strategy

IDs only need to be **unique within the file and internally consistent** — the
app never regenerates them. Use short, readable slugs so the JSON is easy to
debug and the references are obvious at a glance:

- workstreams: `ws-discovery`, `ws-build`, `ws-launch`
- work items: `item-1`, `item-2`, … or `item-auth-api`
- legend: `leg-dev`, `leg-design`, `leg-qa`
- dependencies: `dep-1`, `dep-2`, …

UUIDs work too but add no value here and make the file harder to read.

## Colour Palettes (reuse Gantarr's own)

Match the app's defaults so imported timelines look native.

**Legend categories** (Gantarr's built-in default legend):

| Label | Hex |
|---|---|
| Development | `#3b82f6` |
| Design | `#8b5cf6` |
| Marketing | `#f97316` |
| Business Change | `#22c55e` |
| QA | `#ef4444` |

**Workstream band colours** (cycle through these in order):

`#e76f51` `#f4a261` `#e9c46a` `#2a9d8f` `#264653` `#8ecae6` `#a78bfa` `#f472b6`

Pick a legend that fits the plan's actual categories. If the plan is one kind of
work (e.g. all engineering), a small legend or an empty `legend: []` with
`legendEntryId: null` on every item is fine — bars then take their workstream
colour.

## Workflow

1. **Get the plan.** Use whatever the user pointed you at: a plan in this
   conversation, a file they named, a roadmap doc, or work just discussed. If
   there's genuinely no plan to work from, ask for one — don't invent scope.

2. **Decide the date anchor.** Find the start date: the user's stated kickoff,
   or today if unspecified. State the assumption ("Starting today, <date>") and
   proceed — don't block on it. Schedule work on weekdays (Gantarr treats Mon–Fri
   as working days; weekends render but work normally isn't placed there).
   Convert relative durations ("two weeks", "a sprint") into concrete inclusive
   `startDate`/`endDate`.

3. **Map the plan onto the schema:**
   - **Phases / teams / tracks / epics → workstreams.** Order them top-to-bottom
     with `order: 0, 1, 2, …`.
   - **Tasks / deliverables / milestones → work items**, each assigned to its
     workstream via `workstreamId`. A milestone is a 1-day item
     (`startDate === endDate`).
   - **Categories of work (discipline, team, type) → legend entries**, then set
     each item's `legendEntryId` to colour-code the chart. Skip if there's no
     meaningful category split.
   - **"Blocks" / "depends on" / sequencing → dependencies.** Make sure the
     dependent item's dates actually follow its predecessor.

4. **Assign `order` and lanes.** Give each workstream a unique `order`. Give
   each item an `order` within its workstream (0-based, by start date is fine).
   Leave `lane` off unless pinning a row.

5. **Emit the file.** Write a complete `GanttProject` to
   `<slugified-name>.gantarr.json` in the working directory (or where the user
   asks). Use the current datetime for `createdAt` and `updatedAt`. Pretty-print
   with 2-space indentation.

6. **Validate before finishing** (see checklist). Then tell the user the path
   and how to import.

## Validation Checklist (run before handing over)

Because Gantarr does no validation on import, you are the validation. Confirm:

- [ ] Top-level has all 8 fields: `id`, `name`, `workstreams`, `workItems`,
      `dependencies`, `legend`, `createdAt`, `updatedAt`.
- [ ] Every `workItems[].workstreamId` matches some `workstreams[].id`.
- [ ] Every `workItems[].legendEntryId` is either `null` or matches a
      `legend[].id`.
- [ ] Every `dependencies[].fromItemId` and `toItemId` matches a `workItems[].id`.
- [ ] All `id` values are unique within their array.
- [ ] Every date is a valid `"YYYY-MM-DD"` string and `endDate >= startDate`.
- [ ] Dependent tasks start on or after their predecessor ends (no contradiction
      between an arrow and the dates).
- [ ] Every `workstreams[].order` is unique; every item's `order` is set.
- [ ] All `color` values are valid hex strings.
- [ ] The whole thing is valid JSON (parse it to be sure).

A quick way to parse-check and surface unresolved references after writing:

```bash
node -e '
const p = require("./<file>.gantarr.json");
const ws = new Set(p.workstreams.map(w => w.id));
const leg = new Set(p.legend.map(l => l.id));
const items = new Set(p.workItems.map(i => i.id));
for (const i of p.workItems) {
  if (!ws.has(i.workstreamId)) console.error("bad workstreamId", i.id, i.workstreamId);
  if (i.legendEntryId !== null && !leg.has(i.legendEntryId)) console.error("bad legendEntryId", i.id, i.legendEntryId);
}
for (const d of p.dependencies) {
  if (!items.has(d.fromItemId)) console.error("bad fromItemId", d.id);
  if (!items.has(d.toItemId)) console.error("bad toItemId", d.id);
}
console.log("checked:", p.workItems.length, "items,", p.dependencies.length, "deps");
'
```

## Importing into Gantarr

Tell the user, in their final hand-off:

1. Open [gantarr.joshghent.com](https://gantarr.joshghent.com).
2. Use the toolbar's **import / load** control and select the
   `.gantarr.json` file.
3. The timeline renders immediately; they can then drag bars, edit tasks, and
   export to PNG/PDF from the app.

## Worked Example

A small two-phase plan, starting 2026-06-17, with a legend, a milestone, and a
dependency:

```json
{
  "id": "proj-q3-launch",
  "name": "Q3 Product Launch",
  "workstreams": [
    { "id": "ws-build", "label": "Phase 1 — Build", "order": 0, "color": "#2a9d8f" },
    { "id": "ws-launch", "label": "Phase 2 — Launch", "order": 1, "color": "#e76f51" }
  ],
  "workItems": [
    {
      "id": "item-auth", "workstreamId": "ws-build", "title": "Auth & accounts",
      "startDate": "2026-06-17", "endDate": "2026-06-26",
      "legendEntryId": "leg-dev", "order": 0
    },
    {
      "id": "item-billing", "workstreamId": "ws-build", "title": "Billing integration",
      "startDate": "2026-06-29", "endDate": "2026-07-10",
      "legendEntryId": "leg-dev", "order": 1
    },
    {
      "id": "item-qa", "workstreamId": "ws-build", "title": "QA pass",
      "startDate": "2026-07-13", "endDate": "2026-07-17",
      "legendEntryId": "leg-qa", "order": 2
    },
    {
      "id": "item-campaign", "workstreamId": "ws-launch", "title": "Launch campaign",
      "startDate": "2026-07-13", "endDate": "2026-07-20",
      "legendEntryId": "leg-marketing", "order": 0
    },
    {
      "id": "item-golive", "workstreamId": "ws-launch", "title": "Go live 🚀",
      "startDate": "2026-07-21", "endDate": "2026-07-21",
      "legendEntryId": null, "order": 1
    }
  ],
  "dependencies": [
    { "id": "dep-1", "fromItemId": "item-billing", "toItemId": "item-qa" },
    { "id": "dep-2", "fromItemId": "item-qa", "toItemId": "item-golive" }
  ],
  "legend": [
    { "id": "leg-dev", "label": "Development", "color": "#3b82f6" },
    { "id": "leg-qa", "label": "QA", "color": "#ef4444" },
    { "id": "leg-marketing", "label": "Marketing", "color": "#f97316" }
  ],
  "createdAt": "2026-06-17T09:00:00.000Z",
  "updatedAt": "2026-06-17T09:00:00.000Z"
}
```

## Notes

- View mode (days vs weeks) and zoom are UI state in the app, not part of the
  file — don't add fields for them.
- Don't add fields outside the schema; unknown keys are ignored at best and add
  noise.
- Keep titles short — they render on the bars. Put detail in the plan, not the
  bar label.
