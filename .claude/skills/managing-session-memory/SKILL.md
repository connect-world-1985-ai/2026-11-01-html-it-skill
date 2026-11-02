---
name: managing-session-memory
description: >
  Use when starting a new chat session, ending a session, or at any
  workflow checkpoint where session context should be persisted or
  loaded. Covers the full memory file lifecycle including creation,
  reading, updating, and session-end gates.
---

# Managing Session Memory

## Overview

Session memory files are the AI agent's notebook -- persistent context that survives across sessions. They prevent the next session from wasting tokens and time rediscovering decisions, discoveries, and state that the previous session already established.

The filter question for every memory file entry: *"If the next AI session doesn't have this, how many tokens/minutes will it waste rediscovering it?"*

## Scope

- **Applies to: main agent only.** Subagents do not manage memory files.

## File Convention

- **Path**: `<memory_location>/docs/memory/memory-YYYYMMDD-<topic>.md`, where `<memory_location>` is this session's memory location (see Memory Location)
  - `YYYYMMDD`: current date for chronological file ordering
  - `<topic>`: AI determines a concise kebab-case slug reflecting the primary subject (e.g., `auth-migration`, `skill-consolidation`, `install-scripts`)
- This file is the authoritative memory file for continuation.

## Companion Folder

When a session produces knowledge artifacts that are too large or too detailed for inline inclusion in the memory file, persist them in a **companion folder**.

- **Naming**: strip `.md` from the memory filename. Example: memory file `memory-20260418-payment-refactor.md` gets companion folder `memory-20260418-payment-refactor/`.
- **Location**: same `<memory_location>/docs/memory/` directory, alongside the memory file.
- **What belongs here**: any artifact the agent judges as expensive to recreate in a future session -- architecture diagrams (Mermaid, ASCII), class diagrams, code analysis documents, design comparison tables, sequence diagrams, dependency graphs, refactoring plans with detailed rationale, or any other structured knowledge produced during the session.
- **Creation**: only when needed. Most sessions do not produce heavy artifacts and will not have a companion folder. If it fits comfortably in normal memory sections, keep it in the memory file -- do not create a companion folder for content that works as inline bullets. Do not substitute companion-eligible artifacts (diagrams, detailed analyses, multi-paragraph rationale) with summary bullets only -- summaries in the memory file are additive, not a replacement for the full artifact.
- **Linking**: reference companion folder artifacts inline in the relevant memory file section (so the next session sees WHY the artifact matters in context), and also list them in the References section for discoverability. Both inline and References listing are required -- not either/or.
  ```
  ## Key Discoveries

  - PaymentService uses a layered adapter pattern with 3 abstraction levels
    (see detailed class diagram: `./memory-20260418-payment-refactor/payment-class-diagram.md`)

  ## References

  - `./memory-20260418-payment-refactor/payment-class-diagram.md` -- class hierarchy diagram
  ```
- **Lifecycle**: the companion folder inherits the memory file's identity. No separate cleanup, archival, or naming rules. If the memory file is deleted, the folder can be deleted with it.
- **Update policy**: companion folder artifacts follow the same filter question as the memory file -- *"if the next session doesn't have this, how many tokens/minutes will it waste recreating it?"* Replace or update artifacts as the understanding evolves; do not version individual artifact files.

## Memory Location

A workspace can have several folders that could hold `docs/memory/`: several workspace roots, active working directories, or a linked worktree. This session's memory location is the one root whose `docs/memory/` this session reads and writes. Decide it in this order. Once this session has created a memory file, the memory location stays that file's root for the rest of the session:

1. **A skill fixes the place.** For example, `working-with-linked-worktrees` records a topic session in its linked worktree. That rule wins, also over the root of a file loaded at startup, until this session creates a memory file (Session Selections, rule 5).
2. **A memory file was loaded at startup.** The location is the root that file came from.
3. **Only one candidate root.** That root.
4. **Otherwise, ask once.** Right before the first memory file of this session is created, ask via the question channel which root to use. List every candidate root and recommend the one where this work's edits happen.

Candidate roots are the workspace roots plus the active working directories (`## Working directories`). With a single candidate root, never ask. Carry the memory location through context compaction with the session selections (Session Selections, rule 6).

## Session Selections

Some commands and skills record a choice the user confirmed that governs the rest of the session:

| Selection | Memory-file block | Set by |
|---|---|---|
| Device mode | `## Device mode` | `switch-device-mode` |
| Working directories | `## Working directories` | `pick-working-directories` |
| Autonomous mode | `## Autonomous mode` | `switch-autonomous-mode` |
| Worktree role and integration branch | `## Worktree role` | `working-with-linked-worktrees` |
| Open worktree cleanup | Remaining cleanup entries | `working-with-linked-worktrees` |

The command or skill defines its block's format. These rules decide when and where a block is written. One exception: a Remaining cleanup entry is never written into a memory file inside a linked worktree; it stays held (`working-with-linked-worktrees` -> Remaining cleanup).

1. **Critical state.** A confirmed selection governs the rest of the session. Keep acting on it until the user changes it.
2. **This session has a memory file:** write or replace the block in that file right away (for Remaining cleanup, update that topic's entry). Do not ask first.
3. **No memory file yet:** hold the selection in context and say once: "Held for this session; it will be written when a memory file is created." Never create a memory file, and never offer to create one, because of a selection. Confirming a selection is not a decision event for the memory checkpoint, and running a selection command or skill triggers no memory offer (Lifecycle > Updating, Session selection exemptions).
4. **A memory file is created later** through the normal lifecycle: write every held selection into it when it is created.
5. **This session's memory file** is the file loaded at startup or created in this session, under this session's memory location. A memory file created in this session stays this session's memory file, and its root stays the memory location, even if a skill later fixes a different place. A loaded file outside the memory location (for example after a skill fixed the place) is reference only. If the user said this work gets a new memory file, the loaded file is also reference only. When a loaded file becomes reference only, its `## Device mode` and `## Working directories` blocks carry over as held selections (rule 3), and so does its `## Autonomous mode` block; its Worktree role and Remaining cleanup entries stay in that file. Until this session has a memory file, hold selections, and never write them into a reference-only file.
6. **Keep selections through compaction.** Every context compaction, summary, or handoff of this session carries a `Session selections` list: each selection's current value, whether it is written or held, and the memory location. After compaction, re-read the blocks from this session's memory file when one exists; otherwise use the carried list.
7. **End of session.** At the Termination Gate, name every held selection and every open Remaining cleanup entry that is not yet written. If the user declines the memory file, say they will be lost. Name a Remaining cleanup entry that this session's memory file cannot hold (a file inside a linked worktree) as lost either way; the leftover scan finds those leftovers from git later.

## Lifecycle

### 1. Loading (New Chat Start)

When a new chat starts for the same project:

1. List memory files matching `memory-*.md` under `docs/memory/` in every candidate root (see Memory Location; at startup, every workspace root), sorted by date descending (newest first) across all roots combined
2. Present the 5 most recent files to the user via the question channel (a selection question), using the standard question format. Label each option with the folder it lives in. Show 5 even when there is only one candidate root. If this memory selection is the first user-visible interaction of the session, prefix the prompt with the required `Question channel: <channel-name>` anchor line:

   ### Question 1: Which memory file should I load?

   - **A)** `memory-YYYYMMDD-<topic>.md` (in `<root>`) (newest)
   - **B)** `memory-YYYYMMDD-<topic>.md` (in `<root>`)
   - **C)** `memory-YYYYMMDD-<topic>.md` (in `<root>`)
   - **D)** `memory-YYYYMMDD-<topic>.md` (in `<root>`)
   - **E)** `memory-YYYYMMDD-<topic>.md` (in `<root>`)
   - **F)** No memory load needed -- start fresh

   If fewer than 5 files exist, list all available files plus the "start fresh" option.
   If no memory files exist, skip the selection and proceed as if "start fresh" was selected; in that case the `Question channel:` anchor line attaches to the first actual reply instead (per `global_rules.txt` -> Question Channel).
   Always run this full choice step; do not infer the selection from the user's first message or topic wording.
3. Load the selected file as the starting context baseline. Its root becomes this session's memory location (see Memory Location)
4. If the user selects "start fresh" or no memory files exist, proceed without loading any memory file
5. If anything in the loaded file is unclear or outdated, re-run clarification until 100% understanding
6. Update or create a new memory file after re-confirmation

### 2. Writing (Initial Creation)

Create a memory file when:
- The clarification process completes and the user confirms understanding (write to `<memory_location>/docs/memory/`; see Memory Location)
- A new topic or task begins that has no existing memory file

A confirmed session selection is never by itself a reason to create a memory file. When a memory file is created, write every held session selection into it (see Session Selections).

### 3. Updating (Event-Based Checkpoints)

Offer to write or update the memory file when **any** of the following event types occur:

**Decision events** -- the user makes a key choice:
- Approves or rejects a plan, approach, or alternative
- Changes direction, scope, or constraints mid-task
- Resolves an ambiguity or confirms a requirement

Session selections are exempt; see Session selection exemptions below.

**Task completion events** -- a unit of work finishes:
- Plan execution completes (all tasks done)
- Code review completes (including applying fixes)
- Debugging investigation reaches root cause
- A feature, bug fix, or refactoring unit is complete

**Workflow transition events** -- the session moves to a new phase:
- Before proposing a commit or PR
- Before switching to a different task
- Transition from planning to implementation (or vice versa)

**Discovery events** -- something unexpected is found:
- An unexpected behavior, limitation, or anomaly is identified
- A bug or error changes the understanding of the problem

**Accumulation fallback** (mechanical, not judgment-based):
- 3 or more question-channel interactions have been made since the last memory checkpoint offer (selection-command questions excepted; see Session selection exemptions)

**Session selection exemptions** (these apply whether or not this session has a memory file):
- Confirming a session selection (device mode, working directories, autonomous mode, worktree role, open worktree cleanup) is not a decision event.
- Questions asked while running a command or skill from the Session Selections table (its menus, confirmations, and the selection itself) do not count toward the accumulation fallback.
- That command's or skill's bookkeeping steps trigger no checkpoint event of any type (task completion, workflow transition, discovery, or reporting their result): choosing the role, creating a worktree, a merge, a finish choice and the Finish this topic steps, a leftover scan, and editing the saved list.
- Work the user asks for before, between, or after those steps keeps every checkpoint trigger, including resolving merge conflicts and any action the user names under Something else.

**Autonomous mode** (`skill-runtime-policies` -> Autonomous Mode): while it is on, make no memory offers during a run. Write or update this session's memory file yourself when it helps, and create one when the work is worth keeping (never only to store a selection). The delivery report goes in its companion folder.

**Checkpoint procedure:**

1. Offer in chat (plain-chat memory offer): propose writing or updating the memory file.
2. If user **accepts**: write or update the file, then continue with the current task.
3. If user **declines**: continue with the current task. The offer MUST have been made.

This checkpoint is NOT a session-ending action. After writing/updating, resume the task in progress. Only the Termination Gate (Lifecycle > 4) ends the session.

**How to make the offer:** Append the memory offer to your next chat reply (or as an extra option in the next selection question), before any further task execution or user-visible output. Do NOT defer the offer or make a separate dedicated round. For example, when reporting code review results, add: `### Question N: Memory file may need updating -- shall I update it before proceeding?` This avoids adding extra interaction rounds while ensuring the offer is always made.

**Simultaneous events:** When multiple event types occur at the same moment (e.g., code review completes AND a commit is about to be proposed), a single memory file offer satisfies all overlapping events. Do not offer multiple times for the same moment.

### 4. Termination Gate

When user intent indicates ending the working session or switching away from this project (including explicit "end", "no more interaction needed", or "let's stop here"), enforce this order. Brief absences ("let me take a break", "brb", "need to step away") are NOT termination intent -- if ambiguous, ask a disambiguation question before triggering the gate.

1. Ask whether to write `<memory_location>/docs/memory/memory-YYYYMMDD-<topic>.md` (AI determines a concise topic slug; see Memory Location). Name every held session selection and open Remaining cleanup entry in that question, and say they will be lost if the user declines (Session Selections, rule 7)
2. Write it only if user confirms, including every held session selection
3. Send termination acknowledgment only after steps 1-2 are completed (or explicitly declined)

Hard rule:

- Termination intent is NOT a bypass for memory-file pre-check.
- Do not directly end the conversation before the memory-file decision is captured.

## Update Policy

### When to CREATE a new file
- A new topic/task begins that has no existing memory file
- The topic is substantially different from any existing memory file

### When to UPDATE an existing file
- The current work relates to the same topic as an existing memory file
- Same topic, even across sessions -- update the existing file
- Keep the original filename (creation date stays); add or update `**Last updated**: <date>` inside the file header

### Section-level update strategy

| Section | Strategy | Rationale |
|---------|----------|-----------|
| Goal & Scope | Overwrite | Latest framing matters |
| Key Decisions | Accumulate | Decisions are historical facts |
| Confirmed Assumptions | Accumulate | Grows as more gets confirmed |
| Constraints & Non-Goals | Overwrite | Current constraints matter |
| Key Discoveries | Accumulate | Discoveries don't expire |
| Runtime Evidence | Replace | Session-specific |
| Open Risks | Replace | Current risks only |
| Current State | Overwrite | Latest snapshot only |
| Next Steps | Overwrite | Latest action items only |
| Notes for Next Session | Replace | Ephemeral by definition |
| References | Overwrite | Current relevant files |

**Accumulate** = append new entries, keep existing ones. Never remove a previous decision or discovery.
**Overwrite** = replace with current state. Only the latest version matters.
**Replace** = clear and rewrite. Previous content was session-specific and is no longer relevant.

### Correction pattern

When a previous decision is reversed or a mistake is corrected, record it in Key Decisions using:

```
N. **Reversed: <original decision>**: <what went wrong and why it was changed>
```

This preserves the full chain (original decision -> discovery -> correction) so future sessions avoid repeating the same mistake.

### Cleanup

- Memory file cleanup is manual. The agent does not delete, archive, or move memory files or their companion folders.
- When `docs/memory/` contains many files, the loading procedure (Lifecycle > Loading) already limits display to the 5 most recent. Older files remain available but are not shown by default.

## Content Requirements

Prioritize content by context density. Capture conclusions, not process; reference file paths, not full contents.

### Priority Tiers

- **High priority (always include):**
  - User decisions and feedback (choices, approvals, redirections) with rationale and rejected alternatives
  - Current state (done/pending/blocked)
  - Relevant file paths with one-line descriptions
  - Key discoveries and technical insights -- architecture patterns, design understanding, codebase structure knowledge, anomalies, non-obvious facts
  - User preferences that shape interaction
- **Medium priority (include when available):**
  - Critical error messages and command outputs
  - Next steps as specific actionable items
  - Knowledge artifacts in companion folder (diagrams, detailed analyses, design documents) when they would be expensive to recreate
- The filter question applies to everything: *anything expensive to rediscover is a good candidate.* The memory file itself should stay lean; use the companion folder for detailed artifacts.

### Detail Level Guidance

- **High detail**: Critical decisions, architectural choices, security-related constraints, design patterns and codebase structure understanding
- **Medium detail**: Standard requirements, configuration choices
- **Low detail**: Minor clarifications, obvious assumptions

When high-detail content (architecture descriptions, design analysis, diagrams) is too large for inline inclusion, move it to the companion folder and link from the memory file. This keeps the memory file lean while preserving the full depth of knowledge.

## Template

Use this as a flexible template. **Always include** sections marked required. Include optional sections only when they have meaningful content.

```markdown
# Memory: <Topic Title>

**Generated**: <date and time>
**Last updated**: <date and time>
**Project**: <project path>
**Focus**: <one-line description of what this context covers>

---

## Goal & Scope (required)

<What the user wants to accomplish, background context, constraints>

---

## Key Decisions (required)

<Decisions made and their rationale -- focus on "why", not just "what".
Include rejected alternatives so the next session doesn't re-propose them.>

1. **<Decision>**: <Rationale>
2. **Rejected: <Alternative>**: <Why it was declined>

---

## Confirmed Assumptions (required)

<Assumptions confirmed by the user -- things the AI should NOT re-ask>

- <Assumption>

---

## Constraints & Non-Goals (include when relevant)

<What is explicitly out of scope or restricted>

- <Constraint>

---

## Key Discoveries (required)

<Technical knowledge expensive to recreate -- not limited to anomalies or surprises.
Includes: architecture patterns, design insights, codebase structure understanding,
module boundaries, recurring design patterns, anomalies, surprising findings,
non-obvious facts, boundary conditions. Link companion folder artifacts inline
when details are too large for a bullet point.>

- <Discovery or insight>
- <Discovery with linked artifact> (see `./memory-YYYYMMDD-topic/artifact.md`)

---

## Runtime Evidence (include when relevant)

<Important logs, command outcomes, errors/warnings from the session>

---

## Open Risks (include when relevant)

<Unresolved risks or uncertainties>

---

## Current State (required)

- **Working**: <what's functional>
- **Pending**: <what's in progress>
- **Blocked**: <blockers, if any>

---

## Next Steps (required)

1. [ ] <Action item>
2. [ ] <Action item>

---

## Notes for Next Session (include when relevant)

<Easy-to-forget details, reminders, gotchas>

---

## References (required)

<Important file paths, documentation links, or external resources.
Include companion folder artifacts here for discoverability.>

- `<file path>` -- <description>
- `./memory-YYYYMMDD-topic/<artifact>.md` -- <description of companion artifact>

---

**Confirmed at**: <timestamp>
```

### Section Selection

| Always include | Include when relevant |
|----------------|----------------------|
| Goal & Scope | Constraints & Non-Goals |
| Key Decisions | Runtime Evidence |
| Confirmed Assumptions | Open Risks |
| Key Discoveries | Notes for Next Session |
| Current State | |
| Next Steps | |
| References | |
