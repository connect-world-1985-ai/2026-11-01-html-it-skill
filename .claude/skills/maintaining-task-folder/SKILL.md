---
name: maintaining-task-folder
description: Use when working within an existing task documentation folder that has tracker.md, topics/, meetings/, and my-research/ — enforces update cascade, File Registry maintenance, External References tracking, and flat-table tracker rules
---

# Maintaining Task Folder

## Overview

Enforcement skill for AI agents working within an existing task documentation folder (created by `initializing-task-folder`). Converts the Workflow Quick Reference in each project's README into hard gates — ensuring the update cascade, File Registry, External References tracking, and flat-table tracker rules are followed consistently.

## When to Use

- AI is working within a folder that contains `tracker.md`, `topics/`, `meetings/`, `my-research/`
- Triggered by the project's README instruction ("Load the `maintaining-task-folder` skill")
- Auto-detection fallback: if the AI recognizes the task folder structure, load this skill even without an explicit README instruction

## When NOT to Use

- Creating a new task folder (use `initializing-task-folder` instead)
- Working in a project that does not use this doc system

## Detection

A task documentation folder is identified by the presence of ALL of these:
- `tracker.md` at the project root
- `README.md` with a "Workflow Quick Reference" section
- `topics/` directory
- `meetings/` directory
- `my-research/` directory

## Session Start Protocol

When starting a session within a task folder:

1. Read the project's `README.md` (doc system instructions, folder guide)
2. Read `tracker.md` — Items table (current status), Key People, File Registry (internal files), and External References (external resources)
3. Understand what exists before creating anything new

## Rules

### Rule 1: Follow the Update Cascade (Hard Gate)

After EVERY file-creating event, follow the project's Workflow Quick Reference cascade. The cascade is defined in the project's `README.md`. Do NOT skip cascade steps.

**Post-action verification**: Before claiming the cascade is complete, verify:
- [ ] File Registry in `tracker.md` has an entry for the new file (2-3 sentence summary)
- [ ] Relevant `topics/` file updated if understanding changed
- [ ] `tracker.md` items updated if status changed
- [ ] Key People in `tracker.md` updated if new participants appeared
- [ ] External References in `tracker.md` updated if external resource was read

If any step was missed, complete it before proceeding to other work.

### Rule 2: Flat Table Update Rules (Hard Gate)

When updating `tracker.md` items:

- **Update in place** — change the Status cell and fill the Resolved date. Do NOT move rows between sections, create new sections for completed items, or use strikethrough.
- **Status values**: OPEN · IN PROGRESS · BLOCKED · RESOLVED · DONE · DEFERRED · MITIGATED
- **When a dependency resolves**: Scan the Depends column for references to that ID. Evaluate whether blocked items can move from BLOCKED to OPEN.
- **Keep Summary table accurate**: After changing item statuses, update the Summary count table.

### Rule 3: Naming Conventions

- `my-research/`: `YYYY-MM-DD-HHMM-short-topic.md` (timestamp preserves intra-day ordering)
- `meetings/`: `meeting-YYYY-MM-DD-HHMM-short-topic.md`
- `topics/`: `descriptive-name.md` (no date prefix — knowledge docs, not temporal)
- `memory/`: governed by `managing-session-memory` skill, not this skill

### Rule 4: File Registry Maintenance

Every file created in `topics/`, `meetings/`, `my-research/`, or `raw/` MUST have a corresponding entry in the File Registry section of `tracker.md`.

**Entry format**: filename (date), followed by 2-3 sentences covering: what was investigated/discussed, key findings/conclusions, and what it relates to.

### Rule 5: Topics Are Knowledge Documents

`topics/` files are self-contained knowledge documents, not summaries. When updating a topic file after a meeting or research session, incorporate the substance — don't just add a link. Someone reading only the topic file should understand the current state of that area without needing to read meeting notes or research files.

### Rule 6: External References Maintenance

Every external resource (wiki page, Jira ticket, URL) read by the AI MUST get an entry in the External References > Consulted Resources section of `tracker.md`.

**Entry format**: **[Title](URL)** (YYYY-MM-DD) — 2-3 sentences covering: what the resource contains, key findings/relevance, and what it relates to.

**After logging the link, assess content impact:**
- Update existing `topics/` file if understanding of that area changed
- Update existing or write new `my-research/` note if deep analysis warranted
- Update `tracker.md` items if statuses changed (questions resolved, new risks discovered)
- Or none of the above if the resource confirms existing understanding

The External References log is the only guaranteed action. Everything else is significance-based — the AI evaluates what changed and updates accordingly.

## Common Rationalizations

| Excuse | Reality |
|--------|---------|
| "I'll update the tracker later" | Later means never. Update now, as part of the cascade. |
| "The File Registry entry can wait" | It's one line. Write it while you still have context. |
| "This is a small change, cascade not needed" | Small changes accumulate. The cascade exists to prevent drift. |
| "I already updated the tracker items" | Did you also update the File Registry? Topics? Both are cascade steps. |
| "The topic file doesn't need updating" | If understanding changed, the topic file needs updating. If it didn't, fine — but make the conscious decision, don't skip by default. |
| "Moving the row to a Done section is clearer" | Flat table with Status column is the design. Update in place. |
| "I'll log the link later" | Log it now. You'll forget the URL and the context of why you read it. |

## Quick Reference

| Event | Cascade Steps |
|-------|--------------|
| New meeting note | Write in `meetings/` → File Registry → `topics/` if changed → `tracker.md` items → Key People in `tracker.md` if new participant |
| New research file | Write in `my-research/` → File Registry → `topics/` if changed → `tracker.md` items |
| New topic file | Write in `topics/` → File Registry → `tracker.md` items |
| Raw data received | Save to `raw/` → File Registry → reference from `meetings/` or `my-research/` → External References in `tracker.md` if from external URL |
| Item completed | `tracker.md`: Status → RESOLVED/DONE, fill Resolved date, update Notes → `topics/` if changed |
| Dependency resolved | `tracker.md`: update resolved item → scan Depends column → update newly-unblocked items |
| External comment/reply | `tracker.md` items → `topics/` if decision changed → External References in `tracker.md` if new external link |
| Wiki page review | `tracker.md` items (new/resolved) → `topics/` if understanding changed → External References in `tracker.md` |
| External resource read | External References in `tracker.md` (link + summary) → `topics/` if changed → `my-research/` if significant → `tracker.md` items if applicable |
| Session start | Read `README.md` → load this skill → read full `tracker.md` (Items + Key People + File Registry + External References) |
| Session end | Update `memory/` file |
