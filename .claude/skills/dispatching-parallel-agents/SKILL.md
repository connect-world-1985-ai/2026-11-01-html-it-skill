---
name: dispatching-parallel-agents
description: Use when facing 2+ independent tasks that can be worked on without shared state or sequential dependencies
---

# Dispatching Parallel Agents

## Overview

When you identify multiple independent pieces of work, sequential execution wastes time. Each independent task can be delegated to a separate agent and run concurrently — cutting total time significantly while maintaining quality.

**Core principle:** Think about parallelism proactively. Whenever you spot independent tasks, consider whether dispatching agents in parallel would be faster and equally safe.

## Recognizing Parallelism Opportunities

The best agents don't wait to be told to parallelize — they recognize the opportunity themselves. Ask yourself at every decision point:

> "Are there multiple things that need to happen here, and could they happen at the same time?"

**Quick heuristic:** Read-only work (research, review, investigation) is almost always safe to parallelize. Write work (code changes, migrations) needs more careful independence analysis. When in doubt about read-only tasks, parallelize.

Parallelism decisions aren't only made at the start. As you work, you may discover that your current task contains independent sub-problems. When this becomes clear, pause and pivot to parallel dispatch.

**Strong signals for parallelism:**
- Multiple independent problems to solve (different subsystems, different files, different concerns)
- Research or investigation across unrelated topics
- Reviews or audits of separate components
- Tasks with no data dependencies between them
- Work that touches different parts of the codebase without overlap

**Examples across domains:**

| Situation | Parallel Agents |
|-----------|----------------|
| 3 test files failing with different root causes | One agent per test file |
| Feature requires API + frontend + docs | One agent per layer (if truly independent) |
| Code review + security audit + performance check | One agent per review type |
| Research 3 competing libraries for a decision | One agent per library |
| Fix bugs in unrelated modules | One agent per module |
| Migration across independent services | One agent per service |

## The Pattern

### 1. Decompose, Then Identify Independent Domains

First, break the work into its smallest meaningful units. Parallelism opportunities become visible after decomposition — a single large task often contains independent sub-problems.

Then check what's independent. All three must be true to parallelize safely:
- Each group can be completed without knowledge of the others
- Agents working on different groups will touch different files/resources
- The order of completion doesn't matter

### 2. Craft Focused Agent Tasks

Each agent needs:
- **Specific scope:** One problem domain, clearly bounded
- **Clear goal:** What "done" looks like
- **Constraints:** What NOT to touch
- **All necessary context:** The agent shouldn't need to ask for basics
- **Expected output:** What to report back

### 3. Dispatch Concurrently

Prefer parallelism for non-trivial tasks. For tasks that would take seconds sequentially, the dispatch overhead may not be worth it.

Speed mode requirement: If the dispatch surface supports speed/mode selection, use normal-speed mode for the selected model. Never choose fast mode for parallel agents unless the user explicitly requested fast-mode subagents. Do not downgrade or change the model/capability tier to satisfy this rule; this rule only governs speed mode. Do not treat AI-assessed urgency or time-criticality as permission to use fast mode.

```
Agent 1 → Task A (scope: module X)
Agent 2 → Task B (scope: module Y)
Agent 3 → Task C (scope: module Z)
# All run concurrently
```

### Real-World Pattern: Multi-Phase Parallelism

Tasks are rarely all independent from the start. The common pattern is:
1. **Foundation:** Complete shared pieces first (types, interfaces, schemas, configs)
2. **Fan out:** Dispatch independent tasks in parallel
3. **Converge:** Integrate results and verify the whole

You can also parallelize different phases differently — for example, investigate 3 issues in parallel to diagnose root causes, then fix them sequentially once you understand the relationships.

### 4. Review and Integrate

When agents return:
- Read each agent's summary
- Check for unexpected overlaps or conflicts
- Verify the combined result works as a whole
- Run integration checks (tests, builds, etc.)

## Writing Good Agent Prompts

The quality of parallel work depends on the quality of each agent's instructions.

**Good prompts are:**
1. **Focused** — One clear problem domain, not "fix everything"
2. **Self-contained** — All context needed to start immediately
3. **Specific about output** — What should the agent report back?
4. **Bounded** — Clear constraints on scope
5. **Whole-picture aware** — For review-type work, each agent should understand the full scope of changes even if their focus is narrower
6. **Rules-injected** — Always include the `subagent-context-rules` behavioral contract (see "Subagent Behavioral Rules" section below)
7. **Speed-mode explicit** -- If mode selection is available, the prompt or dispatch metadata must stay in normal-speed mode for the selected model unless the user explicitly requested fast mode.

**Example prompt:**

```markdown
Investigate and fix the authentication timeout issue in the session module.

Context:
- Users report being logged out after 5 minutes instead of 30
- The session TTL config looks correct (1800s in config.yaml)
- Suspect the middleware is overriding the config

Your task:
1. Trace the session lifecycle from login to timeout
2. Identify where the TTL is being overridden
3. Fix the root cause (not just the symptom)
4. Add a test that verifies the correct timeout duration

Scope: Only modify files in src/auth/ and tests/auth/
Do NOT change the session storage implementation.

Return: Root cause analysis + summary of changes.
```

## Subagent Behavioral Rules (Mandatory)

Before dispatching any subagent, load the `subagent-context-rules` skill and inject its behavioral contract into every Task prompt. This ensures each subagent knows:
- Not to ask the user questions or attempt user interaction
- Not to load `skill-runtime-policies`, `interactive-clarification`, or other user-facing workflow skills
- To operate in execution-focused mode
- To document decisions autonomously in its return report

See the `subagent-context-rules` skill for the complete rules block and injection template.

## When Parallelism Helps vs. Hurts

Use your judgment. Here are the principles:

**Parallelize when:**
- Tasks are genuinely independent (no shared state, no ordering dependency)
- Each task has enough context to stand alone
- Combined result can be integrated cleanly
- Time savings justify the coordination overhead

**Stay sequential when:**
- Tasks build on each other (Task 2 needs Task 1's output)
- You need to understand the full picture before acting
- Agents would edit the same files or resources
- The problem is still unclear — explore first, parallelize second
- Fixing one issue might resolve others (investigate together)

**Handling partial dependencies:** Real work is rarely 100% independent. If tasks share a small dependency (a type definition, a config schema, a shared interface), complete the shared piece first, then parallelize the independent work that builds on it.

**The key question:** "If I give this work to two separate people who can't talk to each other, will they produce work that combines cleanly?" If yes, parallelize.

## Common Mistakes

| Mistake | Better Approach |
|---------|----------------|
| Too broad: "Fix all the issues" | Specific: "Fix the auth timeout in src/auth/" |
| No context: "Fix the race condition" | Context: Include error messages, file paths, reproduction steps |
| No constraints: Agent refactors everything | Constraints: "Only modify files in X, do not change Y" |
| Vague output: "Fix it" | Specific: "Return root cause analysis + summary of changes" |
| Parallelizing coupled work | Sequential execution with clear handoffs |
| Skipping integration verification | Always verify the combined result after agents return |

## Verification

After agents return:
1. **Review each summary** — Understand what changed and why
2. **Check for conflicts** — Did agents unexpectedly touch the same code?
3. **Run integration checks** — Tests, builds, linting on the combined result
4. **Spot check agent work** — Agents can make systematic errors or take shortcuts

**If an agent fails:** The other agents' work is still valid. Diagnose the failure independently — don't discard successful parallel work because one agent hit a problem.

## Key Benefits

1. **Speed** — N problems solved in the time of 1
2. **Focus** — Each agent has narrow scope, less context to track
3. **Independence** — Agents don't interfere with each other
4. **Quality** — Focused work tends to be more thorough than context-switching
