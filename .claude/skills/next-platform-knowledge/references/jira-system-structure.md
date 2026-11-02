# medavis JIRA — Portfolio Structure

> The JIRA portfolio model — for developers (create/link issues), sprint planners (epics, parenting, scope), and management/reporting (cross-project rollups, status). For field ids and gotchas, see `jira-field-reference.md`. Run live queries with the available Atlassian plugin or v2 MCP tools; no particular server name is required. This file is the model, not live data.

The medavis JIRA instance (`medavis.atlassian.net`, Cloud ID: `d3fb335a-e7fa-433c-93d4-de6edf2d88ce`) hosts ~117 projects organized by category and a 5-level issue hierarchy. For which JIRA project a given .next project maps to, see `platform-map-project-identity.md` → JIRA Project Mapping.

## Issue Type Hierarchy

| Level | Issue Type | hierarchyLevel | Description |
|-------|-----------|----------------|-------------|
| 3 | Strategy | 3 | Long-term strategic goals |
| 2 | Initiative | 2 | Bigger development initiative that needs to be broken down |
| 1 | Epic | 1 | New function or user experience — maps use cases |
| 0 | Story | 0 | New functionality that didn't exist before |
| 0 | Task | 0 | Technically motivated change/implementation without functionality |
| 0 | Bug | 0 | A problem which restricts or prevents functions of a product |
| 0 | Improvement | 0 | Enhancement to an existing feature |
| 0 | Test | 0 | Zephyr Test Task |
| -1 | Sub-task | -1 | Breakdown of a level-0 issue |

## Project Categories

| Category | Purpose | Typical Issue Types | Examples |
|----------|---------|-------------------|----------|
| **Planning** | Roadmap, initiatives, epics | Strategy, Initiative, Epic | P4MP, B4MP, C4MP, S5GP, TECH, PRIS, ERISP |
| **Implementation** | Actual development work | Story, Task, Bug, Improvement, Test, Sub-task | PORTAL, BOOKING, COCKPIT, ADMINAPP, SMSSERV, ... |
| **Kanban** | Continuous flow work | Varies | COD, PDD, DNA, PL, PS |

## Planning ↔ Implementation Project Pairs

Planning projects hold Epics/Initiatives that parent implementation tasks across multiple Implementation projects:

| Planning Project | Implementation Project(s) | Product |
|-----------------|--------------------------|---------|
| P4MP | PORTAL (+ ADMINAPP, SMSSERV, etc.) | portal4med |
| B4MP | BOOKING | booking4med |
| C4MP | COCKPIT | cockpit4med |
| S5GP | SQ5GEN | Squad 5 General |
| TECH | PORTAL, BOOKING, COCKPIT, ADMINAPP, ... | Technical Roadmap (cross-cutting) |
| TELERAD | TELESERV | Teleradiology |
| PRIS | RISC, RISDB, RISSERVICE, ... | RIS Solution |

## Cross-Project Parent-Child Example

```
TECH-151 (Initiative in TECH — "Technical Upgrade of .next Solution Software Stack")
  └── TECH-184 (Epic in TECH — "Systematic AI code review and findings")
       ├── PORTAL-1149  (Task in PORTAL — "TECH-150 Code Review — p4m")
       ├── PORTAL-1150  (Task in PORTAL — "TECH-150 Code Review — parent")
       ├── BOOKING-143   (Task in BOOKING — "TECH-150 Code Review — booking4med")
       ├── ADMINAPP-122  (Task in ADMINAPP — "TECH-150 Code Review — admin-app")
       └── ... (19 more tasks across 11 Implementation projects)
```

## Key Rules

1. **Epics and Initiatives live in Planning projects** — Implementation projects only have level-0 types (Story, Task, Bug, Improvement, Test) plus Sub-tasks.
2. **TECH is a hybrid** — it has all 9 issue types (Strategy through Sub-task), serving as both planning and implementation.
3. **Cross-project parenting works via the `parent` field** — an Epic in P4MP can parent a Task in PORTAL. The JIRA API `parent` field links across projects.
4. **"a Relates" links** connect issues that are associated but not in a parent-child relationship (e.g., linking implementation tasks to an Epic in another project when the parent field is already used).
5. **Custom fields for tickets**: See `jira-field-reference.md` for all general and custom fields, including known gotchas.
