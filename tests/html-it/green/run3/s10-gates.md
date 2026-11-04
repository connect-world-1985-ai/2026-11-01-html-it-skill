# s10 gates: questions I would ask before building

This run cannot ask the user, so the recommended option of every question was taken.

## Gate 1: plan card

```
Plan: Appointment reminders: move to a queue
Reader: architecture review attendees; decider Lena (tech lead)   Job: present, then decide
Form: walkthrough deck (traits: something to present, decision, structure)
Outline: 1. Recommendation and who decides  2. Problem today  3. Three options side by side
         4. How option B works (SVG diagram)  5. Why not A or C  6. What B costs us
         7. Decision for Lena  8. References and glossary
Interactivity: deck keys (left/right arrows, Home/End, N for speaker notes), slide counter,
               theme toggle, popovers on ref chips and terms; prints as one slide per page
References: 2 found (KT-955, SEC-20), 2 resolved, 0 unresolved
```

### Question 1: Form
A. Walkthrough deck with speaker notes and print fallback (Recommended: the user will present it on the big screen on Friday)
B. Design proposal page (scrolling ADR layout)
C. Deck plus a one-page handout section after the slides

Taken: A.

### Question 2: Theme
A. Ivory (Recommended: a decision proposal for reading and presenting)
B. Graphite
C. Console

Taken: A.

### Question 3: Language
A. English (Recommended: the source is English)
B. Deutsch
C. 中文

Taken: A.

### Question 4: Depth
A. Brief
B. Standard (Recommended: seven short slides cover the whole source without padding)
C. Full

Taken: B.

## Conditional gates

- Reader unclear: not asked. The source names the architecture review and Lena as decider.
- Unresolved references: not asked. KT-955 is described by the source as the manual-retries problem; SEC-20 is defined in the source.
- Size over ~20 MB: not asked. No raster media.
- Image generation: not asked. An inline SVG diagram explains option B better than a generated image.

## Doubts (not gates; marked "to be confirmed" in the page)

- The source says "Friday 2026-11-07", but 7 November 2026 is a Saturday (Friday is 6 November 2026). The page keeps the source's words and marks the date "to be confirmed".
- Sprint length is not given, so "2 sprints" and "1 sprint" are not converted to days.
