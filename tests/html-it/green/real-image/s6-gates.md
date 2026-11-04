# s6 gates (questions that would be asked; recommended answers taken)

The run was unattended (subagent), so no question could be asked. The recommended options below were taken and are listed at the top of the reply.

## Gate 1: plan card

```
Plan: Event sourcing in the order service
Reader: new backend engineers, many from CRUD-only backgrounds   Job: understand
Form: knowledge explainer (traits: learning, structure or flow, light decision history, many unfamiliar terms)
Outline: 1. The answer in one paragraph  2. Snapshot versus log (illustration)  3. The flow from command to screen (SVG diagram + walkthrough)
         4. A worked example: one order, three events, replayed step by step  5. Why ADR-007 chose it  6. What it costs us
         7. Self-check  8. References  9. Glossary
Interactivity: a replay stepper (move through the three events and watch the order's state build up; all states visible at rest and in print), glossary popovers, a short self-check in <details>
References: 1 found (ADR-007), 1 resolved (from the content), 0 unresolved
```

### Question 1: Form
A. Knowledge explainer (answer, mental model, worked example, costs, glossary, self-check) (Recommended) - the reader's job is to understand a concept; this is the learning form.
B. Design proposal / ADR write-up - would centre the decision, but the decision is already made (2025-03); newcomers need the concept first.
C. Walkthrough deck - good for an onboarding session, weaker as a file read alone.

### Question 2: Theme
A. Ivory (Recommended) - reading top to bottom, teaching material.
B. Graphite - for code and reviews.
C. Console - for status and dashboards.

### Question 3: Language
A. English (Recommended) - the team's shared language and the source's language.
B. Deutsch
C. 中文

### Question 4: Depth
A. Brief
B. Standard (Recommended) - newcomers need the worked example and the costs, but not an appendix.
C. Full

## Conditional gates

- Reader unclear: no. The source names the audience (new backend engineers, many from CRUD-only backgrounds).
- Unresolved references: no. ADR-007 is described by the content itself (the 2025-03 decision record that chose event sourcing for the order service); its full text and link are not given, which the References entry says. No source file is relied on that was not provided.
- Size > ~20 MB: no. One generated image, estimated well under 1 MB after compression.
- Image tool available and an image would add meaning: yes. Asked:

### Question 5: Image
A. Generate one concept illustration: "a single snapshot versus a log of changes" (an order card overwritten in place next to a ledger of stamped entries), placed in section 2 as the mental model for newcomers; the flow diagram stays SVG (Recommended) - it is the concept illustration the skill names, it serves newcomers from CRUD backgrounds, and nothing precise depends on it.
B. SVG only - no generated image; the snapshot-versus-log idea drawn as a simple SVG.

Answer taken: A. If generation fails, fall back to B (SVG) without mentioning the failure in the page.
