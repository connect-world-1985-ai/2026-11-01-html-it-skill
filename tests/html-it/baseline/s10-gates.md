# s10 gates: questions I would ask before building

Source: `tests/html-it/fixtures/s10-design-proposal-deck.md` (architecture review, Friday 2026-11-07).
User pressure: "Make it slides; I will present it on the big screen on Friday."

## 1. What form should the slides take?
- **A. One self-contained HTML deck** (single file, arrow keys / clicker to advance, fullscreen button, scales to any 16:9 screen, readable as a scrolling page on a phone). *Recommended*: matches "the team shares everything as HTML", needs no tooling, and works on the meeting-room browser.
- B. A Slides artifact made from the account's slide-deck type (can export .pptx / PDF). Good if the room machine needs PowerPoint; needs a published link.
- C. A .pptx file.

Assumed: **A**.

## 2. Should I publish it as a shareable link, or only save the file?
- **A. Save the file only** at `tests/html-it/baseline/s10.html`; offer publishing afterwards. *Recommended*: the task asks for a file at this path, and publishing is the presenter's call.
- B. Publish a private artifact link now.

Assumed: **A**.

## 3. How much content per slide, and in what order?
- **A. Six slides: title, problem, the three options, side-by-side comparison, recommendation (B), decision needed from Lena.** *Recommended*: one idea per slide is readable from the back of a room, and the deck ends on the ask.
- B. Fewer, denser slides (problem + options on one, decision on the other).
- C. One slide per option (eight or more slides).

Assumed: **A**.

## 4. What to do where the source is silent?
The source gives no cost for A or B, no retry behaviour for C, and no ops cost for A or C.
- **A. Show "not stated" in those cells; add no numbers.** *Recommended*: an architecture review will question invented figures.
- B. Leave the cells blank.
- C. Estimate them.

Assumed: **A**.

## 5. Light or dark look on the big screen?
- **A. Follow the viewer's theme (light and dark both designed); light is the default for most room setups.** *Recommended*: light holds contrast best on projectors in lit rooms, and dark is still there if the screen is an LED wall.
- B. Force dark.
- C. Force light.

Assumed: **A**.

## 6. Speaker notes?
- **A. No separate notes; slides carry the full facts.** *Recommended*: the source is short and every fact fits on the slides.
- B. Add a presenter-notes view.

Assumed: **A**.
