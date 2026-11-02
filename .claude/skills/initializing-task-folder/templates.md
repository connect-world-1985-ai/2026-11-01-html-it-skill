# Template Files for Task Folder Initialization

All templates use these placeholders:
- `{TASK_ID}` — Jira/tracker ID (omit lines referencing it if "none")
- `{TASK_DESCRIPTION}` — one-liner from user
- `{BACKGROUND}` — background context from user (for README Background section)
- `{FOLDER_NAME}` — directory name
- `{DATE}` — YYYY-MM-DD

---

## README.md

```markdown
# {FOLDER_NAME}

**Epic/Task**: [{TASK_ID}](https://medavis.atlassian.net/browse/{TASK_ID})
**Goal**: {TASK_DESCRIPTION}

> **AI Agent**: This folder uses a structured documentation system.
> Before working here, load the `maintaining-task-folder` skill for update cascade rules, File Registry maintenance, and External References tracking.

### Background

{BACKGROUND}

---

## Folder Guide

~~~
{FOLDER_NAME}/
├── README.md                          Project identity and documentation system instructions
├── tracker.md                          Flat tracker + Key People + File Registry + External References
├── quick-notes.txt                    Personal scratch pad (not for AI)
│
├── topics/                             Self-contained knowledge documents, fully explaining each topic area
├── meetings/                           Per-meeting notes
├── my-research/                        Analysis sessions, homework output, AI-assisted investigations
├── raw/                                Source materials (transcripts, specs, images)
├── memory/                             AI session persistence
└── retired/                            Superseded documents (preserved for reference)
~~~

---

## Workflow Quick Reference

| After a... | Do this |
|------------|---------|
| **Meeting** | Write note in `meetings/` → add entry to File Registry in `tracker.md` → update relevant `topics/` file(s) if understanding changed → update `tracker.md` items → update Key People in `tracker.md` if new participants |
| **Research/homework session** | Write analysis in `my-research/` → add entry to File Registry in `tracker.md` → update relevant `topics/` file → update `tracker.md` items (cross-link research doc in Notes column) |
| **AI analysis session** | Write findings in `my-research/` → add entry to File Registry in `tracker.md` → update relevant `topics/` file → update `tracker.md` items |
| **External comment/reply** (Confluence, email, Slack) | Update `tracker.md` items → update `topics/` if a decision changed → add to External References in `tracker.md` if new external link |
| **Wiki page review** (found updates) | Update `tracker.md` with new/resolved items → update `topics/` if understanding changed → add to External References in `tracker.md` |
| **External resource read** (wiki, Jira, URL) | Log in External References in `tracker.md` (link + summary) → update `topics/` if understanding changed → update or write `my-research/` note if significant → update `tracker.md` items if applicable |
| **Action item completed** | Update `tracker.md` (set Status + Resolved date) → update `topics/` if understanding changed |
| **New topic area emerges** | Create new file in `topics/` → add entry to File Registry in `tracker.md` → update `tracker.md` items if new items arise |
| **Raw data received** (transcript, spec, diagram) | Save to `raw/` → add entry to File Registry in `tracker.md` → reference from the relevant `meetings/` or `my-research/` file → add to External References in `tracker.md` if from an external URL |
| **Before a meeting** | Read the relevant `topics/` file + `tracker.md` → fully prepared. If asked to help prepare, write prep doc in `my-research/` → add entry to File Registry in `tracker.md` |
| **Starting an AI session** | Load latest `memory/` file → read this `README.md` → load the `maintaining-task-folder` skill → read full `tracker.md` (Items + Key People + File Registry + External References) |
| **Ending an AI session** | Update or create `memory/` file with session context |

*This table covers common scenarios. For situations not listed, apply the same principles: record what happened, update what changed, track what's open. When in doubt about where something belongs, ask the user.*

---

## Folder Usage Instructions

### `topics/` — Living Knowledge Documents

**Purpose**: Self-contained knowledge documents that fully explain a topic area. Someone reading only a topic file should understand the current state of that area **without needing to read meeting notes or research files**. Each file covers one coherent area and should include the actual content — diagrams, comparison tables, code examples, decision rationale — not just references to where that content lives elsewhere.

**Content depth**: Write as much detail as needed to fully explain the topic. Include comparison tables, architecture diagrams, workflow descriptions, code snippets, decision analysis (including rejected alternatives and why). The goal is a detailed explainer document, not a summary. If new understanding emerges from a meeting or research session, incorporate the substance into the topic file — don't just add a link.

**References**: Cite `meetings/`, `my-research/`, and `retired/` as **source attribution** (where the knowledge came from) rather than as required reading. The topic file should stand on its own.

**When to update**: After a meeting that changed your understanding of that topic. After research that produced new conclusions. After an external reply that resolved a question.

**When NOT to update**: For minor status changes — those go in `tracker.md` only. Don't add verbatim quotes or raw meeting notes here.

**Include**: Last-updated date, key links, current understanding by sub-area (with full detail), open questions, source references to records in `meetings/` and `my-research/`.

**Adding new topics**: When a new major area emerges, create a new file in `topics/` following the same Include pattern above.

---

### `meetings/` — Meeting Notes

**Purpose**: Per-meeting notes capturing what was discussed, decided, and left open. One file per meeting.

**Naming convention**: `meeting-YYYY-MM-DD-HHMM-short-topic.md` (e.g., `meeting-2026-04-28-1400-sync-samer.md`). The timestamp preserves chronological order when multiple meetings happen on the same day.

**Include**: Title, date, duration, participants (name/role), background/context with links, discussion by topic, decisions made, action items (owner/task/due), open items, references to related documents.

**What does NOT go here**: Status tracking (→ `tracker.md`), analysis or research conclusions (→ `my-research/`), topic knowledge (→ `topics/`).

**After writing a meeting note**: Update the relevant `topics/` file(s) if understanding changed. Update `tracker.md` with any new/resolved items.

---

### `my-research/` — Analysis Sessions & Homework Output

**Purpose**: Individual investigation work — deep analysis, homework output, research findings. This is where independent work goes (as opposed to group discussions in `meetings/`). This includes AI-assisted analysis sessions: when the user asks the AI to investigate, analyze, or think through a problem, the output belongs here.

**Naming convention**: `YYYY-MM-DD-HHMM-short-topic.md` (e.g., `2026-04-28-0930-fix-proposal.md`). The timestamp preserves chronological order when multiple files are created on the same day. Use `descriptive-name.md` (without date prefix) for foundational docs that don't have a temporal context.

**Include**: Context/question being investigated, analysis approach, findings with evidence, conclusions, open questions, references.

**After writing a research note**: Update the relevant `topics/` file if conclusions changed understanding. Update `tracker.md` if items were resolved or new questions emerged (cross-link the research doc in the Notes column).

**my-research/ vs meetings/**: Meetings are group discussions. Research is individual work (including AI-assisted analysis).

---

### `tracker.md` — Consolidated Flat Tracker + File Registry

**Purpose**: Single source of truth for ALL tracked items, people, and references. Contains: (1) flat table with 8 columns for all items, (2) **Key People** table for project participants, (3) **File Registry** for internal file discovery, and (4) **External References** for external resource tracking (Project Links + Consulted Resources). This is the one file to check for current status of anything, discover what files exist, and find all external resources consulted.

**Flat table design**: All items live in one table. When an item is completed, update its Status and Resolved date in place — do NOT move rows between sections. This minimizes AI update complexity.

**Status values**: OPEN · IN PROGRESS · BLOCKED · RESOLVED · DONE · DEFERRED · MITIGATED

**When to update**: After any event that changes an item's status — meeting decision, external reply, research conclusion, action item completion.

**ID convention**: Use category-prefix + sequential number (e.g., A1, A2 for the first topic area, B1, B2 for the second). Categories are defined organically as items emerge. When adding new items, check existing IDs to determine the next number in the relevant category.

**Dependencies**: Use the Depends column to reference blocking item IDs (e.g., `A3, GW10`). When a dependency resolves, scan for items that reference it and evaluate whether they can move from BLOCKED to OPEN.

**Cross-references**: Use the Notes column to link to related documents (e.g., `See topics/example.md`, `See my-research/2026-04-28-analysis.md`).

**External References**: Two sub-sections — Project Links (curated bookmarks: Jira, Confluence, code repos) and Consulted Resources (every external resource the AI reads). Both use the same format: **[Title](URL)** (date) — 2-3 sentences. Project Links are stable; Consulted Resources grow as the project progresses.

**What does NOT go here**: Detailed analysis (→ `my-research/`), meeting discussions (→ `meetings/`), topic knowledge (→ `topics/`).

---

### `quick-notes.txt` — Personal Scratch Pad

**Purpose**: Personal quick-note file for jotting down thoughts, reminders, or rough notes during meetings or research. This file is **not managed by AI** — it is purely for manual human note-taking.

**AI behavior**: Do not read, modify, or reference this file unless explicitly asked.

---

### `raw/` — Source Materials

**Purpose**: Unprocessed source materials — meeting transcripts, API specs, architecture diagrams, screenshots. Other documents reference these as source evidence.

**What goes here**: Meeting transcripts (`.txt`, `.vtt`), specs (`.yaml`, `.json`), architecture diagrams (`.png`), screenshots.

**What does NOT go here**: Analysis or notes about the raw materials (→ `my-research/` or `meetings/`).

---

### `memory/` — AI Session Persistence

**Purpose**: Context files for AI chat sessions (Cursor), created and managed by the AI assistant. One file per significant session, containing: scope, decisions, discoveries, current state, next steps, and references.

**Naming convention**: `memory-YYYYMMDD-short-topic.md`

**AI behavior**: At session start, load the most recent memory file for context continuity. Follow the `managing-session-memory` skill for the full lifecycle: creation, updating, event-based checkpoints, and session termination rules.

**Human usage**: You generally don't need to read these directly. The AI loads them at session start. They serve as a useful log of what was covered in each AI session.

---

### `retired/` — Superseded Documents

**Purpose**: Documents that have been replaced by the new structure but are preserved for historical reference. Nothing is deleted — only retired. The substance from retired documents should already be incorporated into the relevant `topics/` files.

**When to retire**: When a document is superseded by new files that cover the same content in a better structure. Move the original here instead of deleting it.

---

## Common Pitfalls

- **Not completing the update cascade** — writing a meeting note but forgetting to update `topics/` and `tracker.md`; always follow the full chain in the Workflow Quick Reference above
- **Duplicating status tracking** — track status only in `tracker.md`, not scattered across multiple files
- **Treating `topics/` as brief summaries** — they are knowledge documents; write as much detail as needed to fully explain the topic
- **Not logging external resources** — every wiki page, Jira ticket, or URL the AI reads should be logged in `tracker.md` External References; the link and context are lost between sessions otherwise

```

---

## tracker.md

```markdown
# Tracker — {FOLDER_NAME}

> **AI Agent**: This file is part of a task documentation system.
> Before editing, load the `maintaining-task-folder` skill for cascade rules and update protocol.

**Tracker for**: {TASK_DESCRIPTION}
**Detailed analysis**: see `my-research/` and `topics/` for context

---

## Summary

| Status | Count |
|--------|-------|
| OPEN | 0 |
| IN PROGRESS | 0 |
| BLOCKED | 0 |
| RESOLVED | 0 |
| DEFERRED | 0 |
| **Total** | **0** |

---

## Key People

| Name | Role | Context |
|------|------|---------|
| *(add as participants are identified)* | | |

---

## Items

| ID | Description | Assignee | Status | Created | Resolved | Depends | Notes |
|----|-------------|----------|--------|---------|----------|---------|-------|
| *(add items as they emerge)* | | | | | | | |

**Status values**: OPEN · IN PROGRESS · BLOCKED · RESOLVED · DONE · DEFERRED · MITIGATED

**ID convention**: Category-prefix + sequential number (e.g., A1, A2 for root cause items, B1, B2 for log analysis). Categories are defined organically as items emerge.

**Update rule**: When an item is completed, set its Status to RESOLVED/DONE and fill the Resolved date. Do NOT move rows between sections — update in place.

**Dependency rule**: When a dependency resolves, scan the Depends column for references to that ID and evaluate whether blocked items can move to OPEN.

---

## File Registry

Central index of all project files. Each entry provides enough context for progressive disclosure — read the summary to decide whether the full file is relevant. AI must update this section when creating new files.

**Entry format**: filename (date), followed by 2-3 sentences covering: what was investigated/discussed, key findings/conclusions, and what it relates to.

### topics/

*(add entries as topic files are created)*

### meetings/

*(add entries as meeting notes are created)*

### my-research/

*(add entries as research files are created)*

### raw/

*(add entries as raw materials are received)*

---

## External References

Central index of external resources. Each entry provides enough context for progressive disclosure — read the summary to decide whether the full resource is relevant. AI must update this section when reading external resources.

**Entry format**: **[Title](URL)** (YYYY-MM-DD) — 2-3 sentences covering: what the resource contains, key findings/relevance, and what it relates to.

### Project Links

*(curated project bookmarks — Jira, Confluence root pages, code repos)*

- *(add as project references emerge)*

### Consulted Resources

*(external resources read/analyzed during the project)*

- *(add entries as external resources are read)*

---

*Cross-references: Detailed analysis lives in [`my-research/`](./my-research/) and [`topics/`](./topics/). Meeting-specific context lives in [`meetings/`](./meetings/). External resources live in External References above. This file is the single place to check current status of all items and discover all resources.*
```

---

## quick-notes.txt

```text
(empty — personal scratch pad, not managed by AI)
```

