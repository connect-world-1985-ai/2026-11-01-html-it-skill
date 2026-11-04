# s6 gates (questions that would be asked before building)

Unattended run: the recommended option is taken for every question.

## Gate 1: plan card

```
Plan: Event sourcing in the order service
Reader: new backend engineers, many from CRUD-only backgrounds   Job: understand
Form: knowledge explainer (traits: learning, structure or flow, light decision history)
Outline: 1. The idea in one sentence  2. Snapshot versus log (mental model)
         3. How an order flows through the system (diagram + walkthrough)
         4. Worked example: replaying one order  5. Why ADR-007 chose it
         6. What it costs  7. Self-check  8. References  9. Glossary
Interactivity: event replay control in the worked example (all states also shown in a table),
               self-check answers in disclosures, glossary and ref popovers
References: 1 found (ADR-007), 1 resolved (from the content), 0 unresolved
```

### Question 1: Form
A. Knowledge explainer: answer, mental model, flow diagram, worked example, costs, self-check (Recommended: the reader's job is to understand a concept; this order gets them to the answer first)
B. Walkthrough deck for an onboarding session
C. Short one-pager without the worked example

### Question 2: Theme
A. Ivory (Recommended: a top-to-bottom reading explainer)
B. Graphite
C. Console

### Question 3: Language
A. English (Recommended)
B. Deutsch
C. 中文

### Question 4: Depth
A. Brief
B. Standard (Recommended: newcomers need the model and one example, not an appendix)
C. Full

**Taken:** A (explainer), A (Ivory), A (English), B (Standard).

## Conditional gates

- Reader unclear: not asked; the content names the audience (new backend engineers).
- Unresolved references: not asked; ADR-007 is described in the content (the 2025-03 decision record that chose event sourcing for the order service).
- Size: not asked; estimated well under 1 MB.

### Question 5: Image
An image-generation tool is available. Generate one concept illustration for the opening ("a single overwritten snapshot versus an append-only log of changes"), or SVG only?
A. Generate one concept illustration for the opening; diagrams and the flow stay SVG (Recommended: a friendly picture of the core contrast helps newcomers and the brief asks for an engaging page; nothing precise depends on it)
B. SVG only, no generated image

**Taken:** A.
