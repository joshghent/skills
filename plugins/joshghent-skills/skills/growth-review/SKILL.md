---
name: growth-review
description: Runs a project's weekly growth loop end to end — health-check the site and its tracking, pull the week's search, analytics, and lead numbers, compare against last week, log a dated snapshot, spot-check target SERPs and one competitor, then implement the single highest-leverage improvement. Use when the user asks for a weekly growth review, a growth check-in, "how did we do this week", to review traffic/rankings/leads on a cadence, or to set up a repeatable growth loop for a project.
---

# Growth Review

A weekly loop that turns real numbers into one shipped improvement. The output
is not a report. It is a dated log entry plus a change in the repo, chosen
because the data pointed at it.

Run the phases in order. Each one feeds the next: a failed health check makes
the numbers meaningless, and the numbers decide what gets built.

## Operating principle

Act like the person who owns the traffic number. Attribute honestly — most
weeks the right answer is "too early to tell", and saying so is worth more than
a confident story about a 12% bump that was one bot crawl. Never invent a
metric. If a source is not connected, say which one and work with what's left.

One change per run. A week of data cannot tell you whether five changes worked.

## 0. Load the project config

Read `docs/GROWTH.md` in the current repo. It defines the production domain,
the search-console property, the analytics source, where leads land, the KPIs,
the strategy doc, and the path to the growth log.

If it does not exist, bootstrap it before anything else:

- Find the production domain from deploy config, `package.json`, or the README.
- Find the search-console property (Google Search Console, directly or via
  Ahrefs).
- Locate analytics — PostHog, Plausible, GA, a database table, or a
  first-party tracker in the code.
- Trace the lead capture path from form to storage.

Write `docs/GROWTH.md` recording what you found, create an empty growth log,
and confirm the config with the user before the first full run. Guessing the
config poisons every week that follows.

## 1. Health check

Abort and alert if any of these fail. A broken site with clean-looking
week-over-week numbers is the trap this phase exists to catch.

- The homepage serves real branded content: `curl -s https://<domain>/`. Not a
  parking page, not an error page, not an empty JS shell.
- The analytics source has events inside the last 48 hours. Silence almost
  always means broken tracking or a down site, not a quiet week.
- Domain registration expires more than 30 days out:

  ```sh
  curl -s https://rdap.org/domain/<domain> \
    | jq -r '.events[] | select(.eventAction=="expiration") | .eventDate'
  ```

## 2. Pull the week's data

- **Search console** — clicks, impressions, CTR, average position. Top queries
  and top pages. Then the queries sitting at position 8–20: striking distance,
  and the highest-yield thing on the list.
- **Analytics** — sessions, page views by path, referrers, conversion events.
  This week against the prior week.
- **Leads** — how many, and where they came from.
- **AI answer engines**, if tracked — crawler hits and live assistant fetches
  (`ChatGPT-User`, `PerplexityBot`, `ClaudeBot`) in the request logs.
- Ask the user for anything only they can see: CRM outcomes, revenue, deals
  that closed.

## 3. Compare and log

Append a dated snapshot to the growth log: the KPI numbers, what shipped last
week, what moved. Never overwrite an old entry — the history is the only way
to tell a trend from noise.

## 4. Research, lightly

- Spot-check three to five target SERPs from the strategy doc. Does the project
  rank yet? Who moved?
- Check one competitor, rotating through the list each week so the whole set
  gets covered over a quarter.

## 5. Propose and implement

Pick one item, informed by this week's data. Priority order:

1. Anything broken.
2. Striking-distance pages — position 8–20 with real impressions behind them.
3. CTR fixes where position is already good and the title or description is
   not earning the click.
4. New content from the strategy backlog.

Implement in a worktree. One or two content pages, or one fix, matching the
project's existing patterns and copy rules. If the data contradicts the plan,
update the strategy doc — the plan was a hypothesis and the numbers just voted.

## Cadence

Weekly. More often is noise at low traffic. Revisit the cadence when sessions
pass roughly 100 a day.
