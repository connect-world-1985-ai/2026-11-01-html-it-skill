# Compare-stack confirmation (companion to Step 1)

Companion to `SKILL.md` Step 1. Load this before any Aspect 1 git-log. A wrong
compare stack wastes the whole gate run. **When a compare-to exists**, do not
start remaining aspects until the user confirms the table via the question
channel. Master-cut with compare-to declined: skip this table (no invented
pairs); still walk the current stack (`SKILL.md` Step 1).

Two ranges stay distinct:

| Range | Default | Used for |
|---|---|---|
| **Compare-to** (this file) | Highest existing tag of **previous `c`** (patch); user-supplied (master-cut) | Confirmation table; Aspect 1; **patch** Aspect 4 log range |
| **Train baseline** | Earliest existing `a.b.0.*` | **Patch** Aspect 3 moved-vs-not-moved only. Master-cut analog: `./master-cut.md` |

Same-`c` previous-`d` (e.g. `8.3.1.4` vs `8.3.1.3`) is **rare**. Offer it at
confirmation; do not default to it.

## 1. This-ship ref

Current side = the gated/named version, **not** auto-bumped to the highest `d`
of this `c`.

- If tag `a.b.c.d` exists: that tag is this-ship.
- If not (right before the drop): treat `a.b.c.d-SNAPSHOT` as the prepared ship
  of `a.b.c.d`. This-ship ref is the line tip:
  - patch: `origin/release/<YYYY-MM-a.b.x.x>`
  - master-cut: `origin/master`
- Table cells **keep** the `-SNAPSHOT` suffix when that is what the pom/tip shows.

## 2. Default compare-to (patch)

For each **named** product with digits `a.b.c.d` (strip `-SNAPSHOT` first):

If `./apache-stack.md` is in play, do **not** run this previous-`c` default for Chocolatey or solution rows (they are not `.next` `a.b.c.d`). Those compare-to cells stay user-supplied or `UNRESOLVED`.

1. List existing 4-digit tags matching `a.b.(c-1).*` (no `-SNAPSHOT`).
2. Version-sort; take the **highest `d`**. That tag is default compare-to.
3. If none exist: cell = `UNRESOLVED`. Do not invent a previous train or a
   formula such as `a.b.(c-1).1`.

Do **not** walk to the previous **existing** tag when that tag is still this `c`
(gating `8.3.1.4` must not default to `8.3.1.3`).

**Patch:** a named product with no previous-`c` tag (`c=0` or missing tags)
is `UNRESOLVED` at the HARD STOP -- do not invent previous-train; skip Aspect 1
**and** Aspect 4 for that row; still walk the current stack for Aspects 2/3.

**Master-cut:** do not default compare-to to previous `c` or previous-train.
If the user provided compare-to, use those tags in this table and HARD STOP.
If they declined, skip Aspect 1 (no table of invented pairs); Aspect 4 is
always SKIP (`./master-cut.md`). Still walk the current stack for Aspects 2/3.

## 3. Stack walk (who appears in the table)

Recursive, git-only, **all** medavis `*.version` properties — not only the ones
that changed.

1. `worklist` := named products; `scope` := named products.
2. Pop `R`. Fetch (`git fetch --all --tags`; clone if absent; else `UNREACHABLE`,
   do not drop). A missing `cockpit-chart-service` clone on a **pre-extraction**
   train is **N/A** (gate `coc.next`), not `UNREACHABLE`. Map `artifactId` with
   era rules (`cockpit-chart-service.version` is the standing example). Read `R`'s pom at **this-ship** and at **compare-to** (named:
   resolved refs from §§1–2; unnamed: the version cells already on that row —
   tag if the cell is a released `a.b.c.d`, else that child's line tip when the
   cell is `-SNAPSHOT`).
3. Collect every medavis `*.version` in those poms. Map via
   `platform-map-project-identity.md` (same-pom `artifactId` + era rules; do not
   trust the property name alone). Third-party properties: note under the table,
   not rows, not gate repos.
4. Each mapped medavis dep not already in `scope` → add to `scope` and
   `worklist`. Recurse to a **fixpoint**. Unchanged versions still get a row.
   If a medavis property exists on only one side (added or removed): keep the
   row; empty cell = `UNRESOLVED`; Flag = `INVESTIGATE`; still recurse. Do not
   drop it.

Apache extra rows (`./apache-stack.md`) are **not** collected from `*.version`.
If `apache-stack.md` is in play, merge its mail-trio + pin rows into this
confirmation table. Do not Maven-map `medavis.apache` or Chocolatey. Extra
rows still join the Step 6 gated set when there is no table (master-cut
compare-to declined).

## 4. Table (print in chat, then HARD STOP)

Question-channel options cannot hold this. Print markdown, then ask via the
question channel: **Confirm** / **I will correct** / **use same-`c` previous `d`
for one or more rows**. Same-`c` opt-in compare-to = the highest existing tag of
**this** `c` that is strictly below this-ship (not `a.b.c.(d-1)`). Resolve
`UNRESOLVED` cells on this question -- do not ask earlier.

| Component | Role | This ship | Compare-to | Source | Flag |
|---|---|---|---|---|---|
| p4m | named | 8.3.1.4 | 8.3.0.3 | named input / highest `8.3.0.*` | |
| admin-app | named | 7.3.1.1-SNAPSHOT | 7.3.0.1 | named input (tip) / highest `7.3.0.*` | SNAPSHOT |
| vaadin-ui | stack (from p4m) | 7.3.1.1 | 7.3.0.1 | p4m pom | |
| core-framework | stack (from p4m) | 7.2.0.2 | 7.2.0.2 | p4m pom | unchanged |

Row rules:

- **Named:** This ship = user input (or prepared SNAPSHOT). Compare-to = highest
  previous-`c` tag of **that** repo (patch) or the user-supplied version
  (master-cut).
- **Unnamed stack:** both cells from parent poms at the two refs. Do **not**
  independently compute that child's previous-`c` unless it is also named.
- Named product also appears as another named product's dep, and the pom value
  disagrees with the named input: keep the named version; Flag = `POM MISMATCH`.
- Two named parents disagree on an unnamed child: one row; This ship and/or
  Compare-to cells use `from <A>: <ver> / from <B>: <ver>`; Flag =
  `PARENTS DISAGREE`.
- Flag priority (leftmost wins if several apply): `UNREACHABLE` >
  `INVESTIGATE` > `POM MISMATCH` / `PARENTS DISAGREE` > `UNRESOLVED` >
  `SNAPSHOT` > `unchanged`.
- This-ship equals compare-to (same digits, both released or both SNAPSHOT):
  Flag = `unchanged`.
- This-ship is SNAPSHOT: Flag = `SNAPSHOT` (prepared, not tagged). Do **not**
  call `7.3.1.1-SNAPSHOT` vs `7.3.0.1` unchanged. Same digits with SNAPSHOT vs
  released (`7.3.1.1-SNAPSHOT` vs `7.3.1.1`) is the prepared ship of that version,
  not unchanged.
- `UNRESOLVED` / `UNREACHABLE`: keep the row; do not drop.

## 5. After confirm

- Confirmed pairs **are** the Aspect 1 (and **patch** Aspect 4) range:
  `compare-to..this-ship` (tag-to-tag, or compare-to..line-tip when this-ship is
  still SNAPSHOT). If compare-to is still `UNRESOLVED`, skip Aspect 1 **and**
  (patch) Aspect 4 for that row (no invented range). Keep Aspects 2/3. Master-cut
  Aspect 4 is always SKIP (`./master-cut.md`) even when compare-to was confirmed.
- Run Aspect 1 on **named products + stack rows that changed**. The rest of the
  gate (Aspects 2/3 analog included) still covers the recursive this-ship
  stack. Unchanged stack rows stay visible; no git-log unless the user asks.
- **Patch** Aspect 3 classifies moved-vs-not using **train baseline**
  (earliest `a.b.0.*` vs this-ship) on the gated repos' poms. A dep unchanged
  **this patch** but moved earlier in the train is still moved-this-train for
  master SNAPSHOT rules. Master-cut Aspect 3 analog does **not** use this
  default -- see `./master-cut.md`.
- Do **not** shrink a child's Aspect 1 to previous existing same-`c` tag
  (old rule: parent jumped `5.3.0.1`→`5.3.1.2` while `5.3.1.1` exists →
  `5.3.1.1..5.3.1.2`). For an **unnamed** child the confirmed pair is the
  parent-pom values (`5.3.0.1..5.3.1.2`). Do not retarget to highest `5.3.0.*`.
  Same-`c` previous `d` only if the user chose it on that row.
