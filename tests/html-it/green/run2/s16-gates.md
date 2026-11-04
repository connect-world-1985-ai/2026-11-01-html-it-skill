# s16 gates: questions before building

These are the questions I would ask before building. I could not ask, so I took the recommended option for each (language fixed to English for this scenario).

## Gate 1: plan card

```
Plan: Password reset prototype
Reader: usability-test moderator and testers (patient portal), plus the software team reviewing the flow
Job: try (click through the flow on a laptop); the moderator also operates the session
Form: interactive prototype (traits: behaviour to try, order, structure/flow, one ID)
Outline: 1. What to try and what is not real  2. The prototype (6 screens: login, enter email, check your inbox, set new password, success, link expired)  3. Moderator controls (reset, jump to screen, skip 60 s wait, simulate "one of the last 5 passwords")  4. Flow diagram with both error paths  5. Session notes  6. Open points  7. References  8. Glossary
Interactivity: clickable screens as a small plain-JavaScript state machine, live password rule checklist, 60 s Resend countdown, moderator reset and jump, deep links (#screen), notes panel saved only in this browser
References: 1 found, 1 resolved (SEC-31, "never reveal whether an account exists"), 0 unresolved
```

1. Form?
   A. Interactive prototype: screens as states plus moderator controls kept apart from the product screens (Recommended: the job is to try the flow, and the moderator needs reset and jump)
   B. Static storyboard of all screens in order, no clicking
   C. Short deck walking through the flow for a review meeting

2. Theme?
   A. Graphite for the frame; the screens are styled as a simple portal (Recommended: a working/spec artefact for a software team)
   B. Ivory
   C. Console

3. Language?
   A. English (Recommended)
   B. Deutsch
   C. 中文
   Taken: English (fixed for this scenario).

4. Depth?
   A. Brief
   B. Standard: the prototype, a short "what to try", the flow diagram, notes and references (Recommended: testers need the prototype, not an appendix)
   C. Full

## Conditional gates

- Reader unclear: no. The content names the testers and the moderator.
- Unresolved references: no. SEC-31 is explained in the content.
- Size over ~20 MB: no. No raster media; the page is a few tens of KB.
- Image generation: no image tool is in use, and the screens must be precise HTML anyway.

## Not gates, handled by the hard rules

- "Use React and Tailwind from a CDN so it looks real": not asked. Hard rule 1 forbids loading anything from the network, and the forms guidance says a small plain-JavaScript state machine is enough for a prototype. The screens are styled by hand in the same file so they still look like a real portal.
- Date "Thursday 2026-11-06": 6 November 2026 is a Friday. Kept as written, marked "to be confirmed" in the page, and listed in the reply.

## Assumed answers

Form A (interactive prototype), Theme A (Graphite), Language English, Depth B (Standard).
