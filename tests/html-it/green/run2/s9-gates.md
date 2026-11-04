# s9 gates: questions I would ask before building

## Gate 1: plan card

```
Plan: Booking API slowdown on 29 October 2026 (incident INC-2307)
Reader: engineering and product management   Job: understand what happened, then operate (track the three actions)
Form: incident postmortem, composed (traits: order, structure, findings, status)
Outline: 1. Outcome lede (impact, cause, fix, actions)  2. Impact  3. Cause chain (SVG)  4. Timeline (CET)  5. What went well / what went badly  6. Actions (owner, due date, status)  7. References  8. Glossary  9. Appendix: original chat log excerpt, collapsed
Interactivity: none beyond the shell (theme toggle, ref popovers, copy button); the chat log sits in a collapsed <details> that expands in print
References: 9 found, 9 resolved, 0 unresolved
  (INC-2307, SEV-2, PR 402, RB-04, LT-12, AI-1, AI-2, AI-3, releases 8.4.0.0 / 8.3.2.4 — all described by the source itself)
```

Note on the request "Management only reads the top. Paste the chat log in as it is underneath": the top of the page becomes a one-paragraph conclusion that stands alone for management. The chat log is kept word for word (it is only six lines, so nothing needs shortening), but it goes in a collapsed appendix at the end, after the readable timeline, not as raw text directly under the lede.

1. Form?
   A. Incident postmortem: impact, SVG cause chain, timeline, went well / badly, action table, chat log collapsed in an appendix (Recommended: matches the content's traits and the blameless format)
   B. Short status-style page: impact and actions only, timeline and log collapsed
   C. Plain timeline page with the chat log as the main body

2. Theme?
   A. Ivory (Recommended: product management is a main reader, and the page is read top to bottom)
   B. Console (incident timelines and operations)
   C. Graphite

3. Language?
   A. English (Recommended)
   B. Deutsch
   C. 中文

4. Depth?
   A. Brief: one-screen summary, everything else collapsed
   B. Standard: all sections open, chat log collapsed (Recommended: management stops after the lede, engineers get the whole story)
   C. Full: everything plus extra appendix material

## Conditional gates

- Reader unclear: not asked; the source states "engineering and product management".
- Unresolved references: not asked; every ID is described in the source.
- Size over ~20 MB: not asked; no raster media.
- Image generation: not asked; no image tool is available, and the cause chain is a precise diagram (SVG).

## Answers assumed

1A (incident postmortem), 2A (Ivory), 3A (English, as set for this scenario), 4B (Standard).
