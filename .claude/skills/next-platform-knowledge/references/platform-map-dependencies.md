# .next Platform — Dependencies, Release Levels & Critical Path

> Who depends on whom across the 33 .next projects, the release order, and the critical path / fan-in / fan-out analysis. Use this to scope a change's blast radius, sequence multi-project work, or judge regression risk. For project identities and git directories, see `platform-map-project-identity.md`; for the two lines (OLD/NEW) and which repos have which, see `platform-lines-old-new.md`; for the orientation summary, see `platform-map-overview.md`.

**Naming convention:** names below use **local git directory names** (e.g., `sms-service-client`, `coc.next`, `vaadin-ui`) unless a short form is given. To map them back to canonical project names, see `platform-map-project-identity.md` → Project-to-Directory Mapping.

## Release Levels

A project's level is 1 + the highest level among the .next projects it depends on (its parent POM and the parents of its `*-installer`/dist modules included). Projects at the same level do not depend on each other, so they can be built and released in parallel; a project is released only after everything at lower levels that it uses. Levels were computed from the pom edges on master (NEW) and on each repo's newest OLD branch, checked 2026-10.

| Level | Projects (NEW line) | Raised by (key edge) | OLD line differs |
|---|---|---|---|
| 1 | parent; appointment-booking-api | — (appointment-booking-api has its own `parent-classic` chain) | same |
| 2 | installer, random-instance-builder, cockpit-chart-service | parent | cockpit-chart-service does not exist on OLD (see the chart note below) |
| 3 | core-framework, apache-dist | random-instance-builder; installer (`installer-infrastructure` parent) | same |
| 4 | manuals, order-component, document-component, person-component, sms-service-client, medavis-clamav, component-image-viewer-2, component-calendar-viewer | core-framework (medavis-clamav also needs installer) | the two viewers are OLD only as tags with no medavis dependency (level 1); OLD-only dicom-commons, hl7-library, rest-clients sit here |
| 5 | vaadin-ui, communication-stack | manuals; order/document/person-component | same |
| 6 | admin-app | vaadin-ui | same |
| 7 | coc.next, p4m-next, b4m.next, sms-service | admin-app | **p4m-next is level 8 on OLD**, after coc.next; OLD-only report-order-service is level 8 for the same reason; coc.next, b4m.next and sms-service stay at level 7 on OLD |
| 8 | keycloak | p4m-next (`p4m.next-auth-client`) | level 9 on OLD; OLD-only report-order-importer is level 9 (needs report-order-service) |
| 9 | applicationserver, identityserver | keycloak (and `installer-infrastructure` parent) | level 10 on OLD |

Outside the levels (not Maven-layered, released on their own): `medavis.solution` (PowerShell module), `medavis.apache` (PowerShell runtime), `medavis-apache.portable` (Chocolatey package). Pins and era split: `apache-portal-stack.md`.

To re-check a level, read the repo's root **and module** poms from the ref you work on (`git -C <git_root>/<repo> show <ref>:<path>/pom.xml`), including the `<parent>` of its `*-installer` and dist modules. An old pin to a different train of a producer (for example OLD admin-app's `coc.next.version` 3.18.0.1) is a dead link to an old release, not a release-order edge.

**Chart service differs by line.** NEW: standalone `cockpit-chart-service` sits low in the levels, and admin-app,
cockpit and p4m need it released first. OLD: the chart code is the `coc.next-chart-service` module of
`coc.next`, so coc.next comes before p4m. Details: `platform-lines-old-new.md` → Chart service by line.

## Dependency Matrix

Which projects depend on which other projects (columns are dependencies, rows are dependents). Edges from both lines; a marker with `(NEW)` or `(OLD)` exists on that line only.

| Project ↓ depends on → | parent | rib | installer | core-framework | manuals | sms-client | clamav | order-comp | doc-comp | person-comp | vaadin-ui | comm-stack | image-viewer2 | calendar | chart-svc | admin-app | cockpit | p4m | rest-clients | hl7-lib | dicom-lib | booking-api | ROS | keycloak |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **random-instance-builder** | P | | | | | | | | | | | | | | | | | | | | | | | |
| **installer** | P | | | | | | | | | | | | | | | | | | | | | | | |
| **cockpit-chart-service** (NEW only) | P | | | | | | | | | | | | | | | | | | | | | | | |
| **core-framework** | P | D | | | | | | | | | | | | | | | | | | | | | | |
| **apache-dist** | | | I | | | | | | | | | | | | | | | | | | | | | |
| **manuals** | P | | I | D | | | | | | | | | | | | | | | | | | | | |
| **sms-service-client** | P | | | D | | | | | | | | | | | | | | | | | | | | |
| **medavis-clamav** | P | | I | D | | | | | | | | | | | | | | | | | | | | |
| **image-viewer2** | | | | D (NEW) | | | | | | | | | | | | | | | | | | | | |
| **calendar-component** | | | | D (NEW) | | | | | | | | | | | | | | | | | | | | |
| **order-component** | P | | | D | | | | | | | | | | | | | | | | | | | | |
| **document-component** | P | | | D | | | | | | | | | | | | | | | | | | | | |
| **person-component** | P | | | D | | | | | | | | | | | | | | | | | | | | |
| **dicom-lib** (OLD only) | P | | | D | | | | | | | | | | | | | | | | | | | | |
| **hl7-library** (OLD only) | P | | | D | | | | | | | | | | | | | | | | | | | | |
| **rest-clients** (OLD only) | P | D | | D | | | | | | | | | | | | | | | | | | | | |
| **vaadin-ui** | P | | | D | D | | | | | | | | | | | | | | | | | | | |
| **communication-stack** | P | | | D | | | | D | D | D | | | | | | | | | | | | | | |
| **admin-app** | P | D | I | D | D | D | | | | | D | | | | D (NEW) | | | | | | | | | |
| **cockpit** | P | | I | D | D | | | | | | D | | | | D (NEW) | D | | | | | | | | |
| **p4m** | P | D | I | D | D | | | D | D | D | D | D | D | | D (NEW) | D | D (OLD) | | | | | | | |
| **booking4med** | P | | I | D | D | D | D | | | | D | | | D | | D | | | | | | D | | |
| **sms-service** | P | | I | D | D | D | | | | | | | | | | D | | | | | | | | |
| **report-order-service** (OLD only) | P | D | I | D | D | | | | | | D | | | | | D | D | | D | D | | | | |
| **keycloak** | P | | | D | | | | | | | | | | | | D | | D | | | | | | |
| **report-order-importer** (OLD only) | P | | I | D | D | | | | | | | | | | | D | | | D | D | D | | D | |
| **applicationserver** | | | I | | | | | | | | | | | | | | | | | | | | | D |
| **identityserver** | | | I | | | | | | | | | | | | | | | | | | | | | D |
| **appointment-booking-api** | | | | | | | | | | | | | | | | | | | | | | | | |

**Legend:** P = parent POM (`de.medavis:parent`), D = dependency, I = the root pom or a `*-installer`/dist module is parented by `installer-web-application` or `installer-infrastructure` (see Installer relationships), `rib` = random-instance-builder, `chart-svc` = cockpit-chart-service, `ROS` = report-order-service.

**Notes on matrix:**
- `cockpit` on OLD does not depend on `chart-svc`: it produces the chart module itself. OLD admin-app pins `coc.next-chart-service` at an old 3.x train; that pin is a dead link, not a release-order edge.
- report-order-service uses the coc.next module artifact (`coc.next-chart-service`); check its pom for the version.
- The viewers' OLD line exists only as tags, with no medavis parent and no medavis dependency; their OLD consumers (p4m, booking4med) pin those tags.
- `appointment-booking-api`: uses `de.medavis:parent-classic` (different parent chain), no medavis runtime dependencies.
- `medavis.solution` is a PowerShell project - not in the Maven dependency matrix.

## Installer relationships

The `installer` repo depends on `parent` only. It is low in the levels, not at the top. Its modules
are parents for modules in other repos:

- `installer-web-application`: parent of the product `*-installer` modules (`manuals-installer`, `admin-app-installer`, `coc.next-installer`, `p4m.next-installer`, `b4m.next-installer`, `sms-service-installer`, `report-order-service-installer`, `report-order-importer-installer`).
- `installer-infrastructure`: parent of the server distributions and dist modules (`applicationserver`, `identityserver`, `apache-dist` root poms; `medavis-clamav-dist`).

Those child modules use an empty `relativePath` and pin a released installer version. A parent or
installer change reaches them through that pin, not through the product's root pom. A child module can
also re-declare a `*.version` property of its root. See `versioning-cross-project-cascade.md`.

keycloak has no installer module.

## Infrastructure Dependencies

The server distributions and apache-dist take their parent from `installer` (`installer-infrastructure`); applicationserver and identityserver also use `keycloak` artifacts. The `installer` row is shown for contrast:

| Project | Parent POM | Depends on installer | Depends on keycloak |
|---------|-----------|---------------------|---------------------|
| **applicationserver** | installer-infrastructure (from installer) | Yes (parent) | Yes (undertow-errorhandler, undertow-query-remover) |
| **identityserver** | installer-infrastructure (from installer) | Yes (parent) | Yes (userfederation-component, medavis-theme, undertow-errorhandler) |
| **apache-dist** | installer-infrastructure (from installer) | Yes (parent) | No (config zip 2.0+; see `apache-portal-stack.md`) |
| **installer** | de.medavis:parent | — | No. It depends on `parent` only and has no Maven dependency on any other medavis project. |

## Critical Path Analysis

The **critical path** (longest dependency chain) is:

```
NEW: parent → random-instance-builder → core-framework → manuals → vaadin-ui → admin-app → p4m → keycloak → applicationserver / identityserver
OLD: parent → random-instance-builder → core-framework → manuals → vaadin-ui → admin-app → cockpit → p4m → keycloak → applicationserver / identityserver
```

A second chain converges at `p4m`:

```
parent → core-framework → person-component → communication-stack ──┐
                                                                    ├──→ p4m
parent → core-framework → manuals → vaadin-ui → admin-app ──────────┘
```

Both chains must complete before `p4m` can build. The chain through `admin-app` is longer. On OLD, `cockpit` sits between `admin-app` and `p4m` because it produces `coc.next-chart-service`; on NEW, `cockpit` is a parallel consumer of `admin-app` and `p4m` needs `cockpit-chart-service` instead.

**Highest fan-out** (direct dependents, from the matrix, both lines combined):
1. **parent** - parent POM of 23 projects (plus the server dists through `installer-infrastructure`)
2. **core-framework** - 21 projects
3. **installer** - 12 projects (I markers)
4. **manuals** - 8 projects
5. **admin-app** - 7 projects (cockpit, p4m, booking4med, sms-service, report-order-service, report-order-importer, keycloak)
6. **vaadin-ui** - 5 projects (admin-app, cockpit, p4m, booking4med, report-order-service)
7. **random-instance-builder** - 5 projects (core-framework, admin-app, p4m, report-order-service, rest-clients; tied with vaadin-ui)

**Highest fan-in** (direct .next dependencies, per line):
1. **p4m** - 13 projects on each line (its matrix row has 14 markers: `chart-svc` on NEW and `cockpit` on OLD are alternatives)
2. **booking4med** - 10 projects
3. **report-order-service** - 10 projects
4. **report-order-importer** - 9 projects
5. **admin-app** - 8 projects on NEW (7 on OLD, without `cockpit-chart-service`)

## Special Notes

1. **Two projects have NO medavis parent POM**: `image-viewer2` (component-image-viewer-2) and `calendar-component` (component-calendar-viewer) are standalone Vaadin components with their own build lifecycle. On NEW they depend on core-framework; their OLD tags have no medavis dependency
2. **keycloak sits one level above p4m**: keycloak uses `p4m.next-auth-client` and `admin-app-auth-client`, so p4m and admin-app are released before keycloak. p4m does not depend on keycloak (the auth-client is a lightweight module), so there is no cycle
3. **appointment-booking-api uses a different parent**: `de.medavis:parent-classic` instead of `de.medavis:parent`
4. **applicationserver, identityserver, and apache-dist** all use `installer-infrastructure` as their parent POM (a module inside the `installer` project). applicationserver and identityserver also depend on `keycloak` artifacts for server customization
5. **medavis.solution** is a PowerShell project outside the Maven ecosystem, built with psake/PowerShellBuild, and depends on other PowerShell modules: medavis.common, medavis.postgres (not in the .next project list), plus **medavis.apache** and **certificateManagement**. Pins and era split: `apache-portal-stack.md`.
