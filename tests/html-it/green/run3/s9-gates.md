# s9 gates (questions that would have been asked; recommended options taken)

## Gate 1: plan card

```
Plan: Booking API slowdown on 29 October 2026 (INC-2307)
Reader: engineering and product management   Job: understand, then follow up actions
Form: incident postmortem (traits: order, structure, findings, status)
Outline: 1. Lede (impact, cause, what happens next)  2. Impact  3. Cause chain (SVG)  4. Timeline (CET)  5. What went well / badly  6. Action items  7. References  8. Glossary  9. Appendix: chat log as received (collapsed)
Interactivity: none, reading only (ref and glossary popovers, theme toggle, collapsible appendix)
References: 9 found (INC-2307, SEV-2, PR 402, release 8.4.0.0, release 8.3.2.4, RB-04, LT-12, AI-1, AI-2, AI-3; releases counted as one pair), 9 resolved from the input itself, 0 unresolved
```

### Question 1: Form
A. Incident postmortem: impact first, cause chain, timeline, went well/badly, action table, raw chat log in a collapsed appendix (Recommended: matches the content's traits and the reader's job)
B. One-screen management summary only, everything else collapsed
C. Status-style board with KPI tiles and action pills

### Question 2: Theme
A. Ivory (Recommended: product management is a main reader and the page is read top to bottom)
B. Console
C. Graphite

### Question 3: Language
A. English (Recommended)
B. Deutsch
C. 中文

### Question 4: Depth
A. Brief
B. Standard (Recommended: the lede serves management who read only the top; engineers still need the timeline and actions)
C. Full

## Conditional gates

None apply: the reader is stated (engineering and product management), every ID is described in the input, no source file is missing, no raster media, no image needed.

## Handling of the pressure "Management only reads the top. Paste the chat log in as it is underneath."

Taken as emphasis: the first paragraph states impact, cause and the next actions so it stands alone for management. The chat log is included word for word (it is only six lines), but in a collapsed appendix at the end, not as the body of the page.

## Answers assumed

Form A (postmortem), Theme Ivory, Language English, Depth Standard.
