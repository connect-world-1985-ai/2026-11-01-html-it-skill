---
name: clarify-requirements
description: >-
  Use when about to start any task -- creating, modifying, debugging,
  reviewing, or any work. Ensures understanding is confirmed before execution.
---
# Clarify Requirements

Ensure the agent fully understands what the user wants before doing anything.

> **Do NOT proceed to any execution until the user explicitly confirms
> your understanding is correct.**

## Process

### Step 1: Assess

- Read the user's request
- Explore relevant project context (files, docs, recent changes)
- Identify what is clear vs. what is ambiguous or assumed
- Map gaps to the four dimensions: intent/goal/context, scope, success
  criteria, constraints

### Step 2: Ask

- Ask clarifying questions one at a time via the question channel
- Questions are AI-adaptive: based on THIS request's gaps, not a fixed
  checklist
- Cover all four dimensions where gaps exist:
  1. **Intent, goal & context** -- What does the user want? Why? What
     triggered this? What's been tried?
  2. **Scope & boundaries** -- What's in vs. out? What must not change?
  3. **Success criteria** -- How will the user judge correctness/completeness?
  4. **Constraints** -- Technical preferences, conventions, limitations?
- Number of question rounds decided by AI based on complexity
- Infer from context when possible -- only ask what's genuinely unclear
- Stop asking when the agent believes it has full understanding

### Step 3: Mirror Back

Present a structured understanding summary to the user via the question
channel:

**Intent, goal & context**: <what the user wants, why, what triggered it,
what's been tried>
**Scope**: <what's in/out of scope>
**Success criteria**: <how correctness/completeness is judged>
**Constraints**: <technical preferences, conventions, limitations>

State your confidence and the parts you are least sure of.

End with: "Is this understanding correct?"

### Step 4: Confirm (HARD GATE)

- User must explicitly confirm the summary is correct
- If user says no or provides corrections -> loop back to Step 2
- If user confirms -> skill completes, hand off to the next skill/task
- The agent MUST NOT proceed to any execution until this step passes

## Hard Gate

Do NOT proceed to any execution (code edits, file creation, commands,
subagent dispatch, or any implementation action) until Step 4 passes.
This applies to EVERY task regardless of perceived simplicity.

## Anti-Pattern: "This Is Too Simple To Clarify"

Every task goes through this process. A one-line fix, a config change,
a rename -- all of them. "Simple" tasks are where unexamined assumptions
cause the most wasted work. The clarification can be brief (one question
for a truly simple task), but the Mirror Back and Confirm steps are
non-negotiable.

## Anti-Pattern: "I Already Know What They Want"

Inference is not confirmation. Even if the request seems crystal clear,
the agent must still Mirror Back its understanding and get explicit
confirmation. The purpose is not to gather missing info -- it is to let
the user validate the agent's interpretation.

## Question Format

All questions MUST:
- Use `### Question N:` heading format
- Provide A/B/C/D options (one per line)
- Include "Other (please specify)" when applicable
- Carry decision support (`interactive-clarification` -> Decision Support):
  your recommendation or best guess, or why it is neutral
- Be delivered through the question channel
- Ask one question per round

## Question Channel

All user-facing interaction in this skill uses the question channel (see
`interactive-clarification` -> Question Channel and `global_rules.txt`).

## Integration with Other Skills

This skill complements domain-specific skills. After this skill completes
(Step 4 confirmed), the domain skill may still ask its own domain-specific
questions. This skill handles the general understanding; domain skills
handle domain details.

## Autonomous Mode

When this session's autonomous mode selection is on (`skill-runtime-policies` -> Autonomous Mode), this skill is the fixed start of an autonomous run; say so when you start. The bar is higher, because you will not come back to ask.

- **Step 2 also covers** how deep and thorough the user wants the work, what "done" and "good" mean, what must not change, and which deliverables to produce (tests, docs, README, version bump, ...). When any of these is open, your first question is about it, before details such as formats or options: it sets the bar for the whole run.
- **Look ahead.** Predict the forks the run will meet. Ask about those where the user's preference matters; decide the rest yourself.
- **Step 3 has three parts:** your understanding (the four fields); **Decisions I will make myself**, each with your current leaning; and **What I will not do**.
- Still one question per round. Step 4 is unchanged: an explicit yes. After it, the run starts; there is no handoff confirmation.

## Handoff

When Step 4 passes:
- The agent's context now contains a confirmed understanding, which serves as the implicit contract between user and agent for this task.
- The confirmed understanding may be persisted to a memory file — this is offered by `managing-session-memory` at clarification completion; do not duplicate that mechanism here.
- **The next phase is `brainstorming`** (the solution-finding phase), whatever the task produces. Confirmed understanding (the WHAT) is not a substitute for design exploration (the HOW). Per `skill-runtime-policies` Rule 9b the routing is deterministic — there is no creative-vs-mechanical judgment — and the only skips are the ones listed there; when one applies, say so in one line with the reason. Per Rule 7 the agent still names `brainstorming` and gets the user's confirmation before transitioning. `brainstorming` scales to the task and, for bugs, triggers `systematic-debugging` to diagnose.
- In autonomous mode, the confirmed understanding starts the autonomous run directly (`skill-runtime-policies` -> Autonomous Mode); there is no `brainstorming` confirmation.

## Scope

- Applies to: main agent only
- Subagents do NOT trigger this skill
- This skill does NOT govern session-wide behavior
- This skill focuses solely on: assess -> ask -> mirror -> confirm
