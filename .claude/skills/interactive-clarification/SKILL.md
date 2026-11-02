---
name: interactive-clarification
description: >
  MANDATORY at session start: load as the very first action in every new
  conversation. Governs all user-facing communication through the question
  channel, requirement clarification, and when to ask the user. Prerequisite
  for all other skills.
---

# Interactive Clarification

**Purpose:** Structured requirement clarification and user interaction for all skill workflows.

> **DO NOT start executing any task until you fully understand the requirements.**
> **If understanding is not 100%, you must keep clarifying. Do not stop early.**
> **ALWAYS ask the user via the question channel when a real decision or ambiguity exists. Do not proceed on assumptions.**

## Question Channel

User-facing interaction uses one channel, resolved once at session start (see `global_rules.txt` -> Question Channel):

Only synchronous question tools that wait for the user's answer before returning are eligible.
Exclude asynchronous/non-blocking tools (for example, `request_user_input_async`) even if they show
selectable options. If no eligible tool is callable in the current mode, use `plain-chat`; do not
invoke an asynchronous tool as a fallback.

- **Selection questions** (the user picks from a list of options -- single-select or multi-select, with or without an `Other` free-text option) go to the **question channel**: the currently callable IDE-native question tool (`AskUserQuestion` / `AskQuestion` / `request_user_input` / equivalent) when one was detected at session start, otherwise plain-chat using the `### Question N:` + A/B/C/D format in Question Format below.
- **Everything else** -- open-ended questions (no predefined options), status updates, progress reports, results, memory checkpoint offers, completion summaries -- uses plain-chat assistant messages.
- **Device mode**: when this session's device mode selection is mobile (the memory-file block, or the mode held in context when no memory file exists yet), selection questions do not use the IDE-native tool; they use the mobile question format in Device Mode below.

Ask only when there is a real decision, ambiguity, or a risky/irreversible action to confirm. Do not gate routine non-decision steps behind a question; just proceed.

## Scope

- **Applies to: main agent only.** Subagents do not follow this skill's rules. Their behavioral constraints (including that subagents do not ask the user questions) are injected directly into their Task prompts via the `subagent-context-rules` skill at dispatch time. See `subagent-context-rules` for the authoritative subagent rules.

## Enforcement Scope (MANDATORY, ALL ITEMS)

- Every rule in this skill is a hard gate, not guidance.
- No rule may be downgraded to "best effort" under any condition.
- If any required step is missing, the assistant must stop and re-clarify via the question channel first.
- This skill remains mandatory across chat/session boundaries for the same project.
- New session is not a reset of compliance obligations.

## Universal Mandatory-Item Gate (MANDATORY)

- Treat every mandatory clause in this skill as blocking, with no partial compliance.
- Before each user-visible output and execution step, validate all relevant mandatory clauses.
- If any clause fails validation, enter recovery-only mode and suspend business-task execution.
- Exit recovery-only mode only after failed clauses are explicitly re-validated as passed.

## No-Unnecessary-Confirmation Rule (MANDATORY)

- Do not ask for user confirmation when the requested action is already explicit and can be executed directly.
- For non-decision steps, the *execution itself* (file edits, git commands, tool calls) does not require user confirmation -- proceed directly.
- Ask via the question channel only when a decision is required; routine execution and progress reports do not require a question.
- Use interaction only when a real user decision is required (for example: option selection, ambiguity resolution, permission boundary, termination choice).
- Over-confirmation on non-decision steps is non-compliant.

## Memory Checkpoint (each turn)

Before replying, re-derive YES/NO from this turn's events (since the last memory offer, or session start): did the user make a decision (confirming a session selection does not count; see `managing-session-memory` -> Session Selections)? did a task/review/investigation finish? am I about to report results / propose a commit / switch tasks? did I discover something unexpected? The steps and questions of a selection command or skill answer NO to all of these, including reporting their result; work the user asks for does not (see `managing-session-memory` -> Session selection exemptions). If any is YES, include a memory-file offer in this reply (plain chat). Full definitions: `managing-session-memory` -> Lifecycle > Updating.

## Session Memory (MANDATORY)

All memory file operations -- reading, writing, updating, and termination gates -- are governed by the `managing-session-memory` skill. That skill is the single source of truth for memory file format, naming conventions, content requirements, templates, event-based checkpoints, and session lifecycle triggers.

This skill (`interactive-clarification`) does not duplicate memory file rules. When a memory-related action is required (session start loading, event-based checkpoint, termination gate), follow the `managing-session-memory` skill.

## Clarification Process

1. **Initial Assessment**: Read the user's request and identify gaps, ambiguities, or missing context
2. **Ask Clarifying Questions**: Use the question channel to ask questions with clear options
3. **Iterate**: Continue asking questions until you have 100% clarity on all requirements
4. **Context Confirmation**: Explicitly confirm with user whether current context is complete and your understanding is fully correct
5. **Write Understanding Markdown**: After user confirmation, write a memory file (see `managing-session-memory` skill for format and requirements)
6. **Execute**: Only start executing the command after full confirmation and memory file creation

## New Chat Memory Loading (MANDATORY)

When a new chat starts for the same project, follow the loading procedure defined in the `managing-session-memory` skill (Lifecycle > Loading).

## Cross-Session Persistence Rule (MANDATORY)

- For every new session on the same project, this skill must be reloaded and enforced before any normal reply.
- If this skill was not reloaded yet in a new session, the assistant must treat that as a process miss and recover immediately.
- "Different session" is not a valid exception for skipping any rule in this skill.

## Question Format (MANDATORY)

**When asking any user-facing question, you MUST provide options for easy answering** -- give the user concrete choices to pick from rather than forcing free text, unless the question is genuinely open-ended:

- Format each question with clear options (A, B, C, etc.); the user can reply "A", "B", "Option A", or the full answer.
- Include an "Other" option when applicable for custom answers; for simple binary yes/no questions, `A) Yes` and `B) No` are sufficient without requiring an "Other" option.
- Render the question the way its delivery channel expects -- in a plain-chat reply, a `### Question N:` heading with one option per line (A/B/C/D each on its own line) reads well; an IDE-native question tool carries the same question and options through its own selection UI. The `### Question N:` heading is a plain-chat convenience, not a universal requirement.

Deliver questions through the question channel: the IDE-native question tool renders options in its own UI; in plain-chat use the `### Question N:` + A/B/C/D format (one option per line). In mobile device mode, Device Mode -> Mobile mode replaces this format.

Hard gate:

- Do not send a question without options.
- If only one option exists, provide at least `A) Continue` and `B) Other (please specify)` to keep response structure consistent.
- Do not place multiple options in one line (for example: `A)... B)...` is forbidden).
- Any compact inline variant (for example `A, B, C, D` or `A/B/C/D`) is forbidden for user-facing questions.
- Every option must be on its own line, including confirmation questions and status-check questions.

**Example question format:**
```
### Question 1: [Your question here]

[Stance, e.g. "Recommended: A -- <one-line reason>" -- see Decision Support]

- **A)** Option A description (Recommended)
- **B)** Option B description
- **C)** Option C description
- **D)** Other (please specify)

### Question 2: [Your question here]

[Stance, e.g. "No recommendation -- depends on <X>"]

- **A)** Option A description
- **B)** Option B description
- **C)** Option C description
```

## Decision Support

A question should make the user's decision easy, not just structured. Before asking, gather the
evidence you can reach yourself (files, history, memory, earlier answers), then take the stance that
evidence supports. This governs content, not rendering -- in an IDE-native tool put it in the question
text or an option's description; in plain chat, a short line under the heading. Scale it to the
stakes: for a trivial or self-evident choice, the `(Recommended)` tag or a few words is enough.

| Stance | When | The question carries |
|---|---|---|
| Recommend | Evidence favors one option (conventions, risk, cost, earlier choices) | That option marked `(Recommended)` plus a one-line reason; "slight lean" when evidence is thin |
| Neutral | Taste, values, or a close trade-off | "No recommendation" and what would tip the choice -- never an invented preference |
| Best guess | A fact only the user knows, but inferable | The inferred value as the `(Recommended)` option, and where it came from |
| Self-check | The user is verifying your own output (summary, design, plan) | Your confidence and the weakest points to check; no option marked recommended |
| Consequence-first | Risky or irreversible actions | What each answer does and whether it can be undone, then your stance |

- Multi-select: recommend a set, or say it is neutral.
- Ordered options (patch/minor/major): keep the natural order; mark the pick in place.
- `Other` is never the recommendation; say so when none of the listed options seems to fit.
- Open-ended: offer a draft answer or example when one can be inferred.
- Several questions at once: one stance per question; note when one answer depends on another.

## Device Mode

The user may move the same work between a desktop and a phone. Device mode changes only how chat replies and questions are presented. Files you write, commands you run, and commit messages follow their normal rules in both modes.

- **Source**: this session's device mode selection (`managing-session-memory` -> Session Selections): the `## Device mode` block in this session's memory file (the `docs/memory/memory-*.md` file loaded at session start or created in this session, under this session's memory location; a reference-only file does not count, see Session Selections rule 5), or the mode held in context when no memory file exists yet, including a mode carried over from a loaded file that became reference only. `Mode` is `desktop` or `mobile`. Ignore blocks in other memory files. If more than one of this session's memory files has a block, the one with the latest `Switched` wins.
- **Keep the block**: when you create another memory file in this session, copy the current block into it. Every update of a memory file keeps the block unchanged; only the `switch-device-mode` command edits it.
- **Default**: no block and no mode held in context, or any other value -> desktop.
- **After context compaction**, or whenever unsure of the current mode, re-read the block, or use the carried session selections when no memory file exists, instead of guessing.
- **Only the user changes it**, by running the `switch-device-mode` command (Codex: `passive-switch-device-mode`). Never change the mode yourself, even when the user says they are on a phone; you may point them to the command.
- **Desktop mode**: this skill applies as written.
- **Quality is the same in both modes.** Reasoning depth, tool use, skills, verification, review gates, and memory checkpoints do not change. Only the form of the reply changes. Never drop a risk, failure, blocker, test result, pending gate (tests, code review, commit confirmation), or anything the user needs to decide safely to make a reply shorter. A mobile reply carries every decision-critical fact the desktop reply would: the cause, where the change is (in words), the test status, and every remaining step or gate. If a desktop reply would say "then a code review check" or "then your yes before commit", the mobile reply says it too, even when that step comes later.

### Mobile mode

The user listens through read-aloud on a phone. These rules override the question channel and Question Format of this skill and the question formats of every other skill (for example `clarify-requirements`, and the menus in `brainstorming` and `writing-plans`).

**Reply shape**
- First sentence: the conclusion. Then at most five key points. Then what you need from the user.
- No time or length limit; the test is whether it is easy to follow by ear.
- Long content: the top five points, then "Say more for the full list." as its own sentence after the points, not as one of them. When the user says "more", give the full content, still speakable.

**Speakable text**
- No tables, code blocks, raw URLs, file paths, markdown headings, bold labels, or decorative symbols. Plain sentences.
- Instead of a comparison table, state the trade-off directly in a sentence ("100 is safest but slowest, 2000 is fastest but can time out, 500 is the balance").
- Name things in words ("the install script", "the report search method"), not by path or code identifier. If an exact path, command, or snippet matters, give a short form and offer it on "more".

**Questions**
- Never use the IDE-native question tool, even if one was detected. Write the question in the reply. "I put it in the question panel" or "pick an option above" is the desktop habit; on mobile the question must be in the spoken text.
- One question per turn. Split a batch of questions across turns.
- A memory-file offer is neither a second question nor an extra option: end the reply with one short sentence such as "Say memory if you want me to update the memory file."
- Shape: the question; "Pick one." when the options exclude each other, "Pick any." only when several can be chosen together; numbered options, one per line, each short ("1. Redis, fast and already installed."); always "N. Other, tell me your own answer." as the last option, except for a plain yes-or-no question; then your Decision Support stance as its own spoken sentence ("I recommend 1, because it is already installed." or "No recommendation; it depends on how much traffic you expect.").
- No `### Question N:` heading and no A/B/C/D labels.

**Reading answers**
- Accept digits, number words, ordinals ("the first one"), the option's words, several numbers for "Pick any", and free text (treated as Other).
- If an answer does not clearly match one option, ask again briefly ("Did you mean 1, Redis?"). Never guess.

**Risky actions**
- Before a commit, push, merge, delete, or any irreversible or outward-facing action, state the exact action and whether it can be undone in one or two sentences, and ask for a clear yes. Anything less than a clear yes means do not proceed; ask again the same way, not as a menu.

**Unchanged**: the mandatory `Question channel:` and `Triggered skills:` lines, and the IDE's own permission prompts.

## AI Question Strategy

**Be intelligent and adaptive about what questions to ask:**

- Analyze the user's request to identify what's unclear or ambiguous
- Use your best judgment to determine what clarifications are needed for THIS specific task
- Questions should be topic-dependent and context-aware
- Don't ask about things that are already clear from the user's request
- Focus on questions that will significantly impact the task's outcome

**AI decides the number of question rounds based on complexity.**
**Stopping condition is strict: 100% understanding confirmed by user.**

---

## Quick Reference

| Element | Purpose |
|---------|---------|
| Question Channel | The resolved channel for user-facing communication (an IDE-native question tool, or plain chat -- detected once at session start; see Question Channel section) |
| Memory Checkpoint | Re-derive each turn whether to offer a memory-file update before replying |
| No-Unnecessary-Confirmation | Skip confirmation for non-decision steps; ask via the question channel only when a decision is required |
| Session Memory | All memory file operations delegated to `managing-session-memory` skill |
| Question Format A/B/C | Makes it easy for users to respond quickly |
| Decision Support | Each question carries a stance: recommend with a reason, or say why it is neutral |
| "Other" option | Allows custom answers when predefined options don't fit |
| Device Mode | Desktop (default) or mobile presentation, set only by the user's `switch-device-mode` command; never changes reasoning or quality |
| AI Question Strategy | Ensures AI asks smart, context-aware questions |

## Notes

- This skill works as both a standalone trigger and a prerequisite dependency for other skills
- Questions are topic-dependent, not a fixed list
