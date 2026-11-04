# s5 gates: questions that would have been asked

This run could not ask the user. The questions below are the ones that would have been asked; the recommended options were taken.

## Gate 1: plan card

```
Plan: Your first week as a backend engineer
Reader: a newly hired backend engineer (and their buddy)   Job: operate (work through the week) and learn
Form: composed (traits: order, status, learning, many unfamiliar terms or IDs) - a day-by-day checklist tool with progress and a buddy hand-off
Outline: 1. What the week is for (answer first)  2. The week at a glance (SVG week strip with progress)  3. Day-by-day checklist (stepper, tick boxes)  4. Share your progress with your buddy (copy-ready message)  5. What this page cannot do  6. References  7. Glossary
Interactivity: tick boxes per task with a progress bar and per-day status, saved only in this browser; a generated progress message with a Copy button; reset
References: 2 found (ONB-01, ADR-007), 2 resolved from the content, 0 unresolved
```

Limit noted: "buddy should see what is done" needs shared state, which one offline file cannot provide. The page says so where the reader meets it and offers a way that works (copy the progress message into Teams for the buddy).

### Question 1: Form
A. Composed checklist tool: day-by-day stepper with tick boxes, progress, and a copy-ready progress message for the buddy (Recommended: the reader's job is to work through the week and keep the buddy informed; a checklist with progress serves that directly)
B. Knowledge explainer: an onboarding read with a stepper but no tick boxes
C. Printable one-page checklist only

### Question 2: Theme
A. Ivory (Recommended: onboarding is read top to bottom by someone new; Ivory is the reading variant)
B. Graphite
C. Console

### Question 3: Language
A. English (Recommended: the source is English and it is the default)
B. Deutsch
C. 中文

### Question 4: Depth
A. Brief
B. Standard (Recommended: five days of tasks, each needing a sentence of why and what "done" means; no appendix material exists)
C. Full

## Conditional gates

- Reader unclear: not asked. The source names the reader (new backend engineers) and the buddy.
- Unresolved references: not asked. ONB-01 is described as the "How we work" document and ADR-007 as the decision record on why the team uses event sourcing; both are resolved from the content (no links given, noted in the entries).
- Size: not asked. No raster media.
- Image generation: not asked. An inline SVG week strip carries the meaning; a generated image would add nothing.

## Answers taken

Form A (composed checklist tool), Theme A (Ivory), Language A (English), Depth B (Standard).
