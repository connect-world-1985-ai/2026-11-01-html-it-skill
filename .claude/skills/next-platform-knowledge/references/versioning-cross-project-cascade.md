# .next — Cross-Project Cascade Checklist

> Use when a change in one .next project must flow into others: a parent fix, a library bump, a
> version alignment. Branch and version policy: `versioning-release-branching-workflows.md`. Lines:
> `platform-lines-old-new.md`. Order: `platform-map-dependencies.md` → Release Levels.

1. **Fix the line first.** Decide OLD or NEW from the branch's root pom parent. Every repo in the cascade
   stays on that line: take each repo's newest branch on it, never master for OLD work (except the repos
   whose master is still OLD; see `platform-lines-old-new.md` → Which repos have which line).
2. **Find consumers by artifact, not by property name.** Search every `pom.xml` of each candidate repo
   (all modules, not only the root) for the producer's `artifactId`:

       git -C <git_root>/<repo> grep -n "<artifactId><producer-artifact></artifactId>" <ref> -- '*pom.xml'

   Then map the property it uses with `platform-map-project-identity.md` (property names can mislead:
   `cockpit-chart-service.version`, `sms.service.client.version`, `clamav-client.version`).
3. **Include the installer modules.** `*-installer` and dist modules are parented by the `installer`
   repo's `installer-web-application` / `installer-infrastructure`, at a pinned released version
   (`platform-map-dependencies.md` → Installer relationships). Check that pin too.
4. **Check re-declared properties.** A module can re-declare a root `*.version` property (for example
   `communication-stack.version` in `p4m.next-installer`, or `dicom-commons.version` and
   `hl7-library.version` in `report-order-importer-installer`). Keep both in step, and confirm the
   effective value.
5. **Order by release level.** Producers before consumers; the same level can go in parallel. Mind the
   OLD-line differences in the level table (for example coc.next before p4m).
6. **Name the project and file path** for every change you report (`p4m-next: p4m.next-installer/pom.xml`).
7. **Stop at the unresolved policies below** instead of deciding them.

## Unresolved policies (do not invent; ask the user before acting)

- **Parent change reach:** whether a new parent release requires every project on that line to be
  updated and released, or only the ones that need the fix. You can list who is reached (by level); the
  release obligation is the user's call.
- **Unreleased upstream on a release branch:** the rule is that release-branch dependencies are not
  SNAPSHOT (`versioning-release-branching-workflows.md`). Teams have sometimes pointed at an upstream
  SNAPSHOT while its release was pending. Ask before doing either.
