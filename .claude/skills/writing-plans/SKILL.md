---
name: writing-plans
description: Use when asked to write an implementation plan, or when asked to implement a spec or requirements for a multi-step task but no implementation plan exists yet — always plan before coding
---

# Writing Plans

## Overview

Write comprehensive implementation plans assuming the engineer has zero context for our codebase and questionable taste. Document everything they need to know: which files to touch for each task, code, testing, docs they might need to check, how to test it. Give them the whole plan as bite-sized tasks. DRY. YAGNI. TDD.

Assume they are a skilled developer, but know almost nothing about our toolset or problem domain. Assume they don't know good test design very well.

**Context:** Best run in an isolated environment (feature branch, worktree, or dedicated workspace).

**Save plans to:** `docs/plans/YYYY-MM-DD-<feature-name>.md`

## Plan Modes

A plan is written in one of two modes:

- **Standard** (default) — the plan will be executed in the *same* session by the same agent that holds the surrounding conversation context. This is the normal mode; everything below applies as written.
- **Handoff (self-contained)** — the plan will be executed by a *different* agent in a *new* session (for example, a cheaper model running the work later). The executor has **zero session context**, so the plan must carry everything itself. See **Handoff Mode (Self-Contained)** below for the extra requirements.

**Choosing the mode:**
- When reached from the `brainstorming` Handoff, the mode is chosen there.
- When `writing-plans` is entered directly, honor an explicit signal in the request ("handoff", "for another session/agent", "cheaper model", "self-contained") without asking; otherwise ask once via the question channel: "Standard or Handoff (self-contained) plan?"

Handoff mode is **opt-in** — do not apply it to standard same-session plans; it exists to avoid bloating them.

## Bite-Sized Task Granularity

**Each step is one action (2-5 minutes):**
- "Write the failing test" - step
- "Run it to make sure it fails" - step
- "Implement the minimal code to make the test pass" - step
- "Run the tests and make sure they pass" - step

## Plan Document Header

**Every plan MUST start with this header:**

```markdown
# [Feature Name] Implementation Plan

> **For the implementing agent:** Follow this plan task-by-task. Complete each step, verify it works, then move to the next.

**Goal:** [One sentence describing what this builds]

**Architecture:** [2-3 sentences about approach]

**Tech Stack:** [Key technologies/libraries]

---
```

## Task Structure

````markdown
### Task N: [Component Name]

**Files:**
- Create: `exact/path/to/file.py`
- Modify: `exact/path/to/existing.py:123-145`
- Test: `tests/exact/path/to/test.py`

**Step 1: Write the failing test**

```python
def test_specific_behavior():
    result = function(input)
    assert result == expected
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/path/test.py::test_name -v`
Expected: FAIL with "function not defined"

**Step 3: Write minimal implementation**

```python
def function(input):
    return expected
```

**Step 4: Run test to verify it passes**

Run: `pytest tests/path/test.py::test_name -v`
Expected: PASS

````

## Remember
- Exact file paths always
- Complete code in plan (not "add validation")
- Exact commands with expected output
- Reference relevant documentation or guidelines when applicable
- DRY, YAGNI, TDD

## Skill Deliverable Plans

When a plan creates, edits, or verifies a skill (`SKILL.md`, `production/skills/...`, personal `skills/...`, or agent-skill documentation), the plan MUST treat `writing-skills` as a required reference. Do not duplicate all of `writing-skills`; translate its requirements into executable plan tasks.

A skill deliverable plan MUST include:

1. **RED / baseline evidence** -- create pressure scenarios before editing the skill, run them without the new or changed skill behavior, and document the agent's failures and rationalizations verbatim.
2. **GREEN / minimal skill change** -- write only the skill content needed to address observed baseline failures. Include exact frontmatter, structure changes, and any supporting files. Spell out ASO checks as executable plan steps: skill name validity, description trigger quality, keyword coverage, third-person wording, and no workflow summary in the description.
3. **VERIFY GREEN** -- rerun the same pressure scenarios with the skill available and record evidence that the agent now complies.
4. **REFACTOR / loophole closure** -- capture any new rationalizations, add explicit counters or red flags when applicable, and rerun verification until the scenario stays green.
5. **Repository verification** -- include project-specific checks such as README impact, version bump impact, drift/sync checks, and "do not run install/uninstall scripts" guardrails when relevant.

For handoff mode, embed the skill-specific context needed by a fresh executor: the relevant `writing-skills` checklist items, pressure scenario prompts, accepted decisions, and verification commands. Do not rely on prior chat context.

## Handoff Mode (Self-Contained)

Use this mode **only** when the plan will be executed by a different agent in a new session (see **Plan Modes**). It layers the following on top of the normal plan structure above — the base header and task structure are unchanged.

When in handoff mode, the plan ALSO includes:

1. **Self-contained header note** — immediately after the plan header, state that the plan is SELF-CONTAINED: the executor needs no prior chat session or memory file and must not ask the user to re-explain context; all task context lives in the plan. Normal session-start rules still apply, but the executor may start fresh and rely on the plan.

2. **Section 0: Full Context** — placed after the header note and before Task 1. Include the subsections that apply (omit those that don't):
   - **0.1 Why / background** — the motivation and the problem being solved.
   - **0.2 Confirmed decisions** — authoritative; mark them "do not re-litigate". Include the rationale and the rejected alternatives so the executor doesn't reopen settled choices.
   - **0.3 Audience & assumptions** — who runs this, and what is assumed about the environment.
   - **0.4 Project rules / conventions to honor** — repo governance the executor must follow (version bumps, parity checks, etc.).
   - **0.5 Formats & reference material** — any formats, schemas, or examples the tasks depend on.

3. **Embed, don't reference** — any external spec, doc, or source file the tasks rely on must be embedded inline or as an **Appendix** (Appendix A, B, ...). A fresh session cannot follow links or recall material that only existed in the planning conversation.

4. **Acceptance / Verification Summary** — an explicit end-state checklist the executor can self-check against once all tasks are done.

5. **Companion execute prompt** — generate a separate file `docs/plans/YYYY-MM-DD-<feature-name>-PROMPT-execute.md` the user can paste into the new session to start execution. Use this template:

```
Execute the implementation plan at `docs/plans/<plan-file>.md` in this repository (`<repo-root>`).

The plan is fully SELF-CONTAINED: it carries every decision, convention, project rule, and
verification step you need. You do NOT need any prior chat session or memory file, and you do
NOT need me to re-explain anything — start fresh and rely on the plan.

Please:
1. Read the entire plan first (especially Section 0 "Full Context" and any appendices).
2. Execute it task-by-task. If you have the `executing-plans` skill available, use it to drive
   the execution; otherwise just follow the tasks in order. After each task, run the verification
   it specifies.
3. The end state must satisfy the plan's "Verification Summary" / acceptance checklist.
4. <hard guardrails for this task — e.g. do NOT run install/deploy scripts; do NOT commit unless I ask>.
5. When done and verification is green, report results and offer a code review.

If something is genuinely ambiguous or you hit a blocker, ask via the question channel; otherwise
proceed autonomously through the whole plan.
```

Fill the `<...>` placeholders from the actual plan (file name, repo root, task-specific guardrails). Keep the prompt short — it points at the plan, it does not duplicate it.

## After the Plan

Once the plan is saved, present routing options via the question channel. In **handoff mode**, two files are saved — the plan and its `-PROMPT-execute.md` companion — so mention both:

```
Plan saved to `docs/plans/<filename>.md`.
(Handoff mode: also `docs/plans/<filename>-PROMPT-execute.md` — paste this into the new session to start execution.)

### Question N: What's next?

- **A)** The agent critically reviews the plan first — via `think-mcp` (`sequentialthinking`) if available, otherwise the agent's own structured reasoning
- **B)** Execute the plan now (`executing-plans`)
- **C)** You review the plan yourself first — the agent waits for your feedback
- **D)** Defer — save for later and switch to another task

### Question N+1: Update memory file with the plan?

- **A)** Yes
- **B)** No, proceed without updating
```

**Rules:**
- The memory file question is bundled in the same interaction — not a separate call.
- **A (agent reviews):** First state which method is being used — `think-mcp` (`sequentialthinking`) if available, otherwise the agent's own structured reasoning. Run the critical review, present the findings (risks, gaps, suggestions), then re-offer these routing options.
- **B (execute):** trigger `executing-plans`.
- **Handoff mode:** execution is normally done by the *other* agent in a new session — the user pastes the `-PROMPT-execute.md` companion there. The user may still pick B to execute in the current session.
- **C (you review):** stop and wait for the user. Do not analyze the plan in the user's place. When the user returns with feedback, incorporate it, revise the plan if needed, then re-offer these routing options.
- **D (defer):** acknowledge and return to normal flow.
- Per `skill-runtime-policies` Rule 7, name the target skill explicitly when proposing the transition.
