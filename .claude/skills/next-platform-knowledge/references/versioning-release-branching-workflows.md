# .next Platform — Versioning, Branching & Release Strategy

> The 4-digit version scheme, branch types, and the epic / release / hotfix / merge-back workflows for the .next platform. Serves **development** (branch targeting and naming), **sprint planning** (epic branches + qualifier versioning), and **release management** (release/hotfix/merge-back, cross-project version alignment). For who-depends-on-whom when sequencing multi-project version bumps, see `platform-map-dependencies.md`; for the release/branch-verification traversal pattern, see `cross-project-navigation.md`. This file does **not** answer live branch contents, commit presence, or merge status; verify those with git/Bitbucket tools.

## 3.1 Version Format: `a.b.c.d`

Every .next platform project follows a 4-digit versioning scheme:

| Digit | Name | What It Represents | When It Changes |
|-------|------|--------------------|-----------------|
| `a` | **Major** | Architecture/platform generation | Platform-wide upgrade (e.g., javax→jakarta migration) |
| `b` | **Minor** | Feature release train | New feature release (aligned with release cycles) |
| `c` | **Patch** | Patch level | `c=0` = first-of-train cuts from `master`. `c≥1` = patches on `release/*`. Increments only for the next patch. |
| `d` | **Build** | Build number at this `a.b.c` | Increments for another build at the **same** `a.b.c`. Restarts at `1` when **any** of `a`, `b`, or `c` increases. A tagged ship (and a quality-gate input) may use **any** `d` — `*.*.*.1` may never have been tagged if those builds were discarded. |

**Do not treat `d=1` as required.** `8.4.0.4` is still a master-cut (`c=0`). `8.3.1.2` is still a patch (`c=1`). Previous version is the previous **existing** tag, not arithmetic `d-1` (there is no `8.3.1.0`).

**Example version progression:**

```
8.4.0.1 → 8.4.0.2 → 8.4.0.4   more builds of the same master-cut (a.b.c unchanged → d increments)
7.37.0.1  → First release of 7.37 train (c=0)
7.37.1.1  → First patch on 7.37 (c increased → d restarts at 1)
7.37.1.2  → Another build of that same patch (a.b.c unchanged → d increments)
7.37.2.1  → Second patch on 7.37 (c increased → d restarts at 1)
8.3.1.2 → 8.4.0.1   new minor train (b increased → d restarts at 1)
7.45.2.3 → 8.0.0.1   major bump (a increased → d restarts at 1)
```

## 3.2 Branch Types

| Branch Pattern | Purpose | Branches From | Merges To | Version Pattern | Example |
|---|---|---|---|---|---|
| `master` | Next release-train development | - | - | next train `-SNAPSHOT` (`a.(b+1).0.1-SNAPSHOT`; `(a+1).0.0.1-SNAPSHOT` at a major bump) | `8.4.0.1-SNAPSHOT` |
| `epic/<JIRA-EPIC>-*` | Multi-sprint epic development | `master` | `master` (when epic completes) | `a.0.0.1-<QUALIFIER>-SNAPSHOT` | `8.0.0.1-P4MP123-SNAPSHOT` |
| `feature/*` | Feature development | `master` or `epic/*` | `master` or `epic/*` | (inherits from parent branch) | - |
| `release/YYYY-MM-a.b.x.x` | Release stabilization & patches | Release tag on `master` (created when first patch needed) | Long-lived branch; individual fixes merge to `master` | `a.b.c.d-SNAPSHOT` | `7.43.1.1-SNAPSHOT` |
| `hotfix/*` | Fix for released version | `release/*` | `release/*` + `master` | (inherits from release branch) | - |
| `bugfix/*` | Bug fix during development | `master` or `epic/*` | `master` or `epic/*` | (inherits from parent branch) | - |

## 3.3 Epic Branch Workflow

Epic branches are used for large development efforts that span multiple sprints:

```
master ──────────────────────────────────────────────── master
  │                                                       ▲
  └── epic/EPIC-XXX-* ─────────────────────────────────┘
        │           ▲     │           ▲      (merge when
        │           │     │           │       epic done)
        └─ feature/A ┘    └─ feature/B ┘
           (sprint 1)        (sprint 2)
```

1. Epic branch is created from `master`
2. Feature branches are created from the epic branch for individual tasks
3. Features merge back to the epic branch
4. QA tests from the epic branch
5. When the epic is complete, the epic branch merges to `master`

**Examples:**
- `epic/P4MP-123-some-feature-p4m` — uses qualifier `P4MP123` → `8.0.0.1-P4MP123-SNAPSHOT`
- `epic/B4MP-456-booking-enhancement` — uses qualifier `B4MP456` → `8.0.0.1-B4MP456-SNAPSHOT`
- `epic/TECH-150-of-next-solution-p4m` — uses qualifier `TECH150` → `8.0.0.1-TECH150-SNAPSHOT`

The qualifier distinguishes the epic's Maven artifacts from master's regular SNAPSHOT artifacts.

## 3.4 Release Branch Workflow

Release branches **do not exist at release time**. They are created later, **from the release tag**, only when the first patch for that version is needed:

```
                     tag: v7.43.0.1
master ────────────────●──────────────────────────────────── master
                       │                                       ▲
          (branch created from tag                             │
           when first bug found)                               │
                       │                                       │
                       └── release/2026-02-7.43.x.x            │
                             │                                  │
                             └── hotfix/PORTAL-XXX ───┐        │
                                                       ▼        │
                             release/2026-02-7.43.x.x ─────────┘
                             (version bumped to 7.43.1.1)  (merge fix
                                                            to master)
```

1. A version is released from `master` and **tagged** (e.g., `v7.43.0.1`). No release branch exists yet.
2. When a bug is later found in that released version, the release branch `release/YYYY-MM-a.b.x.x` is **created from the tag** (e.g., `release/2026-02-7.43.x.x` from tag `v7.43.0.1`).
3. A hotfix branch is created from the release branch to fix the bug.
4. The patch version `c` is incremented (e.g., `7.43.0.1` becomes `7.43.1.1`) and the hotfix merges to the release branch.
5. The same fix **must also be merged to master** to prevent regression in future releases.

**Pom states observed at check time.** When verifying a release branch, the `pom.xml` you read can be in one of two valid states:
- **Right before release:** the project's own version is `a.b.c.d-SNAPSHOT` -- the version is staged and the only remaining step is dropping `-SNAPSHOT`. Check the digits against the intended release version `a.b.c.d`.
- **After release:** the branch tip has moved to `a.b.c.<d+1>-SNAPSHOT` (the next **build** at the **same** `a.b.c`, e.g. `8.3.1.2-SNAPSHOT` after `8.3.1.1` shipped). This is **not** the next patch. Any increase of `a`, `b`, or `c` restarts `d` at 1 (next patch: `8.3.2.1`; next minor: `8.4.0.1`). The **shipped** version is read from the tag `a.b.c.d`, not from the branch tip. The dependency-version checks (§3.5) apply the same way in both states.

### Practical Merge-Back Workflow (Release → Master)

Step 5 above requires a **separate PR** to master. This is done via `git cherry-pick`, not a direct merge, because the release branch carries version-specific `pom.xml` changes that must not propagate to master.

```
release/YYYY-MM-a.b.x.x ←── hotfix/<JIRA-KEY>-* ──── PR #1 (merge to release)
                                      │
                                      │ git cherry-pick <commit>
                                      ▼
master ←────── hotfix/<JIRA-KEY>-merge-back-to-master ──── PR #2 (merge to master)
```

**Step-by-step:**

| Step | Action | Branch | Details |
|------|--------|--------|---------|
| 1 | Create hotfix branch | `hotfix/<JIRA-KEY>-*` from `release/YYYY-MM-a.b.x.x` | — |
| 2 | Implement fix | `hotfix/<JIRA-KEY>-*` | Code changes + optional pom.xml version bump |
| 3 | Create PR #1 → release branch | `hotfix/<JIRA-KEY>-*` → `release/YYYY-MM-a.b.x.x` | Review, approve, merge |
| 4 | Create merge-back branch | `hotfix/<JIRA-KEY>-merge-back-to-master` from `master` | — |
| 5 | Cherry-pick the fix commit | `git cherry-pick <commit-hash>` | Only the code fix commit, NOT pom.xml version bump commits |
| 6 | Resolve conflicts (if any) | `hotfix/<JIRA-KEY>-merge-back-to-master` | Common: dependency or API differences between release and master |
| 7 | Create PR #2 → master | `hotfix/<JIRA-KEY>-merge-back-to-master` → `master` | Reference PR #1 in description |

**Key rules:**
- **PR #1 must merge first** — the release branch is the primary target
- **Cherry-pick only code fix commits**, not version bump commits — master's own version stays unchanged (its current development-train SNAPSHOT, ahead of the release train); only the code fix merges
- **Branch naming convention**: `hotfix/<JIRA-KEY>-merge-back-to-master` (append `-merge-back-to-master` to the original hotfix branch name). Examples: `hotfix/PORTAL-1159-merge-back-to-master`, `hotfix/BOOKING-456-merge-back-to-master`, `hotfix/ADMINAPP-789-merge-back-to-master`
- **PR title convention**: `[<JIRA-KEY>] Merge back <description> to master`
- **Delete the hotfix branch** after its PR is merged (both branches are single-use)

## 3.5 Cross-Project Version Alignment

All .next projects maintain **parallel version trains**. Each train's `pom.xml` references dependency versions from the **same train**:

```
                    p4m            vaadin-ui       admin-app       core-framework    parent
                    ----           ---------       ---------       ---------------   ------
master:             8.0.0.1        7.0.0.1         7.0.0.1         7.0.0.1           6.0.0.1
                    -SNAPSHOT      -SNAPSHOT        -SNAPSHOT       -SNAPSHOT         -SNAPSHOT

epic/<QUALIFIER>:   8.0.0.1        7.0.0.1         7.0.0.1         7.0.0.1           6.0.0.1
                    -<QUALIFIER>   -<QUALIFIER>     -<QUALIFIER>    -<QUALIFIER>      -<QUALIFIER>
                    -SNAPSHOT      -SNAPSHOT        -SNAPSHOT       -SNAPSHOT         -SNAPSHOT

release/2026-02:    7.43.x.x       6.14.x.x        6.50.x.x*       6.14.x.x*         5.25.x.x*
release/2025-07:    7.41.x.x       6.12.x.x        6.48.x.x        6.13.x.x*         5.24.x.x*
```

`*` = Release branch does **not yet exist**. It shows the **potential branch name pattern** derived from the concrete version referenced by downstream projects (e.g., p4m `release/2026-02` uses `core-framework 6.14.0.3` → potential branch `release/2026-02-6.14.x.x`). The **first developer who needs to fix a bug** in that project for that release train **creates the release branch** from the corresponding release tag.

**Rule:** A project's `pom.xml` on a release branch MUST reference the release (non-SNAPSHOT) versions of its dependencies, on the matching release train. A project's `pom.xml` on master MUST reference the SNAPSHOT versions **for dependencies that are being developed for the next train** (i.e. that got a new release in this train and now move to their next minor). Dependencies that did **not** get a new release in this train legitimately stay at their last-released version on master (e.g. `core-framework 7.2.0.2`, `person/order/document-component 8.2.0.2`) -- those are **NOT** leaks; the SNAPSHOT auto-resolve only applies to deps that actually moved. The leak to catch is a merge-back that carried a release-branch pom version bump across to master -- distinguished by cross-checking the master pom against the release-branch pom (an identical value because nothing moved = fine; a train-specific value that should only exist on the release branch = leak).

Unreleased upstream on a release branch: UNRESOLVED team policy. See `versioning-cross-project-cascade.md` → Unresolved policies, and ask the user before deviating from this rule.

## 3.6 Key Rules Summary

1. **Build `d`** restarts at 1 whenever **`a`, `b`, or `c` increases**. `d` increments only when `a.b.c` is unchanged. On a release branch: a **new patch** increments `c` (so `d` restarts at 1); another **build of the same patch** increments `d` only. Tagged/`d` may be `>1` if earlier builds of that `a.b.c` were not shipped.
2. **Master branch** = Only receives the code fix (merge); master's own version stays unchanged. It is master's current development-train SNAPSHOT (normally the next minor `a.(b+1).0.1-SNAPSHOT`, ahead of the release train), NOT necessarily `a.0.0.1`
3. **Cross-project dependencies on release branches** = Must explicitly update version numbers in `pom.xml` to the matching release-train versions (non-SNAPSHOT)
4. **Cross-project dependencies on master** = Dependencies that **moved** in this train reference the next-train SNAPSHOT (auto-resolves, no `pom.xml` change needed for the bump). Dependencies that **did not move** stay at their last-released version -- this is normal, NOT a leak. The only leak to flag on master is a merge-back that carried a release-branch pom version bump.
5. **Release order matters** = Fix the lowest-level producer first, then update its consumers (release levels: `platform-map-dependencies.md`; full checklist: `versioning-cross-project-cascade.md`)
6. **Every fix must go to both** release branch AND master (to avoid regression in future releases)

## 3.7 Practical Examples

### Example 1: Bug Found in p4m Alone (Released Version)

**Scenario:** A bug is discovered in the released p4m version `7.43.0.1`. The bug is only in p4m code, no dependency is involved.

| Step | Action | Branch | File Changed | Version Change |
|------|--------|--------|-------------|----------------|
| 1 | Create bugfix branch | `bugfix/PORTAL-XXX` from `release/2026-02-7.43.x.x` | - | - |
| 2 | Fix the bug | `bugfix/PORTAL-XXX` | Java source files | - |
| 3 | Bump patch version | `bugfix/PORTAL-XXX` | `pom.xml` (root + modules) | `7.43.0.1-SNAPSHOT` → `7.43.1.1-SNAPSHOT` |
| 4 | Merge to release branch | `release/2026-02-7.43.x.x` | - | Release branch now at 7.43.1.x |
| 5 | Build & release | CI/CD | - | Produces `p4m 7.43.1.1` |
| 6 | Merge fix to master | `master` | Java source files only | master stays at `8.0.0.1-SNAPSHOT` (no version change) |

**Files changed:**
- Release branch: `pom.xml` (version bump) + Java source files (bug fix)
- Master branch: Java source files only (version unchanged)

### Example 2: Bug Found in vaadin-ui Affecting Released admin-app

**Scenario:** admin-app `6.48.0.1` is released and working, but a bug is discovered that originates in vaadin-ui code. The admin-app release branch uses vaadin-ui `6.12.0.1`.

| Step | Action | Repo | Branch | File Changed | Version Change |
|------|--------|------|--------|-------------|----------------|
| 1 | Fix vaadin-ui bug | **vaadin-ui** | `bugfix/XXX` from `release/2025-07-6.12.x.x` | Java source files | - |
| 2 | Bump vaadin-ui patch | **vaadin-ui** | `bugfix/XXX` | `pom.xml` | `6.12.0.1-SNAPSHOT` → `6.12.1.1-SNAPSHOT` |
| 3 | Merge to vaadin-ui release | **vaadin-ui** | `release/2025-07-6.12.x.x` | - | vaadin-ui now at 6.12.1.x |
| 4 | Build & release vaadin-ui | **vaadin-ui** | CI/CD | - | Produces `vaadin-ui 6.12.1.1` |
| 5 | Update admin-app dependency | **admin-app** | `release/2025-07-6.48.x.x` | `pom.xml` | `medavis-ui.version`: `6.12.0.1` → `6.12.1.1` |
| 6 | Bump admin-app patch | **admin-app** | `release/2025-07-6.48.x.x` | `pom.xml` | `6.48.0.1-SNAPSHOT` → `6.48.1.1-SNAPSHOT` |
| 7 | Build & release admin-app | **admin-app** | CI/CD | - | Produces `admin-app 6.48.1.1` |
| 8 | Merge vaadin-ui fix to master | **vaadin-ui** | `master` | Java source files only | master stays at `7.0.0.1-SNAPSHOT` |
| 9 | Merge admin-app changes to master | **admin-app** | `master` | Java source files only | master stays at `7.0.0.1-SNAPSHOT` |

**Why no pom.xml change on master (Steps 8-9)?**
On master, admin-app already references vaadin-ui as `7.0.0.1-SNAPSHOT`. Since the vaadin-ui fix is also merged to vaadin-ui's master, the SNAPSHOT dependency automatically picks up the fix. No version change needed.

**Downstream impact:**
If p4m also uses the affected vaadin-ui feature, then p4m's release branch also needs:
- Update `medavis-ui.version` in pom.xml to `6.12.1.1`
- Bump p4m patch version: `7.41.0.1` → `7.41.1.1`
- On p4m master: no change needed (SNAPSHOT picks up the fix)

### Example 3: Bug Found in admin-app Alone (Released Version)

**Scenario:** admin-app `6.48.0.1` has a bug in its own code. No dependency is involved.

| Step | Action | Branch | File Changed | Version Change |
|------|--------|--------|-------------|----------------|
| 1 | Create bugfix branch | `bugfix/ADA-XXX` from `release/2025-07-6.48.x.x` | - | - |
| 2 | Fix the bug | `bugfix/ADA-XXX` | Java source files | - |
| 3 | Bump patch version | `bugfix/ADA-XXX` | `pom.xml` (root + modules) | `6.48.0.1-SNAPSHOT` → `6.48.1.1-SNAPSHOT` |
| 4 | Merge to release branch | `release/2025-07-6.48.x.x` | - | Release branch now at 6.48.1.x |
| 5 | Build & release | CI/CD | - | Produces `admin-app 6.48.1.1` |
| 6 | Merge fix to master | `master` | Java source files only | master stays at `7.0.0.1-SNAPSHOT` |

**Downstream impact on dependent projects (p4m, cockpit, booking4med, etc.):**

If the dependent projects need this fix in their released versions:

| Dependent Project | Release Branch | pom.xml Change | Version Change |
|---|---|---|---|
| p4m | `release/2025-07-7.41.x.x` | `admin-app.version`: `6.48.0.1` → `6.48.1.1` | `7.41.0.1` → `7.41.1.1` |
| cockpit | `release/YYYY-MM-X.Y.x.x` | `admin-app.version`: `6.48.0.1` → `6.48.1.1` | patch bump |
| booking4med | `release/YYYY-MM-X.Y.x.x` | `admin-app.version`: `6.48.0.1` → `6.48.1.1` | patch bump |

On master branches of dependent projects: **no changes needed** - SNAPSHOT dependencies pick up fixes automatically.
