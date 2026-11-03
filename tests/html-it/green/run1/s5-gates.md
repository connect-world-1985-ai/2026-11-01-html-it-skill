# s5 gates: first-week onboarding checklist

## Gate 1: plan card

```
Plan: First week as a backend engineer
Reader: a newly hired backend engineer, and their buddy   Job: operate (follow the week, tick items off) and learn
Form: composed (traits: order, status, learning) - a five-day checklist tool with a live week-progress track and a copy-for-your-buddy message
Outline: 1. Lede: the week in one paragraph and how to use the page  2. Week-progress track (updates as you tick)  3. Day by day: Day 1 get set up, Day 2 build and test, Day 3 choose a first issue, Days 4-5 ship and demo  4. Share progress with your buddy (copyable message, stated limit)  5. Ask your buddy on day 1 (what this page cannot tell you)  6. References  7. Glossary
Interactivity: tick boxes with progress saved in this browser only; progress track and counter; generated progress message with a Copy button; reset. Without JavaScript or printed, it is a plain paper checklist.
References: 2 found (ONB-01, ADR-007), 2 resolved from the content itself (titles/purpose given), 0 unresolved. Their locations (links) are not in the material; the page says so and points to the buddy.
```

Limit to state: "buddy should see what is done" needs shared state. One HTML file cannot share ticks between people. The page says so where the reader meets it and offers a way that works: copy the generated progress message and send it to the buddy in Teams.

### Q1. Form
A. Composed checklist tool: five-day checklist with a live week track and a copy-for-your-buddy message (Recommended) - the reader's job is to work through the week and report progress, and this does both in one file.
B. Onboarding explainer: one-sentence answer, stepper per day, glossary, no ticking.
C. Status board in Console style, one column per day.

### Q2. Theme
A. Ivory (Recommended) - onboarding is read top to bottom by someone new; Ivory is the house look for reading.
B. Console - suits progress scanning, but reads as a dashboard rather than a welcome.
C. Graphite.

### Q3. Language
A. English (Recommended)
B. Deutsch
C. 中文

### Q4. Depth
A. Brief
B. Standard (Recommended) - each item gets one sentence on what to do and why; no appendix needed for this short content.
C. Full

## Conditional gates

- Reader unclear: no. The reader is stated (new-hire backend engineers; the buddy is a secondary reader).
- Unresolved references: no. ONB-01 ("How we work") and ADR-007 (why we use event sourcing) are explained by the content. Only their locations are missing; the page marks that and sends the reader to the buddy, without inventing links.
- Size > ~20 MB: no. No raster media; a few tens of KB.
- Image tool: none available; the week track is hand-drawn inline SVG.

## Answers assumed (cannot ask in this run)

Form 1A, Theme Ivory, Language English (fixed for this scenario), Depth Standard.
