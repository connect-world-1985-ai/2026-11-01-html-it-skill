# s10 gates (questions I would have asked before building)

## Gate 1: plan card

```
Plan: Appointment reminders: move to a queue
Reader: the architecture review on Friday (decider: Lena, tech lead), seen on a big screen
Job: decide (presented live)
Form: walkthrough deck with the decision content of a design proposal (traits: decision, something to present, structure)
Outline: 1. Recommendation: option B, decision by Lena  2. Problem: nightly cron, 6 % late, manual retries  3. Three options side by side  4. Option B: how the queue works (SVG diagram)  5. Trade-offs and what each option leaves unsolved  6. What it takes to accept B (runbook, sprint 47)  7. Decision slide  + References and glossary slide
Interactivity: deck keys (left/right, Home/End), slide counter, N toggles speaker notes; without JavaScript or in print it reads as a document, one slide per page
References: 2 found (KT-955, SEC-20), 2 resolved, 0 unresolved
```

1. Form?
   A. Slide deck for the big screen, recommendation on slide 1, decision on the last slide, speaker notes, prints as a document (Recommended: you will present it on Friday, and the print/no-JS fallback keeps it readable for people who open the file later)
   B. Design proposal page (ADR-style reading page), no slides
   C. Both: a reading page with a "present" mode

2. Theme?
   A. Ivory (Recommended: a proposal read and presented to a mixed review audience; warm, high-contrast serif headings work well on a projector)
   B. Graphite
   C. Console

3. Language?
   A. English (Recommended)
   B. Deutsch
   C. 中文

4. Depth?
   A. Brief: one slide per idea, minimal text
   B. Standard: one idea per slide, full sentences, speaker notes with the detail (Recommended: enough for the room and for readers who open the file cold)
   C. Full: everything plus an appendix

## Conditional gates

None apply:
- Reader is stated (the architecture review; Lena decides).
- References: KT-955 is resolved by the content ("retries are manual (KT-955)"), SEC-20 is defined in the content. No unresolved IDs.
- No raster media; size is small.
- No image tool needed; the diagram is inline SVG.

## Not gates, marked "to be confirmed" in the page instead

- The source says "Friday 2026-11-07", but 2026-11-07 is a Saturday (Friday is 2026-11-06). Kept as written and marked to be confirmed.
- "Load peak at 02:00" has no time zone. Kept as written and marked.
- Sprint length is not given, so "2 sprints" and "1 sprint" are not converted to days.

## Answers assumed (recommended options, language English)

Form: deck (1A). Theme: Ivory (2A). Language: English (3A). Depth: Standard (4B).
