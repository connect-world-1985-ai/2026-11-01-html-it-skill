# How to convert v1 Excalidraw libraries to named v2

Cold-start runbook for an agent in a **new session**. Convert one unnamed v1 `.excalidrawlib` into a **named** v2 file by laying every stamp on a fresh canvas, screenshotting, reading the PNG, and confirming names with the user.

This is **not** Job B of `how-to-maintain-libraries.md`. Job B still accepts only already-v2 named packs. This is **not** a drawing-session path. Do not stamp the output folder while drawing a user diagram.

**Output directory:** `production/skills/use-excalidraw-library/libraries/v2-converted-from-v1/`  
**Utils:** `production/skills/use-excalidraw-library/libraries/v2-converted-from-v1/utils/`  
**Commands assume Git Bash from the collection repo root.**

Ignore this markdown and the `v2-converted-from-v1/` subdirectory when listing live `libraries/*.excalidrawlib` (Job A is non-recursive on the libraries folder root).

---

## Contents

1. [Why conversion is a naming job](#1-why-conversion-is-a-naming-job)
2. [HARD STOPs](#2-hard-stops)
3. [Utils](#3-utils)
4. [Per-pack procedure](#4-per-pack-procedure)
5. [Verification](#5-verification)
6. [Afterward](#6-afterward)

---

## 1. Why conversion is a naming job

v1: `{ type: "excalidrawlib", version: 1, library: [ [elements], … ] }` — no `name`.  
v2: `{ type, version: 2, libraryItems: [ { id, status, created, name, elements } ] }`.

Excalidraw’s import wrap adds ids, not names. `Item 1` / `#0` as final names is forbidden. Names come from a **labeled gallery screenshot** plus the whole pack’s context. Canvas labels `#0`…`#n-1` are join keys only.

Remap/scale for the gallery reuses `scripts/stamp-library-item.js` exports. Do not rewrite remap in `%TEMP%`.

---

## 2. HARD STOPs

Stop and report. Do not continue.

- Source missing, not JSON, not v1 (`type` / `version === 1` / `library[]`)
- Empty `library`
- Already v2 — do not wrap; Job B if the user wants it live
- Convert in place (overwrite the user’s v1 file)
- Final names `#N` or `Item N` (or empty / duplicate)
- Skip per-pack name confirmation
- `npx … import` a `.excalidrawlib`
- Stamp `libraries/v2-converted-from-v1/` during a user diagram
- `PACK_FILES` / `build-catalogs.js` / pack-index / ATTRIBUTION / README Diagram Skills / `Version.txt`
- `Install-to-*.ps1` / `Uninstall-to-*.ps1` unless the user asked
- Mix Jira/Confluence dirt into the same commit
- Guess names because Chrome is missing (CLI exit 4) — ask the user to open `http://127.0.0.1:3000` in **external Chrome**

---

## 3. Utils

Authoring only. No canvas I/O. Tests:

```bash
node --test production/skills/use-excalidraw-library/libraries/v2-converted-from-v1/utils/test-convert-v1.js
```

**Pass:** exit 0.

### Layout a numbered grid

```bash
node production/skills/use-excalidraw-library/libraries/v2-converted-from-v1/utils/layout-v1-grid.js \
  --src "/path/to/source.excalidrawlib" \
  --out-dir "$TEMP/v1-convert-<stem>" \
  --page-size 16
```

**Pass:** stdout `{"itemCount":<n>,"pageCount":<p>,"outDir":"..."}`. Writes `manifest.json` and `page-00.json` … (JSON arrays for `add`). Default page size 16 (emojis 48 → 3 pages). Labels on the board are global `#i`, not per-page `#0`.

Gallery `add` maps legacy element `type: "draw"` to `"freedraw"` (mcp-excalidraw-server enum). The same map is applied when writing the v2 file so a later Job B stamp can `add`.

### Apply a confirmed name list

`names.json`:

```json
{ "names": ["First", "Second"] }
```

Length must equal `library.length`. Unique, non-empty, not `#N` / `Item N`.

```bash
node production/skills/use-excalidraw-library/libraries/v2-converted-from-v1/utils/apply-names.js \
  --src "/path/to/source.excalidrawlib" \
  --names "$TEMP/v1-convert-<stem>/names.json" \
  --out "production/skills/use-excalidraw-library/libraries/v2-converted-from-v1/<basename>.excalidrawlib"
```

**Pass:** stdout `{"out":"...","items":<n>}`. `version` is the number `2`.

---

## 4. Per-pack procedure

External Chrome at `http://127.0.0.1:3000`. First `npx` may take **up to 10 minutes**. Do not use Cursor’s built-in browser.

1. Detect v1. HARD STOP if already v2 or empty.
2. If the live canvas might hold user work: `npx -y mcp-excalidraw-server snapshot save convert-v1-backup`
3. Layout into `$TEMP/v1-convert-<stem>/` (section 3).
4. For **each** `page-XX.json` as its **own** scene:
   - `npx -y mcp-excalidraw-server clear --yes`
   - `npx -y mcp-excalidraw-server add "$TEMP/v1-convert-<stem>/page-XX.json"`
   - Zoom-to-fit: MCP `set_viewport` `{ "scrollToContent": true }` or `POST http://127.0.0.1:3000/api/viewport` with `{"scrollToContent":true}` (no CLI `viewport` command)
   - `npx -y mcp-excalidraw-server screenshot --out "$TEMP/v1-convert-<stem>/page-XX.png"`
   - **Read the PNG** (open the image). Unread path is not naming evidence.
5. Propose `names[0..n-1]` aligned to `#i`. Use the whole pack so similar stamps get distinct names. Baked text is a hint, not automatically the name. Forbidden: `#N`, `Item N`.
6. Paste the list in plain chat. Then question channel: **approve** / **I will edit in chat** / **skip this pack**.
7. On approve (or after edits): write `names.json`, run `apply-names.js` to `libraries/v2-converted-from-v1/<same basename>`.
8. Run section 5. Do not add the file to `PACK_FILES`.

Never stack page 1 onto page 0 (`#0` would overlap `#16`).

---

## 5. Verification

```bash
node -e "
const fs=require('fs');
const p=process.argv[1];
const j=JSON.parse(fs.readFileSync(p,'utf8'));
const names=j.libraryItems.map(i=>i.name);
const u=new Set(names);
console.log({version:j.version, n:names.length, unique:u.size, empty:names.filter(n=>!n).length});
if (j.version!==2 || names.length!==u.size || names.some(n=>!n || /^#\\d+$/.test(n) || /^item\\s*\\d+$/i.test(n))) process.exit(1);
" "production/skills/use-excalidraw-library/libraries/v2-converted-from-v1/<file>.excalidrawlib"
```

**Pass:** exit 0; `n` equals source `library.length`; `unique===n`.  
**Fail:** quote stdout.

Live `PACK_FILES` packs, catalogs, and pack-index must be unchanged.

---

## 6. Afterward

If the user later wants a converted file on the **live** whitelist, it is already v2 named — use `how-to-maintain-libraries.md` Job B (copy from `v2-converted-from-v1/` beside the live packs, then wire). Job B adds a `references/pack-index.md` row (boundary Use-when) plus `PACK_FILES` / catalog emit. It does **not** add a `SKILL.md` Extra libraries / announce-table row. Do not skip Job B verification.

Drawing agents: only the pack-index ids. `v2-converted-from-v1/` is authoring output.

---

## Quick decision tree

```text
User has a v1 .excalidrawlib and wants names?
  → this runbook (gallery + confirm + apply-names).

User wants that file stampable at draw time?
  → finish this runbook, then maintain Job B (already v2).

User asked to stamp v2-converted-from-v1 during a diagram?
  → HARD STOP. Announce-table packs only.

Already v2 named?
  → maintain Job B, not this file.
```
