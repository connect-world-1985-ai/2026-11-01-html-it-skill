# Bitbucket Server PR Reading

Reference for extracting PR data via `bitbucket-mcp` during Changeset Resolution.

**Scope:** Bitbucket Server only. All data comes from `bitbucket-mcp` -- do NOT use local git commands or Read tool for PR file content (local repo may not match the PR's repository or branch).

## Pre-Flight Check

Before any PR reading, verify `bitbucket-mcp` is available:

1. Check if `user-bitbucket-mcp` appears in the available MCP servers listed in the agent's system context (the MCP server list is injected automatically). Alternatively, attempt a lightweight call (e.g., `list_projects`) -- if the server is unavailable, the call will fail.
2. If **available**: proceed
3. If **unavailable**: STOP. Inform the user (plain chat):
   - "`bitbucket-mcp` is required to read Bitbucket PRs but is not available. Options: configure the MCP server, or provide the PR diff/context manually."
   - Do NOT attempt to work around the missing MCP (no web scraping, no guessing)

## URL Parsing

**Bitbucket Server URL pattern:**
```
https://<host>/projects/{WORKSPACE}/repos/{REPOSITORY}/pull-requests/{PR_NUMBER}/overview
```

**Regex:**
```
/projects/([^/]+)/repos/([^/]+)/pull-requests/(\d+)
```

**Extract:**
- `workspace`: project key (e.g., `PLAY`, `NEXT`)
- `repository`: repo slug (e.g., `core-framework`)
- `pull_request_id`: numeric PR ID

If the URL does not match, ask the user to provide a valid Bitbucket Server PR URL.

## Data Extraction

### Phase 1: Metadata + File List (Always, Safe for Any PR Size)

```
user-bitbucket-mcp-get_pull_request
  workspace: {workspace}
  repository: {repository}
  pull_request_id: {pull_request_id}
```

**Extract:**
| Field | Maps to |
|-------|---------|
| `title` | Purpose inference (primary) |
| `description` | Purpose inference (detail) |
| `author` | Context |
| `source_branch` | HEAD reference |
| `destination_branch` | BASE reference |
| `state` (OPEN/MERGED/DECLINED) | Edge case handling |
| `reviewers` + approval status | Context |
| `file_changes` (array of path + status) | Scope, file list for progressive mode |
| `file_changes_summary.total_files` | Size assessment |

This call is lightweight -- it returns file paths and statuses without diff content. Safe even for PRs with hundreds of files.

**Note:** Field names above follow common Bitbucket MCP conventions. If the actual response uses different names, map by meaning (e.g., `fromRef`/`toRef` instead of `source_branch`/`destination_branch`).

### Phase 2: Size Assessment

Use `file_changes_summary.total_files` from Phase 1 to decide the review mode (per Context-Aware Review Mode in SKILL.md):

- **Below threshold** (~10 files): likely inline mode -- proceed to Phase 3a
- **At or above threshold**: likely progressive mode -- proceed to Phase 3b
- Line count is unknown at this point. If file count is borderline, fetch the diff (Phase 3a) and check line count. Switch to progressive if it exceeds ~300 lines.

### Phase 3a: Full Diff (Inline Mode)

```
user-bitbucket-mcp-get_pull_request_diff
  workspace: {workspace}
  repository: {repository}
  pull_request_id: {pull_request_id}
  context_lines: 5
  exclude_patterns: ["*.lock", "*.min.js", "*.min.css", "*.map"]
```

The full diff is embedded in the reviewer's task prompt. If the returned diff exceeds ~300 lines, switch to progressive mode (Phase 3b) instead.

### Phase 3b: File List Only (Progressive Mode)

Do NOT fetch the full diff. Instead:

1. Group `file_changes` by directory/module
2. Provide the grouped file list to the reviewer with instructions to read files on demand
3. **Critical:** Include `workspace`, `repository`, and `pull_request_id` in the reviewer's task prompt so it can make per-file `bitbucket-mcp` calls

**Reviewer tools for progressive mode:**

Per-file diff (what changed in a specific file):
```
user-bitbucket-mcp-get_pull_request_diff
  workspace: {workspace}
  repository: {repository}
  pull_request_id: {pull_request_id}
  file_path: "src/auth/login.ts"
```

Scoped diff by pattern (e.g., all TypeScript files in a directory):
```
user-bitbucket-mcp-get_pull_request_diff
  workspace: {workspace}
  repository: {repository}
  pull_request_id: {pull_request_id}
  include_patterns: ["src/auth/**/*.ts"]
```

Full file content from the source branch (for understanding surrounding context):
```
user-bitbucket-mcp-get_file_content
  workspace: {workspace}
  repository: {repository}
  file_path: "src/auth/login.ts"
  branch: {source_branch}
```

For large files, use `start_line` and `line_count` to read specific sections:
```
user-bitbucket-mcp-get_file_content
  workspace: {workspace}
  repository: {repository}
  file_path: "src/auth/login.ts"
  branch: {source_branch}
  start_line: 40
  line_count: 60
```

### Phase 4: Commit History

```
user-bitbucket-mcp-list_pr_commits
  workspace: {workspace}
  repository: {repository}
  pull_request_id: {pull_request_id}
```

**Use for:**
- Purpose inference from commit messages
- Understanding the evolution of changes
- Commit count for the changeset summary

## Mapping to Changeset Resolution

After extraction, produce the changeset summary for SKILL.md Step 4:

```
Changeset source: PR URL
Base: {destination_branch} (PR target branch)
Head: {source_branch} (PR source branch)
Purpose: <inferred from PR title + description + commit messages>
Scope: {total_files} files changed across {grouped directories}
```

## Edge Cases

| Case | Handling |
|------|----------|
| Draft PR | Review is valid; note draft status in changeset summary |
| Declined PR | Ask user if they still want to review; proceed if confirmed |
| Merged PR | Review is valid (post-merge review); note merged status |
| Fork-based PR | Use `source_branch` and ensure `get_pull_request_diff` works (it reads from the PR's merge ref on server, not a local fork) |
| Truncated file_changes | If `file_changes` array length < `file_changes_summary.total_files`, report the discrepancy to the user -- some files are missing from the list |
| PR not found (404) | Report to user, ask for corrected URL |
| MCP connection failure | Report to user, suggest retry or manual diff provision |
| Empty file_changes | Report "no files changed" to user -- likely an empty PR or metadata-only change |

## Multi-PR Extraction

When the user provides multiple PR URLs for co-related projects, process them as a set.

**Do NOT** default to isolated per-PR reviews when the user supplied a set -- sequential single-PR reviews miss cross-PR context (e.g., interface changes in one repo that require corresponding changes in another). Always aggregate for a holistic review pass.

### Step 1: Parse and Validate All URLs

Apply the URL Parsing section to each URL. Collect extracted parameters into a list:
```
PRs:
  - workspace: PLAY, repository: ris-app, pull_request_id: 45
  - workspace: NEXT, repository: core-framework, pull_request_id: 222
  - workspace: NEXT, repository: admin-app, pull_request_id: 340
```

If any URL fails to parse, report it and ask the user whether to continue with the valid ones.

### Step 2: Phase 1 for Each PR

Run `get_pull_request` for each PR. Collect metadata and file lists per PR.

### Step 3: Combined Size Assessment

Sum `file_changes_summary.total_files` across all PRs. Multi-PR sets almost always exceed the progressive mode threshold -- use progressive mode unless the total is genuinely small (e.g., 2 PRs with 3 files each).

### Step 4: Progressive Mode Dispatch

Provide the reviewer with:
1. Per-PR metadata (workspace, repo, PR id, base, head, title, file count)
2. File lists grouped by PR, then by module within each PR
3. MCP access parameters for ALL PRs so the reviewer can read from any repo
4. Cross-PR relationship context (from PR descriptions, commit messages, or user input)

Example reviewer dispatch payload:
```
Multi-PR set: 3 PRs, 35 files total. Progressive review mode.

PR 1: PLAY/ris-app#45 (develop <- feature/auth, 5 files)
  MCP: workspace=PLAY, repository=ris-app, pull_request_id=45
  Files:
    src/auth/ -- AuthService.java [M], TokenValidator.java [A]
    tests/    -- AuthServiceTest.java [M]
    config/   -- security.yml [M], pom.xml [M]

PR 2: NEXT/core-framework#222 (develop <- feature/order, 20 files)
  MCP: workspace=NEXT, repository=core-framework, pull_request_id=222
  Files:
    src/order/ -- OrderService.java [M], OrderValidator.java [A], ...
    src/api/   -- OrderController.java [M], ...
    tests/     -- OrderServiceTest.java [M], ...

PR 3: NEXT/admin-app#340 (main <- feature/admin-ui, 10 files)
  MCP: workspace=NEXT, repository=admin-app, pull_request_id=340
  Files:
    src/admin/ -- OrderPanel.tsx [M], AuthSettings.tsx [A], ...
    tests/     -- OrderPanel.test.tsx [A], ...

Cross-PR relationship: Feature X implementation spanning auth (PR 1),
  order processing (PR 2), and admin UI (PR 3).

Use bitbucket-mcp tools to review each file on demand.
For each file, use the MCP params of the PR that file belongs to.
```

### Step 5: Commit History (Per PR)

Run `list_pr_commits` for each PR to understand evolution and infer combined purpose.

## Quick Reference: bitbucket-mcp Tools

| Tool | Purpose | When |
|------|---------|------|
| `get_pull_request` | Metadata, file list, reviewers | Always (Phase 1) |
| `get_pull_request_diff` | Full diff or per-file diff | Phase 3a (full) or progressive mode (per-file) |
| `get_file_content` | Read full file from branch | Progressive mode (context beyond diff) |
| `list_pr_commits` | Commit history and messages | Always (Phase 4) |
