# s2 gates: questions that would go to the user

Run unattended (subagent), so every recommended option below was taken.

## Gate 1: plan card

```
Plan: Booking app screen sketches
Reader: the software team building the mobile appointment booking app (designers, developers, product owner)
Job: decide (compare six screen layouts and pick two directions)
Form: UI sketch board (traits: many visual items, light decision, order of the booking flow)
Outline: 1. What the team decides  2. The booking flow at a glance (SVG)  3. Sketch board (six isolated phone sketches, filter chips, compare two)  4. How to pick and share your two directions  5. Open questions  6. References  7. Glossary
Interactivity: filter chips by flow stage, "mark as pick" on each sketch, compare two side by side, copy-ready message with your picks
References: 1 found (BK-2026-0042), 1 resolved (the example confirmation code shown on the success screen), 0 unresolved
```

### Question 1: Form

A. UI sketch board: six isolated sketches with filters and compare mode (Recommended: the content is six visual items to compare, and the team's job is to pick two)
B. Clickable prototype of the booking flow
C. Plain article with one sketch per section

### Question 2: Theme

A. Console (Recommended: the skill's variant for sketch boards; the sketches carry their own look)
B. Ivory
C. Graphite

### Question 3: Language

A. English (Recommended)
B. Deutsch
C. 中文

### Question 4: Depth

A. Brief
B. Standard (Recommended: all six sketches with short annotations and the decision; nothing long enough to need an appendix)
C. Full

## Conditional gates

- Reader unclear: not asked. The reader is stated: the software team.
- Unresolved references: not asked. The only ID, BK-2026-0042, is described by the content as the confirmation code on the success screen.
- Size over ~20 MB or editable assets: not asked. No raster media; the page is a few tens of kilobytes.
- Image generation: not asked. Wireframe sketches in HTML say more than a generated image would, and no native image tool is attached to this run.

## Not gates (stated in the page and the reply instead)

- The request to "use whatever libraries or fonts you like": answered by hard rule 1. System fonts, no CDN, no web fonts.
- Picking two directions together needs shared state, which one HTML file cannot hold. The page keeps picks in the reader's browser and offers a copy-ready message for the team channel.
- "Two directions" is not defined in the source (two of the six screens, or two layout styles). The page keeps the source's words and marks it "to be confirmed".
