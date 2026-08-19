---
description: Turn a plan or this conversation into an importable Gantarr timeline JSON (gantarr.joshghent.com).
argument-hint: [plan file, roadmap, or "the plan above" — plus an optional start date]
---

Use the `gantarr` skill to generate a Gantarr timeline.

Source: $ARGUMENTS

If a file or doc is named, read it and build the timeline from it. If the user
points at "the plan above" or nothing specific, use the plan or work discussed in
this conversation. If there's no plan to work from, ask for one rather than
inventing scope.

Follow the skill end to end: map the plan onto Gantarr's `GanttProject` schema
(phases → workstreams, tasks → work items, categories → legend, sequencing →
dependencies), anchor dates from the user's start date or today, write a
complete `.gantarr.json` file, run the validation checklist so every reference
resolves and every date parses, then tell the user the file path and how to
import it at gantarr.joshghent.com.
