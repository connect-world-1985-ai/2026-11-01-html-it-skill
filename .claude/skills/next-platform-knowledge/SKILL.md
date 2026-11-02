---
name: next-platform-knowledge
description: Use when any task concerns the medavis .next platform — running or debugging .next integration tests locally (Arquillian/WildFly/Maven Failsafe; p4m, admin-app, booking4med, sms-service, core-framework, …); locating a .next project's git directory, Java package owner, dependency, or release order across the 33-project platform; planning or scoping a change/feature/refactor that spans multiple .next projects; working with the medavis JIRA portfolio (issue hierarchy, project mapping, Story Points / Sprint / custom-field ids and their gotchas); .next versioning, OLD/NEW line, branching, release/hotfix, merge-back-to-master, or cross-project version alignment; running a cross-project AI code review of a .next epic; or answering development, QA, sprint-planning, release-management, architecture, or onboarding questions about the platform. Covers medavis/de.medavis, p4m-next, WildFly 21/36, javax/Jakarta stacks, Bitbucket Server, and Atlassian JIRA for the platform.
---

# medavis .next Platform Knowledge

## Overview

Single entry point ("dispatcher") for the team's accumulated knowledge about the medavis **.next** platform — a 33-project enterprise system. This skill does not hold all detail inline; it **routes** you to the one reference file you need and loads only that. Read the dispatch table, open the matching reference file(s), then act.

**This is a multi-purpose knowledge base.** Consult it for development, QA, sprint planning, release management, architecture, and management/reporting questions about the .next platform — not only coding tasks. Answer by the asker's *information need*, navigating across reference files as needed (cross-project questions often take two or three hops).

**Boundary:** this skill supplies the *map, method, policy, and where-to-look*. Live data (actual diffs, branch state, JIRA query results) is fetched by your tools (git, Bitbucket MCP, available Atlassian plugin or v2 MCP tools). Jira/Confluence operation names in the references do not require a particular server name or namespace; follow the exposed tool schemas. The skill directs and structures the check; it does not store live answers.

## Per-user setup (runs FIRST, every session, regardless of task or IDE context)

Two layers, both resolved via the config protocol in `references/config.md`:

1. **`git_root` — resolve on the first .next reference in every session, before any git/dir-based action.** Needed for locating projects, `git fetch` / `git log` / `git show`, reading `pom.xml` from a branch, branch/tag verification, release checks, etc. — i.e. for almost every task, not only local commands. **Do NOT infer it from IDE workspace paths, open folders, the current working directory, or carry-over memory** — those are hints, not substitutes. Read `config.md`; if `git_root` is absent or its directory does not exist, ask the user (question channel), then write it to `config.md` before proceeding. See `references/config.md` → `git_root` resolution.
2. **Toolchain paths (`*_java_home`, `*_maven_home`, `appserver_home`) — resolve only when a Maven / `jboss-cli` / local-server command is about to run.** Never hardcode the example paths that appear in the reference files. See `references/config.md` → Toolchain resolution protocol.

**This runs in every IDE / harness** (Cursor, Claude Code, Codex, …) and **regardless of what context the IDE attaches** (workspace paths, open files, cwd). IDE-provided context is never a substitute for the stored `config.md` values.

## Dispatch table — by task

| When the task is… | Read |
|---|---|
| Run / debug .next integration tests locally | `references/integration-tests-prerequisites.md`, `references/integration-tests-running-and-results.md`, then `references/integration-tests-troubleshooting.md` / `references/integration-tests-server-logs.md` as needed |
| "Which apps have integration tests / datasource / persistence unit?" | `references/integration-tests-applications.md` |
| Understand the IT architecture (Failsafe/Arquillian/WildFly) | `references/integration-tests-architecture.md` |
| Locate a project's git dir; resolve a Java package → project; find a project's Bitbucket repo / JIRA project | `references/platform-map-project-identity.md`; if this lookup is part of adding/changing/refactoring code, also read `references/cross-project-navigation.md` |
| Map a pom `*.version` property / artifact id → its git repo (e.g. `medavis-ui` → `vaadin-ui`) | `references/platform-map-project-identity.md` (Pom-Property (Artifact-Id) → Repo Mapping) |
| Dependencies, release levels / build order, critical path, what-depends-on-what | `references/platform-map-dependencies.md` |
| Orient / onboard / "big picture": landscape, team ownership, risk | `references/platform-map-overview.md` |
| *Any* work spanning multiple .next projects (feature, change, refactor, impact analysis, ideation) | `references/cross-project-navigation.md` (+ `platform-map-*` facts) |
| Cross-project AI code review of an epic | `references/cross-project-review-workflow.md`, `references/cross-project-review-findings-format.md` (built on `cross-project-navigation.md`) |
| Versioning, branching, release/hotfix, merge-back, cross-project version alignment | `references/versioning-release-branching-workflows.md`; for live branch/commit/merge verification, also read `references/cross-project-navigation.md` |
| Cascade a change across projects (parent fix, library bump, version alignment); release order of several projects | `references/versioning-cross-project-cascade.md`, `references/platform-map-dependencies.md` (Release Levels), `references/platform-lines-old-new.md` |
| OLD vs NEW line: which stack a branch is on, JDK/EE/Vaadin per line, a version from the other line in a pom | `references/platform-lines-old-new.md` |
| Portal Apache / apache-dist 1.x vs 2.0+ / medavis.apache / medavis-apache.portable / how those versions relate | `references/apache-portal-stack.md`, plus identity for git dirs |
| medavis JIRA: issue hierarchy, project mapping, planning↔implementation, parenting | `references/jira-system-structure.md` |
| medavis JIRA: which field/custom-field id to use (Story Points, Sprint, Epic Link, parent…) + gotchas | `references/jira-field-reference.md` |

## Dispatch table — by lens (information need)

| If the asker's angle is… | Likely files |
|---|---|
| **Development** (write/locate code) | platform-map-project-identity, cross-project-navigation, versioning (branch targeting), versioning-cross-project-cascade, platform-lines-old-new |
| **QA / testing** | integration-tests-*, platform-map-overview (coverage) |
| **Sprint planning** (scope/estimate) | platform-map-dependencies (blast radius / release levels), jira-* (story points, epics, parenting), versioning (epic branches) |
| **Release management** | versioning-release-branching-workflows, versioning-cross-project-cascade, platform-lines-old-new, platform-map-dependencies (release levels), cross-project-navigation (release/branch-verification) |
| **Architecture / ideation** | platform-map-dependencies (release levels/critical path), cross-project-navigation, platform-map-overview |
| **Management / reporting** | platform-map-overview (ownership/risk), jira-* (status/progress/fix-version fields, JQL) — respect the live-data boundary above |
| **Onboarding** | platform-map-overview first, then drill down |

## Extending this knowledge base

When you add new team knowledge:
1. **File content by cohesive topic** — add a `references/<topic>-<name>.md` (flat folder, topic-prefixed filename). New detail on an existing topic = a new/expanded reference file; zero always-loaded cost.
2. **Wire access by information need** — add a row to the dispatch table(s), framed by what the asker needs (lens-inclusive), not only by one action. Keep triggers anchored to the .next platform.
3. Add a *new skill* only if a genuinely different domain emerges; platform knowledge stays here.
