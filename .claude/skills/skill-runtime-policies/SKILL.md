---
name: skill-runtime-policies
description: >
  MANDATORY at session start: load immediately after interactive-clarification
  in every new conversation. Governs skill startup sequence, the question-channel
  canonical order, session management, and workflow compliance.
---

# Skill Runtime Policies

## Skill Dependencies (Mandatory)

Before this skill can operate, the following must be loaded first (in order):
1. **interactive-clarification** skill: User interaction and requirement clarification workflow

Note: `interactive-clarification` and `managing-session-memory` are loaded globally via global rules. Individual skills do not need to declare them as dependencies — they are always available.

---

## Enforcement Baseline (Mandatory)

- Every rule in this skill is hard-mandatory and must be executed as written.
- No rule may be treated as optional guidance.
- If any rule is missed, stop normal flow and run process-miss recovery first.
- These rules persist across chat/session boundaries for the same project.
- Starting a new session does not reset compliance requirements.
- While a process miss is unresolved, business-task execution is suspended (hard-fail mode).
- When this session's autonomous mode selection is on, the `## Autonomous Mode` section below decides which rules stop for the user; it does not relax evidence, safety, or subagent rules.

---

## Rules (Apply to every triggered skill)

0. **Always-on interactive clarification enforcement (main agent only)**
   - If interactive-clarification is not yet loaded in this conversation, stop and load it before any further action.
   - Its rules apply strictly to all skill runs, including when no specific skill is triggered.

1. **Trigger announcement and skill startup sequence**
   - When one or more skills trigger, execute this mandatory order:
     1) Resolve target skill name(s) for current user intent
     2) Load target skill file(s)
     3) Load required skill dependencies
     4) Emit `Triggered skills: <skill-1>, <skill-2>` (or `Triggered skill: <skill-name>` if only one) as the first user-visible line. On the very first reply of a session, `Question channel: <channel-name>` is emitted on the line above (per `global_rules.txt` -> Question Channel).
     5) Continue normal workflow
   - Steps 1-3 must complete before step 4. Step 4 must precede all other user-visible content.
   - Before step 4, all business-task actions are blocked (no repo exploration, code review, edits, or command execution). Only skill loading, dependency loading, and required startup reads are allowed.
   - If the trigger line is missed, emit it as the first line of the next user-visible response and enter recovery-only mode.
   - Session resumption ("continue", "resume", "I'm back", or equivalent in any language) is treated as a FRESH skill invocation requiring the full startup sequence. "Already loaded in a prior turn" is not a valid bypass.

2. **Memory bootstrap on new chat**
   - On a new chat for the same project, follow the loading procedure defined in `managing-session-memory` skill (Lifecycle > Loading).
   - If no memory files exist, proceed without loading and write a new memory file when appropriate.
   - **Ordering**: Memory selection is presented via the question channel as the first user-visible interaction of the session (carrying the `Question channel:` anchor line; before the trigger announcement in Rule 1 step 4). After the user responds, load the selected memory file, then continue with the normal startup sequence.

3. **MCP, templates, and subagents are allowed**
   - Skills may call MCP tools, use templates/checklists, and launch subagents when it improves quality or speed.
   - Choose tools/templates based on task evidence, not habit.
   - **Normal-speed subagent mode:** When a subagent dispatch supports speed/mode selection, use normal-speed mode for the selected model. Do NOT select, request, or imply fast mode unless the user explicitly asked for fast-mode subagents in the current task. Do not downgrade or change the model/capability tier to satisfy this rule; this rule only governs speed mode. AI-assessed urgency, time-criticality, convenience, or expected speedup is not an exception.
   - When starting a subagent, print: `Subagent started (<type>): <purpose>`
   - **Subagent dispatch protocol:** Before dispatching any subagent via the Task tool, load the `subagent-context-rules` skill and inject its behavioral contract into the Task prompt. This ensures subagents receive explicit instructions about what NOT to do (do not ask the user questions, no skill loading) and how to operate (execution-focused, decision-autonomous). The `subagent-context-rules` skill is the single source of truth for subagent behavioral rules.

4. **Question channel communication**
   - All question-channel rules from **global rules** and the **interactive-clarification** skill apply fully to the main agent. The channel resolves once at session start: the currently callable IDE-native question tool when detected, otherwise plain-chat (see `interactive-clarification` -> Question Channel). Subagents do not ask the user questions; their behavioral rules are injected via the `subagent-context-rules` skill at dispatch time (see Rule 3).
   - Canonical order for the first user-visible output of a session:
     1) the `Question channel: <channel-name>` line
     2) the `Triggered skills: <skill-1>, <skill-2>` line (or `Triggered skill: <skill-name>` if only one)
     3) all other user-visible content and task actions
   - On later turns, ask via the question channel only when a real decision is required; routine progress and results use plain chat.

5. **Examples are not exhaustive**
   - Any examples in skill docs are illustrative. Apply skills to semantically similar scenarios beyond listed examples.

6. **Semantic skill triggering (intent-based, not keyword-based)**
   - Trigger skills based on user intent and workflow stage, not rigid keyword matching.
   - Infer the most suitable skill from semantics, context, and current task state.

7. **Skill-to-skill handoff requires user confirmation**
   - This applies to the **main agent** only (does not apply to subagent-internal skill transitions).
   - Before transitioning to the next skill, explicitly name the target skill and ask for confirmation.
   - Use direct phrasing: "Trigger `receiving-code-review`?" not "fix now?"
   - If user declines or defers, stop transition and keep current state.

8. **Post-implementation code review prompt**
    - After completing a logical unit of code changes (feature, fix, refactoring), evaluate whether to trigger `requesting-code-review`.
    - See the skill's own Trigger Conditions and Exit Conditions for detailed rules.
    - Ask for confirmation before triggering. Do not skip even for direct commit requests.
    - Favor low miss rate: occasional over-prompting is acceptable.
    - Exception: if the user explicitly asks to skip review, do not trigger.

9. **Pre-task skill evaluation**
    - When the user presents a new task or changes direction to a different task, evaluate whether pre-task skills should trigger **before** starting execution.
    - **Evaluation order:**
      a. **`clarify-requirements`**: Trigger for any task where the request is NOT fully self-contained with zero ambiguity (what to change, where, and the expected outcome must all be explicit in the user's message). When in doubt, trigger. "This seems simple" is not a valid bypass.
      b. **`brainstorming`**: After the understand phase (whether `clarify-requirements` ran or was bypassed), `brainstorming` follows for every task, whatever it produces — code, documents, messages, files, or anything else. It is the solution-finding phase, and it scales to complexity (trivial tasks use its fast path: a one-line approach + approval). For a bug whose root cause is unknown, `brainstorming` triggers `systematic-debugging` to diagnose before designing the fix. Skip it only when nothing about how to do the task is left to decide:
         - **Nothing to produce** — a question, explanation, or investigation answered in chat.
         - **Review** — review tasks follow Rule 12 (`requesting-code-review`).
         - **Already decided** — the user's request, or a design or plan the user already approved, fixes the exact result.
         - **Owned by a workflow** — a skill or command that runs its own approval of the approach before producing anything.

         When in doubt, brainstorm; the fast path keeps a small case to one sentence and the user's approval.
    - **Bypass criteria:** May skip `clarify-requirements` only when the user's request is fully self-contained: what, where, and expected outcome are all explicit, with zero ambiguity. Mechanical changes (typo fixes, renames with exact targets, formatting) typically qualify. When in doubt, trigger.
    - **Sequencing note:** Confirmed understanding from `clarify-requirements` does not substitute for design exploration and user approval of approach/trade-offs from `brainstorming`. These are complementary phases: clarification confirms WHAT the user wants; brainstorming produces HOW to do it (2-3 approaches with trade-offs, scaled to complexity).
    - **Announcement:** When a pre-task skill triggers, announce it per Rule 1 (trigger announcement). Skipping `clarify-requirements` needs no announcement. When `clarify-requirements` ran and `brainstorming` does not follow, say so in one line with the reason (for example, `Brainstorming skipped: nothing to produce.`).
    - Favor low miss rate: occasional over-prompting is acceptable.

10. **Root-cause-first principle for process failures**
    - If any mandatory step is missed, DO NOT jump to adding more gates.
    - First answer: 1) Which decision point failed? 2) Why did this run fail? 3) Why didn't existing controls prevent it?
    - Only after stating root-cause evidence, propose prevention changes.
    - If a required question to the user was missed (a decision was made without asking via the question channel when one was needed), the next response MUST explicitly disclose the concrete reason, remediation, and prevention. Silent recovery is forbidden.

11. **Memory-file completeness**
    - When writing `docs/memory/memory-*.md`, follow the content requirements, priority tiers, and template defined in the `managing-session-memory` skill.

12. **PR review intent → skill trigger with context gathering**
    - When the user expresses intent to review someone else's Pull Request, trigger `requesting-code-review`.
    - Rule 7 applies: ask the user for confirmation before triggering (e.g., "Trigger `requesting-code-review` for this PR?").
    - Rule 9 applies: run `clarify-requirements` to gather review context (change type, purpose, focus areas, any JIRA/Wiki context, standalone vs multi-PR) before the skill proceeds.
    - After clarification, the agent determines **review focus** from the clarified purpose and presents it to the user for confirmation before proceeding to Changeset Resolution (see Review Focus Determination in `requesting-code-review`).
    - Trigger is semantic, not keyword-based. Match regardless of the user's language.
    - PR review intent includes: direct review requests, critique requests, pasting a PR URL, or implicit review questions.
    - This trigger has higher priority than the post-implementation trigger (Rule 8).

13. **Pre-completion verification**
    - Before any completion claim -- including ad-hoc work not covered by a formal skill -- verify per `verification-before-completion`: fresh evidence (test output, build result, command output) must support the claim.
    - This applies to ALL contexts: plan execution, code review fix cycles, debugging conclusions, and ad-hoc implementation.
    - "Should pass", "looks correct", or "I changed the code" are not evidence. Run the verification command, read the output, then claim.
    - Structured skills (`executing-plans` Step 5, `receiving-code-review` Exit Condition 1) already reference this. This rule covers the remaining cases.

---

## Autonomous Mode

Autonomous mode is a session selection (`managing-session-memory` -> Session Selections) set only by the user's `switch-autonomous-mode` command (Codex: `passive-switch-autonomous-mode`). Never turn it on or off yourself, even when the user says "just do it yourself"; you may point them to the command. The source is the `## Autonomous mode` block in this session's memory file (latest `Switched` wins), or the mode held in context. No block, or any value other than `on`, means off.

The step-by-step chain in these skills exists because agents used to need a human at every step. In autonomous mode you own the route and work toward the best result. Only the start and the end are fixed.

### Fixed start

- Before autonomous work on any task, run `clarify-requirements` with its Autonomous Mode additions. The run starts only after the user's explicit yes on the three-part summary.
- Turned on while a task is in progress: do this for the remaining work, including what is already decided.

### The middle is yours

- The skills are optional, not a route. Use, skip, reorder, or combine them, or go beyond them: invent a method, write a throwaway script or tool, build a checklist, draft a new skill. Decide yourself whether to plan, review, test first, or use helper agents; that route is the first entry in your decision log, stated when the run starts.
- Ask the user nothing. Rule 7 handoff confirmations, Rule 8 review prompts, the routing menus of `brainstorming` and `writing-plans`, the focus-confirmation, findings-route, and handoff gates of the code-review skills, memory offers, "proceed?" checks, and any other skill's approval or confirmation gate do not stop the run: choose, and log the choice. Triage review findings yourself: decide fix, skip, or defer for each, with the reason.
- A new ambiguity: take the reading closest to the confirmed intent and log it. Stop and ask only when continuing would clearly contradict what the user confirmed.
- Still binding: `verification-before-completion` (fresh evidence before any claim), safety rules, `subagent-context-rules` (subagents never ask the user), and device mode presentation.
- Nothing irreversible or outward-facing: no commit, stash, push, or merge; no deleting branches, worktrees, or files git cannot restore; nothing outside the task's checkout; no posting to external services. Edits stay uncommitted so the user can review them in the IDE.
- Memory: create or update this session's memory file yourself when it helps; never offer. If the memory location would normally need a question (`managing-session-memory` -> Memory Location, step 4), pick the root where this work's edits happen and log it.
- Keep throwaway artifacts you invent (scripts, scratch data) out of the deliverable changes: put them in the memory companion folder or a temp directory unless they are meant to ship, and list each in the report with where it is and a keep or discard recommendation.
- Keep a decision log of every choice the user would otherwise have made: the choice, why, and the rejected options. Post short progress lines only.

### Fixed end

1. Self-check with fresh evidence; the review method is your call.
2. Write the delivery report to `<memory_location>/docs/memory/<memory-file-stem>/delivery-report-YYYYMMDD-HHMM.md` (the companion folder of this session's memory file; create the memory file first if there is none). It is always full written language, whatever the device mode. Use the template below, and copy every logged decision into it in full (choice, why, rejected options): the report stands on its own and never points elsewhere for them.
3. The chat summary follows device mode and points to the report file.
4. Stop once: show the uncommitted changes and a proposed commit message, and ask a clear yes for each of commit, push, merge, and delete.
5. The mode stays on. The next task starts at the fixed start again.

### Switched off during a run

Stop at the next safe point. Give an interim report in chat: what was done, the decisions so far with why, what is left, and that changes are uncommitted. From then on, follow the normal rules from the matching step, asking before the next step or handoff.

### Delivery report template

```markdown
# Delivery Report: <task title>

**Date**: <YYYY-MM-DD HH:MM>
**Checkout / branch**: <path> / <branch>
**Confirmed understanding**: <one-paragraph summary of what the user confirmed at the start>

## 1. Outcome
<What was delivered, in a few sentences.>

## 2. Files changed
- `<path>` -- <what changed and why>

## 3. Decisions made on your behalf
| # | Decision point | Choice | Why | Rejected options |
|---|---|---|---|---|

## 4. Surprises and how they were read
- <what came up> -- <the reading chosen and why it stays closest to your intent>

## 5. Verification
- `<command>` -- <result>

## 6. Risks, weak spots, and what was not done
- <item>

## 7. Things invented
- <script / tool / method / draft skill> -- <where it is> -- keep | discard, <why>

## 8. Ideas to fix or improve later
- <item>

## 9. Where to start your review
1. <file or area> -- <why first>

## 10. Waiting for your yes
- Proposed commit message: `<[TASK-ID] type: description>`
- Pending: commit | push | merge | delete <what>
```

---

## Compliance Checklist (verify throughout skill run)

- [ ] Interactive-clarification skill was preloaded for this conversation
- [ ] Skill startup sequence completed (resolve + load + dependencies + trigger line)
- [ ] Trigger line was the first user-visible text (tool logs don't count)
- [ ] No business-task action occurred before trigger line
- [ ] Question-channel rules satisfied (per global rules and interactive-clarification skill)
- [ ] Skill triggering was semantic and context-aware
- [ ] Main-agent skill transitions confirmed by user with explicit skill naming
- [ ] Memory checkpoint offered on key events per `managing-session-memory` skill -> Lifecycle > Updating (decisions, completions, transitions, discoveries)
- [ ] Code-review prompt evaluated after logical task completion (Rule 8)
- [ ] Pre-task skill evaluation performed for new tasks per Rule 9 (`clarify-requirements` and/or `brainstorming`)
- [ ] PR review intent triggered `requesting-code-review` with confirmation, context gathering, and review focus determination (Rule 12)
- [ ] Pre-completion verification performed before any completion claim (Rule 13)
- [ ] Process failures handled with root-cause analysis first
- [ ] Any process miss was disclosed per root-cause-first principle (Rule 10)
- [ ] Memory file follows priority tiers and template from `managing-session-memory` skill
- [ ] Subagent dispatch included behavioral contract from `subagent-context-rules` (Rule 3)
- [ ] Autonomous mode on: fixed start confirmed, no questions mid-run except a clear contradiction of the confirmed intent, nothing irreversible, delivery report written, one stop before commit/push/merge/delete
