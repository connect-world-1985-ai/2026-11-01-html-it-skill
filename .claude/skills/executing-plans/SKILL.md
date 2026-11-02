---
name: executing-plans
description: Use when asked to execute an implementation plan, or when asked to implement a feature and a written plan already exists — supports one-at-a-time or batch execution with review checkpoints
---

# Executing Plans

## Overview

Load plan, review critically, execute tasks (one at a time or in batches), report for review between tasks.

**Core principle:** Structured execution with checkpoints for review.

## The Process

### Step 1: Load and Review Plan
1. Read plan file
2. Review critically - identify any questions or concerns about the plan
3. If concerns: Raise them with your human partner before starting
4. If no concerns: Create a task list and proceed

### Step 2: Execute

Ask the user for execution preference:
- **One at a time** — execute a single task, report, get feedback before the next
- **Batch** — execute 3 tasks at once, report, get feedback before the next batch

For each task:
1. Mark as in_progress
2. Follow each step exactly (plan has bite-sized steps)
3. Run verifications as specified
4. Mark as completed

### Step 3: Report
When task or batch is complete:
- Show what was implemented
- Show verification output
- Evaluate per `skill-runtime-policies` Rule 8 whether to trigger `requesting-code-review` before proceeding to the next task or batch
- Say: "Ready for feedback."

### Step 4: Continue
Based on feedback:
- Apply changes if needed
- Execute next task or batch
- Repeat until complete

### Step 5: Complete

After all tasks are complete:
- Run the full test suite to confirm no regressions
- Before claiming completion, verify per `verification-before-completion`: fresh evidence (test output, exit code) must support the claim. No "should pass" or "looks correct."
- Summarize what was implemented and any deviations from the plan
- Inform the user: **"All tasks complete and verified. Ready for your review."**
- After reporting completion, evaluate per `skill-runtime-policies` Rule 8 whether to trigger `requesting-code-review`

## When to Stop and Ask for Help

**STOP executing immediately when:**
- Hit a blocker mid-task (missing dependency, test fails, instruction unclear)
- Plan has critical gaps preventing starting
- You don't understand an instruction
- Verification fails repeatedly

**Ask for clarification rather than guessing.**

## When to Revisit Earlier Steps

**Return to Review (Step 1) when:**
- Partner updates the plan based on your feedback
- Fundamental approach needs rethinking

**Don't force through blockers** - stop and ask.

## Remember
- Review plan critically first
- Follow plan steps exactly
- Don't skip verifications
- Follow any documentation or guidelines referenced in the plan
- Between tasks or batches: just report and wait
- Stop when blocked, don't guess
- Never start implementation on main/master branch without explicit user consent
