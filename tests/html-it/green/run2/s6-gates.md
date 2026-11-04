# s6 gates: questions I would ask before building

This is an unattended run, so the questions are written here and the recommended options are taken (language fixed to English for this scenario).

## Gate 1: plan card

```
Plan: Event sourcing in the order service
Reader: new backend engineers, many coming from CRUD-only backends   Job: understand
Form: knowledge explainer (traits: learning, structure or flow, light decision history)
Outline: 1. The idea in one paragraph  2. Snapshot versus log (mental model)  3. How a change flows (SVG: command -> aggregate -> event store -> projector -> read model -> UI)  4. Worked example: replay one example order, with a time-travel slider  5. Why ADR-007 chose it  6. What it costs (schema versioning, eventual consistency, replay time and snapshots every 500 events)  7. Self-check  8. References  9. Glossary
Interactivity: replay slider on the worked example (state of the example order after each event), snapshot calculator, self-check answers in disclosures; everything readable at rest and in print
References: 1 found (ADR-007), 1 resolved, 0 unresolved
```

1. Form?
   A. Knowledge explainer with mental-model diagram, worked example with replay slider, self-check (Recommended): the reader's job is to understand a concept, and "engaging for newcomers" is best served by something they can try, not by decoration.
   B. Walkthrough deck for an onboarding session.
   C. Short article only (no interactive parts).

2. Theme?
   A. Ivory (Recommended): explainer read top to bottom.
   B. Graphite.
   C. Console.

3. Language?
   A. English (Recommended)
   B. Deutsch
   C. 中文
   Taken: English (fixed for this scenario).

4. Depth?
   A. Brief: one-screen summary, details collapsed.
   B. Standard (Recommended): new joiners need the model, the example and the costs, but not an appendix.
   C. Full: everything plus appendix.

## Conditional gates

- Reader unclear: not asked. The content states the audience (new backend engineers, many from CRUD-only backgrounds).
- Unresolved references: not asked. ADR-007 is resolved from the content itself (the architecture decision record from March 2025 that chose event sourcing for the order service). Its title, author and link are not given; that is noted in its References entry.
- Size: not asked. Estimated page size well under 1 MB.
- Image gate (an image tool is available and a concept image adds meaning):

5. Generate an image, or SVG only?
   A. Generate one concept illustration for the top of the page: "a single snapshot (a filled-in form, overwritten each time) versus a log of changes (a ledger where lines are only ever added)" (Recommended): it gives CRUD-minded newcomers the core contrast at a glance, it is exactly the kind of concept image that adds meaning, and nothing in it has to be precise. The flow diagram, the replay example and all labels stay SVG/HTML.
   B. SVG only: draw the snapshot-versus-log contrast as an inline SVG as well.
   C. No image at all.

## Answers taken

1A, 2A (Ivory), 3A (English), 4B (Standard), 5A (one generated concept illustration; everything precise stays SVG/HTML).
