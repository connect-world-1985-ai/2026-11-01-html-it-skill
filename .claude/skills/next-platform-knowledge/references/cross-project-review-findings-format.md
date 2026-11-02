# Cross-Project AI Code Review — Findings Format

> The per-project findings document format: self-contained "fix tickets" another AI session can pick up and act on directly. For the review workflow that produces these, see `cross-project-review-workflow.md`.

Review findings are recorded in **per-project findings documents** designed to be self-contained "fix tickets" that another AI session can pick up and act on directly.

## File Naming and Location

- **Filename**: `{project}-pr{number}-code-review-findings.md`
- **Location**: `d:\git\scratches\<YYYY.MM>\<epic>-review\`
- **Created**: At the start of each project review (even if empty — serves as "review started" signal)

Each project gets a paired set of files:

```
<epic>-review/
  core-framework-pr222-file-inventory.md        ← progress tracking
  core-framework-pr222-code-review-findings.md   ← issues found
  vaadin-ui-pr591-file-inventory.md
  vaadin-ui-pr591-code-review-findings.md
  ...
```

## Document Header

The document header provides session context so a fixing AI can orient itself immediately:

```markdown
# {Project} PR#{number} — Code Review Findings

> **Project**: {project-name}
> **Git Directory**: `{git-dir}`
> **PR**: #{number} ({state} — targeting {destination branch})
> **Merge Commit**: `{hash or "N/A — not yet merged"}`
> **Bitbucket MCP**: `workspace: {WORKSPACE}` · `repository: {repository}` · `pull_request_id: {number}`
> **Review Date**: {date}
> **Change Scope**: {purpose of the changeset — e.g., javax→jakarta migration, feature implementation, bug fix, refactoring}

## Summary

| Severity | Count | Open |
|----------|-------|------|
| HIGH     | 0     | 0    |
| MEDIUM   | 0     | 0    |
| LOW      | 0     | 0    |
| INFO     | 0     | —    |
```

## Finding Format (each finding is a self-contained fix ticket)

~~~markdown
### F-001 [SEVERITY] Title describing the issue

**File**: `{relative path from project root}`
**Lines**: {start}-{end}
**Git Directory**: `{absolute path to project}`
**Inventory**: `{project}-pr{number}-file-inventory.md` → {module} → {filename}
**Status**: Open | Fixed | Won't Fix

#### Current Code
```java
{verbatim code from the file — so the fixing AI can locate it precisely}
```

#### Problem
{Clear explanation of what's wrong and why}

#### Suggested Fix
```java
{The corrected code — the fixing AI can apply this directly}
```

#### Related Files
- `{full path}` — {why it's related, enables batch fixes}

#### Verification
- {Which test to run, command to execute, or what to check after fixing}
~~~

## Severity Levels

| Level | Meaning | Action Required |
|-------|---------|-----------------|
| **HIGH** | Likely runtime failure, data loss, or behavioral change | Must fix before release |
| **MEDIUM** | Correctness concern or non-obvious issue | Should fix |
| **LOW** | Style, cleanup, or minor improvement | Nice to fix |
| **INFO** | Observation confirming correct migration | No action (completeness evidence) |

## Bidirectional Cross-Referencing

The inventory and findings documents cross-reference each other so an AI can navigate in either direction.

**Inventory → Findings** (which findings belong to this file?):

When a file has findings, the inventory checkbox is annotated with the finding IDs:

```markdown
- [x] `path/to/File.java` (Modified) → F-001, F-003
```

Files without findings get no annotation — just the checkbox:

```markdown
- [x] `path/to/OtherFile.java` (Modified)
```

**Findings → Inventory** (which inventory entry does this finding belong to?):

Each finding includes an `**Inventory**` field that references the findings document and the file's inventory entry:

~~~markdown
### F-001 [HIGH] Title describing the issue

**File**: `ejb-framework/src/main/java/de/medavis/framework/ejb/SomeClass.java`
**Inventory**: `core-framework-pr222-file-inventory.md` → ejb-framework module → SomeClass.java
~~~

This enables an AI to:
- Start from the inventory, see `→ F-001, F-003`, and jump to those findings in the findings doc
- Start from a finding, see the Inventory reference, and jump back to the file's position in the inventory to see surrounding files and review progress

## Cross-Project Findings

Findings that span projects are recorded in the **downstream** project's findings doc (where the fix goes), with a cross-reference to the upstream change in the Related Files section.

## Fixing Workflow

A separate AI session can pick up any finding and execute:

1. Read the findings doc header for project context
2. For each Open finding:
   - Read the file at the specified path
   - Apply the Suggested Fix
   - Run the Verification step
   - Update the finding's Status from `Open` to `Fixed`
   - Update the Summary table counts
3. Commit the changes

The sequential finding IDs (F-001, F-002, ...) enable cross-referencing in discussions and tracking to resolution.
