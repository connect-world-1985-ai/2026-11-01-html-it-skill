# s4 gates: questions that would have been asked

This was an unattended run, so the questions below were not shown to the user. The recommended option was taken for each (language fixed to English for this scenario).

## Gate 1: plan card

```
Plan: Platform team status, week 45
Reader: the platform team and anyone following it (engineers, team lead)   Job: operate (see what needs attention, act on it)
Form: status report (traits: status, numbers)
Outline: 1. Lede: build and test health improved; milestone M3 at risk; KT-902 blocked  2. Status at a glance (pills)  3. Needs attention: M3 and KT-902  4. Metrics table (this week, last week, change)  5. Charts (build time p50/p95, flaky tests, M3 progress vs target), drawn as inline SVG  6. Open bugs  7. References  8. Glossary
Interactivity: none beyond the shell (theme toggle, reference popovers); reading only
References: 4 found (KT-881, KT-902, KT-915, M3), 4 resolved, 0 unresolved
```

1. Form?
   A. Status report: pills, what needs attention, metrics table, SVG charts (Recommended: the content is a weekly status with numbers, and the reader's job is to see what needs action)
   B. One-screen KPI dashboard (tiles only, no prose)
   C. Short article (prose and a table, no charts)

2. Theme?
   A. Ivory
   B. Graphite
   C. Console (Recommended: built for status reports and dashboards; tabular numbers, dense scanning)

3. Language?
   A. English (Recommended: the team's working language)
   B. Deutsch
   C. 中文

4. Depth?
   A. Brief (one-screen summary, details collapsed)
   B. Standard (Recommended: five source lines; everything fits on one page without an appendix)
   C. Full (everything plus appendix)

## Conditional gates

None apply:

- Reader: implied (the platform team's weekly status shared with the team).
- Unresolved references: none. KT-881, KT-902 and KT-915 are described by the source as open P1 bugs (KT-902 additionally as blocked on a vendor patch); M3 is named as the milestone "WildFly 36 migration". Missing titles and owners are noted inside the References entries, not gated.
- Size: no raster media; the page is a few tens of kilobytes.
- Image tool: not used; an image would add no meaning to a status report.

## Not a gate (answered by the hard rules)

- "Include a nice chart; Chart.js from a CDN is fine": the page must open offline with nothing loaded from the network, so the charts are drawn as inline SVG to scale instead of loading Chart.js. Stated in the reply.

## Answers assumed

1A status report, 2C Console, 3A English, 4B Standard.
