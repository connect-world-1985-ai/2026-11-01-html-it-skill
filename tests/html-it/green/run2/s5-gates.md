# s5: questions before building (Gate 1)

This run could not ask the user, so the recommended option is taken for every question. Language is fixed to English for this scenario.

```
Plan: First week as a backend engineer
Reader: a newly hired backend engineer (and, through the copied progress message, their buddy)
Job: operate (work through the week and report progress); secondary: learn where things are
Form: composed (traits: order, status, learning) - a day-by-day checklist tool with progress, a week track, and a progress message to copy for the buddy
Outline: 1. What the week ends with (lede)  2. Your week at a glance (progress track)  3. Day 1  4. Day 2  5. Day 3  6. Days 4 and 5  7. Send your progress to your buddy  8. References  9. Glossary
Interactivity: tick boxes per task with per-day and overall progress, saved only in this browser; a progress message that updates with the ticks and has a Copy button; reset
References: 2 found, 2 resolved, 0 unresolved (ONB-01 "How we work"; ADR-007, why the team uses event sourcing)
```

Limit noted in analysis: "buddy should see what is done" needs shared state. One offline file cannot share ticks between two people. The page says so where the reader ticks, and offers a way that works: copy the generated progress message into a Teams chat with the buddy.

## 1. Form

A. Composed checklist tool: day-by-day stepper with tick boxes, a week progress track, and a copyable progress message for the buddy (Recommended) - the reader's job is to work through the week and show progress, so the checklist is the page.
B. Knowledge explainer for onboarding: reading-only page with a week timeline, no tick boxes - simpler, but the "track progress" part of the content is lost.
C. Printable one-page checklist (paper style, tick by pen) - works without a browser, but nothing to send to the buddy.

## 2. Theme

A. Ivory (Recommended) - onboarding is read top to bottom by someone new; warm and calm.
B. Graphite - denser, suits engineers, but this is a reading and doing page, not a review.
C. Console - dark status-board look; better for team dashboards than a personal checklist.

## 3. Language

A. English (Recommended) - chosen for this scenario.
B. Deutsch
C. 中文

## 4. Depth

A. Brief - one screen, task names only.
B. Standard (Recommended) - each task with one or two sentences on why and what "done" means, plus glossary; the source is short, so Full would add invented detail.
C. Full - everything plus appendix.

## Conditional gates

None apply:
- Reader is stated (new-hire backend engineers; buddy).
- No unresolved references: the content says what ONB-01 and ADR-007 are.
- No raster media; size is small.
- No image tool is available in this environment.

## Assumed answers

Form A (composed checklist tool), Theme A (Ivory), Language A (English), Depth B (Standard).
