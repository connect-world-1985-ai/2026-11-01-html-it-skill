# Transitive Dependency Scope (companion to Step 1.4)

> The named bundle the user gives you is the *starting* scope, almost never the *full*
> stack. A medavis dependency whose version **changed vs the confirmed compare-to**
> is a separate repo with its own changeset -- its own commits, its own release
> ticket(s), its own pom to verify. If you gate only the named products you can ship
> an un-gated change. This file is the **worked example** and the artifact-id gotchas.
> The confirmation table, previous-`c` default, SNAPSHOT this-ship, and HARD STOP
> live in `compare-stack.md`. Do not start Aspect 1 from this file's train-baseline
> tags.

**Two ranges:**

| Range | Where | Used for |
|---|---|---|
| This ship vs **previous `c`** (highest `d`) | `compare-stack.md` | Confirmation table; Aspect 1; **patch** Aspect 4 |
| This ship vs **train baseline** (earliest `a.b.0.*`) | Aspect 3 in `patch-release.md` (master-cut analog: `master-cut.md`) | Moved-vs-not-moved on master |

The `*.version` diff below against train baseline is the Aspect 3 classifier
and the historical example. It is **not** the Aspect 1 compare-to default.

## Why this matters

A coordinated release train bumps shared libraries. Those libraries:

1. **Carry their own release tickets.** A ticket can live entirely inside a moved dep and
   appear in NO named product's log. (Worked example below: `PORTAL-1263` exists only in
   `vaadin-ui`.)
2. **Carry security-relevant change.** The other half of a change is often in the library.
   (Worked example: the `MaxEntitySizeHandler` removal of `PORTAL-1197` lived in
   `keycloak-component`, not in `applicationserver`.)
3. **Have their own pom to verify** for Aspects 2/3 and their own merge-back for Aspect 4.

So every stack child whose version **changed vs the confirmed compare-to** is gated
through **all four aspects**, exactly like a named product. Unchanged stack rows stay
in the confirmation table; they do not get a git-log unless the user asks.

## The enumeration method -- a recursive worklist

**For the confirmation table (Step 1.4):** walk **all** medavis `*.version`
properties at this-ship vs default compare-to (previous `c`), including unchanged
and `-SNAPSHOT` cells -- see `compare-stack.md`. That walk is the stack the user
confirms.

**For Aspect 3 (later):** on each **gated** repo, classify moved-vs-not by
diffing `*.version` between train baseline (earliest existing `a.b.0.*` -- often
`.0.1`, not a formula) and this release (the gated tag, or the branch tip if still
`-SNAPSHOT`):

   ```bash
   diff <(git -C <R> show <baseline-tag>:pom.xml | grep -oE "<[a-zA-Z0-9._-]+\.version>[^<]+</[a-zA-Z0-9._-]+\.version>" | sort) \
        <(git -C <R> show <release-tag>:pom.xml  | grep -oE "<[a-zA-Z0-9._-]+\.version>[^<]+</[a-zA-Z0-9._-]+\.version>" | sort) \
     | grep -E "^[<>]"
   ```
   (`diff <(...)` is bash/Git-Bash syntax; in POSIX `sh`/PowerShell, diff two temp files
   instead. A property on only one side = a dep added/removed this train: mark it as
   `INVESTIGATE`, don't ignore it.)

A two-sided value change is the child's train-baseline vs this-ship pair for
**Aspect 3 classification**. Do not use that pair as the Aspect 1 range -- Aspect 1
uses the confirmed previous-`c` (or user-chosen same-`c` `d`) from `compare-stack.md`.
Third-party properties (not in the medavis map) are noted, not gated.

**Deep-chain note (A -> B -> C -> D).** The confirmation-table walk in
`compare-stack.md` is a recursive closure. A child can hide deeper: if D's version
appears only in C's pom, a named-product-only scan never sees D. Do not stop at the
named products' direct dependencies.

**Termination.** The confirmation-table walk visits named products plus every medavis
dep they declare, recursively -- including unchanged rows. Aspect 3's train-baseline
diff then classifies those poms. The "~33 repos" figure is a halting ceiling, not
the work done every run.

## Artifact-id → repo gotchas (illustrative)

The pom property name is the **artifact id**, not the git repo name. A few common foot-guns:

| pom property | repo (git dir) |
|---|---|
| `medavis-ui.version` | `vaadin-ui` |
| `keycloak.component.version` | `keycloak` |
| `image-viewer-2-component.version` | `component-image-viewer-2` |
| `cockpit-chart-service.version` | **era-dependent** — `1.x.x` + artifact `cockpit-chart-service` → `cockpit-chart-service`; legacy `coc.next-chart-service` / cockpit 6.x/7.x → `coc.next` |

> Illustrative only -- the **full, authoritative** list is in
> `next-platform-knowledge/references/platform-map-project-identity.md` ->
> *Pom-Property (Artifact-Id) → Repo Mapping*. Resolve every property there.

## Worked example -- p4m 8.3.1.1 bundle (2026-06)

**Named bundle given by the user (6 repos):** p4m 8.3.1.1, adminapp 7.3.1.1,
cockpit4med 7.3.1.1, booking4med 8.3.1.1, applicationserver 2.3.1.1, identityserver 2.3.1.1.

The p4m diff surfaced all movers at level 1 only because p4m's root pom is a fat
aggregator that declares the whole medavis stack directly. That is not a general guarantee:
thin poms (for example `applicationserver`) do not list the deep stack, which is why the
worklist recursion is required in general.

**Worked tags** (this example's actual tags were train baseline `*.0.1` → this
patch `*.1.1` / `*.1.2`; that is not a universal digit formula -- see
`versioning-release-branching-workflows.md` §3.1). Here previous `c` and train
baseline happen to be the same (`c=0`), which is why Aspect 1 and the example
diff look identical. On a later patch (`8.3.2.1` vs highest `8.3.1.*`) they
diverge -- Aspect 1 uses previous `c`; Aspect 3 still uses `a.b.0.*`.

```
p4m-next        : admin-app 7.3.0.1->7.3.1.1 ; medavis-ui 7.3.0.1->7.3.1.1
admin-app       : medavis-ui 7.3.0.1->7.3.1.1
coc.next        : admin-app 7.3.0.1->7.3.1.1 ; medavis-ui 7.3.0.1->7.3.1.1
b4m.next        : admin-app 7.3.0.1->7.3.1.1 ; medavis-ui 7.3.0.1->7.3.1.1
applicationserver : keycloak.component 5.3.0.1->5.3.1.2
identityserver  : medavis-keycloak-component 5.3.0.1->5.3.1.2
```

**Moved deps (deduped):** `admin-app` (already a named product), `medavis-ui`,
`keycloak-component`.

**Transitive additions to scope (2 repos):**
- `medavis-ui` -> **`vaadin-ui`** @ 7.3.1.1 (train 7.3.x.x, baseline 7.3.0.1)
- `keycloak-component` -> **`keycloak`** @ 5.3.1.2 (train 5.3.x.x, baseline 5.3.0.1)

**Why each mattered (what gating them caught):**
- `vaadin-ui` 7.3.0.1..7.3.1.1 carried **`PORTAL-1263`** "restore UserMenu desktop/mobile
  name display after Vaadin 24 migration" -- a release ticket present in NO named product.
  Aspects 2/3/4 PASS; Aspect 1 = low-risk UI fix.
- `keycloak` 5.3.0.1..5.3.1.2 carried the **`PORTAL-1264`** removal of the
  `max-entity-size-handler` module (the `MaxEntitySizeHandler` Java class lived here, not in
  applicationserver). This is the keycloak half of reverting **`PORTAL-1197`** "add max
  entity size filter for security" -- a control shipped in 2.3.0.1. Confirming the revert is
  COMPLETE (no dangling handler class / module entry) required reading this repo.

**Final scope = 8 repos:** 6 named products + `vaadin-ui` + `keycloak`. Without Step 1.4,
both transitive repos -- and ticket `PORTAL-1263` -- would have shipped un-gated.

## Quick checklist

- [ ] Built the compare-stack table (`compare-stack.md`) for named products + derived stack
      (this ship vs previous `c`, including `-SNAPSHOT`) and **waited for confirm**.
- [ ] Recursed until no new medavis children appeared (fixpoint) -- did NOT stop at the
      named products' direct dependencies.
- [ ] Mapped each artifact id to its **repo** (names differ from artifact ids; era rules).
- [ ] Gated named products + **changed** stack rows through all four aspects (Aspect 1 on
      the confirmed compare-to, not previous existing same-`c` tag).
- [ ] Used train baseline `a.b.0.*` only for Aspect 3 moved-vs-not, not as silent Aspect 1
      compare-to.
- [ ] Marked stack children explicitly in the confirmation table and the go/no-go report.
