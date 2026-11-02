# Cross-Project Navigation (traversal patterns)

> The reusable engine for moving between the 33 .next projects to answer cross-project questions — feature planning, impact analysis, refactoring, **code review**, release verification, ideation. Uses the lookup tables in `platform-map-project-identity.md` (package→project, repo identities) and `platform-map-dependencies.md` (who depends on whom). Live diffs/branch state are fetched by git / Bitbucket MCP; this file is the method.

## Loading discipline (diff-first)

When you need to see what changed in a file across these repos, follow a **diff-first, read-on-demand** discipline:

1. **Load the per-file diff first** — for a file known to have changed in a PR, use Bitbucket MCP (`get_pull_request_diff`) with an explicit `file_path` (and a small `context_lines`, e.g. 3-5). The diff focuses attention on what actually changed and saves context budget — a 500-line file might have only 3 changed lines. Never load a whole PR's diff without a `file_path` filter; that can blow the context window.
2. **Escalate to a full-file read only when the diff lacks context** — e.g. you need the surrounding logic, the class structure, or you are exploring a file that wasn't in the original diff batch.
3. **Prefer Bitbucket MCP (`get_file_content`) with an explicit `branch`** over local filesystem reads. The 33 repos are separate git checkouts that may each sit on a *different* branch, so a local read can return stale content from the wrong branch. `get_file_content` reads the named branch on the server regardless of local checkout state (use `full_content: true` for the whole file, or `start_line`/`line_count` for a range).
   - Local reads (the agent's file-read tool) are fine **only** when you have confirmed the local repo is on the expected branch (check `git branch` first).
   - `git show <branch>:<path>` or `git diff <refA>...<refB> -- <path>` work for branch/commit comparisons not tied to a PR.

| Tool | What it provides | Best for |
|------|-----------------|----------|
| Bitbucket MCP (`get_pull_request_diff`) | Per-file diff from a PR (line-by-line) | Seeing what changed — **always the first step** |
| Bitbucket MCP (`get_file_content`) | Full file content from a specific branch | Reading the complete file on the correct branch, no local-checkout dependency |
| The agent's file-read tool | Full file content from local filesystem | Quick reads when the local repo is confirmed on the correct branch |
| Git commands (`git show`, `git diff`) | File content/diffs from any branch/commit | Targeted reads of a specific commit or branch comparison |

## Pattern 1 — Import / call-chain tracing

**Use for:** code review, refactoring. Follow an `import de.medavis.<pkg>` → resolve the package to its owning project via `platform-map-project-identity.md` (Package-to-Project Mapping, longest-prefix-first) → check whether that file changed (the other project's PR/inventory) → load its diff → verify the call chain is logically consistent.

### Worked example — tracing from p4m into core-framework

1. **Identify the cross-project dependency from the import.** While reviewing `p4m.next-ejb/src/main/java/de/medavis/p4m/ejb/businesslogic/OrderServiceBean.java`, you see:
   ```java
   import de.medavis.framework.ejb.dao.DAOBean;
   ```
2. **Resolve the package to a project** via the Package-to-Project Mapping: `de.medavis.framework.ejb` → **core-framework** → `ejb-framework` module → `d:\git\core-framework\`.
3. **Check whether `DAOBean.java` changed** in this epic — open core-framework's PR/inventory. If it shows `DAOBean.java` as Modified, tracing is warranted.
4. **Load the callee's diff** via Bitbucket MCP (`get_pull_request_diff`) with core-framework's workspace/repository/pull_request_id and `file_path` pointing at `DAOBean.java`. Now both diffs are loaded — the caller (`OrderServiceBean.java`) and the callee (`DAOBean.java`) — so you can verify p4m's usage is consistent with core-framework's change.
5. **Escalate to a full-file read only if needed** (e.g. to see `DAOBean`'s full class structure) via Bitbucket MCP (`get_file_content`) with the epic branch.

Java `import` statements act as natural cross-project links: the package path alone tells you which project owns the class, so no pre-built per-file dependency map is needed — the codebase's own import structure is the guide.

## Pattern 2 — Dependency-edge / impact traversal

**Use for:** feature planning, impact analysis, ideation. Given a target project, enumerate its upstream/downstream projects from the dependency matrix (`platform-map-dependencies.md`) to scope the candidate blast radius, then use the release levels to sequence work and Pattern 1 to find the specific files.

### Worked example — "Add a feature to p4m.next"

1. `platform-map-dependencies.md` → p4m depends on 13 projects: parent POM `parent`, the `installer` parent of `p4m.next-installer`, and admin-app, person-component, order-component, document-component, communication-stack, image-viewer2, cockpit-chart-service, vaadin-ui, manuals, core-framework, random-instance-builder (on OLD, the chart module comes from cockpit; see `platform-lines-old-new.md`) → candidate related set; the release levels give the change sequence (fix/extend lower levels first).
2. `platform-map-project-identity.md` → package→project→git dir → where each project's code lives.
3. Pattern 1 → trace which of those the feature actually touches (follow imports/call chains from the entry point).
4. `versioning-release-branching-workflows.md` → if multi-project, the epic-branch + qualifier plan (`epic/<JIRA-EPIC>-*`, `a.0.0.1-<QUALIFIER>-SNAPSHOT`).
5. `jira-system-structure.md` → tracked under PORTAL; epic→task parenting across the involved projects via the `parent` field.

## Pattern 3 — Release / branch-verification traversal

**Use for:** release management, merge-back audits. Given a release and a dependency edge, locate BOTH repos' release and master branches and compare.

### Worked example — "Was a b4m.next release fully merged to master, incl. referenced vaadin-ui changes?"

1. `versioning-release-branching-workflows.md` §3.4/§3.6 → policy: every release/hotfix fix must merge to BOTH the release branch AND master.
2. `platform-map-dependencies.md` → b4m (booking4med) depends on vaadin-ui → vaadin-ui is a relevant upstream.
3. `versioning-release-branching-workflows.md` §3.5 + Example 2 → the exact cross-project pattern (upstream fix → version bump → downstream updates the dep version on its release branch + bumps its own patch → both merge back to master).
4. `platform-map-project-identity.md` → repo identities: b4m.next = `NEXT-CN/b4m.next`, vaadin-ui = `NEXT/vaadin-ui`; branch-naming patterns (`release/YYYY-MM-a.b.x.x`, `hotfix/<JIRA-KEY>-merge-back-to-master`).
5. **Verify the merge-back landed on master** in EACH repo. This is TWO independent checks -- a SAFETY (hard-gate) check that proves the fix's *content* is on master, and a PROCESS (warning) check that proves it got there via the intended release->master linkage. The split matters because developers sometimes commit on master first and cherry-pick to release, or hand-edit the same change twice on both branches -- both are safe but process-smelly; only an actually-missing fix is a hard failure. A key-grep alone is NOT sufficient: it proves "some commit on master carries this key," not that master's content contains the fix.

   **SAFETY (hard gate, content-based, direction-agnostic):** does master's current content contain the fix that shipped in the release? Use staged rigor -- cheap first, escalate only when inconclusive:
   - **Stage A -- patch-id reachability:** for each release-side code commit (excluding pom-bump machinery), look for a content-equivalent commit on `origin/master` via patch-id (`git log --cherry-pick --no-merges --right-only <release-range>...origin/master`, or `git patch-id` per commit). Equivalent patch-id present -> SAFETY PASS.
   - **Stage B -- content-presence triage:** for inconclusive or smelly cases, for each file the fix touched, check whether `git show origin/master:<path>` contains the release-side changed hunks. Verdict = present / absent / inconclusive (refactors, moved code, conflict-resolution noise read inconclusive).
   - **Stage C -- human verdict:** for inconclusive cases, present the release-side hunks and the master-side state side-by-side; a human confirms present/absent. Do NOT auto-resolve refactor/moved-code cases.
   - The fix is MISSING on master ONLY if all three stages fail to find it.

   **PROCESS (warning, linkage-based):** did the fix reach master via the intended release->master linkage? Reports smells, does NOT fail on them:
   - **Extract per-ticket keys** from the release-branch `git log <prev-tag>..<cur-tag>`: pull every `[JIRA-KEY]` token, excluding non-ticket commits whose prefix is `[RELEASE]`, `[AUTOMATION]`, or `[HOTFIX]` (no JIRA key). A commit that touches a non-pom/non-build file, has NO JIRA key, and is NOT a machinery prefix is "keyless code" -- verify it PER-COMMIT and flag it as a smell (a code fix with no JIRA key is itself worth surfacing).
   - **Key-grep:** for each key, `git log origin/master --all-match --grep="<JIRA-KEY>"`. >= 1 match -> linked.
   - **Patch-id direction (when a content-equivalent commit exists):** release-side older than master-side = clean release->master cherry-pick; master-side older = "reverse cherry-pick" smell (master-first); content present but NO equivalent patch-id = "unlinked duplicate" smell (hand-edited twice).
   - **Corroborate via JIRA** when key-grep returns 0: a squash-merged merge-back can lose the `[JIRA-KEY]` prefix. Use the available Atlassian plugin or v2 MCP tools to call `getJiraIssue` with `view: "evidence"` (preferred) **or** `fields: ["customfield_10000"]` (Development only -- do not also pass `view`; see `jira-field-reference.md`). Passing both drops everything except the listed fields. The value may be at `fields.customfield_10000` or `fields.customFields`. Check for a PR targeting `master`. Label the process verdict "not corroborated" if Jira tools are unavailable -- but do NOT fail the SAFETY check on this (safety was decided on content in Stage A-C, not on the key).
   - `pom.xml` version-bump commits (`[RELEASE] ...`) are NOT expected on master -- merge-back cherry-picks code only (§3.4 Practical Merge-Back Workflow).

   The full release goal-keeper workflow (per-ticket report schema, dev-behavior coverage table, paste-able reminder template) lives in the `release-quality-gate` skill; this KB entry is the underlying verification method. That skill asks the release kind (master-cut first-of-train vs later `release/*` patch) and only the patch mode runs the merge-back procedure in this Pattern. Named apache-dist 2.x or `medavis-apache.portable` loads `apache-stack.md` (independent version schemes; 1.x stays Maven-only). The KB tells you to check BOTH release and master; the git/JIRA tools confirm the live state. Do not answer a live branch/commit question from memory or from the KB alone.
