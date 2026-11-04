# s10 gates: appointment reminders proposal deck

These are the questions that would be asked before building. The run is unattended, so the recommended option is taken for each.

## Gate 1: plan card

```
Plan: Appointment reminders: we recommend a queue
Reader: the architecture review, with Lena (tech lead) as decider   Job: present, then decide
Form: walkthrough deck (traits: decision, something to present, structure, numbers)
Outline: 1. Recommendation and decision needed  2. Problem today  3. Three options side by side
         4. How option B works (SVG diagram)  5. What each option costs us  6. Decision and next step
         7. References and glossary
Interactivity: deck keys (left/right, Home/End, N for speaker notes), slide counter, theme toggle;
               without JavaScript or in print, all slides are shown as one document
References: 2 found (KT-955, SEC-20), 2 resolved, 0 unresolved
```

### Question 1: Form

A. Walkthrough deck with speaker notes and a print fallback (Recommended: you will present it on the big screen on Friday, and the deck still reads as a document when printed or forwarded)
B. Design proposal page (one scrolling page: recommendation, options, diagram, trade-offs)
C. Deck plus a separate one-page handout file

Taken: A.

### Question 2: Theme

A. Ivory (Recommended: a proposal that is read and presented; warm, high-contrast on a projector)
B. Graphite
C. Console

Taken: A.

### Question 3: Language

A. English (Recommended: the source is in English)
B. Deutsch
C. 中文

Taken: A.

### Question 4: Depth

A. Brief
B. Standard (Recommended: six content slides, one idea each, with speaker notes; the source is short, so nothing needs to be cut or collapsed)
C. Full

Taken: B.

## Conditional gates

- Reader unclear: not asked. The source names the architecture review and Lena as decider.
- Unresolved references: not asked. KT-955 is described by the source (late reminders, manual retries) and SEC-20 is defined in the source.
- Size over ~20 MB or editable assets: not asked. No raster media.
- Image generation: not asked. The one diagram is inline SVG.

## Not gates (kept as written, marked "to be confirmed" in the page)

- The source says "Friday 2026-11-07", but 2026-11-07 is a Saturday.
- The 02:00 load peak has no time zone.
- Sprint length is not given, so the efforts (3 days, 2 sprints, 1 sprint) are not converted to a common unit.
