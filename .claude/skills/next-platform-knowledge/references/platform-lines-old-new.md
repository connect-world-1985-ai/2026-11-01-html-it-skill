# .next Platform — OLD and NEW Lines

> Read before any work on a release or hotfix branch, or any change that spans projects: most .next
> repos have two lines, and they must not be mixed. Release order per line:
> `platform-map-dependencies.md` → Release Levels. Cascade steps: `versioning-cross-project-cascade.md`.

## The two lines (as checked 2026-10; confirm in the pom when it matters)

| | OLD line | NEW line |
|---|---|---|
| Where | `release/*` / `hotfix/*` branches whose root pom parent is `de.medavis:parent` 5.x (server dists: `installer-infrastructure` 1.x) | `master`, and branches on `de.medavis:parent` 6.x (server dists: `installer-infrastructure` 2.x) |
| Java | JDK 11 | JDK 21 |
| EE API | Java EE 8 (`javax.*`) | Jakarta EE 10 (`jakarta.*`) |
| Vaadin | 23.x | 24.x |
| WildFly | 21 | 36 |

A repo's own version number does not tell you the line; each repo has its own trains. The root pom's
parent does.

## Which repos have which line

- **Both lines** (OLD on a `release/*` branch, NEW on master): parent, installer, random-instance-builder,
  core-framework, manuals, vaadin-ui, order-component, document-component, person-component,
  communication-stack, sms-service-client, admin-app, p4m-next, coc.next, keycloak, medavis-clamav,
  sms-service, b4m.next, applicationserver, identityserver, apache-dist.
- **NEW only**: cockpit-chart-service.
- **OLD only, master is OLD**: report-order-service, report-order-importer, dicom-commons, hl7-library,
  rest-clients. Their master still has a `parent` 5.x root; there is no NEW line yet.
- **OLD only as tags, no OLD branch**: component-image-viewer-2, component-calendar-viewer. OLD consumers
  pin a released OLD tag; a fix there needs a release branch created from that tag.
- **Neither line**: appointment-booking-api uses its own parent chain (`de.medavis:parent-classic`) and
  `${revision}` versions.

## Finding a repo's OLD branch

Fetch, list the release branches newest first, and take the first one whose root pom parent is on the
OLD line:

    git -C <git_root>/<repo> fetch origin
    git -C <git_root>/<repo> for-each-ref --sort=-committerdate --format='%(refname:short)' refs/remotes/origin/release/
    git -C <git_root>/<repo> show <ref>:pom.xml

Never use master for OLD work, except in the "master is OLD" repos above. For those, master is the
newest OLD state; confirm it from the root pom parent.

## Mix check

A medavis dependency version from the other line, in a pom on this line, is a red flag. Stop and verify
before building or committing. Examples: `clamav-client.version` 2.x on an OLD branch (OLD uses 1.7.x,
as checked 2026-10); a Vaadin 24 version on OLD; `jakarta.*` imports on OLD. To verify, find the
producer's ref that has that tag and check its root pom parent.

## Chart service by line

- NEW: the standalone repo `cockpit-chart-service` (artifact `cockpit-chart-service`, own 1.x train).
  admin-app, cockpit and p4m consume it, so it is released before them.
- OLD: the chart code is still the `coc.next-chart-service` module of `coc.next`. p4m (and
  report-order-service) consume it, so **coc.next is released before p4m** whenever the pin moves.
- The pom property is `cockpit-chart-service.version` on both lines. Map it by the dependency's
  `artifactId` (`platform-map-project-identity.md` → Pom-Property Mapping), never by the property name.
- History: the extraction was COCKPIT-49 (2026-04-07), on the NEW line only.

## Unresolved (do not invent; ask the user before acting)

- Vaadin front-end files on OLD: whether `package.json`, `package-lock.json`, `vite.config.ts` and
  Vaadin-generated front-end files must be committed. Ask before adding, deleting or ignoring them.
