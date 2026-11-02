# Integration Tests — Troubleshooting

> Common failures when running .next integration tests and their fixes. **Resolve `<old_java_home>`, `<new_java_home>`, `<appserver_home>` via `config.md` before running any command below.** For running tests, see `integration-tests-running-and-results.md`; for server logs, see `integration-tests-server-logs.md`.

## Docker Noise with `-Parquillian-cube` (New Stack Only)

**Symptom**: When running with `-Parquillian-cube` on the new stack, the Maven output shows alarming Docker errors BEFORE the tests start:

```
[INFO] --- exec:3.2.0:exec (docker-compose-up) @ p4m.next-integration-test ---
Image repo.medavis.local/medavis/win2019-wildfly36-medavis-application-server-integration-test:2.0.0.1 Pulling
image operating system "windows" cannot be used on this platform: operating system is not supported
Waiting until application server is up and configured
Error response from daemon: No such container: medavis-wildfly-integration-test_http.8080_management.9990_debug.8787
```

And AFTER tests complete:
```
[INFO] --- exec:3.2.0:exec (docker-compose-down) @ p4m.next-integration-test ---
Error response from daemon: No such container: medavis-wildfly-integration-test_http.8080_management.9990_debug.8787
```

**This is completely harmless.** The tests still pass normally via the remote container.

**Cause**: The POM has `exec-maven-plugin` goals (`docker-compose-up` and `docker-compose-down`) that always fire during the `pre-integration-test` and `post-integration-test` phases. These goals are meant for Jenkins CI/CD (which uses Docker containers). Locally, Docker either isn't running or doesn't have the Windows images — so the commands fail, but Maven continues because the exec plugin is configured to not fail the build.

**Action**: Ignore all Docker-related output. Look at the **Failsafe test results** section of the output to determine pass/fail:
```
[INFO] Tests run: 4, Failures: 0, Errors: 0, Skipped: 0
```

> When parsing Maven output from `-Parquillian-cube` runs, skip past all Docker/container/image messages. The meaningful test output appears between `[INFO] --- failsafe:...:integration-test ---` and `[INFO] --- failsafe:...:verify ---`. The final `BUILD SUCCESS` or `BUILD FAILURE` is the authoritative result.

## Cached SNAPSHOT Resolution Failure

**Symptom**: Maven fails with an error like:

```
Could not resolve dependencies for project ...
Failure to find de.medavis:<module>:jar:<version>-SNAPSHOT in https://nexus.medavis.local/...
was cached in the local repository, resolution will not be reattempted until the update
interval of internal-nexus-repository has elapsed or updates are forced
```

**Cause**: Maven previously attempted to resolve a SNAPSHOT artifact from the remote Nexus repository, failed (e.g., the artifact hadn't been published yet), and cached the failure. Even though the artifact is now available on Nexus, Maven refuses to retry until the update interval expires.

**Fix**: Add the `-U` flag (force update of snapshots) to the Maven command:

```bash
mvn verify -pl <integration-test-module> -DskipUTs=true -U
```

The `-U` flag forces Maven to check the remote repository for updated SNAPSHOT versions regardless of cached metadata. Once the artifacts are successfully downloaded, subsequent runs work without `-U`.

> If the first `mvn verify` run fails with dependency resolution errors mentioning "cached in the local repository", retry with `-U`. You don't need `-U` on every run — only when SNAPSHOT artifacts have changed on Nexus or a previous resolution was cached as failed.

## Duplicate Deployment (`WFLYCTL0212`)

**Symptom**: Tests fail immediately with:

```
DeploymentException: Cannot deploy default.war:
WFLYCTL0212: Duplicate resource [("deployment" => "default.war")]
```

**Cause**: A previous test run's WAR (`default.war`) is still registered in WildFly. This happens when a test suite is interrupted (e.g., by a process kill or OOM crash) before Arquillian can undeploy the WAR. When WildFly restarts, it reloads the stale deployment.

**Fix**: Undeploy the old WAR using the JBoss CLI before re-running tests:

```bash
# Use whichever JDK matches your running WildFly instance
# New stack (WildFly 36):
export JAVA_HOME="<new_java_home>" && \
export PATH="$JAVA_HOME/bin:$PATH" && \
"<appserver_home>/bin/jboss-cli.sh" -c --command="undeploy default.war"

# Old stack (WildFly 21):
export JAVA_HOME="<old_java_home>" && \
export PATH="$JAVA_HOME/bin:$PATH" && \
"<appserver_home>/bin/jboss-cli.sh" -c --command="undeploy default.war"
```

If the undeploy reports "Management resource not found", the deployment may have already been cleaned up. In that case, delete stale failsafe reports from the previous run and retry:

```bash
rm -rf <project-root>/<it-module>/target/failsafe-reports
```

Why this helps: the `failsafe:verify` goal reads XML reports from `target/failsafe-reports/`. If stale reports from a failed run exist, Maven reports those old failures even though no new tests actually executed. Deleting them forces a clean test execution.

## OutOfMemoryError: Metaspace

**Symptom**: All tests return HTTP 500 from the Arquillian servlet. If the first 2-3 test classes all fail with `Got 500 (Internal Server Error)`, check the WildFly server log immediately — do not wait for the full suite to complete, as every remaining test will fail identically. The server log shows:

```
ERROR [io.undertow.request] UT005023: Exception handling request to
/default/ArquillianServletRunner: java.lang.OutOfMemoryError: Metaspace
```

**Cause**: WildFly's JVM has exhausted its Metaspace memory, typically due to accumulated class loading from multiple deploy/undeploy cycles during development.

**Fix**: Restart WildFly to clear the Metaspace. **Ask the user to restart the server via the question channel**, then re-run the tests.

> **Important**: After an OOM crash and WildFly restart, expect the Duplicate Deployment (`WFLYCTL0212`) issue next — the stale WAR from the crashed run will be reloaded on startup. Follow that section's fix before re-running tests.

> **Optional permanent fix**: Increase the Metaspace limit in WildFly's JVM settings (`standalone.conf.bat` or `standalone.conf`), e.g., `-XX:MaxMetaspaceSize=512m`.
