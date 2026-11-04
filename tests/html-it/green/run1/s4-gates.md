# s4 gates: weekly status, platform team, week 45

This run could not ask the user, so each recommended option was taken. The language is English, as set for this scenario.

## Gate 1: plan card

```
Plan: Platform team status, week 45
Reader: the platform team and anyone following its work (for example engineering leads)   Job: operate (see what needs attention, act on it)
Form: status report (traits: status, numbers, IDs)
Outline: 1. Status at a glance (pills)  2. What needs attention  3. Build time and flaky tests (table + SVG charts)  4. Open bugs  5. Milestone M3 progress (SVG bar against target)  6. References  7. Glossary
Interactivity: none beyond the shell (theme toggle, ref and glossary popovers); reading only
References: 4 found (KT-881, KT-902, KT-915, M3), 2 resolved (M3 "WildFly 36 migration"; KT-902 as a P1 bug blocked on a vendor patch), 2 only partly resolved (KT-881, KT-915: known only as open P1 bugs, no title or owner)
```

1. Form?
   A. Status report: status pills, attention callout, metrics table with week-over-week comparison, inline SVG charts drawn to scale (Recommended: the content is status plus numbers and the reader job is operate)
   B. One-screen brief: lede plus a single metrics table, no charts
   C. Dashboard with a full KPI tile row and no prose

2. Theme?
   A. Console (Recommended: status reports and dashboards, tabular numbers)
   B. Graphite
   C. Ivory

3. Language?
   A. English (Recommended; also fixed for this scenario)
   B. Deutsch
   C. 中文

4. Depth?
   A. Brief: one-screen summary, details collapsed
   B. Standard (Recommended: five facts, all worth showing; nothing long enough to collapse)
   C. Full: everything plus appendix

## Conditional gate: unresolved references

The source names KT-881 and KT-915 only as open P1 bugs, and says of KT-902 only that it is a P1 bug waiting on a vendor patch. No tracker, title, owner or vendor name was provided.

5. KT-881, KT-915 (and the details of KT-902): what should the page do?
   A. Look further: tell me where (tracker URL or export) and I resolve the titles
   B. Explain them from context you give me now
   C. Show what the status says (open P1 bug) and mark the title as not provided (Recommended: nothing else is available, and inventing titles would mislead)

Gates not asked: reader (implied: platform team), size (no media), image (no image tool; charts must be precise, so SVG).

## Not a gate: the chart library

The request said "Chart.js from a CDN is fine". The skill's hard rule 1 forbids any network load, so the charts are hand-drawn inline SVG, to scale. This is stated in the reply, not asked.

## Answers assumed

1A status report, 2A Console, 3A English, 4B Standard, 5C mark KT-881 and KT-915 as not fully resolved.
