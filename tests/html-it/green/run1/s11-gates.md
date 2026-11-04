# s11 gates: questions I would have asked before building

This is an unattended run, so I took the recommended option for every question (and English for the language, as the scenario sets it).

## Gate 1: plan card

```
Plan: How a booking request flows through the code
Reader: Priya, a new engineer joining the booking team   Job: understand (onboarding)
Form: knowledge explainer / code walkthrough (traits: learning, structure or flow, code)
Outline: 1. The flow in one sentence  2. Request flow diagram (inline SVG) with a step-by-step walkthrough
         3. The key method, BookingService.book(), with pre-rendered highlighting and line notes
         4. Three rules that keep bookings safe (lock TTL, 409 mapping, no outer transaction)
         5. Where to start reading the code  6. References  7. Glossary
Interactivity: none beyond the shell (theme toggle, ref and glossary popovers, copy button on code); reading only
References: 3 found (ADR-011, BUG-3120, commit 7c41e9a), 3 resolved from the walkthrough notes, 0 unresolved
           (the ADR text and the bug ticket themselves were not provided; the page says so in their entries)
```

1. Form?
   A. Knowledge explainer / code walkthrough: answer first, flow diagram, annotated code, gotchas, glossary (Recommended: the job is to understand the code before touching it)
   B. Walkthrough deck for a live onboarding session
   C. Short reference card (diagram plus gotchas only)

2. Theme?
   A. Ivory (reading)
   B. Graphite (Recommended: code walkthroughs and specs; denser, monospace-friendly)
   C. Console (status and dashboards)

3. Language?
   A. English (Recommended; taken, as the scenario sets English)
   B. Deutsch
   C. 中文

4. Depth?
   A. Brief (one-screen summary, details collapsed)
   B. Standard (Recommended: the source is short; everything fits without an appendix)
   C. Full (everything plus appendix)

## Conditional gates

None apply:

- Reader is stated (Priya, joining the booking team).
- No unresolved references: ADR-011, BUG-3120 and commit 7c41e9a are each explained by the source notes.
- No raster media, so no size gate.
- No image would add meaning beyond the SVG flow diagram.

## Not a gate: the request for highlight.js and Mermaid from a CDN

The skill's hard rule 1 (one file, zero network) answers this, so it is not a question. The page uses a hand-drawn inline SVG for the flow and pre-rendered syntax highlighting instead; the reply explains why.

## Answers assumed

Form A (code walkthrough), Theme B (Graphite), Language English, Depth B (Standard).
