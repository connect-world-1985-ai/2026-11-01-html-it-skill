# .next Platform — Project Identity & Code Location

> The identity tables for the 33 .next projects: canonical name ↔ local git directory ↔ JIRA project ↔ Bitbucket repo, plus the Java-package → project/git-dir reverse lookup. Use this to locate a project's code, resolve an `import` to its owning project, or find a project's Bitbucket repo / JIRA project. For dependencies and release levels, see `platform-map-dependencies.md`; for the big picture, see `platform-map-overview.md`. Portal Apache 1.x vs 2.0+ layers, pins, and version schemes: `apache-portal-stack.md`.

> Local git directories use the example root `d:\git\`. Resolve the actual root per developer via `config.md` (`git_root`).

## Project Inventory (project → packages, test counts)

Given a project, find its packages. For the reverse lookup (package → project), see the Package-to-Project Mapping below.

| # | Project Name | Description | Base Package(s) | Unit Tests (as counted 2026-06) | Integration Tests (as counted 2026-06) |
|---|---|---|---|---|---|
| 1 | parent | Maven parent POM for all medavis .next projects | *(no Java)* | none | none |
| 2 | installer | Chocolatey package build for medavis infrastructure and web apps | *(no Java)* | none | none |
| 3 | random-instance-builder | Random test data generator for unit tests | `de.medavis.instancebuilder` | none | none |
| 4 | core-framework | Shared EJB/Jakarta EE framework and core libraries | `de.medavis.framework`, `de.medavis.common`, `de.medavis.logging`, `de.medavis.rest`, `de.medavis.keycloak.client`, `de.medavis.eventsync` | 235 | 163 |
| 5 | manuals | User manual and documentation system for medavis.next | `de.medavis.manuals` | none | none |
| 6 | vaadin-ui-framework | Shared Vaadin Flow UI framework, themes, and components | `de.medavis.vaadin`, `de.medavis.documentviewer`, `de.medavis.p4m.shared.ui`, `de.medavis.ros.sharedui`, `de.medavis.webview2`, `de.medavis.component` | 115 | none |
| 7 | order-component | Medical imaging orders, procedures, and studies | `de.medavis.order` | 25 | 56 |
| 8 | document-component | Document storage, viewing, and thumbnail generation | `de.medavis.document` | 4 | 13 |
| 9 | person-component | Patient and person demographics management | `de.medavis.person` | 24 | 62 |
| 10 | communication-stack | HL7/DICOM messaging and integration with ActiveMQ | `de.medavis.communication` | 196 | none |
| 11 | image-viewer2 | Vaadin Flow medical image viewer component | `de.medavis.imageviewer` | none | none |
| 12 | sms-client | REST client for SMS service API | `de.medavis.sms.webservice` | 11 | none |
| 13 | Adminapp | Medical administration and configuration web application | `de.medavis.admin` | 169 | 222 |
| 14 | p4m | Main radiology portal web application | `de.medavis.p4m`, `de.medavis.workflow`, `de.medavis.masterdata`, `de.medavis.common.document` | 71 | 491 |
| 15 | cockpit | Clinical dashboard and analytics web application | `de.medavis.coc` | 1 | none |
| 16 | keycloak-component | Keycloak identity integration and themes | `de.medavis.keycloak` | 83 | none |
| 17 | calendar-component | Vaadin Flow calendar viewer UI component | `de.medavis.fullcalendar` | none | none |
| 18 | clamav | ClamAV antivirus integration (server + Java client SDK) | `de.medavis.clamav` | none | none |
| 19 | smsservice | SMS messaging service for notifications | `de.medavis.sms`, `de.medavis.communication.sms` | 40 | 26 |
| 20 | appointment-booking-api | RIS appointment booking API library | `de.medavis.appointmentbooking` | none | none |
| 21 | booking4med | Patient appointment booking web application | `de.medavis.b4m`, `de.medavis.bookingapi` | 35 | 61 |
| 22 | medavis.solution | PowerShell deployment and configuration orchestration module | *(PowerShell)* | none | none |
| 23 | identityserver | Keycloak-based identity and SSO server packaging | *(no Java)* | none | none |
| 24 | applicationserver | WildFly-based Java application server packaging for medavis | *(no Java)* | none | none |
| 25 | apache-dist | Portal Apache config zip (2.0+) or 1.x httpd+Chocolatey packaging; see `apache-portal-stack.md` | *(no Java)* | none | none |
| 26 | dicom-lib | DICOM stream handling library for medical imaging | `de.medavis.dicom` | unknown | unknown |
| 27 | hl7-lib | HL7 message processing via MLLP with Apache Camel | `de.medavis.hl7` | unknown | unknown |
| 28 | rest-clients | REST API client libraries for medavis solutions | `de.medavis.restclient`, `de.medavis.roi.rest`, `de.medavis.rs` | unknown | unknown |
| 29 | ReportOrderService | Radiology report order management service with REST, HL7, Excel export | `de.medavis.ros`, `de.medavis.study`, `de.medavis.cms`, `de.medavis.directoryservice`, `de.medavis.dataexporter` | unknown | unknown |
| 30 | ReportOrderImporter | Imports HL7 and DICOM report orders into ReportOrderService | `de.medavis.roi` | unknown | unknown |
| 31 | cockpit-chart-service | Standalone chart REST library extracted from cockpit (COCKPIT-49, 2026-04-07) to break the coc.next ↔ admin-app cycle | `de.medavis.coc.chartservice` | unknown | none |
| 32 | medavis.apache | PowerShell runtime for installed Portal Apache (not Maven) | *(PowerShell)* | none | none |
| 33 | medavis-apache.portable | Chocolatey ship/install of Lounge + apache-dist overlay + bundled modules | *(Chocolatey package)* | none | none |

## Project-to-Directory Mapping

The critical mapping between canonical project names and local git repository directories under `d:\git\`.

| # | Canonical Project Name | Local Git Directory | Name Match |
|---|---|---|---|
| 1 | parent | `d:\git\parent\` | Exact |
| 2 | installer | `d:\git\installer\` | Exact |
| 3 | random-instance-builder | `d:\git\random-instance-builder\` | Exact |
| 4 | core-framework | `d:\git\core-framework\` | Exact |
| 5 | manuals | `d:\git\manuals\` | Exact |
| 6 | vaadin-ui-framework | `d:\git\vaadin-ui\` | Different |
| 7 | order-component | `d:\git\order-component\` | Exact |
| 8 | document-component | `d:\git\document-component\` | Exact |
| 9 | person-component | `d:\git\person-component\` | Exact |
| 10 | communication-stack | `d:\git\communication-stack\` | Exact |
| 11 | image-viewer2 | `d:\git\component-image-viewer-2\` | Different |
| 12 | sms-client | `d:\git\sms-service-client\` | Different |
| 13 | Adminapp | `d:\git\admin-app\` | Different |
| 14 | p4m | `d:\git\p4m-next\` | Different |
| 15 | cockpit | `d:\git\coc.next\` | Different |
| 16 | keycloak-component | `d:\git\keycloak\` | Different |
| 17 | calendar-component | `d:\git\component-calendar-viewer\` | Different |
| 18 | clamav | `d:\git\medavis-clamav\` | Different |
| 19 | smsservice | `d:\git\sms-service\` | Different |
| 20 | appointment-booking-api | `d:\git\appointment-booking-api\` | Exact |
| 21 | booking4med | `d:\git\b4m.next\` | Different |
| 22 | medavis.solution | `d:\git\medavis.solution\` | Exact |
| 23 | identityserver | `d:\git\identityserver\` | Exact |
| 24 | applicationserver | `d:\git\applicationserver\` | Exact |
| 25 | apache-dist | `d:\git\apache-dist\` | Exact |
| 26 | dicom-lib | `d:\git\dicom-commons\` | Different |
| 27 | hl7-lib | `d:\git\hl7-library\` | Different |
| 28 | rest-clients | `d:\git\rest-clients\` | Exact |
| 29 | ReportOrderService | `d:\git\report-order-service\` | Different (case) |
| 30 | ReportOrderImporter | `d:\git\report-order-importer\` | Different (case) |
| 31 | cockpit-chart-service | `d:\git\cockpit-chart-service\` | Exact |
| 32 | medavis.apache | `d:\git\medavis.apache\` | Exact |
| 33 | medavis-apache.portable | `d:\git\chocolatey\` | Different (monorepo) |

### Notes on Name Differences

- **vaadin-ui-framework** vs `vaadin-ui`: The Bitbucket repo is named differently from the canonical project name
- **Adminapp** vs `admin-app`: Canonical name uses camelCase, directory uses kebab-case
- **p4m** vs `p4m-next`: The `.next` suffix in the directory distinguishes it from the legacy p4m
- **cockpit** vs `coc.next`: Short canonical name, `.next` suffix in directory
- **cockpit-chart-service**: on the NEW line, its own git repo (extracted in COCKPIT-49, 2026-04-07); on the OLD line, still the `coc.next-chart-service` *module* of `coc.next` (see `platform-lines-old-new.md` → Chart service by line). Not the same as canonical project `cockpit`.
- **medavis-apache.portable**: not its own git repo. Gate path `packages/portable/medavis-apache.portable` inside the `chocolatey` monorepo. Not a Maven artifact — do not add to the pom-property table.
- **medavis.apache**: PowerShell module, not a Maven artifact — do not add to the pom-property table.
- **installer**: means two things. (1) The `installer` repo; it depends on parent only. (2) The `*-installer` / dist modules in product repos, whose parent is the repo's `installer-web-application` or `installer-infrastructure` module. Say which one you mean.

## JIRA Project Mapping

Maps each canonical .next project to its JIRA project (on `medavis.atlassian.net`). JIRA projects are where implementation tasks are tracked. A single JIRA project often covers multiple .next projects (e.g., `PORTAL` covers p4m and most of its dependencies). For the issue hierarchy and field ids, see `jira-system-structure.md` and `jira-field-reference.md`.

| # | Canonical Project Name | JIRA Project | JIRA Project Name |
|---|---|---|---|
| 1 | parent | PORTAL | Portal4med |
| 2 | installer | PORTAL | Portal4med |
| 3 | random-instance-builder | SQ5GEN | Squad 5 General |
| 4 | core-framework | PORTAL | Portal4med |
| 5 | manuals | MANUALS | ManualsNextApplications |
| 6 | vaadin-ui-framework | PORTAL | Portal4med |
| 7 | order-component | PORTAL | Portal4med |
| 8 | document-component | PORTAL | Portal4med |
| 9 | person-component | PORTAL | Portal4med |
| 10 | communication-stack | PORTAL | Portal4med |
| 11 | image-viewer2 | PORTAL | Portal4med |
| 12 | sms-client | SMSSERV | SmsService |
| 13 | Adminapp | ADMINAPP | ADMINAPP |
| 14 | p4m | PORTAL | Portal4med |
| 15 | cockpit | COCKPIT | cockpit4med |
| 16 | keycloak-component | ADMINAPP | ADMINAPP |
| 17 | calendar-component | BOOKING | booking4med |
| 18 | clamav | BOOKING | booking4med |
| 19 | smsservice | SMSSERV | SmsService |
| 20 | appointment-booking-api | BOOKING | booking4med |
| 21 | booking4med | BOOKING | booking4med |
| 22 | medavis.solution | NEXTPOSH | NEXTPOSH |
| 23 | identityserver | IDSERVER | IdentityServer |
| 24 | applicationserver | APPSERVER | ApplicationServer |
| 25 | apache-dist | WEBPROXY | WEBPROXY |
| 26 | dicom-lib | SQ5GEN | Squad 5 General |
| 27 | hl7-lib | SQ5GEN | Squad 5 General |
| 28 | rest-clients | SQ5GEN | Squad 5 General |
| 29 | ReportOrderService | TELESERV | On-Premise Teleradiology |
| 30 | ReportOrderImporter | TELESERV | On-Premise Teleradiology |
| 31 | cockpit-chart-service | COCKPIT | cockpit4med |
| 32 | medavis.apache | WEBPROXY | WEBPROXY |
| 33 | medavis-apache.portable | DNA | DNA |

### JIRA Projects Summary (grouped)

| JIRA Project | # Projects | Projects |
|---|---|---|
| PORTAL | 10 | parent, installer, core-framework, vaadin-ui-framework, order-component, document-component, person-component, communication-stack, image-viewer2, p4m |
| BOOKING | 4 | calendar-component, clamav, appointment-booking-api, booking4med |
| SQ5GEN | 4 | random-instance-builder, dicom-lib, hl7-lib, rest-clients |
| ADMINAPP | 2 | Adminapp, keycloak-component |
| SMSSERV | 2 | sms-client, smsservice |
| TELESERV | 2 | ReportOrderService, ReportOrderImporter |
| COCKPIT | 2 | cockpit, cockpit-chart-service |
| MANUALS | 1 | manuals |
| NEXTPOSH | 1 | medavis.solution |
| IDSERVER | 1 | identityserver |
| APPSERVER | 1 | applicationserver |
| WEBPROXY | 2 | apache-dist, medavis.apache |
| DNA | 1 | medavis-apache.portable |

#### Notes

- **PORTAL is the catch-all** for p4m and most shared components (core-framework, vaadin-ui, domain components). When in doubt about a shared library, PORTAL is the most likely JIRA project.
- **SQ5GEN** ("Squad 5 General") is for standalone utility libraries that don't belong to a specific application.
- **keycloak-component → ADMINAPP** (not a dedicated Keycloak JIRA project) because the keycloak component primarily integrates with admin-app's user federation.
- **calendar-component, clamav → BOOKING** because these components are primarily used by booking4med.
- **TELESERV** covers the ReportOrder* projects (on-premise teleradiology platform).
- **medavis.apache** has no single JIRA project in git history: WEBPROXY-11 is the dominant Apache-runtime key; NEXTPOSH-4 also appears. PORTAL-1329 is the *solution* pin of `RequiredVersion = 1.0.58`, not a medavis.apache ticket. WEBPROXY is the listed project.
- **medavis-apache.portable** lives in the chocolatey monorepo. Recent work uses DNA (e.g. DNA-476); older history uses IN-*. DNA is the listed project.

## Bitbucket Repository Mapping

Maps each canonical .next project to its Bitbucket Server repository on `git.medavis.local`. The Bitbucket project key and repository slug are needed for Bitbucket MCP API calls.

| # | Canonical Project Name | Bitbucket Project | Repository Slug |
|---|---|---|---|
| 1 | parent | NEXT | parent |
| 2 | installer | NEXT-DE | installer |
| 3 | random-instance-builder | NEXT | random-instance-builder |
| 4 | core-framework | NEXT | core-framework |
| 5 | manuals | NEXT-DE | manuals |
| 6 | vaadin-ui-framework | NEXT | vaadin-ui |
| 7 | order-component | NEXT-DE | order-component |
| 8 | document-component | NEXT-DE | document-component |
| 9 | person-component | NEXT-DE | person-component |
| 10 | communication-stack | NEXT-DE | communication-stack |
| 11 | image-viewer2 | NEXT-CN | component-image-viewer-2 |
| 12 | sms-client | NEXT-DE | sms-service-client |
| 13 | Adminapp | NEXT | admin-app |
| 14 | p4m | NEXT | p4m-next |
| 15 | cockpit | NEXT | coc.next |
| 16 | keycloak-component | NEXT-DE | keycloak |
| 17 | calendar-component | NEXT-CN | component-calendar-viewer |
| 18 | clamav | NEXT-CN | medavis-clamav |
| 19 | smsservice | NEXT-DE | sms-service |
| 20 | appointment-booking-api | RINF | appointment-booking-api |
| 21 | booking4med | NEXT-CN | b4m.next |
| 22 | medavis.solution | PSH | medavis.solution |
| 23 | identityserver | NEXT-DE | identityserver |
| 24 | applicationserver | NEXT-DE | applicationserver |
| 25 | apache-dist | NEXT-DE | apache-dist |
| 26 | dicom-lib | NEXT-DE | dicom-commons |
| 27 | hl7-lib | NEXT-DE | hl7-library |
| 28 | rest-clients | NEXT-DE | rest-clients |
| 29 | ReportOrderService | NEXT-DE | report-order-service |
| 30 | ReportOrderImporter | NEXT-DE | report-order-importer |
| 31 | cockpit-chart-service | NEXT-CN | cockpit-chart-service |
| 32 | medavis.apache | PSH | medavis.apache |
| 33 | medavis-apache.portable | PDD | chocolatey |

### Bitbucket Projects Summary

| Bitbucket Project | # Repos | Description |
|---|---|---|
| NEXT | 7 | Core platform: parent, random-instance-builder, core-framework, vaadin-ui, p4m-next, admin-app, coc.next |
| NEXT-DE | 17 | Germany-maintained: components, services, server distributions, libraries |
| NEXT-CN | 5 | China-maintained: b4m.next, component-image-viewer-2, component-calendar-viewer, medavis-clamav, cockpit-chart-service |
| RINF | 1 | RIS Infrastructure: appointment-booking-api |
| PSH | 2 | PowerShell modules: medavis.solution, medavis.apache |
| PDD | 1 | Chocolatey monorepo (medavis-apache.portable package dir) |

#### Notes

- **Repository slug ≠ canonical name** in many cases (see the Project-to-Directory Mapping above for the full name mapping).
- **Git clone URL pattern**: `https://git.medavis.local/scm/{bitbucket-project}/{repository-slug}.git`
- **Bitbucket Web URL pattern**: `https://git.medavis.local/projects/{BITBUCKET-PROJECT}/repos/{repository-slug}`
- **NEXT-DE** is the largest Bitbucket project, hosting 17 of 33 repositories — most shared components and services.
- **NEXT** hosts the core foundation projects that all other projects depend on.
- **NEXT-CN** contains projects primarily maintained by the China development team.
- **Repository moves**: `admin-app` (from NEXT-DE) and `coc.next` (from NEXT-CN) were moved to **NEXT** on the server. Local git remotes may still reference the old Bitbucket project — the server will redirect but `git remote set-url` should be updated for clarity.

## Pom-Property (Artifact-Id) → Repo Mapping

> Reverse lookup from a Maven `<*.version>` property (the **artifact id**) to the
> **git repo / canonical project** that publishes it. Use this whenever a pom version
> property must be resolved to a repo — for example in `release-quality-gate` Step 1.4
> transitive enumeration. The property name is the artifact id, which frequently differs
> from the git repo name. **Only medavis artifacts become repos to act on; third-party
> version properties are listed separately and are NOT medavis repos.**

### medavis artifacts (each maps to a gate-able repo)

| Pom version property | Repo (git dir) | Canonical project | Name mismatch? |
|---|---|---|---|
| `admin-app.version` | `admin-app` | Adminapp | — |
| `appointment-booking-api.version` | `appointment-booking-api` | appointment-booking-api | — |
| `calendar-viewer-component.version` | `component-calendar-viewer` | calendar-component | ⚠ artifact ≠ repo |
| `clamav-client.version` (artifact `medavis-clamav-client`) | `medavis-clamav` | clamav | ⚠ artifact ≠ repo |
| `cockpit-chart-service.version` | **era-dependent — do not map by property name alone** (see below) | cockpit-chart-service *or* cockpit | ⚠ same property, two producers |
| `communication-stack.version` | `communication-stack` | communication-stack | — |
| `core-framework.version` | `core-framework` | core-framework | — |
| `document-component.version` | `document-component` | document-component | — |
| `ejbframework.version` (artifact `ejb-client-framework`; e.g. keycloak on OLD) | `core-framework` | core-framework | ⚠ module of core-framework; `d:/git/ejbframework` is not the producer |
| `image-viewer-2-component.version` | `component-image-viewer-2` | image-viewer2 | ⚠ artifact ≠ repo |
| `keycloak.component.version` / `medavis-keycloak-component.version` | `keycloak` | keycloak-component | ⚠ artifact ≠ repo |
| `logging.version` / `common-component` (artifacts `logging`, `common-component`; version often `core-framework.version`) | `core-framework` | core-framework | ⚠ modules of core-framework; standalone `d:/git/logging`, `d:/git/common-component` are stale |
| `medavis-ui.version` | `vaadin-ui` | vaadin-ui-framework | ⚠ artifact ≠ repo |
| `medavis.next-manuals.version` | `manuals` | manuals | ⚠ artifact ≠ repo |
| `order-component.version` | `order-component` | order-component | — |
| `p4m-next.version` | `p4m-next` | p4m | ⚠ artifact ≠ repo |
| `person-component.version` | `person-component` | person-component | — |
| `sms.service.client.version` / `sms.service.client` (artifact `sms-service-client-spec`; both spellings occur) | `sms-service-client` | sms-client | ⚠ property ≠ repo; not `sms-service` |

Verified against reachable `origin/master:pom.xml` reads (as checked 2026-09; alias rows added 2026-10 from OLD release branches) from
`p4m-next`, `admin-app`, `coc.next`, `b4m.next`, `applicationserver`, `identityserver`,
`keycloak`, and Bitbucket `NEXT-CN/cockpit-chart-service`.
This list may still be incomplete for medavis artifacts not present in those product
poms; extend it with the derivation method below when new artifacts surface.

**`cockpit-chart-service.version` depends on the line (OLD/NEW; extraction COCKPIT-49, 2026-04-07).** The
pom *property name* existed for years (p4m used it with artifact `coc.next-chart-service`
on the cockpit train, e.g. `7.1.0.1`). Resolve the **producer repo from the same pom's
dependency `artifactId` and the version train**, not from the property name:

| When the dependency in *this* pom is… | Producer repo (git dir) |
|---|---|
| `artifactId` `cockpit-chart-service` and version train `1.x.x.x` (NEW line) | `cockpit-chart-service` (`NEXT-CN/cockpit-chart-service`) |
| `artifactId` `coc.next-chart-service`, **or** version on the cockpit 6.x/7.x train (e.g. `6.30.0.2`, `7.1.0.1`) | `coc.next` (the chart code is a module of cockpit on that line) |

The extraction happened on the NEW line only. OLD-line branches still ship the chart code as the `coc.next-chart-service` module of `coc.next`; see `platform-lines-old-new.md` → Chart service by line.
If `git_root/cockpit-chart-service` is missing while gating an OLD-line or pre-extraction train, that is N/A
(gate `coc.next`), not UNREACHABLE. If the gated pom's artifact is `cockpit-chart-service` `1.x.x`
and the clone is missing, then it **is** UNREACHABLE — clone or fetch `NEXT-CN/cockpit-chart-service`.

If two cloned repos both have the version tag, prefer the repo that **publishes** that
`artifactId` (the standalone repo for `1.x.x`; `coc.next` for the old module).

### third-party version properties — do NOT add as a gate repo

These appear in `.next` poms but are NOT medavis repos. A bump here is a third-party
dependency update, noted but not separately gated:
`keycloak.version`, `keycloak.client.version`, `jackson.version`,
`jackson.jakarta.rs.version`, `infinispan.version`, and other non-`de.medavis`
library versions.

### Derivation method (to extend this table accurately)

This table is authoritative but may lag new artifacts. To extend it, grep the
`*.version` properties from a `.next` product pom and map each medavis artifact to its
repo via the *Project-to-Directory* and *Bitbucket Repository* tables above:

    git -C <git_root>/<product> show origin/master:pom.xml \
      | grep -oE "<[a-zA-Z0-9._-]+\.version>[^<]+</[a-zA-Z0-9._-]+\.version>" | sort -u

Do not classify an unknown property by name alone. For each property not yet listed here,
follow its usage into the relevant dependency or plugin declaration and verify whether it
resolves to a `de.medavis` artifact (or other clearly medavis-owned module) before adding
it to this authoritative table. If that proof step does not show a medavis artifact, treat
the property as third-party instead of adding a gate-able repo row.

## Package-to-Project Mapping (reverse lookup)

Maps Java package prefixes to their owning project and git directory. **Match the longest (most specific) prefix first** — some projects share a common prefix ancestor (see Ambiguous Prefixes below).

| Package Prefix | Project | Git Directory | Module(s) |
|---------------|---------|---------------|-----------|
| `de.medavis.admin.keycloak.connector` | admin-app | `d:\git\admin-app\` | admin-app-keycloak-connector |
| `de.medavis.admin` | admin-app | `d:\git\admin-app\` | admin-app-ejb, admin-app-webui-flow, admin-app-ui-components |
| `de.medavis.appointmentbooking` | appointment-booking-api | `d:\git\appointment-booking-api\` | (single module) |
| `de.medavis.b4m` | booking4med | `d:\git\b4m.next\` | b4m.next-webui-flow, b4m.next-ejb-client |
| `de.medavis.bookingapi` | booking4med | `d:\git\b4m.next\` | b4m.next-booking-api-consumer, b4m.next-booking-api-provider-simulator |
| `de.medavis.clamav` | clamav | `d:\git\medavis-clamav\` | medavis-clamav-client |
| `de.medavis.cms` | report-order-service | `d:\git\report-order-service\` | report-order-service-code-mapping-ejb, -webui |
| `de.medavis.coc.chartservice` | cockpit-chart-service | `d:\git\cockpit-chart-service\` | (single module; extracted from coc.next in COCKPIT-49) |
| `de.medavis.coc` | cockpit | `d:\git\coc.next\` | coc.next-webui-flow, coc.next-ejb |
| `de.medavis.common.document` | p4m | `d:\git\p4m-next\` | common-document-component |
| `de.medavis.common` | core-framework | `d:\git\core-framework\` | common-component |
| `de.medavis.communication.sms` | smsservice | `d:\git\sms-service\` | communication-sms |
| `de.medavis.communication` | communication-stack | `d:\git\communication-stack\` | communication-stack, communication-hl7, communication-imc |
| `de.medavis.component` | vaadin-ui-framework | `d:\git\vaadin-ui\` | medavis-pdfviewer-vaadin-flow |
| `de.medavis.dataexporter` | report-order-service | `d:\git\report-order-service\` | excel-export-component |
| `de.medavis.dicom` | dicom-lib | `d:\git\dicom-commons\` | (single module) |
| `de.medavis.directoryservice` | report-order-service | `d:\git\report-order-service\` | directory-service-rest-spec |
| `de.medavis.document` | document-component | `d:\git\document-component\` | document-component-ejb, document-component-ejb-client |
| `de.medavis.documentviewer` | vaadin-ui-framework | `d:\git\vaadin-ui\` | medavis-document-viewer-component, -demo |
| `de.medavis.eventsync` | core-framework | `d:\git\core-framework\` | eventsync-api, eventsync-cdi |
| `de.medavis.framework` | core-framework | `d:\git\core-framework\` | ejb-framework, ejb-client-framework, ejb-framework-test-classes |
| `de.medavis.fullcalendar` | calendar-component | `d:\git\component-calendar-viewer\` | calendar-viewer-component-webui-flow |
| `de.medavis.hl7` | hl7-lib | `d:\git\hl7-library\` | hl7-library, hl7-library-models |
| `de.medavis.imageviewer` | image-viewer2 | `d:\git\component-image-viewer-2\` | image-viewer-2-vaadin-flow-component |
| `de.medavis.instancebuilder` | random-instance-builder | `d:\git\random-instance-builder\` | (single module) |
| `de.medavis.keycloak.client` | core-framework | `d:\git\core-framework\` | keycloak-client |
| `de.medavis.keycloak.undertow` | keycloak-component | `d:\git\keycloak\` | keycloak-undertow-error-handler, -query-remover |
| `de.medavis.keycloak` | keycloak-component | `d:\git\keycloak\` | keycloak-userfederation-component |
| `de.medavis.logging` | core-framework | `d:\git\core-framework\` | logging |
| `de.medavis.manuals` | manuals | `d:\git\manuals\` | manuals-client, manuals-server |
| `de.medavis.masterdata` | p4m | `d:\git\p4m-next\` | master-data-component |
| `de.medavis.order` | order-component | `d:\git\order-component\` | order-component-ejb, order-component-ejb-client |
| `de.medavis.p4m.shared.ui` | vaadin-ui-framework | `d:\git\vaadin-ui\` | p4m-shared-ui-components |
| `de.medavis.p4m` | p4m | `d:\git\p4m-next\` | p4m.next-webui-flow, p4m.next-ejb, p4m.next-dlx |
| `de.medavis.person` | person-component | `d:\git\person-component\` | person-component-ejb, person-component-ejb-client |
| `de.medavis.rest` | core-framework | `d:\git\core-framework\` | rest-commons |
| `de.medavis.restclient` | rest-clients | `d:\git\rest-clients\` | general-rest-client-model |
| `de.medavis.roi.rest` | rest-clients | `d:\git\rest-clients\` | report-order-importer-rest-spec, -rest-client |
| `de.medavis.roi` | report-order-importer | `d:\git\report-order-importer\` | report-order-importer-ejb, -rest, -hl7, -dicom, -webui-flow |
| `de.medavis.ros.sharedui` | vaadin-ui-framework | `d:\git\vaadin-ui\` | ros-shared-ui-components |
| `de.medavis.ros` | report-order-service | `d:\git\report-order-service\` | report-order-service-ejb, -rest, -webui-flow |
| `de.medavis.rs` | rest-clients | `d:\git\rest-clients\` | rs-rest-client |
| `de.medavis.sms` | smsservice | `d:\git\sms-service\` | (top-level package for sms-service modules) |
| `de.medavis.sms.component` | smsservice | `d:\git\sms-service\` | sms-component |
| `de.medavis.sms.ejb` | smsservice | `d:\git\sms-service\` | sms-service-ejb |
| `de.medavis.sms.webservice` | sms-client / smsservice | `d:\git\sms-service-client\` / `d:\git\sms-service\` | sms-service-client, sms-service-rest (shared API) |
| `de.medavis.study` | report-order-service | `d:\git\report-order-service\` | report-order-service-study-ejb, -rest-spec |
| `de.medavis.vaadin` | vaadin-ui-framework | `d:\git\vaadin-ui\` | medavis-ui-framework-vaadin-flow |
| `de.medavis.webview2` | vaadin-ui-framework | `d:\git\vaadin-ui\` | shared-webview2-component |
| `de.medavis.workflow` | p4m | `d:\git\p4m-next\` | p4m.next-ejb |

## Ambiguous Prefixes

These package prefixes share a common ancestor and **must be matched most-specific-first**:

| Shorter Prefix | Longer (More Specific) Prefix | Resolution |
|----------------|------------------------------|------------|
| `de.medavis.keycloak` → keycloak | `de.medavis.keycloak.client` → core-framework | core-framework's `keycloak-client` module |
| `de.medavis.common` → core-framework | `de.medavis.common.document` → p4m | p4m's `common-document-component` module |
| `de.medavis.p4m` → p4m | `de.medavis.p4m.shared.ui` → vaadin-ui | vaadin-ui's `p4m-shared-ui-components` module |
| `de.medavis.ros` → report-order-service | `de.medavis.ros.sharedui` → vaadin-ui | vaadin-ui's `ros-shared-ui-components` module |
| `de.medavis.roi` → report-order-importer | `de.medavis.roi.rest` → rest-clients | rest-clients' REST spec/client modules |
| `de.medavis.communication` → communication-stack | `de.medavis.communication.sms` → smsservice | sms-service's `communication-sms` module |
| `de.medavis.sms` → smsservice | `de.medavis.sms.webservice` → sms-client / smsservice | Shared API package between sms-service-client and sms-service |
| `de.medavis.coc` → cockpit | `de.medavis.coc.chartservice` → cockpit-chart-service | extracted chart library (COCKPIT-49); on an OLD-line branch or a pre-extraction tag the same package still lives in `coc.next` |

## Cross-Project Package Sharing

Some packages are shared across project boundaries. These cannot be resolved by longest-match alone — during review, context (which file is being reviewed) determines the owning project.

| Shared Package | Projects | Details |
|---------------|----------|---------|
| `de.medavis.communication.stack` | communication-stack, smsservice | smsservice's `communication-sms` module contains 2 files under this package (`JaxBConverter.java`, `MessageErrorKind.java`). The Package-to-Project Mapping resolves `de.medavis.communication` → communication-stack, which is correct for most cases but not for these 2 files. |
| `de.medavis.sms.webservice` | sms-client, smsservice | Both `sms-service-client` (`d:\git\sms-service-client\`) and `sms-service` (`d:\git\sms-service\`) contain classes under this package. sms-client provides the REST client API; smsservice provides the REST server implementation. During review, determine the owning project by which git directory the file is in. |

## Projects Without Java Packages

| Project | Git Directory | Reason |
|---------|---------------|--------|
| parent | `d:\git\parent\` | Maven parent POM only |
| installer | `d:\git\installer\` | PowerShell/packaging |
| identityserver | `d:\git\identityserver\` | Keycloak installer/packaging |
| applicationserver | `d:\git\applicationserver\` | WildFly installer/packaging |
| apache-dist | `d:\git\apache-dist\` | Portal Apache config zip (2.0+) or 1.x httpd+Chocolatey packaging; see `apache-portal-stack.md` |
| medavis.solution | `d:\git\medavis.solution\` | PowerShell module |
| medavis.apache | `d:\git\medavis.apache\` | PowerShell runtime (not Maven) |
| medavis-apache.portable | `d:\git\chocolatey\` (`packages/portable/medavis-apache.portable`) | Chocolatey package (not Maven) |
