# Master-cut mode (first-of-train from master)

Companion to `SKILL.md`. Load this file only after Step 0 selected kind (1): first-of-train / version-stack from master.

`c=0` is the usual digit shape (`d` is the build number at this `a.b.0` and may be `1`, `2`, `4`, …). `8.4.0.4` is still a master-cut. Kind was already asked in `SKILL.md` -- do not re-guess from `c`.

No release branch exists yet at ship time (`versioning-release-branching-workflows.md` §3.4). Do not treat `origin/release/...` as the ship pom. Do not run merge-back.

## Aspect 1 -- changeset (optional)

Run **only** if the user provided a compare-to version or version stack (Step 0c = yes).

- After they supply it: build the **same confirmation table** as patch (`./compare-stack.md`) from those tags vs this cut (SNAPSHOT this-ship allowed: `origin/master` tip). HARD STOP via the question channel. Then Aspect 1 uses confirmed pairs.
- Diff range: confirmed compare-to `..` current tag (or `origin/master` tip if still SNAPSHOT).
- Same ticket extraction / optional `requesting-code-review` handoff as patch Aspect 1 (`./patch-release.md` Aspect 1 procedure).
- If the user declined compare-to: **do not run**. Report Aspect 1 = `SKIP`. Do not invent previous-train last tag. Do not invent previous `c`. Do not git-log a fake range.

## Aspect 2 analog -- ship / train alignment (always)

Always run. This is **not** patch Aspect 2 (no `origin/release/...` as the ship pom).

If `./apache-stack.md` is in play, Apache extra rows (mail trio + pin) use `./apache-stack.md` Aspect 2 **instead of** the numbered ship-pom / `a.b.0.d` / matching-train steps below. Do not FAIL those rows for missing `pom.xml` or non-`a.b.0.d` own version. Ordinary Maven named/stack rows still use the numbered steps.

1. **Read the ship pom:**
   - Already tagged: `git show <a.b.0.d>:pom.xml` (or `v…` if that is the tag name). Example: `git show 8.4.0.4:pom.xml`.
   - Not yet tagged: `git show origin/master:pom.xml`.
2. **Own version** is this first-of-train (`a.b.0.d` or `a.b.0.d-SNAPSHOT` right before the drop). Do not demand `d=1`.
3. **Every in-scope medavis dep** is on the matching train. Right-before: `-SNAPSHOT` allowed. After tag: shipped versions on the **tag** are non-SNAPSHOT.
4. **After tag: do not treat master's new next-train SNAPSHOT tip as the shipped pom.** The shipped pom is the tag.
5. Flag missing upstream release branches as INVESTIGATE. Do **not** fail solely because a dep's release branch does not exist (first-of-train often has none).

Per-repo verdict: PASS if own version and in-scope deps align; FAIL with the specific check(s).

## Aspect 3 analog -- post-cut master (only if already tagged)

If `./apache-stack.md` is in play, Apache extra rows use `./apache-stack.md` Aspect 3 analog **instead of** the numbered next-train SNAPSHOT steps below.

- If **not** yet tagged: Aspect 3 = `SKIP` (master IS the ship line). Do not also use master as a "next-train" check.
- If already tagged: `git show origin/master:pom.xml`.
  - Own version = next-train `-SNAPSHOT` (normally `a.(b+1).0.1-SNAPSHOT`, or `(a+1).0.0.1-SNAPSHOT` at a major bump). Example after `8.4.0.4`: master `8.5.0.1-SNAPSHOT`.
  - **Moved-vs-not-moved:** if compare-to was given, classify moved vs not using **that user-supplied compare-to** as the master-cut baseline (this is the master-cut analog, **not** patch Aspect 3 -- patch Aspect 3 still uses earliest `a.b.0.*`). If no compare-to, classify using named+stack current values vs tag: master must not still carry the **just-shipped non-SNAPSHOT** as if it were the live development line for a moved dep that should now be next-train SNAPSHOT. Unmoved deps may stay last-released.
  - **Naive-all-SNAPSHOT is still wrong here.** Without a compare-to, you cannot classify every dep as moved. Do **not** fail every non-SNAPSHOT master dep. Only: (a) own version must be next-train `-SNAPSHOT`; (b) a dep that is **in the named ship set** (or whose just-shipped version appears on the tag) must not still show that **just-shipped non-SNAPSHOT** on master when it should have moved to next-train SNAPSHOT. Deps that were never in this ship stay at last-released -- not leaks. Same nuance as patch Aspect 3.

## Aspect 4 -- Merge-back

Always `SKIP`. Rationale: there is no release-branch fix to merge back; the ship originated on master. Do not grep master for "missing merge-back". Do not paste the hotfix reminder template. Do not FAIL Aspect 4. SKIP ≠ FAIL.

## Report schema

Same per-repo row as the orchestrator (`SKILL.md` Step 6). Aspect 4 column is always SKIP in this mode. SKIP cells do not create HOLD. Overall is not HOLD solely because Aspect 1 or 4 were skipped.

| Repo | In scope as | Version | Mode | Aspect 1 | Aspect 2 | Aspect 3 | Aspect 4 | Overall |
|---|---|---|---|---|---|---|---|---|
| p4m | named | 8.4.0.4 | master-cut | SKIP (no compare-to) | (ship pom = tag) | (post-cut master) | SKIP | SHIP or HOLD from **run** aspects only |

## Common mistakes (master-cut)

| Mistake | Reality |
|---|---|
| Guessing kind from `c=0` | Ask. `c=0` is a hint the user may confirm, not a substitute for the question. |
| Inventing previous-train as compare-to | Only use a user-provided compare-to. Else skip Aspect 1. Never default master-cut to previous `c`. |
| Skipping the stack table after the user supplied compare-to | Same HARD STOP as patch. Wrong stack wastes the run. SNAPSHOT this-ship is in scope. |
| Running merge-back | Always SKIP Aspect 4. |
| Using master tip as shipped pom after tag | Shipped pom is the tag. Master tip should already be next-train. |
| Treating SKIP as FAIL | SKIP does not HOLD. |
| Stopping stack walk at named products | Without compare-to, still walk declared medavis deps recursively. |
| Flagging every non-SNAPSHOT master dep as a leak | Same as patch Aspect 3: only moved/ship-set deps go next-train SNAPSHOT; unmoved last-released is legitimate. |
| Looking for `origin/release/...` as the ship pom | First-of-train is cut from master. After tag, ship pom = the tag. Release branches are created later, from the tag, when the first patch is needed. |

## References

- `./SKILL.md` -- orchestrator (kind, compare-to question, shared Step 1).
- `./compare-stack.md` -- confirmation table when compare-to was provided.
- `./patch-release.md` -- ticket extraction / review-depth procedure reused by optional Aspect 1.
- `./patch-release.md` is **not** the suite for this mode; do not run its Aspect 2 (`origin/release`) or Aspect 4.
