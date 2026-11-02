# Aspect 4 -- Merge-Back to Master: Full Method

This is the companion reference for `release-quality-gate` **patch mode** Aspect 4 (`./patch-release.md`). Patch mode only. Master-cut always SKIP Aspect 4 (`./master-cut.md`) -- do not run this procedure on a first-of-train from master.

`cross-project-navigation.md` Pattern 3 step 5 points to the `release-quality-gate` skill (this companion) for the dev-behavior coverage table and reminder template.

---

Use the available Atlassian plugin or v2 MCP tools for JIRA calls (`getJiraIssue`); no particular server name or namespace is required. Follow the exposed tool schemas. Reference: [Calling the v2 tools](../../MCP/howto-configure-mcp-jira-wiki-v2.md#calling-the-v2-tools): prefer `view: "evidence"`; custom fields may sit under `fields.customFields`.

## Overview

Merge-back verification answers two independent questions per release fix:

- **SAFETY (hard gate):** Does master's current content contain the fix? Content-based and direction-agnostic.
- **PROCESS (warning):** Did the fix reach master via the intended release->master linkage? Linkage-based; reports smells, never fails.

Product Aspect 4 = FAIL iff any ticket safety = MISSING.

`<prev-tag>` in the commands below **is the confirmed compare-to** from
`compare-stack.md` (patch default: highest previous `c` for **named** products;
unnamed rows use parent-pom values). It is not the previous existing same-`c`
tag unless the user chose that row at confirmation.

`<cur-tag>` is the gated tag if it exists, otherwise the line tip
(`origin/release/<branch>` when still `-SNAPSHOT`).

---

## Step 5.1: Precondition

Ensure `origin/master` and all release refs are fresh:
```
git fetch --all --tags
```

---

## Step 5.2: Partition the release range

Run: `git log <prev-tag>..<cur-tag> --no-merges --oneline`
(`cur-tag` = gated tag, or `origin/release/<branch>` tip when still SNAPSHOT)

Classify each commit:

| Class | Criteria | Action |
|---|---|---|
| **Ticketed** | commit message contains `[JIRA-KEY]` (e.g. `[PORTAL-1264]`) -- a `[JIRA-KEY]` takes precedence over a machinery prefix | Primary unit for SAFETY + PROCESS checks; group by key |
| **Machinery** | prefix `[RELEASE]`, `[AUTOMATION]`, `[HOTFIX]` **with no `[JIRA-KEY]`**, or pom-only / no-code change | EXCLUDED -- pom-version-bump commits from the release branch must NOT appear on master via merge-back |
| **Keyless code** | non-pom file changed, no `[JIRA-KEY]`, not machinery | Per-commit SAFETY check + "keyless code commit" process smell |

Use the same ticket set extracted in Aspect 1. Do NOT re-derive it.

---

## Step 5.3: SAFETY check (staged rigor)

For each **ticketed** group and each **keyless code** commit, run the stages in order. Stop at the first conclusive result.

```
Stage A: Key-grep reachability
  git log origin/master --oneline --grep="<KEY>"
    |
    +-- >= 1 commit found --> SAFETY = PASS  (process: clean)
    |
    +-- 0 commits found
            |
            v
    Stage B: Content-presence triage (per-file)
      For each file the fix touches on the release branch,
      check whether the equivalent change is present on master:
        git show origin/master:<file>
        git diff <prev-tag> origin/master -- <file>
            |
            +-- fix content clearly present --> SAFETY = PASS
            |                                   (process: unlinked-duplicate or reverse-cherry)
            |
            +-- fix content clearly absent  --> SAFETY = MISSING
            |
            +-- inconclusive (e.g. squash-merge dropped key;
            |   file exists but changed differently)
                    |
                    v
            Stage C: Human verdict
              Present release-side hunks + master-side state side by side.
              Ask the user: is the fix content present on master?
                    |
                    +-- user: present  --> SAFETY = PASS
                    |
                    +-- user: absent   --> SAFETY = MISSING
                    |
                    +-- still inconclusive --> report as "inconclusive -- would ask user"
                                              do NOT declare MISSING on inconclusive alone

MISSING only if Stage A = 0 AND Stage B = clearly absent AND Stage C = absent/unresolvable
```

**Do NOT skip to Stage C for squash merges.** A squash merge that dropped the `[KEY]` prefix will show Stage A = 0. Run Stage B (content check) before deciding inconclusive. If Stage B is inconclusive, then Stage C.

---

## Step 5.4: PROCESS check

After SAFETY is resolved, determine the process verdict for each ticket:

| Process verdict | Condition |
|---|---|
| `clean` | Stage A >= 1 commit with the key; commit-timestamp direction = release earlier than master (release -> master) |
| `reverse-cherry` | Stage A >= 1 commit; commit-timestamp direction = master earlier than release (committed on master first, cherry-picked to release) |
| `unlinked-duplicate` | Stage A = 0, Stage B = present, JIRA corroboration not used; fix exists on master but no key-linking commit |
| `keyless` | Keyless code commit; SAFETY per-commit; no key to grep |
| `not-corroborated` | Stage A = 0, the optional JIRA corroboration path was used; git key-linkage is absent regardless of whether `customfield_10000` returned a PR (a found PR -> evidence column, not a verdict upgrade) |

**Optional JIRA corroboration** for Stage A = 0 cases (before declaring inconclusive):
Call `getJiraIssue` with `view: "evidence"` (preferred) **or** `fields: ["customfield_10000"]` (Development only — do not also pass `view`), cloud ID `d3fb335a-e7fa-433c-93d4-de6edf2d88ce`. Passing both drops everything except the listed fields. The value may be at `fields.customfield_10000` or `fields.customFields` (display name "Development"). Look for a linked PR whose target branch is `master`.
- PR found: retain `process: not-corroborated` (git key-linkage is still absent); add the PR reference to the evidence column.
- PR not found / Jira tools unavailable: retain `process: not-corroborated` -- do NOT fail safety on this.

**`unlinked-duplicate` vs `not-corroborated`** (both are Stage A = 0 with content present on master): use `not-corroborated` whenever you ran the optional JIRA-corroboration step -- the label records that git key-linkage was absent, and a found PR goes to the evidence column without upgrading the verdict. Use `unlinked-duplicate` only when no JIRA path was used and the fix is simply present on master without any key-linking commit.

---

## Step 5.5: Report schema + dev-behavior coverage table

### Per-ticket output

```
<ticket> | safety: PASS/MISSING | process: clean / reverse-cherry / unlinked-duplicate / keyless / not-corroborated | evidence
```

Example:
```
PORTAL-1264 | safety: PASS | process: clean           | 8 commits on master, all keyed [PORTAL-1264]
PORTAL-1262 | safety: PASS | process: not-corroborated | Stage A = 0; Stage B = present (file removed matches); JIRA PR #2277 corroborates
PORTAL-999  | safety: MISSING | process: --            | Stage A = 0; Stage B = export.txt absent on master; Stage C = absent confirmed
```

### Dev-behavior coverage table

| Scenario | SAFETY | PROCESS | Notes |
|---|---|---|---|
| A. Release->master cherry-pick (standard) | PASS | clean | Stage A finds keyed commit; commit-timestamp shows release earlier (release->master) |
| B. Master->release cherry-pick (committed on master first) | PASS | reverse-cherry | Stage A finds commit; commit-timestamp shows master earlier (master->release); fix IS present |
| C. Independent duplicate edits (same change hand-edited on both branches) | PASS (content present) or MISSING (content differs) | unlinked-duplicate | Stage B decides; content match = PASS; content mismatch = MISSING |
| D. Forgot entirely (no merge-back at all) | MISSING | -- | Stage A = 0; Stage B = absent; report + reminder |
| E. Keyless code commit | per-commit PASS/MISSING | keyless | No key to grep; check content per-commit; note smell regardless |
| F. Squash-merge dropped the key (git can't link; JIRA used to corroborate) | PASS (content present) | not-corroborated | Stage A = 0; Stage B present; optional JIRA `customfield_10000` checked; key-linkage absent so verdict stays not-corroborated even if a PR is found (PR -> evidence) |

### Paste-able reminder template (for SAFETY = MISSING tickets)

```
Hi <dev>,

Ticket <KEY> was fixed on release branch <release/YYYY-MM-a.b.x.x> but has no
corresponding merge-back to master.

To fix:
1. Create branch: hotfix/<KEY>-merge-back-to-master (off master)
2. Cherry-pick the code fix commit(s) from the release branch -- NOT the pom
   version-bump commits.
3. Open a PR targeting master and get it merged.

The fix commit(s) on the release branch:
  <paste git log output for the relevant commits>

Please do this before the next release from master to avoid the fix being lost.

Thanks
```

---

## F8: Stage A -> B -> C Decision Flowchart

```
For each ticket key extracted from Aspect 1:
        |
        v
[Stage A] git log origin/master --grep="<KEY>"
        |
        +---[ >= 1 commit ]---> SAFETY = PASS, process = clean (or reverse-cherry if direction flipped)
        |
        +---[ 0 commits ]
                |
                v
        [Stage B] inspect master content for each file the fix touches
                |
                +---[ fix content present ]---> SAFETY = PASS, process = unlinked-duplicate
                |                              (or not-corroborated if you used the optional JIRA corroboration path)
                |
                +---[ fix content absent  ]---> SAFETY = MISSING --> report + paste-able reminder
                |
                +---[ inconclusive ]
                        |
                        v
                [Stage C] show hunks side-by-side; ask user (or report inconclusive if pre-bound)
                        |
                        +---[ present  ]---> SAFETY = PASS
                        +---[ absent   ]---> SAFETY = MISSING --> report + reminder
                        +---[ unresolved ]-> report "inconclusive -- would ask user"
                                             do NOT declare MISSING on inconclusive alone

KEY RULE: MISSING only if ALL THREE stages fail.
```
