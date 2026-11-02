# Integration Tests — Running & Reading Results

> The Maven commands to run .next integration tests and how to read the results. **Resolve `<old_java_home>`, `<new_java_home>`, `<old_maven_home>`, `<new_maven_home>` via `config.md` before running — never hardcode the example paths.** For prerequisites and stack detection, see `integration-tests-prerequisites.md`; module names per app are in `integration-tests-applications.md`.

**All commands must be run from the project's git root directory** (e.g., the `p4m-next` repo root for p4m). Integration tests are long-running (several minutes — see Timing Expectations), so use the agent's non-blocking command mechanism: background the command and poll its output periodically rather than blocking.

## General Command Pattern

**Old stack** (JDK 11 / WildFly 21 — no profile needed, Chameleon auto-resolves adapter):
```bash
export JAVA_HOME="<old_java_home>" && \
export PATH="<old_maven_home>/bin:$JAVA_HOME/bin:$PATH" && \
mvn verify -pl <integration-test-module> [options]
```

**New stack** (JDK 21 / WildFly 36 — requires `-Parquillian-cube` for remote adapter):
```bash
export JAVA_HOME="<new_java_home>" && \
export PATH="<new_maven_home>/bin:$JAVA_HOME/bin:$PATH" && \
mvn verify -pl <integration-test-module> [options] -Parquillian-cube
```

> **Why `-Parquillian-cube`?** On the new stack, the default Maven profile (`arquillian-managed`) brings in the managed container adapter, which does NOT connect to a running WildFly by default. The `-Parquillian-cube` profile activates `wildfly-arquillian-container-remote`, which pairs with the `wildfly36-remote` container definition (marked `default="true"` in `arquillian.xml`) to connect to your already-running WildFly on localhost:9990. Despite the "cube" name, this has nothing to do with Docker — it's just a project convention for the remote adapter profile.

## Common Options

| Flag                              | Purpose                                                                                                        |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `-pl <module>`                    | Build only the specified module                                                                                |
| `-DskipUTs=true`                  | Skip unit tests (surefire), run only integration tests                                                         |
| `-Dit.test=ClassName`             | Run specific integration test class                                                                            |
| `-Dit.test=ClassName#method`      | Run specific test method                                                                                       |
| `-Dit.test=Class#method1+method2` | Run multiple specific methods                                                                                  |
| `-DfailIfNoTests=false`           | Don't fail if no tests match the filter                                                                        |
| `-Parquillian-cube`               | **New stack only**: Activate remote container adapter to connect to running WildFly                            |
| `-Denforcer.skip=true`            | Skip Maven enforcer checks                                                                                     |
| `-DskipITs=true`                  | Skip all integration tests                                                                                     |
| `-U`                              | Force update of SNAPSHOT dependencies from remote (see `integration-tests-troubleshooting.md`)                 |

## Examples by Application

Module names come from `integration-tests-applications.md`. Build the `export` lines from `config.md`-resolved paths.

```bash
# OLD stack (JDK 11 / Maven 3.6.x) — core-framework, order/person/document-component, p4m release branches
export JAVA_HOME="<old_java_home>" && \
export PATH="<old_maven_home>/bin:$JAVA_HOME/bin:$PATH" && \
mvn verify -pl <module> -DskipUTs=true
#   <module> ∈ ejb-framework | order-component-ejb | person-component-ejb |
#              document-component-ejb | p4m.next-integration-test

# OLD stack — run a SPECIFIC test class / method
mvn verify -pl p4m.next-integration-test \
  -Dit.test=ReceiveOrderWorkflowIntegrationTest \
  -DfailIfNoTests=false -DskipUTs=true
mvn verify -pl p4m.next-integration-test \
  -Dit.test=ReceiveOrderWorkflowIntegrationTest#testReceiveORMMessageWithCopiesToResult \
  -DfailIfNoTests=false -DskipUTs=true
```

```bash
# NEW stack (JDK 21 / Maven 3.9.x) — p4m, admin-app, booking4med, sms-service on master
export JAVA_HOME="<new_java_home>" && \
export PATH="<new_maven_home>/bin:$JAVA_HOME/bin:$PATH" && \
mvn verify -pl <module> -DskipUTs=true -Parquillian-cube
#   <module> ∈ p4m.next-integration-test | admin-app-integration-test |
#              b4m.next-integration-test | sms-service-integration-test

# NEW stack — run a SPECIFIC test class / method
mvn verify -pl p4m.next-integration-test \
  -Dit.test=TicketCreationRetryIntegrationTest \
  -DfailIfNoTests=false -DskipUTs=true -Parquillian-cube
mvn verify -pl p4m.next-integration-test \
  -Dit.test=TicketCreationRetryIntegrationTest#testCreateCaseTicketRetryOnOleException \
  -DfailIfNoTests=false -DskipUTs=true -Parquillian-cube
```

> The `p4m.next-integration-test` module appears under both stacks because p4m has old-stack release branches and a new-stack master. Confirm the stack with the detection method in `integration-tests-prerequisites.md`.

## Timing Expectations

| Phase                       | Duration | Notes                                                  |
| --------------------------- | -------- | ------------------------------------------------------ |
| Maven dependency resolution | ~10-30s  | Longer on first run or after `mvn clean`               |
| WAR assembly (ShrinkWrap)   | ~10-30s  | Packages all classes, resources, dependencies          |
| WAR deployment to WildFly   | ~90-120s | Hibernate schema creation, CDI bean discovery          |
| Single test class execution | ~5s      | After deployment finishes; actual test runtime is fast |
| Full p4m suite              | ~5 min   | All classes share one deployment                       |
| WAR undeployment            | ~5-10s   | Schema dropped                                         |

**First run is always the slowest** due to dependency resolution and WAR build. Subsequent runs reuse compiled classes if you don't `mvn clean`.

> **Polling interval**: When periodically checking the output of a running integration test command, use a checking interval of **less than 60 seconds** (e.g., 15-30 seconds). Since a single test class completes in ~5 seconds after deployment, you want early detection of completion or failure rather than waiting on an already-finished job. Deployment itself takes ~2 minutes, so after that initial phase, results arrive quickly.

## Reading Test Results

### Maven Console Output

The Maven output shows test results as they complete. Look for the Failsafe summary at the end:

```
[INFO] Results:
[INFO]
[INFO] Tests run: 491, Failures: 0, Errors: 0, Skipped: 2
```

### Failsafe Reports Directory

Detailed test results are written to:

```
<project-root>/<integration-test-module>/target/failsafe-reports/
```

For example, p4m-next: `<git_root>/p4m-next/p4m.next-integration-test/target/failsafe-reports/`.

Key files in this directory:

| File                                   | Purpose                                                                                          |
| -------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `failsafe-summary.xml`                 | Overall summary: completed, errors, failures, skipped counts                                     |
| `TEST-<fully.qualified.ClassName>.xml` | JUnit XML report per test class (contains individual test results, error messages, stack traces) |
| `<fully.qualified.ClassName>.txt`      | Plain-text output per test class                                                                 |

### Quick result check

Use **the agent's file-read tool** to read report files (not shell `cat`):

- Read `<project-root>/<it-module>/target/failsafe-reports/failsafe-summary.xml` for the overall summary
- Read `<project-root>/<it-module>/target/failsafe-reports/TEST-<fully.qualified.ClassName>.xml` for a specific test class report

**For finding failures across all reports:**

```bash
# Find failed test reports (look for <failure> or <error> elements)
rg "<failure |<error " <project-root>/<it-module>/target/failsafe-reports/
```
