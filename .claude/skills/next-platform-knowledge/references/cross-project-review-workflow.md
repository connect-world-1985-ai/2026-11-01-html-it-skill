# Cross-Project AI Code Review — Workflow

> The methodology for reviewing a .next epic that spans many projects within AI context limits: inventory-first, small-batch, adaptive review order. **Traversal mechanics (import tracing, cross-repo diff loading, diff-first discipline) live in `cross-project-navigation.md`** — this file is the review-specific workflow built on them. For the findings document format, see `cross-project-review-findings-format.md`.

## 4.1 The Problem

A cross-project epic can touch **many or all 33 projects** with changesets ranging from 24 to 500+ files per project. A single project's PR diff can easily exceed 1–2 MB of text. AI models have a finite context window, which means:

- Loading the full diff of even **one** large project would consume the entire context window
- Loading diffs for **all projects** simultaneously is impossible
- A naive "read everything at once" approach will fail before it starts

Traditional human code review would involve a reviewer opening each PR and scanning every file. The same file-by-file discipline must be applied to AI-assisted review, but with deliberate context management.

## 4.2 Core Principles

| # | Principle | Rationale |
|---|-----------|-----------|
| 1 | **File inventory first, diffs later** | Generate lightweight file change manifests per project first. These lists act as a "map" for the AI — they show what changed without consuming context on how it changed. |
| 2 | **Small-batch file review** | Review files in small groups (1–5 at a time) within a single AI session. If the context fills up, start a new session and continue from where the last one left off. |
| 3 | **Never load full PR diffs into AI context** | The Bitbucket `get_pull_request` API returns file paths and statuses as lightweight metadata — use it for inventory generation. The `get_pull_request_diff` API returns actual diff content and **must never be called without a `file_path` filter** during review. During Phase 2 per-file review, `get_pull_request_diff` with `file_path` is the **primary tool** for loading targeted, single-file diffs. |
| 4 | **Cross-project dependency tracing via imports** | When reviewing a file, if it imports a class from another project and that class has also changed, the AI should follow the `import` → package path → find the corresponding file in the other project's inventory. This builds a cross-project call chain for focused review. (Mechanics: `cross-project-navigation.md` Pattern 1.) |
| 5 | **Progress tracking with checkboxes** | Each file in the inventory has a `- [ ]` checkbox. As files are reviewed, they are marked `- [x]`. This provides clear progress visibility and ensures no file is missed. |
| 6 | **Adaptive review order** | The review order is not fixed — it depends on the changeset's purpose, where the "correctness anchor" lives, and the AI's judgment about what sequence is most effective. The AI recommends a concrete review order and confirms with the user before starting file-by-file review (see Review Order below). |

## 4.3 Review Workflow

```
Phase 1: Inventory Generation
┌──────────────────────────────────────────────────────────────┐
│  For each project with a PR under the epic:                   │
│  1. Fetch PR metadata from Bitbucket (no diffs)              │
│  2. Generate file inventory with module grouping              │
│  3. Categorize files by type (source, test, config, etc.)    │
│  4. Add review checkboxes for progress tracking              │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
Phase 1.5: Determine Review Order
┌──────────────────────────────────────────────────────────────┐
│  Before starting file-by-file review:                         │
│  1. Clarify the changeset purpose with the user              │
│  2. Identify the "correctness anchor" (see Review Order)     │
│  3. Recommend a concrete review order with reasoning         │
│  4. Confirm the review order with the user                   │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
Phase 2: File-by-File Review
┌──────────────────────────────────────────────────────────────┐
│  For each project, in the order determined in Phase 1.5:     │
│  1. Open the file inventory as a review map                  │
│  2. Select a small batch of related files (1-5)              │
│  3. Load the actual diff for those files                     │
│  4. AI analyzes changes against review rules                 │
│  5. If AI judges a cross-project dependency warrants it:     │
│     trace via cross-project-navigation.md Pattern 1          │
│     (resolve import → owning project → that project's        │
│      inventory header for Bitbucket MCP params → diff)       │
│  6. Mark reviewed files with [x]                             │
│  7. If context fills up → new session, continue from map     │
└──────────────────────────────────────────────────────────────┘
```

Cross-project tracing (step 5) is not a separate phase — it happens naturally during file review whenever the AI encounters an import from another project whose API has changed. The AI uses its own judgment to decide when tracing is warranted (e.g., a renamed method, a changed return type, a deleted class) versus when it's unnecessary (e.g., a straightforward javax→jakarta import that doesn't affect the calling code's logic).

**Cross-project inventory update rule**: When the AI traces from Project A's file-a into Project B's file-b, it should assess whether the trace covered ALL changes in file-b or only part of them:
- **If the trace covered everything** — all changes in file-b are relevant to the call chain just verified, and the AI has reviewed them all → mark file-b as `[x]` in Project B's inventory and record any findings in Project B's findings doc. When the formal review of Project B begins later, file-b can be skipped to avoid double work.
- **If the trace only covered part of the changes** — file-b has other changes beyond what's relevant to the call chain from file-a → do NOT mark file-b as `[x]`. Leave it for the formal review of Project B's inventory, where ALL changes will be reviewed.

This ensures no file is reviewed twice unnecessarily, while also ensuring no changes are missed.

**The Package-to-Project Mapping and the inventory files together form the routing mechanism.** The mapping table (in `platform-map-project-identity.md`) resolves an import's package path to the owning project and git directory. The inventory file for that project then provides two things the mapping table cannot: (a) whether the imported file actually changed in this epic, and (b) the Bitbucket MCP parameters (`workspace`, `repository`, `pull_request_id`) needed to load the diff from that project's PR.

## 4.6 Review Order

The review order is **not fixed** — it is not inherently "bottom-up" or "top-down." A skilled reviewer doesn't mechanically sweep in one direction through a dependency graph. Instead, the AI should use its best judgment to determine the most effective sequence based on the changeset's purpose, where the **correctness anchor** lives, and what order will build understanding most efficiently. The AI proposes a concrete review order and confirms with the user before beginning Phase 2.

### The Correctness Anchor

Every changeset has a "correctness anchor" — the point in the dependency graph where the source of truth for judging correctness lives. The review should **start from the anchor**, because the anchor is where the reviewer first builds the mental model of "what should be true." After that starting point, the AI uses its judgment to determine the next most valuable file or module to review.

| Changeset Purpose | Correctness Anchor | Recommended Starting Point | After the Starting Point |
|---|---|---|---|
| **Technical migration** (e.g., javax→jakarta, Hibernate 5→6, JDK upgrade) | Foundation (lower layers) | Start at the framework layer where the new API contract is defined | Expand to consumers, prioritizing those with the most complex adaptations or highest risk of regression |
| **Feature implementation** | Application layer (callers) | Start at the feature entry point to understand the intent and requirements | Trace into supporting layers as needed, grouping related cross-layer files that serve the same feature logic |
| **Bug fix** | Where the bug manifests (usually application layer) | Start where symptoms are observed | Trace to root cause across layers; review the fix and its surrounding context together |
| **API redesign / contract change** | API owner (whichever layer initiated the change) | Start at the layer that initiated the API change | Expand to affected consumers, prioritizing those with non-trivial adaptation |
| **Refactoring** | Wherever the refactoring originated | Start where the refactoring intent is clearest | Follow the refactoring's ripple effects through related files |
| **Configuration / infrastructure** | Depends on scope | May not follow the dependency graph — start with the config change itself | Check affected deployments and consuming code |
| **Mixed-purpose epic** | Multiple anchors | Identify each distinct concern and its anchor separately | Propose a sequenced plan that handles each concern in the most natural order; confirm with user |

**The table above is advisory, not prescriptive.** In practice, the best review order often doesn't follow a clean directional sweep — the AI might start at the application layer, jump to a critical framework change, then review a mid-layer integration, depending on what the change requires.

### How the AI Should Determine Review Order

1. **Understand the changeset purpose** — Ask the user if not already clear (Section 4.7 requires this).
2. **Identify the correctness anchor** — Based on the purpose, determine which layer or module holds the source of truth for judging correctness.
3. **Recommend a concrete review order with reasoning** — Propose an ordered list of projects/modules, explaining why that sequence is effective for this particular changeset, using the dependency graph (`platform-map-dependencies.md`), the change scope, and the risk profile.
4. **Confirm with the user** — The user may have additional context that overrides the recommendation. Never silently assume a fixed order.

### Dependency Level Reference (navigation aid)

Use the release level from `platform-map-dependencies.md` → Release Levels to talk about position in the graph (e.g., "start at level 7 and trace down into level 3 as needed"); the non-Maven pieces (medavis.solution, medavis.apache, medavis-apache.portable) are reviewed independently if included.

## 4.7 Definition of Reviewed

A file is marked `[x]` (reviewed) when ALL four conditions are met:

| # | Condition | Description |
|---|-----------|-------------|
| 1 | **Diff read** | The file's diff was loaded and read by the AI |
| 2 | **Changes understood** | The AI can explain what changed and why, in the context of the PR's purpose |
| 3 | **Correctness assessed** | The AI made a judgment on whether the changes are correct — either "correct" or "issue found" |
| 4 | **Outcome recorded** | If issues found → findings recorded in the code-review-findings doc. If clean → no annotation needed |

If any condition is not met, the file stays `[ ]`.

**Review depth is driven by the purpose of the changeset, not by file type alone:**

Before beginning any review, the AI **must** clarify the driving force behind the code changes with the user. Do not start reviewing files until the purpose is fully understood. Keep asking questions until the AI has a clear picture of:

1. **What kind of change is this?** (technical upgrade, feature implementation, bug fix, UI change, refactoring, etc.)
2. **What is the expected outcome?** (existing behavior preserved, new behavior added, performance improved, etc.)
3. **What are the risks the reviewer should watch for?** (regressions, breaking changes, data loss, security gaps, etc.)

The purpose determines what "appropriate scrutiny" means for every file in the changeset. Examples:

| Changeset Purpose | Review Focus |
|-------------------|--------------|
| **Technical upgrade** (e.g., Java EE 8 → Jakarta EE 10, Hibernate 5 → 6) | Does the migration preserve existing business logic? Are behavioral changes introduced unintentionally? Do updated APIs maintain the same contracts? Are deprecated patterns replaced correctly? |
| **Feature implementation** | Is the implementation correct against requirements? Are test cases sufficient and meaningful? Does the code follow project conventions? Are edge cases handled? |
| **Bug fix** | Does the fix address the root cause? Could it introduce side effects elsewhere? Is there a regression test? |
| **UI implementation** | Is the styling consistent? Is the UX intuitive? Does it meet accessibility requirements (WCAG)? Are responsive layouts handled? |
| **Refactoring** | Is behavior preserved exactly? Are all callers updated? Do tests still pass with the same assertions? |
| **Configuration / infrastructure change** | Are versions correct? Are environment-specific values properly handled? Do references point to the right targets? |

These are illustrative, not exhaustive. The key principle: **understand the "why" before judging the "what".**

**Explicitly NOT required for `[x]`:**

- Reading the full file (diff is sufficient unless the AI needs more context)
- Tracing every import to its source project (only when the AI judges it warranted)
- Running tests (testing is a separate concern from code review)

## 4.8 How This Mirrors Traditional Human Code Review

The approach deliberately replicates the discipline of a human code reviewer — the AI simply replaces the human as the reader, but follows the same workflow:

| Step | Human Reviewer | AI-Assisted Equivalent |
|------|---------------|----------------------|
| 1 | Open a PR, look at the file list (not full diff upfront) | Load the file inventory for a project |
| 2 | Pick a file, read its changes, understand them | AI reads the diff for 1–5 selected files |
| 3 | If the file calls an API from another project that also changed, go find that file in the other PR | AI follows `import` statements to locate cross-project dependencies, checks the other project's inventory |
| 4 | Follow the chain until the logic is verified end-to-end | AI loads diffs from both projects' files together for comparison |
| 5 | Mark the file as done, move to the next | Check `- [x]`, select next batch |
| 6 | If tired or out of time, stop and resume tomorrow | If context fills up, start a new AI session and continue from the inventory map |

The key insight is that the approach trades **breadth** (seeing everything at once) for **depth** (understanding each change thoroughly). The inventories provide just enough breadth to navigate, while per-file review provides the depth needed for meaningful analysis.

## 4.10 Assessment and Known Limitations

**Strengths:**

- **Resumable**: Checkbox-based progress tracking means review state survives across AI sessions. If 50 files are reviewed today and 50 tomorrow, no context is lost.
- **Scalable**: The approach works regardless of total changeset size — whether 24 files or 500+ files. Each individual review session operates within context limits.
- **Progressive context loading**: Only the files on the current review path are loaded. The AI never needs to hold the entire migration in memory simultaneously.
- **Follows established practice**: The file-by-file, change-by-change approach is how experienced human reviewers already work.

**Known limitations:**

- **Cross-project tracing breadth**: When a change in `core-framework`'s `DAOBean` affects `order-component`, `person-component`, `admin-app`, and `p4m` simultaneously, the AI will need to hold diffs from multiple projects in one session. Because only the *specific files on the call chain* are loaded (not entire PRs), this should still fit within context for most cases — but very deep or wide call chains could push limits.
- **Depends on inventory completeness**: The approach assumes file inventories have been generated for all projects involved in the epic. If an inventory is missing for a project on the call chain, the tracing breaks. All in-scope projects need inventories before Phase 2 can fully work.
- **Review order quality depends on purpose understanding**: The adaptive review order (Phase 1.5) relies on the AI correctly understanding the changeset's purpose and identifying the right correctness anchor. This is why Phase 1.5 requires explicit confirmation with the user before proceeding.
