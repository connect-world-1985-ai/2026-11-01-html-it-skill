---
name: release-quality-gate
description: >
  Use when the user asks to act as release goal keeper / verify a medavis
  .next product release before it ships and supplies a product version or a
  coordinated bundle of versions (e.g. "goal-keep p4m 8.4.0.1"; "check this
  release: adminapp 7.4.0.1, p4m 8.4.0.1, ..."). Covers first-of-train cuts
  from master and later patches on a release branch. Named apache-dist 2.x
  or medavis-apache.portable use independent version schemes. Not for general
  versioning questions or single-PR reviews.
---

# Release Quality Gate

## Scope

- **Applies to: main agent only.** Subagents do not trigger or follow this skill.
- Orchestrates read-only git + Bitbucket MCP checks across one or more medavis .next repos. It does NOT modify any repo, create branches, open JIRA tickets, or run install/deploy scripts.
- **Two modes** (ask; do not infer from digit `c`): (1) first-of-train / version-stack from **master**; (2) later **patch** on `release/*`.
- Aspect 1 (code review) is delegated to `requesting-code-review` -- this skill does NOT reimplement review logic.

## Trigger Conditions

Activate when the user expresses release goal-keeper intent AND supplies a product version or bundle. Examples:
- "check the p4m 8.3.1.1 release before we ship"
- "goal-keep this release: adminapp 7.3.1.1, p4m 8.3.1.1, cockpit4med 7.3.1.1, ..."
- "goal-keep p4m 8.4.0.1" / "first train from master"

Do NOT trigger for general versioning questions, single-PR reviews (use `requesting-code-review`), or branch-creation requests.

## Inputs

- **Single product**: one `<product> <a.b.c.d>` pair (e.g. `p4m 8.3.1.1` or `p4m 8.4.0.4`).
- **Bundle**: several `<product> <a.b.c.d>` pairs forming one coordinated train; cross-check dependency versions between them by train (`a.b.c.d`), NOT by release-branch month.
- **Apache stack exception:** when the named set includes apache-dist with `a>=2` or `medavis-apache.portable`, versions may be solution `2.6.rev` (e.g. `2.6.1101`) or Chocolatey `httpd.yyMMddHH` (e.g. `2.4.68.26082810`). Do not reject them as malformed `.next` `a.b.c.d`. Load `./apache-stack.md` (details there).

## Quick Reference

| Mode | Companion | Aspects |
|---|---|---|
| (1) First-of-train from master (`c=0`; `d` is build number and does not change the kind) | `./master-cut.md` | see `master-cut.md` -- Aspect 1 only if compare-to provided; Aspect 2 analog always; Aspect 3 analog if already tagged; Aspect 4 always SKIP |
| (2) Later patch on `release/*` (`c>=1`) | `./patch-release.md` | see `patch-release.md` -- Aspects 1–4 all run (compare-to default: highest previous `c`; HARD STOP on `compare-stack.md`) |
| Apache stack (named apache-dist `a>=2` or `medavis-apache.portable`) | `./apache-stack.md` | extra mail-trio + pin rows; independent version schemes; skip same-train digits |

## Workflow

### Step 0: Questions (question channel, no guessing)

Ask via the question channel. Do **not** infer kind from digit `c`. `c=0` is a hint the user may confirm, not a substitute for 0b. Do not invent a compare-to.

**0a. Run mode.** Run all **applicable** aspects in one pass, or step through one aspect at a time? Do not say "all four" as if Aspect 4 always runs -- master-cut skips Aspect 4.

**0b. Release kind.** (1) first-of-train / version-stack from **master**, or (2) later **patch** on `release/*`.

**0c. Master-cut only (kind 1):** will the user provide a compare-to version or version stack? If they decline, skip Aspect 1 for this run. Do not invent previous-train last tag. Do not invent previous `c`.

**0d. Master-cut only (kind 1):** already tagged, or still about to ship (master still on this train `-SNAPSHOT`)?

### Step 1: Resolve scope from the version(s)

**Resolve the .next git root FIRST via the `next-platform-knowledge` config protocol -- do NOT assume `d:\git\`.**

1. **Identify the product(s) and version(s).** Single product or bundle. Cross-check by train `a.b.c.d`, NOT by release-branch month.

2. **Map each named product to its git directory** using `next-platform-knowledge/references/platform-map-project-identity.md` (Project-to-Directory Mapping).

   If named products include apache-dist with first digit `a>=2` OR product id `medavis-apache.portable`, load `./apache-stack.md` **before** remaining aspects. apache-dist `a==1` → do not load. solution-only does not load. Maven walk (`compare-stack.md`) still runs for ordinary .next deps; Apache extra rows are **in addition**, not a replacement walker.

3. **Refresh the named-product repos.** For each run: `git fetch --all --tags`. Repos are usually stale since the last session.

4. **Build the compare stack -- MANDATORY before any Aspect 1 git-log** (when Aspect 1 will run). Method, table columns, flags, SNAPSHOT handling: `./compare-stack.md`. Artifact-id → repo mapping (era rules; do not trust the property name alone) stays in `platform-map-project-identity.md`. Worked mover example: `./transitive-dependency-scope.md`.

   Digit rules (`versioning-release-branching-workflows.md` §3.1): `d` is the build at this `a.b.c`; it restarts at 1 when **any** of `a`, `b`, or `c` increases; the gated version may have **any** `d`. `8.4.0.4` is still a master-cut (`c=0`) if kind=1.

   **Patch mode (kind 2):** default compare-to = highest existing 4-digit tag of **previous `c`** (max `d` on `a.b.(c-1).*`) for **named** products only. Unnamed stack cells are **parent-pom values**, not an independent previous-`c` lookup. Walk every medavis `*.version` (recursive fixpoint); unchanged rows stay in the table. SNAPSHOT this-ship = line tip (`origin/release/<branch>`); cells keep `-SNAPSHOT`. If no previous-`c` tag exists for a named product: cell = `UNRESOLVED` -- do not invent a previous train.

   **Do not mix eras in compare-to:** apache-dist 2.x must **not** default compare-to to the last 1.x tag (e.g. `2.0.0.3` must not silently use `1.47.0.1`). If previous-`c` for a 2.x patch is missing, cell = `UNRESOLVED`. Chocolatey and solution do not use .next previous-`c` at all.

   **Master-cut with compare-to (kind 1, 0c = yes):** same confirmation table using the user-supplied compare-to tags vs this cut (SNAPSHOT this-ship allowed: `origin/master` tip). HARD STOP. Then Aspect 1 uses confirmed pairs.

   **Master-cut without compare-to (kind 1, 0c = declined):** **stack walk** -- named products plus medavis deps declared in their poms, recursive -- not a moved-dep diff and **not** an Aspect 1 table. No Aspect 1 table (Aspect 1 skipped). Still map artifact-id → repo via `platform-map-project-identity.md`. Still walk the current stack so Aspects 2/3 analog know the in-scope repos.

   **This-ship:** the gated/named version, **not** auto-bumped to the highest `d` of this `c`. The gated tag if it exists; otherwise the line tip still on `a.b.c.d-SNAPSHOT` (patch: release-branch tip; master-cut: `origin/master`). Keep `-SNAPSHOT` in table cells when that is what the pom shows.

   **Train baseline** (patch Aspect 3 only, later): earliest existing `a.b.0.*`. Not the compare-to default. Master-cut Aspect 3 analog uses the user-supplied compare-to as its baseline when one was given -- see `./master-cut.md`.

5. **Present the compare-stack table and HARD STOP** -- when there is a compare-to (patch always after defaulting; master-cut only if 0c = yes). Print the table from `./compare-stack.md` in chat (named products + derived stack). Then ask via the question channel: Confirm / I will correct / use same-`c` previous `d` for one or more rows (patch). Same-`c` opt-in compare-to = the highest existing same-`c` tag **strictly below** this-ship (not `a.b.c.(d-1)`). **Do not start remaining aspects until the user confirms.** Same-`c` `d`-to-`d` is opt-in on that question, never silent. Resolve `UNRESOLVED` cells here -- do not ask earlier.

   After confirm: Aspect 1 (and patch Aspect 4) ranges **are** the confirmed pairs (`compare-to..this-ship`, or compare-to..line-tip when still SNAPSHOT). If a row's compare-to is still `UNRESOLVED`, skip every compare-to-based range for that repo -- Aspect 1 **and** (patch) Aspect 4. Keep Aspects 2/3. Gate named products plus the recursive this-ship stack. Aspect 1 git-log is named + stack rows that changed and have a resolved compare-to. Unchanged stack rows stay in the table for visibility; no git-log unless the user asks. Clone/UNREACHABLE vs N/A (`cockpit-chart-service` pre-extraction): `./compare-stack.md` §3.

   **Master-cut, compare-to declined:** skip this HARD STOP. Aspect 1 = SKIP. Still list named + recursive stack (this-ship only) so later aspects have a repo set. Apache extra rows (mail trio + pin) join **every** gated-repo report, including this case — Aspects 2/3 analog still need the rows. Do not wire extra rows only into the confirmation-table merge.

6. **Do not shrink a child's Aspect 1 to a same-`c` intermediate tag.** If the parent pom jumped `5.3.0.1`→`5.3.1.2` while `5.3.1.1` exists, the **unnamed** child's confirmed pair stays those parent-pom values (`5.3.0.1..5.3.1.2`), not `5.3.1.1..5.3.1.2` and not independently `highest 5.3.0.*`..`5.3.1.2`. Same-`c` previous `d` only if the user chose it on that row.

### Dispatch

- Kind **(2)** → follow `./patch-release.md` for all remaining aspects (1–4). Do not skip Aspect 4. Apache extra rows excepted per `./apache-stack.md`.
- Kind **(1)** → follow `./master-cut.md`. Aspect 4 is always SKIP. Aspect 1 only if compare-to was provided. Apache extra rows excepted per `./apache-stack.md`.

Do not paste Aspect 4 Stage A/B/C into this file. That procedure lives in `aspect4-merge-back.md` (patch only).

### Step 6: Report

Produce a consolidated go/no-go table across all aspects and **every gated repo** -- named products plus the recursive this-ship stack, always. When `./apache-stack.md` is in play, Apache extra rows (mail trio + pin) join this set even if Aspect 1 was SKIP (master-cut compare-to declined; no HARD STOP table). "Stack rows that changed" is the Aspect 1 git-log subset when a compare-to exists; it is not the gate-set. Master-cut with Aspect 1 SKIP still lists/gates the this-ship stack for Aspects 2/3 analog. Unchanged stack rows stay in the table; Aspect 1 = `SKIP` (no git-log) unless the user asked to log that row.

| Repo | In scope as | Version | Mode | Aspect 1 | Aspect 2 | Aspect 3 | Aspect 4 | Overall |
|---|---|---|---|---|---|---|---|---|
| ... | named product / transitive / apache extra / pin | ... | master-cut / patch | PASS / FAIL / SKIP | PASS / FAIL / SKIP | PASS / FAIL / SKIP | PASS / FAIL / SKIP | SHIP / HOLD |

- Cells: `PASS` / `FAIL` / `SKIP`.
- **SKIP ≠ FAIL.** HOLD only if a **run** aspect FAILs. Do not HOLD solely because Aspect 1 or Aspect 4 were skipped.
- Patch PROCESS smells remain advisory -- they do not block SHIP.
- If all **run** aspects pass for all gated repos, overall = SHIP.

## Exit Conditions

This skill is done when:

0. Kind was asked (Step 0b). For kind 1, the compare-to question (0c) and tagged-vs-about-to-ship (0d) were asked.
1. When Aspect 1 will run: the compare-stack table was presented and **confirmed** (`compare-stack.md`) -- named products plus the recursive medavis stack, including `-SNAPSHOT` prepared ships. Remaining aspects did not start before that confirm.
2. Every in-scope repo was gated under the **selected** suite (`patch-release.md` or `master-cut.md`).
3. A consolidated SHIP / HOLD verdict has been produced with per-repo per-aspect cells (`PASS` / `FAIL` / `SKIP`).
4. Patch only: every Aspect 4 SAFETY = MISSING ticket has a paste-able reminder attached; PROCESS smells reported as advisory.
5. If Aspect 1 was handed off to `requesting-code-review`, that skill's own exit conditions are also satisfied.

## Non-Goals

- Does NOT modify any repo (no commits, no branch creation, no pushes).
- Does NOT create `hotfix/<KEY>-merge-back-to-master` branches or JIRA sub-tasks -- report and reminder only.
- Does NOT reimplement code review logic -- delegates Aspect 1 to `requesting-code-review`.
- Does NOT run install or deploy scripts.
- Does NOT hardcode the question channel by name -- uses "the question channel" generically.
- Does NOT infer release kind from digit `c`.
- Does NOT invent a compare-to (previous-train last tag or previous `c`) when the user declined or none exists.

## Common Mistakes

Patch-mode mistakes (previous-`c` default, SNAPSHOT this-ship, stack walk, naive-all-SNAPSHOT, reverse-cherry, key-grep-only, JIRA-as-scope, whole PR diff, bundle-by-month, creating hotfix branches): see `./patch-release.md`.

| Mistake | Reality |
|---|---|
| Guessing kind from `c=0` (or from "be fast") | Ask Step 0b. `c=0` is a hint the user may confirm, not a substitute. |
| Inventing previous-train or previous `c` as compare-to on a master-cut | Only use a user-provided compare-to. Else skip Aspect 1. Never default master-cut to previous `c`. |
| Running merge-back on a master-cut | Aspect 4 is always SKIP. There is no release-branch fix to merge back. |
| Using master tip as shipped pom after the cut is tagged | Shipped pom is the tag. Master tip should already be next-train. See `./master-cut.md`. |
| Treating SKIP as FAIL / HOLD | SKIP does not HOLD. HOLD only if a **run** aspect FAILs. |
| Saying "all four aspects" as if Aspect 4 always runs | Step 0a is **applicable** aspects. Master-cut skips Aspect 4. |
| Starting patch Aspects 1–4 without confirming the compare-stack table | HARD STOP. See `compare-stack.md`. |
| Same-train digits across apache-dist 2.x / Chocolatey / solution | Independent schemes. See `./apache-stack.md`. |
| Loading `apache-stack.md` for apache-dist 1.x or solution-only | Trigger is named apache-dist `a>=2` or `medavis-apache.portable`. |
| Defaulting apache-dist 2.x compare-to to last 1.x tag | Era mix. UNRESOLVED; do not invent. |

## References

- `./patch-release.md` -- kind (2): Aspects 1–4 on `release/*`.
- `./master-cut.md` -- kind (1): first-of-train suite from master.
- `./compare-stack.md` -- confirmation table: previous-`c` default (patch), user compare-to (master-cut), SNAPSHOT, HARD STOP.
- `./apache-stack.md` -- named apache-dist `a>=2` or `medavis-apache.portable`: extra rows, pins, independent versions (not same-train digits).
- `./aspect4-merge-back.md` -- patch Aspect 4 staged SAFETY/PROCESS (not used in master-cut).
- `./transitive-dependency-scope.md` -- why a changed stack child is a gate repo; Aspect 3 train-baseline classifier (patch).
- `next-platform-knowledge/references/versioning-release-branching-workflows.md` -- 4-digit scheme (§3.1), branch naming (§3.2), pom states (§3.4), cross-project alignment (§3.5), every fix to both branches (§3.6).
- `next-platform-knowledge/references/cross-project-navigation.md` -- Pattern 1 + Pattern 3.
- `next-platform-knowledge/references/platform-map-project-identity.md` -- product -> git directory. Used in Step 1.
- `next-platform-knowledge/references/platform-map-dependencies.md` -- who-depends-on-whom.
- `next-platform-knowledge/references/jira-field-reference.md` -- JIRA field ids.
- `next-platform-knowledge/references/jira-system-structure.md` -- JIRA issue hierarchy and cloud ID `d3fb335a-e7fa-433c-93d4-de6edf2d88ce`.
- `production/skills/requesting-code-review/SKILL.md` -- Aspect 1 full code review handoff.
