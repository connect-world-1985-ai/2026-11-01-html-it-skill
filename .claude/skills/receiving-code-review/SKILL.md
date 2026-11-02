---
name: receiving-code-review
description: Use when receiving code review findings from any source -- code-reviewer agents, external reviewers, or the user -- especially if feedback seems unclear or technically questionable.
---

# Code Review Reception

## Scope

- **Applies to: main agent only.** Subagents do not trigger or follow this skill. This skill requires user interaction (Go/No-Go gates via the question channel) which subagents cannot perform.

## Trigger Conditions

Activate this skill when ANY of these conditions are met:

1. **After `requesting-code-review`:** Review findings have been presented and the user confirmed the handoff.
2. **External review feedback:** The user provides code review comments from an external reviewer (PR comments, colleague feedback).
3. **Direct feedback:** The user gives code review feedback to process.

## Exit Conditions

Before this skill is "done", ALL of these must be satisfied:

1. All accepted fixes have been implemented and tested individually. Before claiming fixes are complete, verify per `verification-before-completion`: fresh test evidence must support the claim.
2. **Handoff gate (hard gate):** Ask: "Trigger `requesting-code-review` for a follow-up review of the applied fixes?" No commit, push, merge, completion claim, summary, or next-task proposal may proceed until the user responds.
3. If the user declines the follow-up review, do not claim fixes are verified. Ask the user to acknowledge that fixes were applied without re-review.
4. **Loop guard:** After 2 consecutive review-fix cycles (one cycle = requesting-code-review dispatches reviewer + receiving-code-review processes findings and applies fixes) for the same logical task, pause the loop and ask the user: "Continue reviewing, or accept current state and proceed?" If the user chooses to accept, this also satisfies the handoff gate in item 2.

## Overview

Code review requires technical evaluation, not emotional performance.

**Core principle:** Verify before implementing. Ask before assuming. Technical correctness over social comfort.

## Context Sanitization (Soft Reset, Mandatory)

Before validating any review feedback, run this reset protocol in the same session:

0. **Verify review basis**:
   - Before evaluating any findings, confirm the review was conducted against the intended changeset.
   - For same-session reviews (triggered via `requesting-code-review`): the intended changeset is known from the dispatch context.
   - For external review feedback (PR comments, colleague feedback): determine the intended changeset independently -- check the PR diff, branch comparison, or ask the user what was under review.
   - Cross-check: do the findings reference files and code that are actually in the changeset?
   - If a finding references code outside the changeset scope, flag it as a potential scope error -- do not silently accept or reject it.
   - If findings systematically reference wrong code (multiple findings about files not in the changeset), STOP processing. Ask the user: "Trigger `requesting-code-review` with corrected changeset?" (per `skill-runtime-policies` Rule 7). Do not re-request without user confirmation.

1. **Drop prior conclusions**:
   - List your current assumptions and earlier conclusions.
   - Mark them as untrusted working hypotheses.
2. **Re-read evidence only**:
   - Re-check changed code, tests, logs, and requirements from source files.
   - Do not reuse earlier judgment text as evidence.
3. **Falsification first**:
   - For each feedback item, first try to prove it is wrong with concrete evidence.
   - If it survives falsification, then evaluate whether it is applicable and valuable.
4. **Decision with proof**:
   - Accept or reject each item only with explicit code/test/log evidence.
   - If evidence is missing, mark as `NEEDS_VERIFICATION`, not accepted.

Rule: No evidence, no acceptance. No assumption carry-over.

## Complete Findings Intake

When this skill is triggered after `requesting-code-review`, the input is the complete findings set, not a pre-selected subset chosen by the main agent.

Before asking which fixes to apply:

1. Evaluate every finding in the received set.
2. Preserve the reviewer-provided severity, but make an independent evidence-based decision.
3. Verify each finding against codebase reality before deciding.
4. Classify each finding as one of:
   - `ACCEPTED`
   - `REJECTED`
   - `NEEDS_VERIFICATION`
5. Cite concrete evidence for each non-trivial finding: file:line, test output, command result, or explicit missing evidence.
6. Present the triage table to the user.
7. Ask which `ACCEPTED` fixes to implement. The user may approve all, approve a subset, defer some, or stop.

Do not implement any fix during intake. Intake is evaluation only.

Minimum bar: for each non-trivial feedback item, cite at least one concrete artifact (file:line, test output, or command result) as part of the falsification attempt. If no artifact can be cited, mark the item as `NEEDS_VERIFICATION`.

## The Response Pattern

```
WHEN receiving code review feedback:

1. RESET: Run Context Sanitization (mandatory)
2. READ: Complete feedback without reacting
3. UNDERSTAND: Restate requirement in own words (or ask)
4. VERIFY: Check every finding against codebase reality
5. EVALUATE: Decide whether each finding is technically sound for THIS codebase
6. TRIAGE DECISION: Classify each finding as accepted/rejected/needs-verification
7. RESPOND: Present the triage table and supporting evidence
8. CONFIRM: Obtain user Go/No-Go before implementing accepted fixes
9. IMPLEMENT: One item at a time, test each
```

## User Go/No-Go Before Any Fix (Mandatory)

Before applying any fix from review feedback:

1. Ask the user explicitly whether to proceed with the fix.
2. Wait for explicit confirmation (`go/yes/proceed` or equivalent).
3. If user does not confirm, do not implement the fix.
4. If user asks to postpone, record it and continue with confirmed items only.

For findings received from `requesting-code-review`, Go/No-Go happens after Complete Findings Intake. The user chooses from findings classified as `ACCEPTED`; unapproved findings remain unresolved or deferred and must be reported as such.

Rule: No user confirmation, no fix implementation.

Default: confirm each feedback item separately. Batched confirmation (e.g., "fix all three") is valid only when the user explicitly approves a listed set of items in one message.

## Forbidden Responses

**NEVER:**
- "You're absolutely right!" (performative, not technical)
- "Great point!" / "Excellent feedback!" (performative)
- "Let me implement that now" (before verification)

**INSTEAD:**
- Restate the technical requirement
- Ask clarifying questions
- Push back with technical reasoning if wrong
- After verification and user approval, implement with minimal preamble (actions > words)

## Handling Unclear Feedback

```
IF any item is unclear:
  STOP - do not implement anything yet
  ASK for clarification on unclear items

WHY: Items may be related. Partial understanding = wrong implementation.
```

**Example:**
```
your human partner: "Fix 1-6"
You understand 1,2,3,6. Unclear on 4,5.

❌ WRONG: Implement 1,2,3,6 now, ask about 4,5 later
✅ RIGHT: "I understand items 1,2,3,6. Need clarification on 4 and 5 before proceeding."
```

## Source-Specific Handling

### From your human partner
- **Trusted** - implement after understanding and Go/No-Go approval
- **Still ask** if scope unclear
- **No performative agreement**
- **Skip preamble** -- technical acknowledgment then action (Go/No-Go gate still applies)

### From External Reviewers
```
BEFORE implementing:
  1. Check: Technically correct for THIS codebase?
  2. Check: Breaks existing functionality?
  3. Check: Reason for current implementation?
  4. Check: Works on all platforms/versions?
  5. Check: Does reviewer understand full context?

IF suggestion seems wrong:
  Push back with technical reasoning

IF can't easily verify:
  Say so: "I can't verify this without [X]. Should I [investigate/ask/proceed]?"

IF conflicts with your human partner's prior decisions:
  Stop and discuss with your human partner first
```

**Principle:** External feedback should be treated skeptically but checked carefully.

## YAGNI Check for "Professional" Features

```
IF reviewer suggests "implementing properly":
  grep codebase for actual usage

  IF unused: "This endpoint isn't called. Remove it (YAGNI)?"
  IF used: Then implement properly
```

**Principle:** Both you and the reviewer serve the project. If a feature isn't needed, don't add it (YAGNI).

## Implementation Order

```
FOR multi-item feedback:
  1. Clarify anything unclear FIRST
  2. Then implement in this order:
     - Blocking issues (breaks, security)
     - Simple fixes (typos, imports)
     - Complex fixes (refactoring, logic)
  3. Test each fix individually
  4. Verify no regressions
```

## Design Context and Test Coverage (Guidance, Non-Blocking)

When feedback concerns large implementations or newly introduced logic, include a lightweight check for:

- Related design documents, specs, or requirements that describe the intended behavior
- Supporting test cases (happy path, edge cases, failure behavior)

This is advisory guidance for better review quality.
Do not treat this as a mandatory gate by itself.

## When To Push Back

Push back when:
- Suggestion breaks existing functionality
- Reviewer lacks full context
- Violates YAGNI (unused feature)
- Technically incorrect for this stack
- Legacy/compatibility reasons exist
- Conflicts with your human partner's architectural decisions

**How to push back:**
- Use technical reasoning, not defensiveness
- Ask specific questions
- Reference working tests/code
- Involve your human partner if architectural

**Signal if uncomfortable pushing back directly:** "I'd like to verify this further before proceeding."

## Acknowledging Correct Feedback

When feedback IS correct:
```
✅ "Fixed. [Brief description of what changed]"
✅ "Good catch - [specific issue]. Fixed in [location]."
✅ [Just fix it and show in the code]

❌ "You're absolutely right!"
❌ "Great point!"
❌ "Thanks for catching that!"
❌ "Thanks for [anything]"
❌ ANY gratitude expression
```

**Why no thanks:** Actions speak. Just fix it. The code itself shows you heard the feedback.

**If you catch yourself about to write "Thanks":** DELETE IT. State the fix instead.

## Gracefully Correcting Your Pushback

If you pushed back and were wrong:
```
✅ "You were right - I checked [X] and it does [Y]. Implementing now."
✅ "Verified this and you're correct. My initial understanding was wrong because [reason]. Fixing."

❌ Long apology
❌ Defending why you pushed back
❌ Over-explaining
```

State the correction factually and move on.

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Performative agreement | State requirement or just act |
| Blind implementation | Verify against codebase first |
| Batch without testing | One at a time, test each |
| Assuming reviewer is right | Check if breaks things |
| Avoiding pushback | Technical correctness > comfort |
| Partial implementation | Clarify all items first |
| Can't verify, proceed anyway | State limitation, ask for direction |

## Real Examples

**Performative Agreement (Bad):**
```
Reviewer: "Remove legacy code"
❌ "You're absolutely right! Let me remove that..."
```

**Technical Verification (Good):**
```
Reviewer: "Remove legacy code"
✅ "Checking... build target is 10.15+, this API needs 13+. Need legacy for backward compat. Current impl has wrong bundle ID - fix it or drop pre-13 support?"
```

**YAGNI (Good):**
```
Reviewer: "Implement proper metrics tracking with database, date filters, CSV export"
✅ "Grepped codebase - nothing calls this endpoint. Remove it (YAGNI)? Or is there usage I'm missing?"
```

**Unclear Item (Good):**
```
your human partner: "Fix items 1-6"
You understand 1,2,3,6. Unclear on 4,5.
✅ "Understand 1,2,3,6. Need clarification on 4 and 5 before implementing."
```

## The Bottom Line

**External feedback = suggestions to evaluate, not orders to follow.**

Verify. Question. Then implement.

No performative agreement. Technical rigor always.
