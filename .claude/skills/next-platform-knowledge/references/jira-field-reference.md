# medavis JIRA — Field Reference

> Which field / custom-field id to use on medavis JIRA issues, with the known gotchas that have caused bugs in AI workflows (Story Points, Parent vs Epic Link). For the portfolio model (hierarchy, project mapping, parenting), see `jira-system-structure.md`.

Use the available Jira tools from an Atlassian plugin or v2 MCP connection; no particular server name or namespace is required. Follow the exposed tool schemas for the operations below.

Complete catalog of all general (system) fields and custom fields available on issues. Prefer `getJiraIssue` with `view: "evidence"` or `full`. Custom fields are under `fields.customFields` (keyed by display name, `.id` still e.g. `customfield_10000`). An explicit `fields` array is still valid and **overrides** the view fetch strategy. Calling contract: [Calling the v2 tools](../../../MCP/howto-configure-mcp-jira-wiki-v2.md#calling-the-v2-tools). Fields marked with "**⚠️**" have known gotchas.

## General (System) Fields

| Field Key | Display Name | Type / Notes |
|---|---|---|
| `summary` | Summary | String |
| `description` | Description | markdown (v2 default) |
| `issuetype` | Issue Type | Object: `name`, `id`, `hierarchyLevel`, `subtask` |
| `project` | Project | Object: `key`, `name`, `id`, `projectTypeKey` |
| `status` | Status | Object: `name`, `id`, `statusCategory` |
| `statusCategory` | Status Category | Object: `key` (`new`, `indeterminate`, `done`), `name`, `colorName` |
| `statuscategorychangedate` | Status Category Changed | ISO datetime |
| `priority` | Priority | Object: `name` (Blocker, Critical, Major, Minor, Trivial), `id` |
| `resolution` | Resolution | Object or null: `name` (Done, Won't Do, Duplicate, etc.) |
| `resolutiondate` | Resolved | ISO datetime or null |
| `assignee` | Assignee | User object or null: `displayName`, `emailAddress`, `accountId` |
| `reporter` | Reporter | User object: `displayName`, `emailAddress`, `accountId` |
| `creator` | Creator | User object: `displayName`, `emailAddress`, `accountId` |
| `parent` | Parent | Object or null: parent issue `key`, `fields.summary`, `fields.issuetype` |
| `labels` | Labels | String array |
| `components` | Components | Object array |
| `fixVersions` | Fix versions | Object array: `name`, `id`, `released`, `archived` |
| `versions` | Affects versions | Object array |
| `issuelinks` | Linked Issues | Object array: link `type`, `inwardIssue`/`outwardIssue` |
| `subtasks` | Sub-tasks | Object array |
| `created` | Created | ISO datetime |
| `updated` | Updated | ISO datetime |
| `lastViewed` | Last Viewed | ISO datetime or null |
| `duedate` | Due date | Date string or null |
| `timespent` | Time Spent | Seconds (integer) or null |
| `timeestimate` | Remaining Estimate | Seconds (integer) or null |
| `timeoriginalestimate` | Original estimate | Seconds (integer) or null |
| `aggregatetimespent` | Σ Time Spent | Seconds (integer) or null |
| `aggregatetimeestimate` | Σ Remaining Estimate | Seconds (integer) or null |
| `aggregatetimeoriginalestimate` | Σ Original Estimate | Seconds (integer) or null |
| `timetracking` | Time tracking | Object: `remainingEstimate`, `timeSpent`, `*Seconds` |
| `progress` | Progress | Object: `progress`, `total` (seconds) |
| `aggregateprogress` | Σ Progress | Object: `progress`, `total` (seconds) |
| `workratio` | Work Ratio | Integer (-1 if no estimate) |
| `worklog` | Log Work | Object: `worklogs` array, `total` |
| `votes` | Votes | Object: `votes` (count), `hasVoted` |
| `watches` | Watchers | Object: `watchCount`, `isWatching` |
| `attachment` | Attachment | Object array: `filename`, `size`, `mimeType`, `content` URL |
| `comment` | Comment | Object: `comments` array, `total` |
| `environment` | Environment | String or null |
| `security` | Security Level | Object or null |
| `issuerestriction` | Restrict to | Object |

## Custom Fields

**⚠️ CRITICAL — Parent / Epic Link disambiguation:**
- **`parent`** (system field) — **USE THIS ONE** for epic-to-task hierarchy. Returns a rich object with the parent's `key`, `summary`, `status`, `priority`, and `issuetype`. Supports cross-project parenting (e.g., Epic in TECH can parent a Task in PORTAL). Works for the full hierarchy (Strategy > Initiative > Epic > Story/Task > Sub-task).
- **`customfield_10014`** ("Epic Link") — Legacy Greenhopper field. Returns just a plain string with the epic key (e.g., `"B4MP-22"`). Jira keeps it in sync with the `parent` field for backward compatibility. Prefer `parent` for AI workflows since it provides richer context without a second API call.

**⚠️ CRITICAL — Story Points disambiguation:**
- **`customfield_10033`** ("Story Points") — **USE THIS ONE**. This is the classic Greenhopper/custom field where the team enters story points. Type: `float`.
- **`customfield_10016`** ("Story point estimate") — **DO NOT USE**. This is the Jira Software native field. It is **always null** on medavis issues. Using it will silently return 0/null for all issues.

| Field ID | Display Name | Type / Notes |
|---|---|---|
| `customfield_10000` | Development | JSON string — linked PRs, branches, commits |
| `customfield_10001` | Team | Object: `id`, `name`, `title` (e.g., "Squad 5 - Portals") |
| `customfield_10002` | Organizations | Array |
| `customfield_10010` | Request Type | JSM request type (null for software projects) |
| `customfield_10014` | Epic Link | String — epic issue key (e.g., "B4MP-22") |
| `customfield_10015` | Start date | Date string or null |
| **`customfield_10016`** | **Story point estimate** | **⚠️ ALWAYS NULL — do not use. See warning above** |
| `customfield_10017` | Issue color | String or null |
| `customfield_10019` | Rank | String — Jira rank value (e.g., "1\|i01nhx:") |
| `customfield_10020` | Sprint | Array of sprint objects: `id`, `name`, `state` (active/closed/future), `boardId`, `startDate`, `endDate` |
| `customfield_10021` | Flagged | Array or null — flagged/impediment marker |
| `customfield_10022` | Target start | Date string or null |
| `customfield_10023` | Target end | Date string or null |
| `customfield_10027` | Locked forms | Integer or null |
| `customfield_10028` | Open forms | Integer or null |
| `customfield_10029` | Submitted forms | Integer or null |
| `customfield_10030` | Total forms | Integer or null |
| `customfield_10031` | Project overview key | String or null |
| `customfield_10032` | Project overview status | String or null |
| **`customfield_10033`** | **Story Points** | **Float — the correct story points field** (e.g., 1, 3, 5, 8, 13) |
| `customfield_10065` | Work category | JSM field or null |
| `customfield_10066` | Request participants | Array |
| `customfield_10067` | Satisfaction | JSM field or null |
| `customfield_10068` | Satisfaction date | JSM field or null |
| `customfield_10069` | Approvals | JSM field or null |
| `customfield_10070` | Design | String or null |
| `customfield_10103` | Quarter | String or null |
| `customfield_10104` | Docs | String or null |
| `customfield_10105` | Docs Comment | String or null |
| `customfield_10106` | Acceptance Criteria | markdown or null |
| `customfield_10107` | Solution Ideas | markdown or null |
| `customfield_10108` | CRM_JobGGUID | String or null |
| `customfield_10109` | CRM_TicketGGUID | String or null |
| `customfield_10110` | Category | Object or null |
| `customfield_10140` | OnPrem Issue URL | String or null |
| `customfield_10141` | OnPrem Epic URL | String or null |
| `customfield_10145` | Sentiment | String or null |
| `customfield_10146` | Goals | Array or null |
| `customfield_10246` | [CHART] Date of First Response | ISO datetime or null |
| `customfield_10247` | [CHART] Time in Status | Encoded string or null |
| `customfield_10279` | Idea archived | Boolean or null |
| `customfield_10280` | Idea archived by | User object or null |
| `customfield_10281` | Idea archived on | Datetime or null |
| `customfield_10282` | Atlassian project | Object or null |
| `customfield_10283` | Atlassian project status | Object or null |
| `customfield_10284` | Insights | Object or null |
| `customfield_10285` | Comments (JPD) | Integer or null |
| `customfield_10286` | Linked items | Object or null |
| `customfield_10287` | Delivery progress | Object or null |
| `customfield_10288` | Delivery status | Object or null |
| `customfield_10328` | Integration layer | String or null |
| `customfield_10329` | PMI Time Phases | Object or null |
| `customfield_10330` | PMI Entity | String or null |
| `customfield_10331` | PMI Definition of Done | String or null |
| `customfield_10332` | PMI Responsible | String or null |
| `customfield_10334` | PMI needs discussion | Boolean or null |
| `customfield_10345` | Focus Areas | Array or null |
| `customfield_10378` | OriginalEstimation | Number or null |
| `customfield_10512` | Readiness Score | Select field or null |
| `customfield_10545` | Deviation Reason | Multi-select or null |
| `customfield_10650` | Request language | JSM field or null |
| `customfield_10651` | Urgency | JSM field or null |
| `customfield_10652` | Affected services | JSM field or null |
| `customfield_10653` | Pending reason | JSM field or null |
| `customfield_10654` | Approvers | Array or null |
| `customfield_10655` | Approver groups | Array or null |
| `customfield_10656` | Major incident | Boolean or null |
| `customfield_10657` | Responders | Array |
| `customfield_10658` | Severity | Object or null |
| `customfield_10659` | Affected hardware | Array or null |
| `customfield_10660` | Planned start | Date string or null |
| `customfield_10661` | Planned end | Date string or null |
| `customfield_10662` | Implementation plan | markdown or null |
| `customfield_10663` | Backout plan | markdown or null |
| `customfield_10664` | Test plan | markdown or null |
| `customfield_10665` | Source | Object or null |
| `customfield_10666` | Investigation reason | Object or null |
| `customfield_10667` | Root cause | Object or null |
| `customfield_10668` | Workaround | markdown or null |
| `customfield_10669` | Time to resolution | SLA/JSM field (may return permission error) |
| `customfield_10670` | Time to first response | SLA/JSM field (may return permission error) |
| `customfield_10671` | Time to close after resolution | SLA/JSM field (may return permission error) |
| `customfield_10672` | Time to review normal change | SLA/JSM field (may return permission error) |

## Querying Fields via API

Prefer `view: "evidence"` (or `full`) so custom fields are not dropped:

```
getJiraIssue(issueIdOrKey, view: "evidence")
```

Values for Story Points, Development, Acceptance Criteria, etc. may appear under `fields.customFields` (display name key, `.id` still `customfield_10033` / `customfield_10000` / `customfield_10106`) rather than as top-level `fields.customfield_*`.

An explicit `fields` array is still valid on v2 and **overrides** the view fetch strategy. Keep it when the skill only needs one custom field:

```
getJiraIssue(issueIdOrKey, fields: ["customfield_10000"])
```

The value may still be at `fields.customfield_10000` or under `fields.customFields`. Fields not on the create/edit screen (like `customfield_10033`) may not appear in `getJiraIssueTypeMetaWithFields` but are returned when requested via `view` or `fields`.
