# s6 image requests

## 1. Concept illustration: snapshot versus log

- **Prompt:** A clean, flat editorial illustration on a warm off-white background, split into two halves. Left half: a single index card being erased and rewritten with a pencil, with faint smudges showing the old text is lost. Right half: a long paper ledger or receipt roll unrolling downwards, with three new entries stacked one below the other, each stamped and never crossed out, and a small hand pointing at the latest line. Muted clay orange and slate grey palette, no readable text, no logos, no people's faces, generous white space, 16:9.
- **Purpose:** Give readers coming from CRUD-only backends the mental model before the precise diagram: a CRUD row is overwritten in place and loses history, while event sourcing keeps an append-only list of changes from which any past or current state can be rebuilt.
- **Placement:** Section "A snapshot versus a log", directly under its heading and before the CRUD comparison table (the first figure on the page, after the lede).
- **Alt text:** Illustration: on the left, a single card is erased and rewritten, so its earlier content is lost; on the right, a ledger keeps growing, with each new entry added below the previous ones and nothing crossed out.
