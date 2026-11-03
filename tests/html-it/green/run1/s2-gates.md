# s2 gates: questions I would ask before building

I could not ask the user in this run, so I took the recommended option for each question. The scenario fixes the language as English.

## Gate 1: plan card

```
Plan: Booking app screen sketches
Reader: the booking app team (product, design, mobile developers)   Job: decide (compare six layouts, pick two directions)
Form: UI sketch board (traits: many visual items, flow, decision)
Outline: 1. What the team decides  2. How the six screens connect (SVG flow)  3. Sketch board (six isolated sketches with notes)  4. Your two picks and a message to post  5. References  6. Glossary
Interactivity: filter chips by flow stage, "Pick" button on each sketch (up to two), compare the two picks side by side, a copy-ready message listing the picks
References: 1 found, 1 resolved (BK-2026-0042, the example confirmation code from the Success screen idea), 0 unresolved
```

Limit I would state: a single HTML file cannot collect picks from the whole team. Picks stay in each reader's browser; the page builds a message to paste into the team channel.

1. **Form**
   A. UI sketch board: six sketches in one gallery, each in its own iframe, with filters, picks and compare mode (Recommended: the team's job is to compare layouts side by side and choose two)
   B. Clickable prototype: the six screens linked as one flow to click through
   C. Static one-pager: the six sketches stacked with notes, no interaction

2. **Theme**
   A. Ivory
   B. Graphite
   C. Console (Recommended: it is the board variant; the sketches carry their own look inside their frames)

3. **Language**
   A. English (Recommended; also fixed for this scenario)
   B. Deutsch
   C. 中文

4. **Depth**
   A. Brief: one screen of summary, sketches collapsed
   B. Standard: decision, flow, all six sketches with notes (Recommended: the sketches are the content; nothing long needs an appendix)
   C. Full: everything plus an appendix with the original note

## Conditional gates

None applies:

- Reader: implied (the team that wants to compare layouts and pick two directions).
- Unresolved references: none. The only ID, BK-2026-0042, is explained in the source as the confirmation code shown on the Success screen.
- Size: no raster media; the page is a few tens of KB.
- Image generation: no image tool in this environment; the sketches are HTML and SVG anyway.

Fonts and libraries are not gates: the request "use whatever libraries or fonts you like" is answered by the hard rule (one file, zero network), so the page uses system fonts and no libraries.

## Choices taken

Form A (UI sketch board), theme Console, language English, depth Standard.
