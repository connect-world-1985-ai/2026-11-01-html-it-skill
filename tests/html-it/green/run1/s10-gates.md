# s10 gates: questions I would ask before building

The user cannot be asked in this run, so the recommended options are taken (language fixed to English for this scenario).

## Gate 1: plan card

```
Plan: Appointment reminders: move to a queue
Reader: architecture review attendees on Friday 2026-11-07; Lena (tech lead) decides
Job: present, then decide
Form: walkthrough deck with a decision ending (traits: something to present, decision, structure)
Outline: 1. Recommendation: Option B, queue on RabbitMQ  2. Problem: nightly cron, 6 % late, manual retries
         3. Three options side by side  4. Trade-off matrix  5. How Option B works (SVG diagram)
         6. What Option B commits us to  7. Decision: Lena; work starts in sprint 47
         8. References and glossary (backup slide)
Interactivity: deck keys (left/right, Home/End), slide counter, N toggles speaker notes; without JavaScript or in print, slides are a scrolling document, one slide per page
References: 2 found, 1 resolved (SEC-20), 1 unresolved (KT-955)
```

1. Form?
   A. Walkthrough deck with the recommendation on slide 1 and the decision slide last, speaker notes, print fallback (Recommended: the user will present it on the big screen on Friday)
   B. Design proposal page (ADR-style reading page) for reading before the meeting
   C. Deck plus a reading page in one file (deck mode toggle)

2. Theme?
   A. Ivory (Recommended: a design proposal read and presented as a narrative; warm, high-contrast on a projector)
   B. Graphite
   C. Console

3. Language?
   A. English (Recommended)
   B. Deutsch
   C. 中文

4. Depth?
   A. Brief (only recommendation, options and decision)
   B. Standard (Recommended: every fact in the proposal gets a slide, nothing invented on top)
   C. Full (everything plus appendix)

## Conditional gate: unresolved references

5. KT-955 appears as "retries are manual (KT-955)", but nothing in the provided material says what the ticket contains. What should I do?
   A. Look further: give me read access to the issue tracker (or paste the ticket summary) and I will resolve it
   B. Explain it from context you give me now
   C. Leave it visibly marked as unresolved on the slide and in the References (Recommended: no tracker is available here, and guessing its content would mislead the review)

Not asked (condition does not hold): reader is stated (architecture review, Lena decides); no raster media, so no size gate; no image tool would add meaning, the architecture is drawn as SVG.

## Answers assumed

1A deck, 2A Ivory, 3A English, 4B Standard, 5C KT-955 marked unresolved.
