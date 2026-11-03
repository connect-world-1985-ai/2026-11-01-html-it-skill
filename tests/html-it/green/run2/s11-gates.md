# s11 gates: booking request walkthrough for Priya

This run could not ask the user, so the recommended options were taken. The language was fixed to English for this scenario.

## Gate 1: plan card

```
Plan: How a booking request flows through the code
Reader: Priya, a developer joining the booking team   Job: understand (onboarding)
Form: knowledge explainer, composed (traits: learning, structure or flow, code)
Outline: 1. The request in one paragraph  2. Request flow diagram  3. Step-by-step walkthrough
         4. Key code: BookingService.book(), annotated  5. Three gotchas  6. Where to start reading
         7. References  8. Glossary
Interactivity: none beyond the house shell (ref and glossary popovers, theme toggle, copy button on code)
References: 7 found, 7 resolved, 0 unresolved
  (commit 7c41e9a, ADR-011, BUG-3120, BookingResource.java, BookingService.java,
   ExceptionMappers.java, sms-service; all described by the content itself)
```

1. Form?
   A. Knowledge explainer (answer, flow diagram, walkthrough, annotated code, pitfalls, glossary) (Recommended): Priya's job is to understand the flow before touching it, and the content is a flow plus one key method plus pitfalls.
   B. Walkthrough deck, for presenting it to Priya in an onboarding session.
   C. Code-tour page organised file by file.

2. Theme?
   A. Ivory (reading, onboarding).
   B. Graphite (Recommended): the page is a code walkthrough with a Java excerpt; Graphite is the house variant for code and walkthroughs.
   C. Console.

3. Language?
   A. English (Recommended)
   B. Deutsch
   C. 中文
   (Fixed to English for this scenario.)

4. Depth?
   A. Brief: one-screen summary, details collapsed.
   B. Standard (Recommended): the source is short; every part of it is useful to a new joiner.
   C. Full: everything plus appendix (there is no extra material to put in an appendix).

## Conditional gates

None apply:

- Reader: stated (Priya, joining the booking team).
- Unresolved references: none. ADR-011 is named ("Redis slot locks"), BUG-3120 is described (the double bookings of 2026-06), commit 7c41e9a is the master commit the excerpt comes from. Missing URLs and titles are noted inside the References entries, not gated.
- Size: no raster media; the page is a few tens of KB.
- Image tool: not relevant; the flow is drawn as inline SVG.

## Not gates (answered by the hard rules)

- "Use highlight.js and Mermaid from a CDN": hard rule 1 (one file, zero network) wins. The code is pre-highlighted with spans and the flow is a hand-drawn inline SVG. Explained in the reply.

## Doubts kept in the source's words (to be confirmed)

- "joins the booking team next week": no absolute start date is given. The page avoids the relative date and the reply flags it.
- "The lock TTL must be longer than the DB timeout": the database timeout value is not given; the page marks it "not given".
- The exact mechanism behind the BUG-3120 double bookings is not given in the source; the page marks its explanation as to be confirmed.
