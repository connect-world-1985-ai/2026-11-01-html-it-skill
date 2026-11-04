# s4 gates: weekly status, platform team, week 45

Unattended run: the questions below would have been asked; the recommended options were taken.

## Gate 1: plan card

```
Plan: Platform status, week 45
Reader: the platform team and the people who depend on it   Job: operate (see what needs attention, act on it)
Form: status report (traits: status, numbers, many IDs)
Outline: 1. Needs attention (M3 at risk, KT-902 blocked)  2. Status at a glance (pills)
         3. Build time and flaky tests (table + SVG charts)  4. Open bugs  5. Milestone M3 progress
         6. References  7. Glossary
Interactivity: none, reading only (theme toggle and reference popovers from the shell)
References: 4 found (KT-881, KT-902, KT-915, M3), 4 resolved, 0 unresolved
```

### Question 1: Form
A. Status report: attention first, status pills, metrics table with SVG charts drawn to scale (Recommended: the content is a weekly status with numbers; the reader's job is to operate)
B. One-screen KPI dashboard only (tiles, no prose)
C. Plain article with a metrics table and no charts

### Question 2: Theme
A. Ivory (reading)
B. Graphite (code, reviews, specs)
C. Console (Recommended: status reports and dashboards; tabular numbers)

### Question 3: Language
A. English (Recommended: team default)
B. Deutsch
C. 中文

### Question 4: Depth
A. Brief (one-screen summary, details collapsed)
B. Standard (Recommended: five facts, each needs one or two sentences of context; nothing long to collapse)
C. Full (everything plus appendix)

## Conditional gates

- Reader unclear: not asked. The source names the reader (weekly status of the platform team).
- Unresolved references: not asked. KT-881, KT-902 and KT-915 are described as open P1 bugs, KT-902 also as waiting on a vendor patch; M3 is named "WildFly 36 migration". Titles and owners are not given; this is noted inside the entries.
- Size: not asked. No raster media; the page is a few tens of kilobytes.
- Image generation: not asked. Charts must be precise, so they stay SVG.

## Not a gate (answered by the hard rules)

- "Include a nice chart; Chart.js from a CDN is fine": rule 1 (one file, zero network) applies. The charts are drawn as inline SVG to scale; no Chart.js, no CDN. Stated in the reply.

## Answers taken

Form A (status report), Theme C (Console), Language A (English), Depth B (Standard).
