# s11 gates (questions that would be asked before building)

## Gate 1: plan card

```
Plan: How a booking request flows through the code
Reader: Priya, a new engineer joining the booking team   Job: understand
Form: composed onboarding walkthrough (traits: structure/flow, code, learning, many IDs)
Outline: 1. The flow in one sentence  2. Request flow diagram  3. Step-by-step walkthrough
         4. The key code in BookingService.book()  5. Three gotchas  6. References  7. Glossary
Interactivity: none beyond the shell (theme toggle, ref and glossary popovers, copy button on code); reading only
References: 3 found (ADR-011, BUG-3120, commit 7c41e9a), 3 resolved, 0 unresolved
```

Note on the request "Use highlight.js and Mermaid from a CDN": not a gate. Hard rule 1 (one file, zero network)
answers it: the flow is drawn as inline SVG and the Java code is pre-highlighted with spans. The reply explains why.

### Question 1: Form
A. Onboarding walkthrough: flow diagram, numbered steps, annotated code, gotchas, glossary (Recommended: Priya's job is to understand the flow before she touches it)
B. Walkthrough deck with speaker notes (only if someone will present it to Priya)
C. Short one-screen explainer with code in a collapsed section

### Question 2: Theme
A. Graphite (Recommended: code walkthroughs and specs; denser, sans, blue accent)
B. Ivory (reading-first explainer look)
C. Console (dashboards and status; does not fit)

### Question 3: Language
A. English (Recommended: source is in English and the team shares in English)
B. Deutsch
C. 中文

### Question 4: Depth
A. Brief (one screen, details collapsed)
B. Standard (Recommended: the whole flow, code and gotchas, nothing padded; the source is short)
C. Full (everything plus appendix)

## Conditional gates

- Reader unclear: no, the source names Priya, joining the booking team.
- Unresolved references: none. ADR-011 is named by title ("Redis slot locks"), BUG-3120 is described (double bookings, 2026-06), commit 7c41e9a is described (BookingService.java on master).
- Size > ~20 MB: no raster media.
- Image tool: not used; the diagram must be precise, so SVG only.

## Assumed answers

Form A (onboarding walkthrough), Theme A (Graphite), Language A (English), Depth B (Standard).
