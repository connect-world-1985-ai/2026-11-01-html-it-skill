# s2 gates: questions I would ask before building

These are the questions for the user. This run is unattended, so the recommended options were taken (language fixed to English for this scenario).

## Gate 1: plan card

```
Plan: Booking app screen sketches
Reader: the software team building the mobile appointment booking app (design, product, engineering)
Job: decide (compare six screen layouts and pick two directions to take forward)
Form: UI sketch board (traits: many visual items, structure or flow, light decision)
Outline: 1. What to decide  2. How the screens connect (SVG flow)  3. Sketch board (six isolated sketches, filters, pick two, compare)  4. Open questions per screen  5. Message for the team channel  6. References  7. Glossary
Interactivity: filter chips by flow stage; "Pick" on each sketch (at most two); "Compare picks" shows the two side by side; "Copy my picks" builds a paste-ready message. Picks stay in the reader's browser only.
References: 1 found, 1 resolved, 0 unresolved (BK-2026-0042, the confirmation code shown on the success screen, explained by the notes themselves)
```

1. Which form should the page take?
   A. UI sketch board: one gallery, each sketch in its own iframe, with filters, pick-two and compare (Recommended: the job is to compare layouts and pick two, which is what the board is for)
   B. Clickable prototype: the six screens wired into one tappable flow
   C. Plain article with one sketch per section

2. Which theme?
   A. Console (Recommended: the house theme for boards; the sketches carry their own neutral wireframe look)
   B. Graphite
   C. Ivory

3. Which language?
   A. English (Recommended)
   B. Deutsch
   C. 中文
   Taken: English (fixed for this scenario).

4. How deep?
   A. Brief: board only, notes collapsed
   B. Standard: board, flow diagram, short notes and open questions per screen (Recommended: enough for a cold reader to judge each sketch without an appendix nobody needs)
   C. Full: everything plus an appendix with the original notes

## Conditional gates

- Reader unclear: not asked. The notes say the team compares layouts and picks two directions.
- Unresolved references: not asked. BK-2026-0042 is described in the notes as the confirmation code on the success screen.
- Size over ~20 MB or editable assets: not asked. No raster media; the page is a few tens of KB.
- Image tool: not asked. No image tool is available, and wireframes must stay precise HTML anyway.

## Not gates (answered by the hard rules, listed in the reply)

- "Use whatever libraries or fonts you like": the page uses system fonts and no libraries, because it must open offline and load nothing from the network.
- What "two directions" means (two of the six screens, or two visual styles) is not stated; the page lets the team pick any two sketches and marks the meaning "to be confirmed".
- Who decides and by when is not stated; marked "to be confirmed" in the page.
