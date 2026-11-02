---
name: use-excalidraw-library
description: >
  Use when drawing or refining a diagram on the live Excalidraw canvas
  (mcp-excalidraw-server), or when the task is a lo-fi wireframe, form-control
  kit, AWS or architecture sketch, C4 or EIP or 3D-network diagram, UML class
  or ER or component or deployment or activity diagram, stick-figure
  or emoji-face scene, speech bubble, sticky note, chart glyph, office-file
  icon, data-pipeline stage, or stamping bundled Excalidraw library items or
  .excalidrawlib figures. Also use when choosing which bundled library pack to
  stamp, stamps look unreadably small, labels walk off chips after
  --replace-text, mixing library packs with built-in frames, or when tempted
  to skip visual QA after stamp/`add`.
---

# Use Excalidraw Library

**REQUIRED BACKGROUND:** Use the `excalidraw-skill` for canvas CLI, screenshots, and the quality loop. This skill adds the live v2 packs listed in `references/pack-index.md`.

## Overview

Named packs live in this skill's `libraries/` folder after install. `references/pack-index.md` is the menu. Catalogs are item lists (names + native size), not the picker. `scripts/stamp-library-item.js` places one item. Do not parse other `.excalidrawlib` files. Do not stamp files under `libraries/v2-converted-from-v1/` at draw time — that folder is authoring output from v1 conversion, not a live pack. Only pack-index ids are stampable. Do not use Chrome's Library panel. Do not `import` a `.excalidrawlib` (`import` is for `.excalidraw` scenes). Do not call `get_resource library`.

To add or remove a live pack, follow `libraries/how-to-maintain-libraries.md` (authoring, not draw time).

## Pack index

Read `references/pack-index.md`. Do **not** paste it into chat.

For each row, decide yes/no **independently** from **this** diagram versus that row's Use when. The proposed set is the union of yeses. Similar purpose does not mean you must keep both. Do not stamp a pack just because another selected pack looks related.

Then run **Pre-flight**. Load a catalog only for packs that survived pre-flight (do not load all 249 AWS names for a stick-figure scene).

## Pre-flight (once per diagram, question channel)

State the proposed pack ids, each with one line of why it matched. Then ask:

- **A)** Accept the proposed set
- **B)** Change the set — follow-up multi-select of **all live pack ids** from pack-index (add or remove)
- **C)** Built-in only — no library stamps

If a pack remains in the set, stamp at least one item from it (otherwise it should have been removed in B).

"Don't ask questions" / standup time pressure does **not** skip this. One question is cheaper than re-parsing a library.

## Stamp

Catalog native W×H is **authoring size**, not drawn size. This procedure is for pack-index / `PACK_FILES` packs (whatever ids are live, including a pack added later via Job B). Do not stamp `libraries/v2-converted-from-v1/`. It is **not** a per-kind factor table and **not** pack-specific zoom.

1. Draw built-in frames first. Those rectangles are the **holes**. Nested stamps use holes *inside* a parent region.
2. Read the item’s catalog native W×H (or the item bbox). Pick **one** axis mode:
   - **contain** (default): `scale = min(hole_w/native_w, hole_h/native_h)` — must stay inside a card/slot.
   - **match-height**: `scale = hole_h/native_h` — shared row of people, icons, toolbar widgets.
   - **match-width**: `scale = hole_w/native_w` — overlay/banner.
3. Stamp with that number. Scale the **whole group** together:

```bash
node "<skill-dir>/scripts/stamp-library-item.js" --pack ux --name "Search field" --x 400 --y 80 --scale 2
```

Pipe stdout JSON to `npx -y mcp-excalidraw-server add`. `--x`/`--y` are the top-left of the drawn box, including lines drawn backwards. Optional `--replace-text old=new` when the old string is **exactly** `el.text` (newlines and trailing spaces count; catalog Notes are a hint, not always byte-exact), or, when no text matches whole, exactly one line of a multi-line text; a line found more than once is a usage error. Duplicate baked words (`Button`+`Button` in Modal): after `add`, `apply` by id. Use the exact catalog `name`. Mix with built-in rectangles, arrows, and free-standing text. Python callers must use `encoding="utf-8"` (Windows GBK crashes on stick face glyphs).

Keep the stamp's own text. It is part of the sticker (AWS service name, Cache title, pipeline stage name). Scale the whole group together so the native label stays aligned with the icon.

- **Need a different word on that same node** (C4 Person fields, form labels, ComboBox value, Search placeholder, a chart title you are filling): `--replace-text` only. Enlarge the hole if the result is unreadable.
- **Need extra meaning the sticker does not already say** (instance names like `thumbs` / `upload`): add free-standing text. Do **not** add a second caption that repeats the stamp's native name.
- A word the reader cannot read is not kept just because it is native. The checker fails stamp text under 12px: scale the stamp up, raise that word's `fontSize`, or, if neither fits and the name is clear from what is around it, remove the word.
- Otherwise never strip native labels as a leftover fix. Never invent a replacement caption for a name the stamp already carries.

4. Do **not** overlay a second built-in caption on a stamp that still has its own label. Do **not** bind stamp text with `containerId`.
5. `stamp-library-item.js` already converts grouped stamp text that was `textAlign: "center"` (and has no `containerId`) to `left` **without moving `x`**. That matches UI library-drag on this canvas (`add` would otherwise treat `x` as the centerline). After `--replace-text` and `--scale`, it also recenters **in-hole** labels: grouped text with `verticalAlign: "middle"`, no `containerId`, whose center sits inside a same-group rectangle, is emitted `verticalAlign: "top"` with `y` such that the `fontSize` band is vertically centered in that hole, and `height` set to `fontSize * 1.25`. That is not `middle`→`top` keep `y` (that pins ink to the top of the old box). Do **not** run `reflow-center-labels.js` after stamp to “fix” AWS/Cache/pipeline/Button captions — that script places the word on the innermost rectangle (on-glyph), which is not the UI layout. Leave already-top field/radio/checkbox/toggle/Search text and under-glyph captions alone. `reflow-center-labels.js` remains only for leftover **center** grouped text that did **not** go through stamp. `--replace-text` also updates `originalText`, because the canvas draws bound text from it. The canvas centres bound text in its container, so the helper unbinds a bound title authored at the top and recentres it horizontally; a bound middle label stays bound. A replaced word that sat centred on its box stays centred there; any other replaced word keeps its `x` and grows right. Smaller `--scale` shrinks font with the stamp.
6. `apply` payload must be `{"update":[{"id":"…","set":{…}}]}`. A bare array is treated as create (duplicates).
7. Judge the **full scene** after zoom-to-fit (`POST /api/viewport` `{"scrollToContent":true}`). If a stamp looks lost in its card, restamp with a better hole or mode — do not add a kind table. Rotated overlays (Tooltip) may still look off after bbox-fit; give them a larger hole or skip tiny `--replace-text`.

Do not stretch filled buttons to **fake product chrome** (a 200px-tall filled pill). Pair stamps with built-in frames; the frame is the chrome, the stamp is the widget that **fits the hole**.

After stamp/`add`, the canvas skill's verify cycle still applies (full screenshot, **read the PNG** and judge it, `check-scene.mjs` pointers, Quality Checklist / Present gate). Do **not** insert a reflow step between `add` and the first screenshot for stamps. Extra stamp checks the canvas list does not cover: native stamp labels kept (not replaced by a free-standing copy); hole-scale applied (not catalog native in a large hole); zoom-to-fit before screenshot; built-in chrome still handwritten (do not Helvetica-wash titles next to Virgil stamps). Dummy kit names in the value/action hole and walked-off stamp text are canvas Quality Checklist item 8. Open joins and drifted edges are items 9 and 10. Do not copy those items here.

Library items come from different authors and vary in quality, so some flaws may be baked into the item. That can explain a flaw only after you have tried to fix it; every check still applies to stamps. Treat a flaw as yours until shown otherwise, and make three different attempts at it within the cycle limit: another scale or hole, moving the stamp or its neighbours, nudging a word or part, or another item. If it still shows, decide by the reader: if they would stumble, use another item or a built-in stand-in; if it is only a small imperfection, keep it and name it in the result with what you tried. Do not keep polishing after that.

If a widget is missing from allowed packs, say so and use a built-in stand-in. Do not invent a pack id that is not in pack-index.

Do not reuse `%TEMP%` remap scripts. Do not `node -e` parse `libraries/*.excalidrawlib` for names. After install, this skill is the path.

## Common mistakes

| Excuse | Reality |
|--------|---------|
| `import` the `.excalidrawlib` | `import` reads scenes only |
| Chrome Library / download again | Packs are already in `libraries/` |
| Skip pre-flight to save time / senior said don't ask | One question per diagram; read pack-index, do not paste it |
| Similar Use when, so load both catalogs every time | Independent match; drop a pack with no stamp you need |
| Parse or grep the AWS file for names | Open `catalog-aws.md` after the pack is selected |
| Last week's temp remap script already works | Call `stamp-library-item.js` |
| No skill, so parse json myself | After install, this skill is the path |
| `add` succeeded after stamp, show the user | Read the PNG. Success JSON is not QA. |
| Screenshot path without opening it | Not QA. |
| Next pre-flight pass, skip the picture | Each scene has its own gate. |
| Stamp at catalog native size because the kit is ~20px / “do not stretch” | Native W×H is authoring size. Scale to the hole. “Do not stretch” means do not fake huge filled chrome |
| Per-kind table (fields 2.0×, buttons 1.6×) or uniform 2.2× | One axis mode per stamp: contain / match-height / match-width |
| `min(w,h)` for a row of people/icons | That is contain. Height-matched rows use match-height |
| Guess Virgil width `len * fontSize * 0.62` | Stamp already emits `left` at authored `x`. Do not invent widths. `reflow-center-labels.js` is leftover-only (center text that never went through stamp), not a post-stamp ritual |
| `containerId` bind to keep the label in the chip | Broken on this canvas stack. Unbind; left-align; place using live metrics |
| Overlay a built-in caption that repeats the stamp's name | Keep the native label; extra text only for new meaning |
| Helvetica/`fontFamily: 2` on chrome so it looks like a real UI | Omit `fontFamily` on built-in text (handwritten default). Stamps already use Virgil |
| Python `subprocess` `text=True` on Windows | `encoding="utf-8"` |

## Red flags — STOP

- Stamping before pre-flight
- Opening libraries.excalidraw.com for the pack-index packs
- Pasting pack-index into chat as a checklist
- Treating similar Use-when rows as a required bundle
- Following deleted intent hints (`wireframe → ux` as a lock)
- `get_resource library` or Chrome IndexedDB
- Dumping all 249 AWS names into the drawing plan
- Rewriting remap in `%TEMP%` or `node -e`
- Presenting after stamp/`add` without the canvas Visual QA Gate
- Treating a screenshot path as QA without reading the PNG
- Skipping visual QA because the user asked for another pass
- Stamping at catalog native size into a large hole
- Using a per-kind or per-pack factor table
- Binding stamp text with `containerId`
- Running `reflow-center-labels.js` after stamp to park AWS/Cache/pipeline names on the icon square
- Baking `.excalidrawlib` `center`→`left` instead of stamp normalize
- Telling the user to drag from the Library panel as the agent drawing path
- The helper rule is **all packs**, not AWS-only
- `--replace-text` with a guessed string (must equal `el.text` or one whole line of it, including trailing spaces)
- Blanking every library word on a sticker by default
- Stripping a stamp's native label to invent a free-standing caption
- Overlaying a second caption on a stamp that already has a label
- Switching built-in chrome to Helvetica/`fontFamily: 2` next to handwritten stamps
- Stamping `v2-converted-from-v1` or parsing a raw v1 library during a drawing session
