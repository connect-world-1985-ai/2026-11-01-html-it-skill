# How to maintain bundled Excalidraw libraries

Cold-start runbook for an agent in a **new session**. You do not need the original chat or memory file. Follow this file to:

1. **Audit** whether the packs already in this skill are wired correctly.
2. **Add** another already-v2 named `.excalidrawlib` pack.
3. **Remove** a pack without leaving dangling references or breaking the packs that stay.

Do **not** convert v1 unnamed packs into v2 inside this runbook. Refuse them. To convert a v1 pack into a named v2 file, follow `libraries/how-to-convert-v1-to-v2.md`. Job B still accepts only already-v2 named packs.

This file lives next to the vendored binaries. Ignore it when listing pack files (`*.excalidrawlib` only).

**How a cold-start agent finds this file:** `SKILL.md` Overview points here. If the user asked to add, remove, or audit bundled libraries, follow that pointer or open this path directly: `production/skills/use-excalidraw-library/libraries/how-to-maintain-libraries.md`. If the user asked to convert a v1 pack, open `libraries/how-to-convert-v1-to-v2.md` — do not invent a third flow and do not use Job B on raw v1. Keep the Overview pointer on Job B7 / Job C3; do not remove it.

**Repo:** `squad5-curated-ai-tooling-collection`  
**Skill root:** `production/skills/use-excalidraw-library/`  
**Canvas skill (separate folder, do not merge, do not patch npm install):** `production/skills/excalidraw-skill/`  
**Commands in this runbook assume Git Bash from the collection repo root** unless a `cd` is shown.

---

## Contents

1. [Why libraries are files](#1-why-libraries-are-files)
2. [Format gate — v2 vs v1](#2-format-gate--v2-vs-v1)
3. [Wiring map](#3-wiring-map)
4. [HARD STOPs](#4-hard-stops)
5. [Job A — Audit the current set](#5-job-a--audit-the-current-set)
6. [Job B — Add a pack](#6-job-b--add-a-pack)
7. [Job C — Remove a pack](#7-job-c--remove-a-pack)
8. [Verification (mandatory)](#8-verification-mandatory)
9. [Version, README, commit](#9-version-readme-commit)
10. [Pointers (do not duplicate source)](#10-pointers-do-not-duplicate-source)

---

## 1. Why libraries are files

Community packs are `.excalidrawlib` JSON, not npm packages. Browse them at https://libraries.excalidraw.com. Scene files (`.excalidraw`) are a different format.

The live canvas (`mcp-excalidraw-server`) **cannot**:

- see the browser Library drawer
- `import` a `.excalidrawlib` (`import` reads `.excalidraw` scenes only)
- use `get_resource library` (stub; returns scene elements)

The only agent stamp path is: parse a **v2 named** pack on disk → pick `libraryItems[].name` → remap ids/groups/bindings → shift bbox → pipe JSON to `npx -y mcp-excalidraw-server add`. That recipe is already implemented in `scripts/stamp-library-item.js`. **Do not re-parse `.excalidrawlib` during a drawing session.** At draw time, open the markdown catalog and call the helper.

This skill vendors a **whitelist** of packs under `libraries/`. Runtime drawing must not accept an arbitrary extra library path. **Authoring** (this runbook) is the only time you copy a new v2 file in.

Keep two skill folders. Do not vendor libraries into `production/github_collection/`.

---

## 2. Format gate — v2 vs v1

Detect from JSON keys. Do not guess from the filename.

### Accept: v2 named pack

```json
{
  "type": "excalidrawlib",
  "version": 2,
  "source": "https://excalidraw.com",
  "libraryItems": [
    {
      "id": "...",
      "status": "published",
      "created": 123,
      "name": "Stick man",
      "elements": []
    }
  ]
}
```

- `type` is `"excalidrawlib"`
- `version` is `2`
- `libraryItems` is an array
- **every** item has a non-empty unique human `name`

Item fields that exist: `id`, `status`, `created`, `name`, `elements`.  
Item fields that **do not** exist: `description`, tags, `useWhen`. Pack-level blurbs live in the public catalog (`libraries.json` on GitHub), still not per-item conditions.

### Refuse: v1 unnamed pack

```json
{
  "type": "excalidrawlib",
  "version": 1,
  "library": [ [ /* elements */ ], [ /* elements */ ] ]
}
```

- Key is `library` (array of **element arrays**), not `libraryItems`
- Items have **no names** (index `#0`, `#1` only)
- Historical examples on disk (do not vendor): `storytelling.excalidrawlib`, `lo-fi-wireframing-kit`

**HARD STOP** if `version !== 2` or `libraryItems` is missing or any chosen item lacks `name`. Do not silently dump v1 arrays onto the canvas. Do not invent names here. Convert v1 via `libraries/how-to-convert-v1-to-v2.md`, then come back to Job B only if the user wants that named v2 file on the live whitelist.

### Scene vs library

| File | Typical keys | CLI |
| --- | --- | --- |
| `.excalidraw` | `type: excalidraw`, `elements` | `import` / `export` |
| `.excalidrawlib` v2 | `type: excalidrawlib`, `libraryItems` | **not** `import` — helper + `add` |
| Browser Library panel | IndexedDB in the tab | invisible to CLI/MCP |

---

## 3. Wiring map

Every surface below must describe the **same** pack set: pack id, filename, `libraryItems` count, and catalog names.

| Surface | What must stay in sync |
| --- | --- |
| `libraries/*.excalidrawlib` | Vendored live binaries. Ignore `how-to-maintain-libraries.md`, `how-to-convert-v1-to-v2.md`, and subdirectory `v2-converted-from-v1/` |
| `scripts/stamp-library-item.js` `PACK_FILES` | `{ packId: 'filename.excalidrawlib' }` whitelist |
| `scripts/stamp-library-item.js` Usage / `--help` | Hardcoded `--pack a\|b\|c` on **one line** — must match `Object.keys(PACK_FILES)` (not a frozen historical list) |
| `scripts/build-catalogs.js` | Hardcoded `load(...)` + `writeFileSync` + self-check list at the bottom. **Edit the generator first**; then run it once as authoring. It overwrites every catalog it emits. |
| `scripts/audit-libraries.js` | Authoring Job A checker (A1/A2/A4/A5) and Job B1 `--src`. Ignore at draw time. |
| `references/catalog-<id>.md` | Generated output. Every `libraryItems[].name` exactly once. Native W×H is **authoring size** |
| `scripts/test/test-stamp-library-item.js` | `PACK_FILES` iteration, catalog `mapping`, **and** hardcoded fixtures (`stick` Stick man / Happy, `ux` Search field, `c4-architecture` Database, `aws` Lambda) |
| `references/pack-index.md` | Live menu: pack id, count, Use when (with boundaries), catalog path. A4/A5 read this file. Drawing agents must not paste it into chat |
| `SKILL.md` | Points at pack-index; pre-flight A/B/C; no pack table; no frozen “four packs”. Overview already points at this runbook (keep that line on Job B7 / C3; A5 does not fail if it is missing) |
| `production/skills/excalidraw-skill/SKILL.md` | REQUIRED COMPANION: read `references/pack-index.md` and run its pre-flight (companion canvas skill; do not merge folders) |
| `production/github_collection/backup_manual_install_excalidraw-skill.txt` | “vendors the live v2 packs listed in references/pack-index.md” |
| `ATTRIBUTION.md` | Filename + item count table |
| Repo root `README.md` | Diagram Skills row for **use-excalidraw-library** (user-facing bundle description) |

Pack id rules: `[a-z0-9-]+`, unique in `PACK_FILES`, stable once shipped (drawing agents stamp `--pack <id>`).

**Example of a valid snapshot (not a permanent expected list).** On 2026-09-13 the set happened to be:

| Pack id | File | Items | Catalog |
| --- | --- | --- | --- |
| stick | `stick-figures.excalidrawlib` | 9 | `references/catalog-stick.md` |
| architecture | `architecture-diagram-components.excalidrawlib` | 11 | `references/catalog-architecture.md` |
| ux | `basic-ux-wireframing-elements.excalidrawlib` | 69 | `references/catalog-ux.md` |
| aws | `aws-architecture-icons.excalidrawlib` | 249 | `references/catalog-aws.md` |

After future adds/removes, **Job A** prints whatever is actually on disk. Regression is against **that** pre-change snapshot, not this table.

---

## 4. HARD STOPs

Stop the job and report the reason. Do not continue.

- Source file missing, unreadable, or not JSON
- Not v2 named (`type` / `version` / `libraryItems` / unique `name`s) or `libraryItems` is empty
- Add would **overwrite** an existing `libraries/*.excalidrawlib`
- Replace-in-place of an existing pack (out of scope unless the user explicitly ordered a replace; default is add-beside or remove)
- Removing the **last** remaining pack unless the user explicitly wants zero packs
- `npx … import` a `.excalidrawlib`
- Chrome/Edge Library panel as the agent path
- `get_resource library`
- Accepting an arbitrary library path at **draw** time
- Running `Install-to-*.ps1` / `Uninstall-to-*.ps1` unless the user asked
- Running `build-catalogs.js` during a drawing session (authoring only)
- Running `audit-libraries.js` during a user drawing session (authoring only)
- Patching `~/.cursor/skills/excalidraw-skill` or re-running npm `install-skill` in a way that wipes the vendored canvas overlay
- Claiming done without pasting Verification evidence (commands + stdout + pass/fail)
- Mixing unrelated Jira/Confluence dirt into the same commit

---

## 5. Job A — Audit the current set

No mutation. Ignore `v2-converted-from-v1/` and `how-to-convert-v1-to-v2.md`. `readdirSync` on `libraries/` is non-recursive — converted files in the subdirectory are not live packs.

Run this:

- in a new session, to see if the skill is consistent
- **before** Job B or Job C, to record the baseline snapshot
- **after** Job B or Job C, as the first half of Verification

Do **not** reconstruct the old `node -e` blobs. Do not `git grep` as a substitute for A5.

From repo root:

```bash
node production/skills/use-excalidraw-library/scripts/audit-libraries.js
```

Stdout: `PASS a1|a2|a4|a5 true/false` then a JSON object with keys `a1`, `a2`, `a4`, `a5`, `pass`. Exit 0 only if `pass` is true. A4 smoke-stamps each live pack to a temp JSON (no canvas); aws may take tens of seconds.

### A1. Record the live set (`a1`)

**Pass:** every `a1.rows[]` has `pass: true` (`type=excalidrawlib`, `version=2` number, `itemCount>0`, `itemCount===named===unique`, `missingNames=0`, `duplicateNames=[]`). Subdirectory `v2-converted-from-v1/` is ignored.  
**Fail:** any v1, unnamed, empty, or duplicate names. Quote the row.

Save the JSON as **Baseline** if Job B/C will follow. Do not treat the example four-pack table in §3 as Baseline.

### A2. Diff files ↔ PACK_FILES (`a2`)

**Pass:** `a2.missingMapped` and `a2.extraFiles` empty (every top-level lib file is a `PACK_FILES` value and vice versa).  
**Fail:** print both lists from the JSON.

### A3. Diff catalogs ↔ library names

The unit test `each catalog lists exactly the library names` is the authority. Also keep `build-catalogs.js` bottom self-check list aligned with `PACK_FILES`.

```bash
node --test production/skills/use-excalidraw-library/scripts/test/test-stamp-library-item.js
node --test production/skills/use-excalidraw-library/scripts/test/test-reflow-center-labels.js
```

**Pass:** both exit 0.  
**Fail:** paste the first failing assertion. Typical cause after an add/remove: catalog `mapping` or `build-catalogs.js` pairs still list the old set, or a fixture still calls `itemNamed('<removedPack>', …)` / `--pack <removedPack>`.

If tests fail **before** you changed anything, the current set is already inconsistent. Report Job A FAIL. Do not add/remove on top of a red tree unless the user asked you to repair first.

### A4. Helper smoke (no canvas) (`a4`)

For **each** pack id in `PACK_FILES`, the CLI stamps the first catalog data-row name to a temp file. It does **not** call `mcp-excalidraw-server add`.

**Pass:** `a4.pass` true; every `a4.results[]` has `pass: true` and `n > 0`.  
**Fail:** any result with `pass: false`. UTF-8: the helper is spawned with Node so stick-figure face glyphs do not crash on Windows GBK.

### A5. Docs vs live set (`a5`)

The same CLI checks pack-index ids/counts/catalog paths, the `Usage:` line `--pack a|b|c` in `stamp-library-item.js` source (do not spawn `--help` to discover packs; grep the `Usage:` string even though `-h`/`--help` exist), companion pack-index.md + pre-flight (not “Announce its N”), ATTRIBUTION item counts, install-note `pack-index.md`, and frozen “four packs” phrases **always** (even when live N is 4).

**Pass:** `a5.pass` true. Do not fail if SKILL.md still lacks a pointer to this runbook (B7/C3).  
**Fail:** `a5.details` lists the mismatched surface. Do not skip A5 with a manual `git grep` instead of the CLI.

### A6. Audit verdict

Paste A1–A5 evidence. Then one line:

- `AUDIT PASS — current set: <id=file:count, …>`
- or `AUDIT FAIL — <surface>: <detail>`

You may **not** say the skill is correctly implemented without this.

---

## 6. Job B — Add a pack

### B0. Preconditions

- User named a local v2 `.excalidrawlib` (they may have downloaded it from libraries.excalidraw.com; you do not download unless they asked).
- Job A **PASS** on the current tree, or the user ordered a repair first.
- Record Job A output as **Baseline**.

### B1. Validate the source (before copy)

```bash
node production/skills/use-excalidraw-library/scripts/audit-libraries.js --src "/path/to/source.excalidrawlib"
```

**Pass:** exit 0; print `type`/`version`/`items`/`named`/`dup` with `pass: true` and `items>0`. **Fail:** HARD STOP (v1, unnamed, empty `libraryItems`, or `version` string `"2"`). Do not copy. Keep `version` as the number `2` (same as `stamp-library-item.js` `json.version !== 2`).

### B2. Choose pack id and destination filename

- Pack id: short, `[a-z0-9-]+`, not already in Baseline `PACK_FILES`
- Destination filename: keep the upstream `.excalidrawlib` basename when it is unique; otherwise `packid.excalidrawlib`
- Destination path: `production/skills/use-excalidraw-library/libraries/<filename>`
- If that path exists → HARD STOP (no overwrite)

### B3. Copy beside existing files

Binary-safe:

```bash
cp "/path/to/source.excalidrawlib" "production/skills/use-excalidraw-library/libraries/<filename>"
```

Re-run B1 `--src` on the **destination** path. Counts must match the source.

Do **not** re-run Job A / A2 between B3 and B4. Until `PACK_FILES` includes the new filename, A2 `extraFiles` is expected. That is not a rollback signal. Baseline remains the Job A snapshot **before** copy. A2 must PASS only after B4.

### B4. Wire PACK_FILES

In `scripts/stamp-library-item.js`, add one entry:

```js
const PACK_FILES = {
  // …existing keys unchanged…
  <packId>: '<filename>',
};
```

Do not rename or remove Baseline keys.

### B5. Wire catalogs (authoring only)

`scripts/build-catalogs.js` is **not** generic. It `fs.writeFileSync`s every catalog it knows (`catalog-stick.md`, `catalog-ux.md`, …). Hand-writing `references/catalog-<packId>.md` and then running the script **loses** that file’s notes and **regenerates** the other catalogs from code. Do not hand-edit generated catalogs.

Correct order — **extend the generator, then run it once**:

1. Add a legal JS identifier that `load`s the new file, e.g. `const loFi = load('<filename>');` if the pack id is `lo-fi`. Hyphens are valid in the `PACK_FILES` **key**; they are not valid in a `const` name. Do not write `const <packId> = load(...)` when `<packId>` contains `-`.
2. Add the matching `fs.writeFileSync(path.join(refDir, 'catalog-<packId>.md'), …)` in the script. Put title, “Use when…”, table `| Name | Native size (px) | Notes |`, and any grouping **in that emit**, not in a one-off markdown file:
   - AWS-sized packs: TOC + `##` sections like the existing `aws` emit
   - UX-like packs: classifier list with `/radio|checkbox/` **before** `/button/` so “radio button” is not filed as a Button
   - Native W×H is authoring size (same sentence as `catalog-ux.md`). Stamp-sizing rules stay in `SKILL.md`
3. Append `[ 'catalog-<packId>.md', '<filename>' ]` to the self-check list at the bottom
4. Run **once**: `node production/skills/use-excalidraw-library/scripts/build-catalogs.js`
5. Confirm stdout: one self-check line per pack, `missing 0 extra 0 dup 0`, exit 0. Diff the regenerated catalogs; Baseline packs must still list the same names

Every `libraryItems[].name` must appear exactly once in the generated catalog.

### B6. Wire tests

In `scripts/test/test-stamp-library-item.js`, extend the `mapping` in `each catalog lists exactly the library names`:

```js
const mapping = {
  // …existing…
  <packId>: 'catalog-<packId>.md',
};
```

Tests already iterate `Object.keys(PACK_FILES)` for stamp behavior; a new key is picked up if `PACK_FILES` is updated. Add a fixture stamp by `--pack <packId> --name "<exact>"` only if you need pack-specific coverage. Do not weaken existing assertions (including stick `--scale` points / `strokeWidth`).

### B7. Wire SKILL.md, companion skill, helper Usage, ATTRIBUTION.md

- Add a row to `references/pack-index.md`: pack id, count, **boundary** Use-when, catalog path. Do not mention other non-live pack ids. Do not add recipes/companions/categories.
- Do not add a pack table to `SKILL.md`.
- If Overview still has no pointer to this runbook, add one line (path: `libraries/how-to-maintain-libraries.md`)
- Pre-flight stays A/B/C; do not announce/paste the full index; load a catalog only for packs that survive pre-flight
- Companion already points at pack-index (do not put the new pack id in the companion)
- `stamp-library-item.js` Usage / `--help` string: add the new pack id to the `--pack a|b|c` list
- Backup install already points at pack-index (no N bump in that sentence)
- `ATTRIBUTION.md`: one new table row (file + item count). Keep the libraries.excalidraw.com note. If the file is multi-MB, say so (AWS-style: normal git blob, no LFS unless the user asks)

### B8. README (user-facing)

Root `README.md` Diagram Skills cell for **use-excalidraw-library**: describe the **current** bundle (do not freeze a pack count in that cell; live set is pack-index). Skill **count** in Project Structure (`22 skills`) does **not** change when you add a library pack (still one skill).

### B9. Verify (mandatory)

Run [§8](#8-verification-mandatory) with `mode=add`. Do not claim done without it.

---

## 7. Job C — Remove a pack

### C0. Preconditions

- User named the pack id (or filename) to remove
- Job A **PASS**; record **Baseline**
- Pack id exists in Baseline `PACK_FILES`. Else HARD STOP
- If this is the last pack: HARD STOP unless the user explicitly wants zero bundled packs

### C1. Identify the file

From Baseline: `filename = PACK_FILES[packId]`. Confirm `libraries/<filename>` exists.

### C2. Delete only that binary

```bash
rm "production/skills/use-excalidraw-library/libraries/<filename>"
```

Do not delete other `.excalidrawlib` files. Do not delete this how-to.

### C3. Unwind every surface

Remove the pack from **all** of:

- `PACK_FILES` key
- `build-catalogs.js` `load` / `writeFileSync` / bottom self-check pair
- `references/catalog-<packId>.md`
- catalog `mapping` in `test-stamp-library-item.js`
- any test that stamps `--pack <packId>` or calls `itemNamed('<packId>', …)` — **rewrite those tests onto a remaining pack, or drop them**. This is not a one-line `PACK_FILES` delete. On 2026-09-13 the suite hardcoded fixtures on **every** then-bundled pack (`stick` Stick man / Happy, `ux` Search field, `architecture` Slack, `aws` Lambda). Removing any of those ids without retargeting the tests fails A3.
- `references/pack-index.md` row (not a SKILL.md announce row). Overview pointer to this runbook (keep the pointer)
- Companion already points at pack-index (do not put a live pack count in the companion)
- Helper Usage / `--help` `--pack a|b|c` list
- `production/github_collection/backup_manual_install_excalidraw-skill.txt`
- `ATTRIBUTION.md` row
- README Diagram Skills description

Then grep (ripgrep `rg` is not required):

```bash
git grep -n "<packId>" -- production/skills/use-excalidraw-library production/skills/excalidraw-skill production/github_collection README.md
git grep -n "<filename>" -- production/skills/use-excalidraw-library production/skills/excalidraw-skill production/github_collection README.md
```

**Pass:** leftover hits are only this how-to’s examples, or comments that do not register a pack.  
**Fail:** a live `PACK_FILES` key, catalog, Usage string, companion SKILL.md, install note, or test still references the removed pack.

### C4. Remaining packs

Every Baseline pack **except** the removed one must still exist with the same filename and `libraryItems` count.

### C5. Verify (mandatory)

Run [§8](#8-verification-mandatory) with `mode=remove`. Do not claim done without it.

---

## 8. Verification (mandatory)

Three uses of the same checks:

| Use | When | Extra assertions |
| --- | --- | --- |
| **Audit now** | Job A, no mutation | Live set internally consistent |
| **After add** | End of Job B | Baseline packs unchanged **plus** new pack present and wired |
| **After remove** | End of Job C | Removed pack gone everywhere; every other Baseline pack unchanged |

You must paste command stdout (or a clearly trimmed equivalent) in the session. A screenshot of the canvas is **not** verification for this authoring job.

### 8.1 Always-on commands

1. `node production/skills/use-excalidraw-library/scripts/audit-libraries.js` (A1/A2/A4/A5; re-run after mutation — this is the **new** live set). Save JSON as Baseline before add/remove; compare `a1.rows` file names and `itemCount` after.
2. Tests (A3):

```bash
node --test production/skills/use-excalidraw-library/scripts/test/test-stamp-library-item.js
node --test production/skills/use-excalidraw-library/scripts/test/test-reflow-center-labels.js
```

Expected: exit 0. Do not skip reflow tests: they are independent of pack count but prove you did not break sibling scripts.

### 8.2 Snapshot-diff after add

Let `B` = Baseline JSON from Job A (`audit-libraries.js` stdout) before copy. Let `N` = the same CLI JSON after copy.

**Pass all of:**

- Every `B.a1.rows[].file` still exists on disk
- For each Baseline row, `N.a1.rows` has the same `file` with equal `itemCount` (and `version` still 2)
- `N.a1.rows` has exactly one extra file: the new filename. A documented one-pass multi-add expects N extra root files (that plan's Appendix E), not exactly one extra file.
- `PACK_FILES` contains every Baseline key with the **same** filenames, plus the new pack id

- Helper smoke (A4) succeeds for every Baseline pack **and** the new pack
- `references/pack-index.md` has the new pack id with matching count and catalog path; companion still points at pack-index (no new pack id required there); helper Usage, ATTRIBUTION, catalog mapping, and `backup_manual_install_excalidraw-skill.txt` stay consistent with the live set
- Tests exit 0

**Fail if:** any Baseline pack disappeared, was overwritten, or changed item count; or tests/smoke fail.

### 8.3 Snapshot-diff after remove

Let `B` = Baseline. Let `R` = removed filename / pack id.

**Pass all of:**

- `libraries/<R>` is gone
- Every other `B.a1.rows[].file` still exists with the same `itemCount`
- `PACK_FILES` has no `R` key and no `R` filename
- `references/catalog-<packId>.md` for `R` is gone
- Grep (§C3) clean of live references (library skill, companion SKILL.md, helper Usage, install note, README)
- Helper smoke succeeds for every **remaining** pack and is **not** attempted for `R` (unknown `--pack` must exit 2 if you probe it)
- Tests exit 0

**Fail if:** a remaining pack broke; or the removed pack still appears in `PACK_FILES`, catalogs, SKILL.md, companion skill, Usage, ATTRIBUTION, install note, or tests.

### 8.4 Pass/fail checklist (copy into the session)

```
[ ] A1 v2 named unique names, itemCount>0, for every *.excalidrawlib
[ ] A2 PACK_FILES ↔ files bijection
[ ] A3 unit tests exit 0
[ ] A4 helper smoke (no canvas) per current PACK_FILES (catalog path from `references/pack-index.md`)
[ ] A5 pack-index ids/counts/catalogs + companion + helper Usage + ATTRIBUTION + install note + README match live set (SKILL.md has no pack table / frozen-four)
[ ] Snapshot-diff vs Baseline (skip if audit-only)
[ ] No overwrite of Baseline binaries (add) / only intended file deleted (remove)
[ ] build-catalogs.js load + writeFileSync + self-check edited **before** the one authoring run
[ ] HARD STOPs not violated
```

All boxes required. If any box is unchecked, the job is not done.

### 8.5 Expected shapes (patterns, not a frozen pack list)

A1 row:

```text
{ "file": "<something>.excalidrawlib", "type": "excalidrawlib", "version": 2, "itemCount": <n>, "named": <n>, "unique": <n>, "duplicateNames": [], "missingNames": 0 }
```

`itemCount` must be `> 0` and equal `named` and `unique`.

A2:

```text
PASS true
```

A4:

```text
PASS <packId> "<exact catalog name>" exit 0 n <positive integer>
```

Unknown pack (remove probe):

```bash
node production/skills/use-excalidraw-library/scripts/stamp-library-item.js --pack no-such --name x --x 0 --y 0
```

Expected: **exit 2**, stderr usage/unknown pack (do not treat exit 0 as success).

---

## 9. Version, README, commit

Collection rules: `docs/agents/versioning.md`, `docs/agents/readme-maintenance.md`, `docs/agents/ide-parity.md`.

| Change | `Version.txt` | README |
| --- | --- | --- |
| This how-to markdown only | Do **not** bump (documentation-only) | Do not change Diagram Skills unless you also change the bundle |
| Add a pack | **MINOR** (new bundled content) | Update Diagram Skills description; do not change the “N skills” count |
| Remove a pack | Ask the user via the question channel: **MINOR** vs **PATCH**. Pack ids are a drawing-agent contract (`--pack stick`). Default recommendation: MINOR | Same as add: describe the live bundle |

- Never hardcode the version number in this skill’s scripts
- `Check-CodexDrift.ps1` from repo root **before any commit** (skills need no Codex command mirror; the gate still runs)
- Do **not** run installers unless the user asked. Overlay is not live in `~/.cursor` / `~/.claude` / `~/.codex` until they resync or install **and** start a new chat
- Do **not** commit unless the user asked
- If they ask to commit and the branch has `SQ5GEN-*`, prefix Conventional Commits with that task id

---

## 10. Pointers (do not duplicate source)

| Topic | Authority |
| --- | --- |
| Stamp algorithm (clone, new ids, remap groups/bindings, bbox shift, `--scale`, `--replace-text`) | `scripts/stamp-library-item.js` |
| Stamp grouped `center` → `left` (keep x/y); leftover-only reflow | `stamp-library-item.js`; `reflow-center-labels.js` only for non-stamp center text |
| Holes / contain / match-height / match-width | `SKILL.md` (not this file) |
| Historical v1/v2 write-up | `docs/memory/memory-20260909-excalidraw-skill/library-stamp-recipe.md` |
| Original vendoring plan (four packs) | `docs/plans/2026-09-10-use-excalidraw-library.md` Task 1–4 |
| Version / README / drift | `docs/agents/versioning.md`, `readme-maintenance.md`, `ide-parity.md` |
| Do not run installers | `docs/agents/install-scripts.md` |
| v1 → named v2 (gallery + confirm) | `libraries/how-to-convert-v1-to-v2.md` |
| Job A / B1 checker | `scripts/audit-libraries.js` |

Drawing a diagram after a pack change still uses `excalidraw-skill` (CLI, screenshots, Present gate) plus this skill (read `references/pack-index.md`, pre-flight A/B/C, stamp helper). Do not announce packs. That is a drawing job, not this runbook.

---

## Quick decision tree

```text
Need to know if the current bundle is consistent?
  → Job A, then stop (or continue to B/C).

User has a new .excalidrawlib?
  → v2 named? no → convert how-to (not Job B).
  → yes → Job A baseline → Job B → §8 mode=add.

User wants a pack gone?
  → Job A baseline → Job C → §8 mode=remove.

Unsure which files to touch?
  → §3 wiring map; git grep PACK_FILES, build-catalogs.js, SKILL.md,
    references/pack-index.md, excalidraw-skill/SKILL.md, stamp Usage,
    ATTRIBUTION.md, tests, backup_manual_install_excalidraw-skill.txt.
```
