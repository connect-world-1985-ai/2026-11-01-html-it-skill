---
name: requesting-code-review
description: Use when a logical task is complete (feature, fix, refactoring unit) before reporting results or moving on, when the user requests commit/push/merge, or when the user asks to review someone else's PR (including Bitbucket Server PR URLs via bitbucket-mcp).
---

# Requesting Code Review

Dispatch the code-reviewer agent to catch issues before they cascade.

**Core principle:** Review early, review often.

## Scope

- **Applies to: main agent only.** Subagents do not trigger or follow this skill. This skill dispatches a code-reviewer subagent via the Task tool, which requires main-agent capabilities.

## Trigger Conditions

Activate this skill when ANY of these conditions are met:

1. **Logical task complete:** A feature, bug fix, or refactoring unit is finished -- before reporting results, proposing a commit, or starting the next task.
2. **User completion signal:** The user indicates work is done (e.g., "ready to commit", "push this", "merge it"). Propose review first, even for direct commit requests.
3. **PR review request:** The user asks to review someone else's Pull Request. Per `skill-runtime-policies` Rule 12: confirm trigger, gather context via `clarify-requirements`, and determine review focus before proceeding.

Do NOT trigger mid-implementation while files are still being edited for the same logical task.

Summarizing completed changes for the user counts as "reporting results" -- satisfy this skill first.

## Exit Conditions

Before this skill is "done", ALL of these must be satisfied:

1. Review results have been presented to the user, including the complete findings set exactly as returned by the reviewer.
   - Preserve reviewer-provided finding IDs when present.
   - If the reviewer did not provide stable IDs, assign deterministic IDs before presenting findings, such as `Critical-1`, `Important-1`, `Minor-1`.
   - The findings route gate must not be presented until every finding has a stable ID.
2. **No pre-triage by the main agent:** The main agent must not accept, reject, reprioritize, or select "valuable" findings before `receiving-code-review` runs. It may summarize reviewer-provided severity categories, but must not make its own fix-selection decision at this stage.
3. **Findings route gate (hard gate):** If ANY findings exist (Critical, Important, or Minor), present these options and wait for the user:
   - **Default/recommended:** Trigger `receiving-code-review` for evidence-based triage of the complete findings set.
   - **Direct-fix bypass:** Directly apply explicitly selected eligible Minor trivial/mechanical finding IDs only, under the strict rules in Direct-Fix Bypass below. All other findings remain unresolved unless routed to `receiving-code-review` or explicitly deferred.
   - **Defer:** Leave findings unresolved with explicit user acknowledgment.
4. If no findings exist (zero items in Critical, Important, or Minor categories), the skill exits cleanly -- do not ask about `receiving-code-review`.
5. If the user declines both `receiving-code-review` and the direct-fix bypass, do not ignore findings. Ask the user to acknowledge the unresolved findings (e.g., "Proceed with known issues?" or "Defer fixes to a later session?"). No commit, summary, or next-task proposal may proceed until this acknowledgment is received. Document the decision.

Skipping the findings route gate is a process miss requiring recovery handling.

## Direct-Fix Bypass

The `direct-fix bypass` is an explicit user-selected alternative to the full `receiving-code-review` workflow for obvious trivial/mechanical findings.

Default behavior remains `receiving-code-review`. Do not present the bypass as the default.

The bypass is allowed only when ALL of these are true:

- The user explicitly chooses the bypass.
- The user names the exact finding IDs to fix.
- Each selected finding is obvious, localized, and non-behavioral.
- Each selected finding is trivial/mechanical, such as typo correction, formatting, simple import cleanup, or documentation wording.

Bypass eligibility is an objective rule-bound check only. The main agent may reject bypass eligibility when a selected finding violates the rules below, but must not decide that a finding is "valuable enough" or "not worth fixing" at this stage. If eligibility requires investigation or judgment, route the finding to `receiving-code-review`.

The bypass is forbidden for:

- Critical findings
- Important findings
- Security concerns
- Behavior changes
- Architecture or design changes
- Test logic or coverage changes
- Data handling, persistence, migrations, or compatibility
- Concurrency, async, or ordering concerns
- Any unclear finding
- Any finding whose correctness requires investigation or judgment

When using the bypass:

1. Apply only the explicitly selected trivial/mechanical fixes.
2. Run focused verification for the edited files.
3. Keep all non-selected findings visible as unresolved or deferred.
4. Do not claim the complete review was processed by `receiving-code-review`.
5. Before commit, summary, or next-task proposal, document which findings were fixed directly and which remain unresolved.

## When to Request Review

**Mandatory:**
- After each task in agent-driven development
- After completing major feature
- Before merge to main

**Optional but valuable:**
- When stuck (fresh perspective)
- Before refactoring (baseline check)
- After fixing complex bug

## Review Focus Determination (Mandatory Before Dispatch)

Before proceeding to Changeset Resolution, determine the review focus. This applies to ALL review types -- PR reviews, self-reviews, uncommitted work reviews, branch comparisons, etc. The review focus shapes what the reviewer prioritizes and directly affects review quality.

For user-initiated reviews (PR, explicit request), this step follows `clarify-requirements` (per `skill-runtime-policies` Rule 9). For self-reviews after agent tasks, the focus is inferred from the task context. Present the inferred focus to the user for confirmation -- this is a hard gate, not optional.

1. **Infer the review focus** from the change type and context. Different change types demand different scrutiny:
   - Security patch → attack surface, auth flows, input validation, secrets handling, dependency vulnerabilities
   - Bug fix → root cause correctness, regression risk, edge cases, test coverage for the fix
   - Feature implementation → requirements alignment, architecture soundness, extensibility, test coverage
   - Refactoring → behavior preservation, test coverage before/after, simplification metrics
   - Performance optimization → benchmark evidence, resource usage, correctness preservation
   - Migration/config → backward compatibility, rollback strategy, environment-specific concerns
   - Mixed purpose → combine relevant focus areas; if ambiguous, ask the user which aspect to prioritize

2. **Present the proposed focus** to the user via the question channel:
   - "Based on the changeset purpose (<inferred purpose>), I propose these review focus areas: <list>. Adjust or confirm?"
   - User may add, remove, or reprioritize focus areas.
   - If the user provides rich context upfront (e.g., "review this security patch, focus on auth flows"), the agent can present the inferred focus directly for confirmation without additional questions.

3. **User confirms** the review focus. This is a separate confirmation from the changeset summary (Step 5 of Changeset Resolution).

4. The confirmed review focus becomes part of the reviewer dispatch (included in `{DESCRIPTION}` and/or `{PLAN_OR_REQUIREMENTS}`).

## Changeset Resolution (Mandatory Before Dispatch)

Before dispatching the reviewer, the agent must resolve two questions: **what is the changeset** and **why is it being reviewed**. If either is wrong, the review is meaningless.

### Step 1: Detect Changeset Scenario

Infer the changeset source from the trigger condition, git state, and user request. Common scenarios:

| Scenario | Detection cues | Changeset extraction |
|----------|---------------|---------------------|
| Self-review after task | Agent just completed implementation | All commits since task started; use merge-base with the branch's upstream (e.g., `git merge-base origin/<upstream> HEAD`), not a hardcoded branch name |
| Uncommitted work | User says "review my changes", `git status` shows modifications | Default: include ALL local modifications -- `git diff` (unstaged) + `git diff --cached` (staged). If the user's intent clearly covers everything ("review my changes"), combine both without asking. Only escalate to "Mixed state" when signals conflict (see below). |
| Mixed state (conflicting signals) | User asks for a specific subset ("review what I staged") but `git status` shows both staged and unstaged changes, OR the same file has partial staging (hunks in index differ from worktree) | Ambiguous -- ask the user: review staged only, all modifications, or commit first? Partial staging (same file in both staged and unstaged) always triggers this ask. |
| Committed but unpushed | `git status` shows "ahead of origin" | `origin/<branch>..HEAD` |
| Explicit reference | User specifies a base (tag, branch, commit) | `git diff <user-specified-ref>..HEAD` or `git diff <ref-a>..<ref-b>` |
| PR URL | User provides a pull request URL | For Bitbucket Server PRs, follow `bitbucket-pr-reading.md` in this directory. For other platforms, fetch PR metadata, extract base branch and head branch/commit; for fork-based PRs, ensure the correct contributor remote/ref is fetched |
| Multi-PR set | User provides multiple PR URLs (co-related PRs from different repos/projects) | For Bitbucket Server, follow `bitbucket-pr-reading.md` Multi-PR Extraction section. For other platforms, apply the single-PR extraction per URL, then aggregate. Combined size assessment; almost always progressive mode |
| Subset of changes | User specifies a scope filter ("just review the auth changes") | Full changeset extraction as above, then filter the diff to the requested files/directories |

If the scenario is not clear from context, ask the user. Do not guess.

### Step 2: Extract the Changeset

Use the scenario-appropriate git commands to obtain the diff. When the changeset involves commits (not just working-directory changes), resolve concrete SHAs:

```
BASE_SHA = the starting point (before the changes)
HEAD_SHA = the ending point (after the changes)
```

For uncommitted work, SHAs are not applicable -- use `git diff` output for inline mode (small changesets), or provide the changed file list and let the reviewer read files on demand for progressive mode (see Context-Aware Review Mode below).

For Bitbucket Server PR URLs: follow the extraction procedure in `bitbucket-pr-reading.md` (this directory) -- all data comes from `bitbucket-mcp`, no local clone needed. For other platforms: locate the local clone, `git fetch` the PR branch if not available locally, then derive SHAs from the PR's base and head.

### Step 3: Determine Purpose

The changeset purpose shapes HOW the reviewer evaluates the code. A security fix demands different scrutiny than a refactoring.

Infer purpose from available context:
- Task description or plan step that triggered the review
- Commit messages in the changeset
- PR title and description (for PR reviews)
- User's stated intent

If purpose is not obvious from context, ask the user before proceeding. The question is: "What kind of change is this?" (feature, bug fix, refactoring, security fix, config change, migration, performance optimization, etc.)

If the determined purpose significantly differs from what was used during Review Focus Determination (e.g., clarification indicated a bug fix but commit messages reveal a security patch), revisit the review focus and re-confirm with the user before proceeding.

### Step 4: Produce Changeset Summary

Before dispatching the reviewer, produce a brief changeset summary:

```
Changeset source: <scenario from Step 1>
Base: <BASE_SHA or "working directory">
Head: <HEAD_SHA or "staged + unstaged changes">
Purpose: <one-line description of the changeset intent>
Scope: <N files changed, rough description of what areas are touched>
```

For multi-PR sets, use this extended format:
```
Changeset source: Multi-PR set (<N> PRs)
PRs:
  PR 1: <workspace>/<repo>#<id>, <destination> <- <source> (<N> files)
  PR 2: <workspace>/<repo>#<id>, <destination> <- <source> (<N> files)
Purpose: <combined or per-PR purpose>
Total scope: <total files> files across <N> repos
Cross-PR relationship: <how the PRs relate to each other>
```

This summary becomes input to the reviewer dispatch.

### Step 5: Validation Checkpoint

- **Self-review with clear context** (agent completed a task and knows exactly what changed): agent validates the summary internally and proceeds to dispatch.
- **User-initiated or ambiguous scope** (user asked for review, mixed git state, unclear base reference): show the changeset summary to the user via the question channel and get confirmation before dispatch.
- **Hard rule:** if the changeset cannot be determined (e.g., no changes found, conflicting signals), do NOT dispatch the reviewer. Ask the user to clarify.

### Context-Aware Review Mode

AI agents have limited context windows. Embedding a large diff inline in the reviewer's prompt degrades review quality well before the context actually overflows -- the reviewer loses the ability to hold cross-file patterns in working memory.

**Two-tier strategy** (applies to ALL changeset types -- self-review, uncommitted, branch comparison, PR, etc.):

**Inline mode** (default for small changesets): Embed the full diff in the reviewer's task prompt. The reviewer sees everything immediately and reviews in one pass.

**Progressive mode** (for larger changesets): Do NOT embed the full diff. Instead:
1. Run `git diff --stat` (or equivalent) to get the changed file list with line counts
2. Provide the reviewer with: file list, SHAs/refs, purpose, and instructions to read changed files on demand (using the Read tool for local changesets, or the appropriate platform MCP tools for remote PRs -- e.g., `bitbucket-mcp` for Bitbucket Server, see `bitbucket-pr-reading.md`)
3. The reviewer reads and reviews files progressively, prioritized by risk (security-sensitive > core logic > tests > peripheral/config). If categories overlap, prioritize the stricter one (e.g., security over core logic).
4. Group changed files by directory or module in the dispatch so the reviewer can assess scope at a glance
5. For non-text files (binaries, images, compiled assets): list them by path and type in the file list but do not attempt to embed or diff them. The reviewer should verify their presence and intent, not their content.

**When to switch:** Default threshold is at or above **~300 lines of diff or ~10 changed files** (whichever condition is met first). At or above both thresholds simultaneously always means progressive. This is a practical guideline, not a rigid gate -- use judgment:
- A 400-line diff concentrated in 2 files? Probably fine inline.
- A 200-line diff scattered across 12 files? Switch to progressive.
- Many files even with one dominant file (e.g., 1 large file + 10 small touch files): if file count exceeds the threshold, use progressive regardless of line distribution.
- If the current conversation is already long (heavy prior context consumption), bias toward progressive earlier than the static thresholds.
- When in doubt, use progressive mode. Conservative is cheaper than a degraded review.

**Resisting pressure to skip progressive mode:**
- Time pressure ("just review it quickly") does not change the quality argument. A degraded inline review of 500+ lines is worse than no review.
- "It's just documentation changes" -- line count and file count thresholds still apply. Doc refactors with many cross-references are not lighter for review purposes.
- Past success with larger inline diffs does not lower thresholds. Context and model behavior vary between sessions.
- If the user explicitly requests full inline embedding for a changeset that exceeds the threshold: explain the quality tradeoff, then follow the user's decision. If the user insists, document the override and focus the inline review on the highest-risk areas first.

**Very large changesets** (50+ files): Propose splitting the review itself -- by module, by change type (refactoring vs. new logic), or by priority area. Ask the user which split makes sense before dispatching. Each split sub-review follows the same inline/progressive rules based on its own size.

**Progressive mode dispatch example:**
```
[Changeset: 22 files, ~650 lines -- branch comparison against release-2.5]

[Dispatch code-reviewer agent]
  WHAT_WAS_IMPLEMENTED: Feature X + related test updates
  PLAN_OR_REQUIREMENTS: Spec from docs/plans/feature-x.md
  BASE_SHA: abc1234 (release-2.5 tag)
  HEAD_SHA: def5678 (current HEAD)
  DESCRIPTION: |
    22 files changed (~650 lines). Progressive review mode.
    Review priority: security-sensitive > core logic > tests > config.
    
    Changed files (grouped by module):
      src/auth/   -- login.ts (+85), session.ts (+42), middleware.ts (+30)
      src/api/    -- routes.ts (+120), handlers.ts (+95)
      src/models/ -- user.ts (+45), schema.ts (+20)
      tests/      -- auth.test.ts (+90), api.test.ts (+75)
      config/     -- settings.json (+8), deploy.yml (+5)
      docs/       -- api-reference.md (+35)
    
    For local changesets: use the Read tool to review each file on demand.
    For Bitbucket PRs: use bitbucket-mcp (get_pull_request_diff with file_path, get_file_content) -- see bitbucket-pr-reading.md.
    Do NOT expect the full diff inline -- read files on demand.
```

## PR Review Workflow

When triggered for reviewing someone else's PR:

1. Run Review Focus Determination (above) -- clarify context, infer focus, get user confirmation.
2. Apply the Changeset Resolution steps. For PRs specifically:
   - **Scenario**: PR URL
   - For Bitbucket Server: follow `bitbucket-pr-reading.md` (pre-flight check, URL parsing, phased data extraction via `bitbucket-mcp`)
   - **Extraction**: identify BASE (the PR's target branch as reported by the hosting platform -- not necessarily `main`) and HEAD (PR source branch head)
   - **Purpose**: derive from PR title, description, and commit messages; ask user if unclear
3. Use the `code-reviewer.md` template to structure the output.
4. Output language MUST match the user's input language.

## How to Request

**0. Determine review focus** (follow Review Focus Determination above).

**1. Resolve the changeset** (follow Changeset Resolution above).

**2. Dispatch code-reviewer agent:**

Dispatch the code-reviewer agent using checklist template `code-reviewer.md` in this directory. Per `skill-runtime-policies` Rule 3, load `subagent-context-rules` and prepend the behavioral contract to the Task prompt before dispatch.

**Placeholders:**
- `{WHAT_WAS_IMPLEMENTED}` - What was changed and why (from changeset purpose)
- `{PLAN_OR_REQUIREMENTS}` - What it should do (task description, plan step, PR description)
- `{BASE_SHA}` - Starting point (from changeset resolution)
- `{HEAD_SHA}` - Ending point (from changeset resolution)
- `{DESCRIPTION}` - Changeset summary from Step 4

**3. Route findings**:
- If any findings exist, present the complete findings set and use the Findings route gate from Exit Conditions.
- Do not pre-select fixes before `receiving-code-review`; evidence-based triage belongs there.
- Do not use shortcut wording such as "fix immediately" or "fix before proceeding" before the route gate. `receiving-code-review` safeguards govern unless the user explicitly chooses the `direct-fix bypass`.
- Use the `direct-fix bypass` only for user-selected trivial/mechanical findings that satisfy all bypass rules.
- Keep unresolved or deferred findings visible in the report.

## Examples

**Self-review after completing a task:**
```
[Just completed Task 2: Add verification function]

Review Focus Determination:
  Inferred focus: Feature implementation -> requirements alignment, architecture soundness, test coverage
  User confirmed: Yes

Changeset Resolution:
  Scenario: Self-review after task (agent completed implementation)
  Extraction: merge-base with upstream (replace 'main' with your branch's tracked upstream)
               BASE_SHA = $(git merge-base origin/<upstream> HEAD) -> a7981ec
               HEAD_SHA = current HEAD (3df7661)
  Purpose: New feature -- verification and repair functions
  Summary: 3 files changed (src/verify.ts, src/repair.ts, tests/verify.test.ts)

[Dispatch code-reviewer agent]
  WHAT_WAS_IMPLEMENTED: Verification and repair functions for conversation index
  PLAN_OR_REQUIREMENTS: Task 2 from docs/plans/deployment-plan.md
  BASE_SHA: a7981ec
  HEAD_SHA: 3df7661
  DESCRIPTION: New feature (focus: requirements alignment, architecture, test coverage): 3 files, added verifyIndex() and repairIndex()
```

**User asks to review uncommitted work:**
```
User: "Review my changes before I commit"

Review Focus Determination:
  Inferred focus: Bug fix -> root cause correctness, regression risk, edge cases, test coverage
  User confirmed: "Yes, also check thread safety" -> added concurrency focus
  Final focus: root cause correctness, regression risk, edge cases, test coverage, thread safety

Changeset Resolution:
  Scenario: Uncommitted work (git status shows modifications)
  Extraction: git diff + git diff --cached (both staged and unstaged)
  Purpose: [Asked user] -> Bug fix for payment timeout
  Summary: 2 files changed (src/payment.ts, src/timeout.ts), ~45 lines

[Dispatch code-reviewer agent]
  WHAT_WAS_IMPLEMENTED: Bug fix for payment timeout handling
  PLAN_OR_REQUIREMENTS: [From user clarification] Fix timeout race condition
  BASE_SHA: (working tree -- no commit reference; diff provided inline)
  HEAD_SHA: (staged + unstaged changes)
  DESCRIPTION: Bug fix (focus: root cause correctness, regression risk, thread safety): 2 files (~45 lines), payment timeout handling
  [Attach: git diff output as inline context for the reviewer]
```

**PR review from URL (Bitbucket Server):**
```
User: "Review this PR: https://git.medavis.local/projects/PLAY/repos/ris-app/pull-requests/45/overview"

Review Focus Determination:
  Context gathered (clarify-requirements): auth middleware refactoring, no security implications
  Inferred focus: Refactoring -> behavior preservation, test coverage before/after, simplification
  User confirmed: Yes

Changeset Resolution:
  Scenario: PR URL (Bitbucket Server -- follow bitbucket-pr-reading.md)
  Pre-flight: bitbucket-mcp available? Yes
  URL parsed: workspace=PLAY, repository=ris-app, pull_request_id=45
  Phase 1: get_pull_request -> 8 files changed, destination=develop, source=feature/auth-refactor
  Phase 2: 8 files < 10 threshold -> inline mode
  Phase 3a: get_pull_request_diff -> 180 lines of diff (< 300 threshold, confirmed inline)
  Phase 4: list_pr_commits -> 3 commits, messages indicate auth middleware refactoring
  Base: develop (PR target branch -- not always main)
  Head: feature/auth-refactor (PR source branch)
  Purpose: [From PR title + description] -> Refactoring authentication middleware
  Summary: 8 files changed across src/auth/

[Dispatch code-reviewer agent with diff inline, purpose, and review focus]
```

**Large PR review from URL (Bitbucket Server, progressive mode):**
```
User: "Review this PR: https://git.medavis.local/projects/NEXT/repos/core-framework/pull-requests/222/overview"

Changeset Resolution:
  Scenario: PR URL (Bitbucket Server -- follow bitbucket-pr-reading.md)
  Pre-flight: bitbucket-mcp available? Yes
  URL parsed: workspace=NEXT, repository=core-framework, pull_request_id=222
  Phase 1: get_pull_request -> 35 files changed, destination=develop, source=feature/order-redesign
  Phase 2: 35 files >= 10 threshold -> progressive mode
  Phase 3b: Skip full diff. Group file_changes by module.
  Phase 4: list_pr_commits -> 12 commits across 2 weeks
  Base: develop (PR target branch)
  Head: feature/order-redesign (PR source branch)
  Purpose: [From PR title + description] -> Redesign order processing pipeline
  Summary: 35 files changed across src/order/, src/api/, tests/

[Dispatch code-reviewer agent -- progressive mode]
  WHAT_WAS_IMPLEMENTED: Order processing pipeline redesign
  PLAN_OR_REQUIREMENTS: [From PR description]
  BASE: develop
  HEAD: feature/order-redesign
  DESCRIPTION: |
    35 files changed. Progressive review mode.
    Review priority: security-sensitive > core logic > tests > config.
    Bitbucket MCP params: workspace=NEXT, repository=core-framework, pull_request_id=222

    Changed files (grouped by module):
      src/order/  -- OrderService.java [M], OrderValidator.java [A], OrderMapper.java [M], ...
      src/api/    -- OrderController.java [M], OrderDTO.java [A], ...
      tests/      -- OrderServiceTest.java [M], OrderValidatorTest.java [A], ...
      config/     -- application.yml [M]

    Use bitbucket-mcp tools to review each file on demand:
      - get_pull_request_diff with file_path for per-file diffs
      - get_file_content with branch=feature/order-redesign for full file context
    Do NOT expect the full diff inline.
```

**Multi-PR review (co-related Bitbucket Server PRs):**
```
User: "Review these related PRs:
  https://git.medavis.local/projects/PLAY/repos/ris-app/pull-requests/45/overview
  https://git.medavis.local/projects/NEXT/repos/core-framework/pull-requests/222/overview
  https://git.medavis.local/projects/NEXT/repos/admin-app/pull-requests/340/overview"

Changeset Resolution:
  Scenario: Multi-PR set (3 Bitbucket Server PRs -- follow bitbucket-pr-reading.md Multi-PR Extraction)
  Pre-flight: bitbucket-mcp available? Yes
  URLs parsed: 3 valid PR URLs
  Phase 1 (each PR): get_pull_request -> PR 1: 5 files, PR 2: 20 files, PR 3: 10 files
  Combined assessment: 35 files total -> progressive mode
  Phase 4 (each PR): list_pr_commits
  Purpose: Feature X spanning auth, order processing, and admin UI
  Summary: 35 files across 3 repos

[Dispatch code-reviewer agent -- progressive mode, multi-PR]
  (see bitbucket-pr-reading.md for dispatch payload format)
```

## Integration with Workflows

**Agent-Driven Development:**
- Review after EACH task
- Catch issues before they compound
- Resolve the findings route gate before moving to the next task; keep any deferred findings visible

**Executing Plans:**
- Review after each batch (3 tasks)
- Get feedback, apply, continue

**Ad-Hoc Development:**
- Review before merge
- Review when stuck

## Design Context and Test Coverage (Guidance, Non-Blocking)

For large implementations or newly introduced logic, reviewers should ask for:

- Related design documents, specs, or requirements that describe the intended behavior
- Corresponding test cases (happy path, edge cases, failure behavior)

This is guidance for review quality improvement only.
It is not a hard gate and must not block progress by itself.

## Red Flags

**Never:**
- Skip review because "it's simple"
- Skip or defer review due to context window limits or token constraints
- Skip review focus determination because "the focus is obvious"
- Ignore Critical issues
- Proceed past Important findings without routing them through the findings route gate, `receiving-code-review`, or explicit defer acknowledgment
- Argue with valid technical feedback

**If reviewer wrong:**
- Push back with technical reasoning
- Show code/tests that prove it works
- Request clarification

See template at: `code-reviewer.md`
See Bitbucket PR reading guide at: `bitbucket-pr-reading.md`
