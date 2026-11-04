# s6 gates: questions I would ask before building

The user cannot be asked in this run, so the recommended option is taken for every question. Language is English for this scenario.

## Gate 1: plan card

```
Plan: Event sourcing in the order service
Reader: new backend engineers, many from CRUD-only backgrounds   Job: understand
Form: knowledge explainer (traits: learning, structure/flow, light numbers)
Outline: 1. The answer in one paragraph  2. A snapshot versus a log (concept picture + CRUD comparison)
         3. How a change flows (SVG diagram: command -> aggregate -> event store -> projector -> read model -> UI)
         4. Worked example: replay one example order, step by step  5. Why ADR-007 chose it
         6. What it costs (schema versioning, eventual consistency, replay time and snapshots, with a small snapshot calculator)
         7. Check yourself (three questions, answers collapsed)  8. References  9. Glossary
Interactivity: event replay stepper (all states readable without JS), snapshot calculator with an example state, collapsed self-check answers, glossary popovers
References: 1 found (ADR-007), 1 resolved from the content (the ADR file itself was not provided), 0 unresolved
```

**1. Form?**
A. Knowledge explainer: answer, mental-model diagram, worked example, costs, glossary, self-check (Recommended: the reader's job is to understand a concept, and "engaging for newcomers" is best served by a replay they can step through)
B. Walkthrough deck for an onboarding session
C. One-screen brief with everything else collapsed

**2. Theme?**
A. Ivory (Recommended: an explainer read top to bottom)
B. Graphite
C. Console

**3. Language?**
A. English (Recommended)
B. Deutsch
C. 中文
-> English (fixed for this scenario)

**4. Depth?**
A. Brief
B. Standard (Recommended: newcomers need the definitions, the worked example and the costs, but not a full appendix)
C. Full (everything plus appendix)

## Conditional gates

- Reader unclear? No: the content names new backend engineers. Not asked.
- Unresolved references? No: ADR-007 is explained by the content itself (architecture decision record, March 2025, chose event sourcing for the order service). Its file location is unknown; the References entry says the document was not provided. Not asked.
- Size > ~20 MB? No: one small placeholder image plus inline SVG, well under 1 MB. Not asked.
- Image tool available and an image would add meaning? Yes, asked:

**5. Generate an image for the concept "one overwritten snapshot versus an append-only log of changes", used as the opening picture, or SVG only?**
A. Generate one concept illustration (Recommended: for readers coming from CRUD, a picture of the shift from "one row overwritten" to "a ledger of entries" sets the mental model before the precise diagram; the flow diagram itself stays SVG because it must be exact)
B. SVG only, no generated image
