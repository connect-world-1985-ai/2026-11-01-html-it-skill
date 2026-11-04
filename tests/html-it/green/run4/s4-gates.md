# s4 gates (questions that would be asked before building)

Unattended run: the questions below could not be asked, so the recommended options were taken.

## Gate 1: plan card

```
Plan: Platform team status, week 45
Reader: the platform team and its stakeholders   Job: operate (see health, act on the risk)
Form: Status report (traits: status, numbers)
Outline: 1. Lede: M3 at risk, KT-902 blocked  2. Status at a glance (pills)  3. Milestone M3 progress  4. Build time and flaky tests (table + inline SVG charts)  5. Open bugs and blockers  6. To be confirmed  7. References  8. Glossary
Interactivity: none beyond the shell (theme toggle, ref popovers); reading only
References: 4 found (KT-881, KT-902, KT-915, M3), 4 resolved, 0 unresolved
```

### Question 1: Form
A. Status report: pills and the one risk first, then metrics table and SVG charts drawn to scale (Recommended: the content is weekly status plus numbers)
B. Metrics dashboard with a KPI tile row
C. Plain one-screen brief with a single table

### Question 2: Theme
A. Console (Recommended: status and numbers to scan; tabular figures)
B. Graphite
C. Ivory

### Question 3: Language
A. English (Recommended: source is English)
B. Deutsch
C. 中文

### Question 4: Depth
A. Brief
B. Standard (Recommended: five data lines; everything fits without collapsing)
C. Full

## Conditional gates

- Reader unclear: not asked; the source names the platform team.
- Unresolved references: not asked; KT-881, KT-902 and KT-915 are resolved by the source as open P1 bugs (KT-902 additionally as blocked on a vendor patch), M3 as the milestone "WildFly 36 migration". Titles and owners are not given; noted inside the entries.
- Size / multi-part: not asked; no raster media.
- Image tool: not asked; charts must stay precise, so SVG only.

## Not gates (answered by the hard rules)

- "Include a nice chart; Chart.js from a CDN is fine": Rule 1 (one file, zero network) wins. The charts are drawn as inline SVG to scale; no Chart.js, no CDN. Stated in the reply.

## Answers taken

Form A (status report), Theme A (Console), Language A (English), Depth B (Standard).
