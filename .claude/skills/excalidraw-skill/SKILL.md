---
name: excalidraw-skill
description: >
  Use when drawing or refining a diagram on a live Excalidraw canvas
  (mcp-excalidraw-server), when about to present a canvas screenshot or
  exported PNG as the result, after add/apply/batch_create returns success,
  or when tempted to treat a screenshot file path or element-count JSON as
  visual QA. Also use for a UML class, ER, component, deployment, or activity
  diagram, export/import, snapshots, Mermaid conversion, and
  element-level CRUD on that canvas.
---

# Excalidraw Skill

**REQUIRED COMPANION:** Before drawing, also load `use-excalidraw-library` (same skills root). Read its `references/pack-index.md` and run its pre-flight, including the built-in-only skip. If that skill is not installed, continue with this playbook alone.

**JUDGE THE PICTURE:** Excalidraw is for sketching. A diagram is good when a person looks at it and understands it, not when every join is exact. After every `add` / `apply` / `batch_create_elements`, run one verify cycle: fit the viewport (MCP `set_viewport` with `scrollToContent`, or `POST /api/viewport` `{"scrollToContent":true}` — there is no CLI `viewport` command), take one full screenshot and **read the PNG**, then run `scripts/check-scene.mjs` for pointers on where to look closer. Your judgment of the picture decides; the checker does not. CLI/MCP success JSON is not a look at the picture, a screenshot path you did not open is not either, and neither is a clean checker run. Authority: Verify cycle / Quality Checklist / Present gate below.

## Step 0: Pick an Interface

Three interfaces drive the same live canvas. Pick the first one that applies:

1. **MCP tools** — if `excalidraw/*` tools (e.g. `batch_create_elements`) are in your tool list, prefer them: results land directly in your context, and screenshots come back as images without touching disk.
2. **CLI** (default when no MCP tools are present):
   ```bash
   npx -y mcp-excalidraw-server <command>
   ```
   No setup needed — any canvas-touching command **auto-starts the canvas server** on `http://127.0.0.1:3000`. If the CLI is installed globally (`npm i -g mcp-excalidraw-server`), the shorter alias `excalidraw-canvas <command>` works too.
3. **REST API** (last resort, e.g. from application code): HTTP endpoints on `http://127.0.0.1:3000` — see `references/cheatsheet.md` for payloads. The server must already be running.

The canvas URL comes from `EXPRESS_SERVER_URL` (default `http://127.0.0.1:3000`). Once the server is up, remind the user to open that URL in a browser — mermaid conversion and viewport control need an open tab (CLI exits with code 4 when it's missing). On current versions `screenshot` renders headless (`"renderer": "node"` in its JSON) and works without a tab.

**First run on a machine:** before the first CLI command or MCP spawn, tell the user: `npx` is downloading `mcp-excalidraw-server` and starting the local canvas; a cold npm cache can take **up to 10 minutes**; this is not a hang; later commands are fast. Then ask them to open `http://127.0.0.1:3000` when the server is up.

**Stay on the newest server (once per session, before drawing):** the server ships bug fixes often, so a problem you hit may already be fixed. Compare `npm view mcp-excalidraw-server version` with what you run (`npx -y mcp-excalidraw-server --version`, or `excalidraw-canvas --version` for a global install) and update if npm is newer: `npm i -g mcp-excalidraw-server` for a global install; a name-only `npx` picks up the new release on current npm, and `npx -y mcp-excalidraw-server@latest` forces it. A server that is already running keeps its old code, and `status` does not report its version, so restart it unless you started it yourself this session. The canvas lives in the server's memory and snapshots do not survive a restart, so when `status` shows elements or you are unsure whose they are, keep them: `export --out <file>.excalidraw`, `stop`, `start`, `import <file>.excalidraw --replace`, then check the element count matches. An MCP client keeps its spawned process, so if the MCP tools are what is out of date, tell the user to restart the client. If npm cannot be reached, carry on with what you have and say so.

### CLI Quick Reference

Results are JSON on stdout — except `describe` (plain text) and raw-content output when `--out` is omitted (`export` scene JSON, `screenshot --format svg`). Diagnostics on stderr. Exit codes: 0 ok, 1 error, 2 usage, 3 canvas unreachable, 4 browser tab required.

| Task | Command |
|------|---------|
| Start / stop / inspect server | `start`, `stop`, `status` |
| Create elements (batch) | `add elements.json` or `echo '[...]' \| add` or `add --one '{...}'` |
| Multi-op patch in one call | `apply patch.json` — `{"create":[...],"update":[{"id":"a","set":{...}}],"delete":[...]}` |
| Read one / query many | `get <id>`, `query [--type t] [--bbox x0,y0,x1,y1] [--filter k=v] [--filter-json '{...}']` |
| Update / delete | `update <id> --set '{...}'`, `delete <id> [...]` |
| Understand the scene | `describe` (plain-text summary: ids, positions, labels, connections) |
| See the scene | `screenshot [--out f.png]` (PNG without `--out` → temp file path in JSON; SVG without `--out` → raw SVG) |
| Zoom on a few elements | `screenshot --ids a,b,c --scale 2 --padding 24` (draws only those elements, enlarged); `screenshot --frame <id>` for one frame |
| Measure the scene | `node "<this-skill-dir>/scripts/check-scene.mjs" [scene-file] [--max N] [--accept-notes id,id] [--clear key,key]` (JSON findings with boxes and ready zoom commands; see Verify cycle) |
| Layout operations | `arrange align\|distribute\|group\|ungroup\|lock\|unlock\|duplicate --ids a,b,c [--to left\|horizontal\|...]` |
| Scene files | `export [--out scene.excalidraw]`, `import [scene.excalidraw|-] [--replace]` — a `.excalidraw.md` out path writes Obsidian's format (see File I/O). After every export and before every import of a `.excalidraw` JSON file, run `scripts/fix-scene-indices.mjs` on that file (see File I/O). |
| Mermaid → canvas | `mermaid [diagram.mmd|-]` (or stdin) |
| Snapshots | `snapshot save\|list\|restore <name>` |
| Share link | `share` (encrypted upload → excalidraw.com URL) |
| Wipe canvas | `clear --yes` |
| Install / upgrade this skill | `install-skill --dir <skills-root>` (agent chooses project/global root) |

### Element Format (CLI and MCP)

The CLI and MCP tools accept the same agent-friendly format and normalize it automatically:

- **Labels**: put `"text": "My Label"` on any shape — converted to Excalidraw's bound-label format for you.
- **Arrow binding**: `"startElementId": "a"` / `"endElementId": "b"` — arrows auto-route to element edges and follow when a shape moves. Bind every connector that joins two shapes; do not hand-compute its end points. The canvas leaves a small gap (about 8px) at a bound end; that gap is correct.
- **Connector labels**: put `"text"` on the arrow itself, at creation or later with `update <arrow-id> --set '{"text":"yes"}'`. The label sits on its own line and moves with it. Loose text beside a line drifts and can read as naming the wrong line.
- **Arrowheads**: `startArrowhead` / `endArrowhead` take, for example, `arrow` (default), `bar`, `circle_outline`, `triangle_outline`, `diamond`, `diamond_outline`, `crowfoot_one`, `crowfoot_many`, `crowfoot_one_or_many`, or `null`. Use them for relationship notation before reaching for a connector stamp: an arrowhead binds, a stamp cannot. `"strokeStyle": "dashed"` gives dashed relationships.
- **fontFamily**: omit it for built-in text so the canvas keeps the handwritten default (Excalifont / Virgil). If you must set it, use `"excalifont"` or `"1"`, not `"helvetica"`, unless the user asked for sans/mono. String names or `"1"`–`"8"` only — do not pass a number.
- **points**: both `[[x,y], ...]` tuples and `[{"x":..,"y":..}]` objects are accepted.
- **Patch updates**: in `apply`, update entries can use either direct fields (`{"id":"a","x":120}`) or a `set` object (`{"id":"a","set":{"x":120}}`). Do not mix both forms in one update entry.

**Raw REST is stricter**: labels must be `"label": {"text": "..."}`, bindings must be `"start": {"id": "..."}` / `"end": {"id": "..."}`. Only worry about this when POSTing to the API directly.

---

## Coordinate System

The canvas uses a 2D coordinate grid: **(0, 0) is the origin**, **x increases rightward**, **y increases downward**. Plan your layout before writing any JSON.

**General spacing guidelines:**
- Vertical spacing between tiers: 80–120px (enough that arrows don't crowd labels)
- Horizontal spacing between siblings: 40–60px minimum; give labeled arrows 120px+
- Shape width: `max(160, labelCharCount * 12)` to keep the label on one line
- Shape height: 60px single-line, 80px two-line labels
- Background/zone padding: 50px on all sides around contained elements

**Styling for a professional look:**
- Keep the **handwritten** built-in type. Omit `fontFamily` (or use `"excalifont"` / `"1"`). Do not switch titles, zone labels, or wireframe chrome to Helvetica/`"2"` to mimic a product UI — that fights library stamps and the sketch style. Sans/mono only if the user asks.
- `"fillStyle": "solid"` on shapes gives crisp flat fills — the default is a sketchy hachure pattern
- Pair pastel `backgroundColor` fills with their darker `strokeColor` (palette in the cheatsheet)
- `"strokeStyle": "dashed"` on zone borders and async arrows reads as "boundary / background"

---

## Layout Anti-Patterns (Critical for Complex Diagrams)

These are the most common mistakes that produce unreadable diagrams. Avoid all of them.

### 1. Do NOT use `label.text` (or `text`) on large background zone rectangles

When you put a label on a background rectangle, Excalidraw creates a bound text element centered in the middle of that shape — right where your service boxes will be placed. The text overlaps everything inside the zone and cannot be repositioned.

**Wrong:**
```json
{"id": "vpc-zone", "type": "rectangle", "x": 50, "y": 50, "width": 800, "height": 400, "text": "VPC (10.0.0.0/16)"}
```

**Right — use a free-standing text element anchored at the top of the zone:**
```json
{"id": "vpc-zone", "type": "rectangle", "x": 50, "y": 50, "width": 800, "height": 400, "backgroundColor": "#e3f2fd"},
{"id": "vpc-label", "type": "text", "x": 70, "y": 60, "width": 300, "height": 30, "text": "VPC (10.0.0.0/16)", "fontSize": 18}
```

The free-standing text element sits at the top corner of the zone and doesn't interfere with elements placed inside.

### 2. Avoid cross-zone arrows in complex diagrams

An arrow from an element in one layout zone to an element in a distant zone will draw a long diagonal line crossing through everything in between. In a multi-zone infra diagram this produces an unreadable tangle of spaghetti.

**Design rule:** Keep arrows within the same zone or tier. To show cross-zone relationships, use annotation text or separate the zones so their edges are adjacent (no elements between them), and route the arrow along the edge.

If you must connect across zones, use an elbowed arrow that travels along the perimeter — never through the middle of another zone.

### 3. Use arrow labels sparingly

Arrow labels are placed at the midpoint of the arrow. On short arrows, they overlap the shapes at both ends. On crowded diagrams, they collide with nearby elements.

- Only add an arrow label when the relationship name is genuinely essential (e.g., protocol, port number, data direction).
- If you're adding a label to every arrow, reconsider — it usually adds visual noise, not clarity.
- Keep arrow labels to ≤ 12 characters. Prefer omitting them entirely on dense diagrams.
- When a connector needs a label, put it on the arrow (`text` on the arrow), not as loose text beside it.

---

## Quality: Why It Matters (and How to Check)

Excalidraw diagrams are visual communication, and they are sketches. If a reader cannot follow the diagram, if text is cut off or hidden, or if an arrow plainly misses what it joins, the drawing has failed. A slightly short line, a slightly crooked row, or a hand-drawn wobble has not. Leave room for that: chasing pixels breaks other things and never ends. Fix what hurts understanding, then stop.

### Verify cycle

Run one cycle after each `add` / `apply` / `batch_create_elements`:

1. **Look first.** Fit the viewport, take one full screenshot, and read it before running anything else. Say in a sentence or two what the picture actually shows, as a stranger would read it, before judging it: what the parts are, what connects to what, what order it reads in. Writing what you hope it shows is the common failure here: you drew this, so you will tend to be kind to it. For a large scene (a multi-screen UI, a dense architecture), add one `screenshot --frame <id>` (or `--ids` of a zone) per frame or zone.
2. **Judge it.** Three questions. Does it show what the user asked for? Could a stranger follow it, and is the notation right? Does anything look wrong at normal size? Use the checklist below as things to think about, not a form to pass.
3. **Get pointers.** `node "<this-skill-dir>/scripts/check-scene.mjs"` reads the live canvas (or a scene file) and points at spots a wide picture can hide. Each finding has a `key`, ids, measurements, `boxes`, a fix hint, and a ready `screenshot --ids … --scale 2` zoom command. A `fail` is a likely visible fault: zoom it, then fix it or dismiss it. A `note` is a small thing (a few pixels off, a free line end): skim it, and zoom only if the picture made you doubt it. Dismiss with `--clear key,key` for fails and `--accept-notes id,id` for notes. A dismissal lasts for that run, so pass the same flags again on every re-run. Dismissing needs one line of reason: "the open dropdown covers the search field on purpose". Any finding can be dismissed; the checker also cannot see inside images (`image-unmeasured`) or rotated elements (`skipped.rotated`), so judge those by eye.
4. **Fix what matters, in one batch.** One `apply`, plus `arrange align` where it does the job. Fix the things that hurt understanding. Leave the rest alone: every fix can move something else.

Neither half replaces the other. A wide picture can hide a small gap and a description of it can call a line beside a shape a line from it, which is why you zoom where the checker points. The checker cannot see meaning, and it will both raise false alarms and miss real faults, which is why the picture decides. If `check-scene.mjs` is missing (an older install), read the picture and zoom the joins that matter.

### Quality Checklist

These are the things that usually go wrong, on every diagram type. Think about each one when you read the picture; none is a pass/fail form. (M) means the checker points at it. (I) means only your eye can judge it. Below, "fails" means the checker reports it as a likely fault, for you to fix or dismiss. Checker names map to items: `label-fit` → 1; `overlap`, `covers-many`, `shape-covered`, `stamp-overflow` → 2; `crossing`, `rides-border` → 3; `text-on-line`, `text-border`, `text-overflow`, `text-covered`, `label-ambiguous`, `label-hides-arrow` → 4; `font-size` → 6; `stamp-word` → 8; `connector-end`, `inner-line-end`, `free-end`, `stamp-marker` → 9; `near-align`, `near-align-soft`, `near-straight`, `oversized` → 10. `image-unmeasured` belongs to no single item: nothing inside that image was measured, so judge every item by eye on that picture.

1. **Text truncation** (I) — Is all label text fully visible, without a word broken across lines? Truncated or mid-word-wrapped text means the shape is too small. Increase `width` and/or `height`.
2. **Overlap** (M, I) — Shapes that partly share space, or a stamp poking out of the shape it sits in, usually look broken. Something drawn on top on purpose is fine when the picture reads well, whatever it is: leave it and dismiss the finding with that reason. Do not rearrange a sound drawing to make findings go away. One solid shape over several things is reported once as `covers-many`, which names the words and shapes it hides, so look at those and decide once. A shape wholly under a solid one (`shape-covered`) cannot be seen in the picture, so the checker is your only warning. Background zones should contain their children.
3. **Connector crossing** (M) — A connector visibly cutting through an unrelated shape, or running along its border, confuses the reader. A line hidden under an opaque shape drawn after it is not reported, because no one can see it. A zone or lane may be passed through. Route around it with an elbowed or curved path (see Arrow Routing below), or move the shapes.
4. **Text on lines and borders** (M) — Loose text on a connector or across a border is hard to read. A loose label with two connectors nearby may name the wrong one: put the label on its connector (`text` on the arrow). A label covering most of a short arrow hides the arrow: lengthen it or shorten the label. Text mostly hidden under an opaque shape drawn after it is lost (`text-covered`); a translucent layer does not hide it.
5. **Spacing** (I) — Give separate elements room to breathe, about 40px as a starting point. Inside a UI mock (a form, a card, a toolbar), follow that UI's own spacing instead.
6. **Readability** (M, I) — Font size ≥ 16 for body text, ≥ 20 for titles. The checker flags free-standing text under 16px and stamp words under 12px. Judge titles in the image. `add` draws free-standing text from its `x`, whatever `textAlign` and `width` say: to centre a word in a box, use the box's label, or set `x` from the box centre and the word's measured width.
7. **Zone label placement** (I) — If you used `text`/`label.text` on a background zone rectangle, the zone label will be centered in the middle of the zone, overlapping everything inside. Fix: delete the bound text element and add a free-standing text element at the top of the zone instead (see Layout Anti-Patterns above).
8. **Stamp labels in authored hole** (I) — This item follows the stamps in the scene, not the diagram type. If this scene used library stamps, does each stamp's own text still sit where the library puts it (in the field, on the chip, under the glyph)? Fail if a kit word sits on top of an empty field or toolbar (walked-off / floating), **or** if a dummy widget/kit **name** occupies the value or action hole (`ComboBox`, `Button`, Toolbar `style`) — that reads as a caption on empty chrome even when geometrically in-hole. Do not keep the dummy name and add a second caption for the same meaning (`Button` + `Pick`). Baked chrome (pass) is only a non-name mark still in that hole (Date picker `//`, Toolbar B/U/S). Glyph-adjacent native labels (`Selected`, `Checkbox`) stay as authored. If the scene needs the widget, **stamp it** — do not drop a needed stamp to pass this item. Fix dummy names with `--replace-text` (real value/action). The stamp helper already recenters in-hole middle-aligned labels — see `use-excalidraw-library`. If the PNG still shows the word riding empty chrome, `apply` that text `y` into the sibling hole. Do not run `reflow-center-labels.js`. Built-in-only scenes: skip item 8.
9. **Connector ends** (M) — A connector meant to join two shapes should plainly meet both. A connector is an arrow, a line, or a stamp used as the join.
   - A **bound** end (`startElementId` / `endElementId`) is joined. The canvas leaves a gap of about 8px there on purpose. Do not "fix" it. A bound end drawn more than 16px from its shape is a stale route and is reported.
   - An **unbound** end heading at a shape and more than 8px off it is reported as a likely fault; closer than that is a note, and usually fine in a sketch. A line that ends beside a shape without heading at it (a row divider next to an avatar) is not a join at all. Bind real connectors so this cannot come up.
   - An end far from every shape, or more than 16px inside a container with no other shape near, is a **free end**. The checker reports it as a note. Fine when it is meant to be free.
   - A straight line of at least 100px with at least two connector ends within 24px of it is a **target line** (a lifeline, a bus, an axis). Those ends must be nearer the line than any shape, and a plain line counts only if its other end rests on a shape. Ends on it are measured against the line, at most 6px off, because an arrow cannot bind to a line. An end nearer a shape, or aimed at an unjoined shape within 48px past the line, goes to that shape. One end is not enough evidence: it is measured as usual. A target line's own end near a shape is measured.
   - Touching lines with at most one plain ellipse, whose open ends reach no other shape, are a **figure** (a stick person, a check mark), and a closed frame of loose lines is artwork too. Their ends are not connectors. A head with limbs reaches a shape only within 16px, so normal spacing keeps it a figure; a lone stem or lines with no head reach it within the near band (48-96px) and stay connectors. Several ellipses joined by lines are a graph, not a figure. A figure aligns by its outer box, and its caption may graze it (8px at most). Any other shape a figure or frame line cuts is still a crossing.
   - A stamp is library artwork: the stamp helper marks every element it places (`customData.stampId`, plus the item name and its element count), and the checker never treats a stamp's own lines as connectors or its own parts as peers. A relationship stamp whose line spans the stamp (an association, inheritance, or labelled relation arrow) is measured at its ends like any connector, at any scale. Groups without that marker, including groups you make yourself, are checked element by element. A marker whose element count does not match (a duplicated stamp, a hand-written marker) gives a `stamp-marker` note and is checked like loose elements, as is a stamp placed before the helper marked stamps: restamp it with the helper instead of duplicating it.
   - A divider inside a stamp's frame that misses the frame border is a note (`inner-line-end`), within a tolerance that grows with the frame, so hand-drawn library wobble passes. Zoom it: fix a divider you broke by resizing; name an authored one as intended.
   - Fix by binding first. A connector stamp cannot bind: when a built-in arrowhead carries the same meaning, replace the stamp with a bound arrow. Move an end by hand only when no arrowhead can replace the stamp.
10. **Alignment and proportion** (M, I) — Judge this with your eyes: does a row read as a row? Almost-equal edges, legs a few pixels off straight, and large empty shapes are all notes, never faults. Snap peers with `arrange align` when it costs nothing, and offset them clearly when the difference is meant. Do not move a layout around to satisfy a pixel count. In the image, check that each label sits in the region meant to hold it, not in the empty part of a stretched shape.

If you find any issue, say "I see [issue], fixing it" rather than glossing over it, and fix everything found in one batch.

### Present gate

A user-facing result (for example "here is the diagram", or handing over a PNG as finished work) is allowed when, in the same cycle, you read the last full screenshot (opened as an image, not merely saved), you said what it shows, and you judge that a stranger would understand it and that it is what the user asked for. Every remaining `fail` is either fixed or dismissed with its one-line reason. Name each dismissed `fail` in the result, in one line each, along with anything you know is still imperfect. Do not call a sketch "perfect"; say what you left and why.

**Stop rules (no endless loops):**

- Stop when the picture is sound. Two or three cycles is normal; a further cycle needs a reason you can name, something a reader would actually stumble on.
- If a fix broke something else, or the same spot has had two fixes, stop patching it: change the approach (bind instead of placing by hand, replace a connector stamp with a bound arrow, route along another side, move the neighbours), or accept it and say so.
- Six cycles is the limit. If the picture still has something that hurts understanding after that, stop, show it, say what is wrong, and ask the user whether to continue, accept it, or change the design. An agent that cannot ask the user (a subagent, for example) stops and reports the same things to whoever started it.

Keep needed stamps: never drop a stamp to quiet a finding. Baked stamp marks (Date picker `//`, Toolbar B/U/S) are fine as they are. Library items come from different authors and vary in quality, so see `use-excalidraw-library` for flaws inside a stamp.

A **cycle** is: full screenshot → read PNG and say what it shows → checker pointers → zoom doubts → one fix batch.

Native bundled library stamps from the live pack-index are **exempt** from checklist item 6 after they have been scaled to their hole. Do not stretch them further to fake ≥16px body text or giant filled chrome. Do not fail the gate solely because stamp type is still under 16px. Do not keep stamps at catalog native size when a hole exists — hole-scale lives in `use-excalidraw-library`. Extra captions you add as free-standing text still follow item 6.

Before screenshot, if the scene may exceed the viewport: MCP `set_viewport` with `scrollToContent: true` when `excalidraw/*` tools exist; otherwise `POST /api/viewport` with `{"scrollToContent":true}`; otherwise ask the user to zoom-to-fit in the open canvas tab. There is no `mcp-excalidraw-server viewport` CLI. A zoom adds detail; it never replaces the full screenshot.

A new diagram or a new pre-flight pass does not skip this gate. Each scene gets its own cycles.

---

## Workflow: Drawing a New Diagram

### Mermaid vs. Direct Creation — Which to Use?

**Use `mermaid` / `create_from_mermaid`** when: the user already has a Mermaid diagram, or the diagram is sequence or state (no library pack). Mermaid may land as one flat image instead of shapes (`stateDiagram-v2` does): the checker cannot see inside it and reports an `image-unmeasured` note, so 0 fails says nothing about that picture. Read it at full size; fix faults in the Mermaid source.

**Use `references/uml-diagrams.md`** when the diagram is UML class, ER, component, deployment, or activity.

**Create elements directly** when: you need precise layout control, the diagram is custom architecture or an annotated cloud diagram, or you want elements positioned in a specific coordinate grid.

### Steps (CLI shown; MCP tools are 1:1 — see cheatsheet)

1. Plan your coordinate grid — map out tiers and x-positions before writing JSON. (MCP mode: call `read_diagram_guide` for colors/sizing; the same guidance lives in `references/cheatsheet.md`.)
2. Optional fresh start: `npx -y mcp-excalidraw-server clear --yes`
3. Create shapes and arrows in one call. Custom `id` fields (e.g. `"id": "auth-svc"`) make later updates easy:
   ```bash
   npx -y mcp-excalidraw-server add - <<'EOF'
   [
     {"id": "lb", "type": "rectangle", "x": 300, "y": 50, "width": 180, "height": 60, "text": "Load Balancer"},
     {"id": "svc-a", "type": "rectangle", "x": 100, "y": 200, "width": 160, "height": 60, "text": "Web Server 1"},
     {"id": "svc-b", "type": "rectangle", "x": 450, "y": 200, "width": 160, "height": 60, "text": "Web Server 2"},
     {"id": "db", "type": "rectangle", "x": 275, "y": 350, "width": 210, "height": 60, "text": "PostgreSQL"},
     {"type": "arrow", "x": 0, "y": 0, "startElementId": "lb", "endElementId": "svc-a"},
     {"type": "arrow", "x": 0, "y": 0, "startElementId": "lb", "endElementId": "svc-b"},
     {"type": "arrow", "x": 0, "y": 0, "startElementId": "svc-a", "endElementId": "db"},
     {"type": "arrow", "x": 0, "y": 0, "startElementId": "svc-b", "endElementId": "db"}
   ]
   EOF
   ```
   (The `-` positional is optional — with no file argument, `add` reads stdin.)
4. Set shape widths using `max(160, labelLength * 12)`.
5. Run the verify cycle: `check-scene.mjs` → full `screenshot` → read the file → zoom doubts → fix everything found in one `apply` before the next batch.

---

## Arrow Routing — Avoid Overlaps

Straight arrows can cross through elements in complex diagrams. Use curved or elbowed arrows when needed:

**Curved arrows** (smooth arc over obstacles):
```json
{
  "type": "arrow", "x": 100, "y": 100,
  "points": [[0, 0], [50, -40], [200, 0]],
  "roundness": {"type": 2}
}
```
The intermediate waypoint `[50, -40]` lifts the arrow upward. `roundness: {type: 2}` makes it smooth.

**Elbowed arrows** (right-angle / L-shaped routing):
```json
{
  "type": "arrow", "x": 100, "y": 100,
  "points": [[0, 0], [0, -50], [200, -50], [200, 0]],
  "elbowed": true
}
```

**When to use which:**
- Fan-out (one source → many targets): curved arrows with waypoints spread to avoid overlapping
- Cross-lane (connecting to side panels): elbowed arrows that go up, then across, then down
- Long horizontal connections: curved arrows with a slight vertical offset

**Rule:** If an arrow would pass through an unrelated shape, add a waypoint to route around it.

---

## Workflow: Iterative Refinement

Pairing `describe` with `screenshot` is what makes this skill powerful.

- **`describe`** (`describe_scene` in MCP) → structured text: element IDs, types, positions, labels, connections. Use it to know *what's on the canvas* before making programmatic updates (find IDs, understand bounding boxes).
- **`screenshot`** (`get_canvas_screenshot` in MCP) → PNG of the actual rendered canvas. Use it for *visual quality verification* — it shows exactly what the user sees, including truncation, overlap, and arrow routing. The CLI prints the saved file path as JSON; read/view that file.

**Feedback loop:**
```
add elements
  → screenshot → view → "reads top to bottom; auth-svc text is cut off"
  → check-scene → "arrow-2 ends 14px short of db; label-q is 6px from arrow-2 and 20px from arrow-3"
  → apply: bind arrow-2 to db, move label-q onto arrow-3 as its text, widen auth-svc to 220
  → screenshot → view → a stranger could follow it → present
  → proceed
```

## Common mistakes (visual QA)

| Excuse | Reality |
|--------|---------|
| `add` returned success / element count | That is not a picture. Read the PNG. |
| "I screenshotted" (path in JSON only) | Unread path is not QA. Open the image. |
| User asked for the next pass / another diagram | New scene, new gate. Do not skip. |
| First dump is "close enough" | First dumps routinely overlap. Cycle 1 is expected to fail. |
| Time pressure / they are waiting | The checker takes a second, and one read of the PNG is cheaper than handing over a broken diagram. |
| The description said the arrow starts at the box | Zoom where the checker points. A wide sheet can call a line beside a box a line from the box. |
| A checker fail must reach 0 before I can show it | No. Fix it or dismiss it with a reason. The picture decides. |
| I will nudge this 3px so the note goes away | Leave it. In a sketch it does not matter, and moves break other things. |
| It looks fine to me, I drew it | Say what it shows as a stranger would, then judge. Authors are kind to their own work. |
| The bound arrow shows a gap, so move it onto the border | That is the canvas binding gap. Leave it. |
| The checker says 0 fails, so skip the picture | It cannot see meaning, legibility, or balance. Read the full screenshot. |
| Zoom every join to be safe | The checker measured them. Zoom what it flags or what you doubt. |
| The checker flagged it, and it looks fine in the wide shot | Zoom it once. Then dismiss it with a reason, or fix it. |
| One more try on the same fail | After two fixes, change the approach or accept it and say so. |

## Red flags — STOP

- Presenting a diagram as the result after `add`/`apply` without reading a PNG
- Calling a screenshot file path visual QA without opening it
- Skipping the gate because the user requested another pass or option
- Hiding a known flaw behind "done" or "all checks pass"
- Screenshot without zoom-to-fit when content is off-screen
- Judging what you meant to draw rather than what the picture shows
- Dismissing a fail with no reason, or without zooming it
- Moving things around to quiet pixel notes while the picture was already sound
- Hand-computing connector end points instead of binding them
- Loose label text beside a connector instead of `text` on the arrow
- Patching the same spot a third time

**All of these mean:** stop, and go back to the picture.

## Workflow: Refine an Existing Diagram

1. `describe` to understand current state — note element IDs and positions.
2. Identify elements by `id` or label text (not by x/y coordinates — they change).
3. `update <id> --set '{...}'` to resize/recolor/move; `delete <id>` to remove; or bundle everything in one `apply` patch. **Bound arrows re-route automatically when you move or resize their endpoints** — no need to delete and recreate them.
4. Run the verify cycle to confirm the change. A bound elbowed arrow can come back as a straight diagonal after its shape moves; re-send its `points` or route it again if the diagonal crosses something or breaks the layout.
5. If updates fail: check the ID exists with `get <id>`; unlock with `arrange unlock --ids <id>` if locked.

## Workflow: Mermaid Conversion

```bash
echo 'graph TD
  A[Client] --> B[API]
  B --> C[(DB)]' | npx -y mcp-excalidraw-server mermaid
```
Requires an open browser tab (conversion runs in the frontend; exit code 4 tells you to open the canvas URL). Afterwards `screenshot` to verify layout. If the auto-layout is poor (nodes crowded, edges crossing), find problem elements with `describe` and reposition them with `update`.

## Workflow: File I/O

**Index and default-align rewrite (mandatory for `.excalidraw` JSON):** CLI `export` invents z-order keys `a0`, `a1`, … `a90` (Open/refresh fail from 91 elements) **and** writes `textAlign: "center"` on free-standing text that `add` drew left-aligned (import then recenters labels into other shapes; JSON `x` stays put). Do not invent `a0`/`a1` yourself. After every `export --out <file>.excalidraw` and before every `import <file>.excalidraw`, always run:

```bash
node "<this-skill-dir>/scripts/fix-scene-indices.mjs" diagram.excalidraw
```

`<this-skill-dir>` is the folder that contains this `SKILL.md`. The script always rewrites every `element.index` with `generateNKeysBetween(null, null, n)` **and** sets `textAlign` to `"left"` on ungrouped, unbound text that matches the CLI default combo (`center` + `verticalAlign: "middle"` + `autoResize: true`). Do not skip it because the scene is "small" or the keys "look fine". Leave grouped stamp labels and bound text alone. It does not rewrite Obsidian `.excalidraw.md` files.

- Export scene: `export --out diagram.excalidraw` (no `--out` → JSON to stdout), then run `fix-scene-indices.mjs` on that file
- Import scene: run `fix-scene-indices.mjs` on the file, then `import diagram.excalidraw` (append) or `import diagram.excalidraw --replace`
- Image: `screenshot --out diagram.png` / `screenshot --format svg --out diagram.svg`
- Share link: `share` — encrypts the scene and returns a shareable excalidraw.com URL

This is how diagrams live in a repo: commit the `.excalidraw` file, and re-`import` + edit + `export` it when the architecture changes.

### Obsidian vaults: use `.excalidraw.md`

Check the destination before writing: if any ancestor directory contains `.obsidian/`, it is an Obsidian vault. A raw `.excalidraw` file there opens in the Excalidraw plugin only in **compatibility mode** ("Convert to new format" warning), gets no block references or vault-wide search, and default Obsidian Sync skips non-`.md` files. Give the export a `.excalidraw.md` extension and the CLI writes the plugin's native format automatically:

```bash
npx -y mcp-excalidraw-server export --out "$VAULT/diagrams/system-map.excalidraw.md"   # .md → Obsidian format (or force with --format obsidian)
npx -y mcp-excalidraw-server import "$VAULT/diagrams/system-map.excalidraw.md" --replace  # reads both plain and compressed Drawing blocks
```

Round-trips are safe: text-element block references follow the plugin's own id rules, so re-importing, editing, and re-exporting the same file keeps links from other notes intact.

## Workflow: Snapshots

1. `snapshot save <name>` before risky changes.
2. Make changes, evaluate with `describe` / `screenshot`.
3. `snapshot restore <name>` to roll back if needed. `snapshot list` shows what's saved.

## Workflow: Duplication

`arrange duplicate --ids a,b --offset 40,40` (default offset 20,20). Useful for repeated patterns or copying layouts.

## Error Recovery

- **Exit code 3 (canvas unreachable)?** Auto-start is disabled (`EXCALIDRAW_NO_AUTOSTART=1`) or a non-loopback `EXPRESS_SERVER_URL` is set. Run `start` explicitly or fix the env.
- **Exit code 4 (browser required)?** Open `http://127.0.0.1:3000` in a browser, then retry — viewport and mermaid conversion run in the frontend. If `screenshot` itself exits 4, that install still renders in the browser; open the tab.
- **Elements not appearing?** Check `describe` — they may be off-screen. In MCP mode, use `set_viewport` with `scrollToContent: true`, or `scrollToElementIds` plus optional `viewportZoomFactor` to focus on a specific subgraph; in a browser, press the zoom-to-fit button.
- **Arrow not connecting?** Verify element IDs with `get <id>`. Make sure `startElementId`/`endElementId` match existing element IDs.
- **Canvas in a bad state?** `snapshot save` first, then `clear --yes` and rebuild. Or `snapshot restore` to go back.
- **Element won't update?** It may be locked — `arrange unlock --ids <id>` first.
- **Duplicate text elements / element count doubling?** The frontend auto-sync timer periodically writes the full Excalidraw scene back to the server. Excalidraw internally generates a bound text element for every shape with a label; clearing and re-sending elements can re-inject cached bound texts. Clean up: `query --type text` to find elements with a `containerId`, `delete` the unwanted ones, wait a few seconds for auto-sync to settle. The safest prevention: **never put labels on background zone rectangles** — use free-standing text elements.

---

## References

- `references/cheatsheet.md`: full CLI reference, the 26 MCP tools, REST API endpoints + payload shapes, and the diagram design guide (colors, sizing).
