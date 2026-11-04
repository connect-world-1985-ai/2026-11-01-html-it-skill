# s16 gates: questions I would ask before building

No question tool and no user available in this run, so the recommended options are taken (language: English, as set for this scenario).

## Gate 1: plan card

```
Plan: Password reset prototype
Reader: usability testers (clicking on a laptop) and the test moderator; later, the portal team
Job: try (testers), operate (moderator)
Form: interactive prototype (traits: behaviour to try, order, structure or flow, one unfamiliar ID)
Outline: 1. What to try and what is not real  2. The prototype with moderator controls and notes
         3. The flow as a diagram  4. Rules the screens follow  5. References  6. Glossary
Interactivity: clickable screens as a small state machine, 60-second Resend countdown,
               live password rule checklist, moderator Reset / Jump to screen / Skip wait,
               deep links per screen (#screen), local notes panel with Copy
References: 1 found (SEC-31), 1 resolved, 0 unresolved
```

1. **Form**
   A. Interactive prototype: screens as states, moderator controls beside the screen, notes panel (Recommended: the content is a flow testers must click through, and the moderator needs reset and jump)
   B. Static screen-by-screen walkthrough (stepper with one mock screen per step)
   C. Prototype only, without the explanatory sections around it

2. **Theme**
   A. Ivory
   B. Graphite for the frame, screens styled as the patient portal (Recommended: it is a working tool for a product team; the house pattern for prototypes)
   C. Console

3. **Language**
   A. English (Recommended)
   B. Deutsch
   C. 中文

4. **Depth**
   A. Brief
   B. Standard: what to try, the prototype, flow diagram, rules, references (Recommended: the moderator needs the rules and limits, but not an appendix)
   C. Full

## Gate 2: conflicting date (conditional)

The source says "Thursday 2026-11-06", but 6 November 2026 is a Friday.

5. **Which is right?**
   A. Keep the date 2026-11-06 as written and show the weekday conflict visibly in the page as "to be confirmed" (Recommended: the ISO date is the more specific value; inventing a correction would be guessing)
   B. The test is on Thursday 5 November 2026
   C. The test is on Friday 6 November 2026

## Not asked (conditions do not hold)

- Reader: stated (testers on a laptop, a moderator).
- Unresolved references: none; SEC-31 is explained in the source.
- Size: no raster media; the file stays well under 1 MB.
- Image generation: no image tool in this environment; the flow is drawn as SVG.
- "Use React and Tailwind from a CDN": not a gate. The hard rule (one file, no network) answers it; the prototype uses plain HTML, CSS and a small JavaScript state machine.

## Choices taken

Form A (interactive prototype), Theme B (Graphite), Language English, Depth B (Standard), Date A (keep 2026-11-06, flag the weekday).
