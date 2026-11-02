# Patch mode (release-branch)

Companion to `SKILL.md`. Load this file only after Step 0 selected kind (2): later patch on `release/*`.

Run Aspects 1–4 exactly as specified here. Do not skip Aspect 4. Diff range is the **confirmed** `<compare-to>..<cur-tag>` (default highest previous `c`) or `<compare-to>..origin/release/<branch>` when still SNAPSHOT. Copy `compare-stack.md` with the patch body (do not drop it).

Assumes `SKILL.md` Step 1 already resolved `git_root`, mapped products, fetched, built the compare-stack table (`./compare-stack.md`), and **confirmed** it. Do not start Aspects 1–4 without that confirm. Worked mover example: `./transitive-dependency-scope.md`. Aspect 4 staged procedure: `./aspect4-merge-back.md`.

## Quick Reference

| Aspect | One-line check | Primary command |
|---|---|---|
| 1. Scope + review | per-ticket scope since **confirmed** compare-to (default: highest previous `c`); hand off to `requesting-code-review` | `git diff --stat <compare-to>..<cur-ref>`; `git log --oneline <compare-to>..<cur-ref>` (`cur-ref` = tag, or `origin/release/<branch>` tip when still SNAPSHOT) |
| 2. Release-branch pom | own patch `c` correct + every medavis dep released on the matching train | `git show origin/release/<YYYY-MM-a.b.x.x>:pom.xml` |
| 3. Master pom | own version = next dev train `-SNAPSHOT` (normally `a.(b+1).0.1-SNAPSHOT`); moved deps = next-train SNAPSHOT; no merge-back pom leak | `git show origin/master:pom.xml` |
| 4. Merge-back | every release fix present on master (SAFETY) + reached via linkage (PROCESS) | `git log <compare-to>..<cur-ref> --no-merges`; per ticket `git log origin/master --grep=<KEY>` |

## Aspect 1 -- Change scope + final code review

**Goal:** derive the per-ticket changeset since the **confirmed compare-to** and hand off to `requesting-code-review` (or produce a scope summary if the user chose scope-only).

1. **Compute the aggregate changeset** for each gated repo (named + stack rows that changed; confirmed pairs from Step 1.5):
   - `git diff --stat <compare-to>..<cur-ref>` for file count and line churn.
   - `git log --oneline <compare-to>..<cur-ref>` for the commit list.
   - `cur-ref` is the gated tag if it exists, otherwise `origin/release/<branch>` tip (still `-SNAPSHOT`).
   - Never load a whole PR diff without a file filter -- use `get_pull_request_diff` with `file_path` + small `context_lines`; escalate to full-file only when needed (diff-first discipline; see `cross-project-navigation.md` Pattern 1).

2. **Extract per-ticket fix commits.** From `git log <range>`, collect commit messages. Keep commits with a `[JIRA-KEY]` prefix (e.g. `[PORTAL-1264]`, `[ADMINAPP-126]`). EXCLUDE commits prefixed `[RELEASE]`, `[AUTOMATION]`, `[HOTFIX]` that carry NO `[JIRA-KEY]` -- those are machinery, not ticket fixes. A commit that contains a `[JIRA-KEY]` is a ticket fix even if it also carries a machinery-style prefix (the key takes precedence). Group by key. Note any keyless code commits (non-pom, no key, not machinery) for Aspect 4.

   **Save the extracted ticket set -- it is reused verbatim in Aspect 4.**

3. **Epic/initiative expansion (optional, JIRA-dependent).** If the user supplies an epic or initiative key (e.g. `P4MP-123`), expand to sub-tasks via `searchJiraIssuesUsingJql` (`parent = <KEY>`, cloud ID `d3fb335a-e7fa-433c-93d4-de6edf2d88ce`). Treat each sub-task as an individual ticket. Fallback when Jira tools are unavailable: ask the user to paste the sub-task key list.

4. **Optional JIRA enrichment (user-gated).** Use the available Atlassian plugin or v2 MCP tools; no particular server name or namespace is required. Follow the exposed tool schemas. Reference: [Calling the v2 tools](../../MCP/howto-configure-mcp-jira-wiki-v2.md#calling-the-v2-tools). Offer to call `getJiraIssue` per ticket with `view: "evidence"` (or `full`) to pull `summary`, `description`, Acceptance Criteria (`customfield_10106`), `fixVersions`, `parent`, and Development (`customfield_10000` — linked PRs/branches/commits). Custom fields may appear under `fields.customFields` (e.g. `fields.customFields["Development"]`, `.id` still `customfield_10000`) rather than as top-level `fields.customfield_*`. Field-id reference: `jira-field-reference.md`. Fallback when Jira tools are unavailable: commit-log-only. JIRA is enrichment; it is NOT used for scope discovery.

5. **Ask the user for review depth** (via the question channel):
   - Full review -- hand off to `requesting-code-review` (triggers that skill's full workflow).
   - Scope summary only -- produce a per-ticket table (ticket | files | one-line description) without a full review.
   - Tiered -- scope summary now, full review for high-risk tickets on request.

6. **Present the scope summary** (at minimum, regardless of review depth):

   | Ticket | Files changed | One-line scope |
   |---|---|---|
   | ... | ... | ... |

   Reference: `versioning-release-branching-workflows.md`, `cross-project-navigation.md` Pattern 1 + Pattern 3.

If a row's compare-to is still `UNRESOLVED`, skip Aspect 1 **and** Aspect 4 for that repo (no invented range). Keep Aspects 2/3.

## Aspect 2 -- Release-branch versioning conformance

**Goal:** confirm the release branch pom is fully conformant before the version ships.

If `./apache-stack.md` is in play, Apache extra rows (mail trio + pin) use `./apache-stack.md` Aspect 2 **instead of** the numbered pom / 4-digit / matching-train steps below. Do not FAIL those rows for missing `pom.xml` or non-`a.b.c.d` own version. Ordinary Maven named/stack rows still use the numbered steps.

1. **Discover then read the release-branch pom.** Discover the remote branch: `git branch -r | grep release/<train>` e.g. `origin/release/2026-06-8.3.x.x`. Then: `git show origin/release/<YYYY-MM-a.b.x.x>:pom.xml`

2. **Two valid states at check time** (see `versioning-release-branching-workflows.md` §3.4):
   - *Right before release:* pom shows `a.b.c.d-SNAPSHOT` (the `-SNAPSHOT` will be dropped at release time). Correctness is already verifiable against the snapshot.
   - *After release:* branch tip shows `a.b.c.<d+1>-SNAPSHOT` (next **build** at the same `a.b.c`, e.g. `8.3.1.2-SNAPSHOT` after `8.3.1.1`). Not the next patch. Any of `a`/`b`/`c` increasing restarts `d` at 1 (`c+1` → `8.3.2.1`; next minor → `8.4.0.1`). The shipped version is read from tag `a.b.c.d`.

3. **Checks to perform:**
   - **4-digit scheme** -- own version is `a.b.c.d` or `a.b.c.d-SNAPSHOT`. No 3-digit versions.
   - **Branch naming** -- `release/YYYY-MM-a.b.x.x` where `a.b` matches the product's minor train.
   - **Own version `c`/`d` correct** (classify the ship first; see §3.1):
     - **New patch** (`c` increased vs the previous existing tag's `c`): this `c` is `+1` from that previous patch level.
     - **Same-`c` rebuild**: `c` matches the previous existing tag of this `c`; only `d` is higher. PASS -- do not demand `c+1`.
     - **Master-cut** (`c=0`, any `d`): PASS on `c`; do not demand `d=1`. This companion is still the wrong suite for a first-of-train -- if Step 0 selected patch in error, stop and return to `SKILL.md` Step 0b.
     - Do **not** FAIL solely because `d ≠ 1`. FAIL only if `c` does not match that classification.
   - **Every medavis dependency is released (non-SNAPSHOT)** on the matching train. For each `<property>` version in the pom, confirm it is a `a.b.c.d` form with no `-SNAPSHOT`. If an upstream release branch does not yet exist, flag it (do NOT fail -- it may be in progress per §3.5).

4. **Per-repo verdict:** PASS if all checks clear; FAIL with the specific failing check(s) listed.

   Reference: `versioning-release-branching-workflows.md` §3.1 (4-digit scheme), §3.2 (branch naming), §3.4 (pom states), §3.5 (cross-project alignment).

## Aspect 3 -- Master versioning

**Goal:** confirm master is on the correct next-minor train with no pom-version leaks from the release branch.

If `./apache-stack.md` is in play, Apache extra rows use `./apache-stack.md` Aspect 3 analog **instead of** the numbered master-pom steps below (Chocolatey and medavis.apache SKIP; solution does not demand `2.7.0.1-SNAPSHOT`).

1. **Read the master pom:** `git show origin/master:pom.xml`

2. **Own version check:** master's own version is its current development train as a `-SNAPSHOT`, strictly ahead of the release train -- normally the next minor `a.(b+1).0.1-SNAPSHOT` (on master a train change does `b+1`; on the release branch it does `c+1`). Example: if the release is `8.3.x.x`, master is `8.4.0.1-SNAPSHOT`. At a major bump the next train resets to `(a+1).0.0.1-SNAPSHOT` instead. Read the actual value from the master pom and confirm it is a `-SNAPSHOT` on a train beyond the release train (not the release train itself, and not a non-SNAPSHOT).

3. **Dependency check -- NUANCED RULE (the naive "all deps must be SNAPSHOT" is WRONG):**

   For **every** medavis dependency in the master pom, classify it explicitly:

   | Dep | On release-branch pom | On master pom | Moved in this train? | Expected on master | Flag? |
   |---|---|---|---|---|---|
   | e.g. medavis-ui | 7.3.1.1 | 7.4.0.1-SNAPSHOT | YES | next-train SNAPSHOT | flag if NOT SNAPSHOT |
   | e.g. core-framework | 7.2.0.2 | 7.2.0.2 | NO | last-released (same) | flag if DIFFERENT from release-branch |

   Rules:
   - **Deps that MOVED in this train** (release-branch value is a new release that didn't exist before this train): master must carry the next-train SNAPSHOT (e.g. `7.4.0.1-SNAPSHOT`).
   - **Deps that did NOT move** (same value on release branch as before this train): master legitimately stays at their last-released version. These are NOT leaks -- do not flag them.
   - **Leak = a merge-back that carried a pom version bump.** Cross-check: if a dep's value on master equals the train-specific value from the release-branch pom but that value did NOT exist before this train, it leaked via a merge-back pom commit. Flag it.

   How to classify "moved vs not moved": compare the dep's value at the **train baseline** (the earliest existing `a.b.0.*` tag -- `c=0`, whatever `d`; often `.0.1` but not a formula) against its value at `<cur-tag>` / the release-branch tip. If they differ, it moved; if they are the same, it did not move. For a later patch of this train, use that train-baseline tag, NOT the confirmed Aspect 1 compare-to (previous `c` for named products; parent-pom values for unnamed stack), or a dep that moved in an earlier patch of this train will be misclassified as "not moved". Aspect 1 compare-to defaults to highest previous `c` **for named products** (same-`c` previous `d` only if the user chose it). Aspect 3 train baseline stays the first `a.b.0.*` either way. When you run Aspect 3 on a child, re-resolve that child's **own** train baseline (earliest `a.b.0.*`) -- do not assume the parent's compare-to equals the child's train baseline.

4. **Per-repo verdict:** PASS if own version is correct and no leaks detected; FAIL with the specific dep(s) that fail the rule.

   Reference: `versioning-release-branching-workflows.md` §3.5 (cross-project alignment, master dep rules), §3.6 (every fix to both release + master).

## Aspect 4 -- Merge-back to master (the step devs forget)

Do **not** skip Aspect 4 in patch mode.

Answer TWO questions per release fix: **SAFETY (hard gate)** -- is the fix present in master's current content? (content-based, direction-agnostic); **PROCESS (warning)** -- did it reach master via the intended release->master linkage? SAFETY missing = repo FAIL + paste-able dev reminder. PROCESS smells (reverse-cherry, unlinked-duplicate, keyless, not-corroborated) = report only, never fail.

Per-repo result schema (one row per ticket):

```
<ticket> | safety: PASS/MISSING | process: clean / reverse-cherry / unlinked-duplicate / keyless / not-corroborated | evidence
```

Repo Aspect 4 = FAIL iff any ticket safety = MISSING.

**REQUIRED:** run the full staged procedure (partition -> staged-rigor SAFETY -> PROCESS -> report schema -> dev-behavior coverage table -> reminder template) from the companion reference `aspect4-merge-back.md` in this skill folder.

If compare-to is still `UNRESOLVED`, skip Aspect 1 **and** Aspect 4 for that row (no invented range). Keep Aspects 2/3.

## Common Mistakes

| Mistake | Reality |
|---|---|
| Starting Aspects 1–4 without confirming the compare-stack table | Wrong compare-to wastes the run. Print named + derived stack (this ship vs compare-to), including `-SNAPSHOT` prepared ships, then HARD STOP via the question channel. See `compare-stack.md`. |
| Defaulting Aspect 1 to the previous existing tag (same-`c` previous `d`) | Normal patch compare is **previous `c`**: highest `a.b.(c-1).*` (e.g. `1.2.1.4` vs `1.2.0.3`). Same-`c` `d`-to-`d` only if the user picks it at confirmation. |
| Skipping the table because the poms are still `-SNAPSHOT` | Right-before-release is in scope. This-ship = line tip; cells keep `-SNAPSHOT`; compare-to stays released previous-`c` tags. |
| Gating only the named products and forgetting the derived stack | The named bundle is rarely the full stack. Walk every medavis `*.version` recursively (`compare-stack.md`). A changed stack child has its OWN changeset and possibly its OWN release ticket. Real miss: `PORTAL-1263` only in `vaadin-ui`. See `transitive-dependency-scope.md`. |
| Assuming a moved dep only needs a version-number check | A changed stack child must run ALL FOUR aspects, including Aspect 1 on its confirmed compare-to..this-ship log. Real case: `vaadin-ui` 7.3.1.1 carried `PORTAL-1263` ("restore UserMenu name display after Vaadin 24 migration"), a ticket in no named product. |
| Stopping the stack walk at the named products' direct deps | Step 1.4 is a recursive closure (worklist to fixpoint), NOT a one-shot scan. A child can hide below a named product (A->B->C->D where D's version appears only in C's pom). A fat aggregator pom (like p4m) can surface the deep stack at level 1 by luck; a thin pom (like applicationserver) will not. See `compare-stack.md` + `transitive-dependency-scope.md`. |
| Flagging every non-SNAPSHOT master dep as a leak (the naive "all deps must be SNAPSHOT" rule) | WRONG. Only deps that MOVED in this train go next-train SNAPSHOT; deps that did not move stay at their last-released version (e.g. `core-framework 7.2.0.2`) -- NOT leaks. Always classify EVERY dep as moved/not-moved before judging. |
| Only checking the deps you know moved in Aspect 3 and skipping the rest | Every dep in the master pom must be explicitly classified. An un-checked dep that leaked will be silently missed. |
| Treating a master-first cherry-pick (reverse-cherry) as a missing merge-back | The fix IS on master (safe). That is a reverse-cherry PROCESS smell, not a SAFETY failure. Do NOT declare MISSING. |
| Using a different commit hash to infer direction (labelling standard release->master cherry-picks as reverse-cherry) | Cherry-picks ALWAYS produce a new hash; a different hash alone tells you nothing about direction. To determine direction: check which branch has the EARLIER commit timestamp for the same change. release-branch EARLIER = standard (clean). master EARLIER = reverse-cherry. When in doubt, label as clean if Stage A found the key on master. |
| Deciding Aspect 4 SAFETY by key-grep alone | Key-grep proves linkage, not content. A squash-merge can drop the `[KEY]`; a hand-edited duplicate has no key. Use Stage A key-grep first -- if it hits, PASS. If it misses, proceed to Stage B content check before deciding. |
| Going deep into file-level content checks when Stage A key-grep already returned a match | Stage A >= 1 commit = SAFETY PASS. Stop there. Stage B is only for Stage A = 0 cases. Over-investigation wastes context and can produce spurious "CONDITIONAL PASS" uncertainty. |
| Declaring a Stage C inconclusive case as MISSING | Inconclusive is NOT MISSING. Report "inconclusive -- would ask user" and do not fail Aspect 4 on it. MISSING requires all three stages to fail. |
| Using JIRA to discover scope | Scope comes from the version + git log. JIRA is OPTIONAL enrichment; degrade gracefully when the MCP is absent. |
| Loading a whole PR diff to inspect one file | Blows the context window. Use `get_pull_request_diff` with `file_path` + small `context_lines`; escalate to full-file only when needed. |
| Cross-checking a bundle by release-branch month | Cross-check by train (`a.b.c.d`). A coordinated bundle's products can each carry a different `YYYY-MM` on their release branches. |
| Creating the `hotfix/...-merge-back` branch or a JIRA sub-task | Out of scope. Report the gap + paste-able reminder only. |
| Computing compare-to as `a.b.c.(d-1)`, requiring `d=1`, or using previous existing tag as the silent default | `d` is the build at this `a.b.c`. It restarts at 1 when **any** of `a`, `b`, or `c` increases. `8.3.1.1` ↛ `8.3.1.0`. Patch Aspect 1 default = highest previous **`c`**, confirmed in the stack table. Train baseline (Aspect 3) = earliest `a.b.0.*`, not the formula `.0.1`. See `compare-stack.md` and `versioning-release-branching-workflows.md` §3.1. |
| Mapping `cockpit-chart-service.version` to `coc.next` (or always to the standalone repo) by property name | The property name is older than the extraction (COCKPIT-49, 2026-04-07). Resolve from the **same pom's `artifactId` + version train**. `1.x.x` + artifact `cockpit-chart-service` → repo `cockpit-chart-service`. Legacy artifact `coc.next-chart-service` or cockpit 6.x/7.x versions → `coc.next`. A 2025 train must not look for the standalone repo. |
| Skipping Aspect 4 because the run is "just a version bump" | Patch mode always runs merge-back. SKIP Aspect 4 only when this row's compare-to is still `UNRESOLVED` (no invented range) or when Step 0 selected master-cut (`./master-cut.md`). |

## References

- `./compare-stack.md` -- previous-`c` default, SNAPSHOT this-ship, confirmation table, HARD STOP, which range is Aspect 1 vs Aspect 3.
- `./aspect4-merge-back.md` -- full staged-rigor SAFETY/PROCESS procedure, dev-behavior coverage table, reminder template, Stage A->B->C flowchart.
- `./transitive-dependency-scope.md` -- why a changed stack child is a gate repo. Train-baseline `*.version` diff is for Aspect 3 classification, not the Aspect 1 compare-to default.
- `./master-cut.md` -- do not use this file for first-of-train cuts from master.
- `next-platform-knowledge/references/versioning-release-branching-workflows.md` -- 4-digit scheme (§3.1), branch naming (§3.2), pom states at check time (§3.4), cross-project version alignment (§3.5), every fix to both branches (§3.6).
- `next-platform-knowledge/references/cross-project-navigation.md` -- diff-first (Pattern 1), release/branch-verification (Pattern 3).
- `production/skills/requesting-code-review/SKILL.md` -- Aspect 1 full review handoff.
