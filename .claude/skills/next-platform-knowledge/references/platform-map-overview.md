# .next Platform — Overview (orientation, ownership, risk)

> Use this for the big picture: onboarding, sprint scoping, management/reporting, and "where will a change ripple?" For exact tables, see `platform-map-project-identity.md` and `platform-map-dependencies.md`.

## Landscape
- 33 interconnected projects. Most repos have two lines, OLD (release branches) and NEW (master), with different JDK, EE API, Vaadin and WildFly versions; see `platform-lines-old-new.md`. Release order follows the release levels (see `platform-map-dependencies.md`).

## Team ownership / geography (Bitbucket projects)
- **NEXT** — core foundation (parent, core-framework, vaadin-ui, p4m-next, admin-app, coc.next, random-instance-builder).
- **NEXT-DE** — Germany-maintained: most components, services, server distributions, libraries (largest, ~17 repos).
- **NEXT-CN** — China-maintained: b4m.next, component-image-viewer-2, component-calendar-viewer, medavis-clamav, cockpit-chart-service.
- **RINF**, **PSH**, **PDD** — appointment-booking-api; medavis.solution and medavis.apache; chocolatey (medavis-apache.portable).

## Risk / blast-radius (read before planning a cross-project change)
- **core-framework** = highest fan-out after the `parent` POM (21 direct dependents); nearly everything depends on it — a change here cascades platform-wide.
- **admin-app** = 7 direct dependents.
- **vaadin-ui** = 5 dependents.
- **p4m** = highest fan-in (depends on 13) and the largest integration-test suite — highest review/regression complexity.
- Critical path: parent → random-instance-builder → core-framework → manuals → vaadin-ui → admin-app → p4m → keycloak → server distributions (on OLD, cockpit sits between admin-app and p4m).

## Key Takeaways

1. **33 projects** comprise the .next platform
2. **core-framework is the most critical dependency** — nearly every runtime project depends on it; any issue here cascades widely (`cockpit-chart-service`, installer, apache-dist, the server distributions and appointment-booking-api do not)
3. **admin-app is the most depended-upon application** — 7 downstream projects depend on it
4. **p4m has the widest dependency breadth** (13 direct .next dependencies per line) and the largest integration-test suite — highest review complexity
5. **Release order matters** — producers before consumers, by release level; OLD and NEW differ
6. **Project names often differ from git directory names** — always use the mapping table
7. **Two standalone components** (image-viewer2, calendar-component) have no parent POM — independent build lifecycle
8. **Epic branches use qualifier-based versioning** (e.g., `X.0.0.1-TECH150-SNAPSHOT`, `X.0.0.1-P4MP123-SNAPSHOT`) to isolate Maven artifacts from master's regular SNAPSHOTs
9. **PORTAL is the dominant JIRA project** — 10 of 33 projects track tasks there, including p4m and most shared components
10. **Three naming layers exist per project** — canonical name, local git directory, and Bitbucket repository slug may all differ (e.g., `cockpit` -> `d:\git\coc.next\` -> `NEXT/coc.next`). See `platform-map-project-identity.md` for the cross-references.

## Release Levels (summary)

Bottom to top: foundation (parent, installer, random-instance-builder) → core-framework → libraries and domain components → UI framework and communication-stack (vaadin-ui, communication-stack) → admin-app → applications (cockpit, p4m, booking4med, sms-service; report-order-service on OLD) → keycloak (with report-order-importer on OLD) → server distributions (applicationserver, identityserver). On OLD, cockpit comes before p4m because it still produces the chart module.

Exact levels per line, the dependency matrix and the installer relationships: `platform-map-dependencies.md` → Release Levels. The PowerShell and Chocolatey pieces (`medavis.solution`, `medavis.apache`, `medavis-apache.portable`) are outside the levels. Apache era split: `apache-portal-stack.md`.
