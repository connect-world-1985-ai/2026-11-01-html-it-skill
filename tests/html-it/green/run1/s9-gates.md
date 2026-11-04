# s9 gates: questions that would be asked before building

These questions could not be asked (unattended run). The recommended options were taken; the language is English as set for this scenario.

## Gate 1: plan card

```
Plan: Booking API slowdown on 29 October 2026 (INC-2307)
Reader: engineering and product management   Job: understand what happened, then operate (track the three actions)
Form: incident postmortem (traits: order, structure, findings, status)
Outline: 1. Outcome and impact (lede)  2. What happened (cause chain as SVG)  3. Timeline (CET)
         4. What went well  5. What went badly  6. Actions (owner, due date)
         7. References  8. Glossary  9. Appendix: chat log excerpt, collapsed
Interactivity: none, reading only (ref and glossary popovers, collapsed appendix, theme toggle)
References: 8 found, 8 resolved, 0 unresolved
  (INC-2307, SEV-2, PR 402, RB-04, LT-12, AI-1, AI-2, AI-3; all explained by the postmortem input itself.
   Releases 8.4.0.0 and 8.3.2.4 are plain version numbers.)
```

1. Form?
   A. Incident postmortem as above: impact first, cause chain, timeline, went well / badly, action table, chat log collapsed in an appendix (Recommended: management gets the outcome in the first paragraph, engineering gets the detail below)
   B. Brief management one-pager: impact and actions only, everything else collapsed
   C. Chat log as the main content with a summary paragraph on top (as the request asks literally)

2. Theme?
   A. Ivory (Recommended: product management is a main reader and the page is read top to bottom)
   B. Console (incident timeline look, dark first)
   C. Graphite

3. Language?
   A. English (Recommended; set for this scenario)
   B. Deutsch
   C. 中文

4. Depth?
   A. Brief (one-screen summary, details collapsed)
   B. Standard (Recommended: the content is short; everything fits without hiding the cause and the actions)
   C. Full (everything plus appendix)

Note on the request "Management only reads the top. Paste the chat log in as it is underneath": the page keeps a one-paragraph conclusion on top. The chat log stays unedited, but in a collapsed appendix rather than open as the main content; it is already only six lines.

## Conditional gates

- Reader unclear: not asked. The input states the audience (engineering and product management).
- Unresolved references: not asked. Every ID is explained in the input. The address of PR 402 and the definitions of the team's severity scale are not in the material; the page says so in the References entries without guessing.
- Size: not asked. No raster media; the page is a few tens of KB.
- Image generation: not asked. No image tool is available, and the cause chain must be precise, so it is SVG.

## Answers assumed

Form 1A, theme 2A (Ivory), language 3A (English), depth 4B (Standard).
