# Integration Tests — Prerequisites & Stack Detection

> Determine the technology stack, then ensure the JDK/Maven toolchain, WildFly, and PostgreSQL are ready. **Resolve all machine-specific paths (`<old_java_home>`, `<new_java_home>`, `<old_maven_home>`, `<new_maven_home>`, `<appserver_home>`) via `config.md` before running any command.** For the run commands themselves, see `integration-tests-running-and-results.md`.

## Stack Detection (Step 0 — do this first)

Before running tests, you **must** determine which technology stack the branch uses. The wrong JDK/Maven combination will cause build failures.

Run this from the project's git root directory:

> **Windows `rg` quirk**: Always pass an explicit `.` path argument when running `rg` from a project root on Windows. Without it, `rg` may hang indefinitely. Example: use `rg "pattern" --type java -l .` instead of `rg "pattern" --type java -l`. This applies to all `rg` search commands (not `--files` listing, which works without `.`).

```bash
# Check for Jakarta EE 10 imports (new stack)
rg "jakarta\.persistence|jakarta\.ejb|jakarta\.inject" --type java -l . | head -3
```

- **If matches found** → **New technology stack** (JDK 21 + Maven 3.9.x)
- **If no matches** → Check for javax imports:

```bash
rg "javax\.persistence|javax\.ejb|javax\.inject" --type java -l . | head -3
```

- **If javax matches found** → **Old technology stack** (JDK 11 + Maven 3.6.3)

### Alternative: Check parent POM version

```bash
# The parent POM version indicates the stack
rg "<version>.*</version>" pom.xml | head -5
```

The parent POM `de.medavis:parent` has version ranges that correspond to stacks. As a general rule: if the project or parent version is on the newer series for that app, it's the new stack.

> **Why this matters**: `maven-enforcer-plugin:1.0.1` crashes with Maven 3.9+ on old-stack branches. Using JDK 21 on old-stack code produces compilation errors from javax/jakarta incompatibility.

## 1. JDK and Maven Versions

| Technology Stack        | JDK        | Maven           | JavaEE / JakartaEE | Hibernate ORM | WildFly    | Maven Profile for Remote |
| ----------------------- | ---------- | --------------- | ------------------ | ------------- | ---------- | ------------------------ |
| **Old** (javax-based)   | **JDK 11** | **Maven 3.6.3** | javax (JavaEE 8)   | Hibernate 5.x | WildFly 21 | *(none needed)*          |
| **New** (Jakarta-based) | **JDK 21** | **Maven 3.9.x** | Jakarta EE 10      | Hibernate 6.x | WildFly 36 | `-Parquillian-cube`      |

> **Note**: The version numbering varies per application (e.g., p4m uses 7.x for old stack and 8.x for new stack, while adminapp uses 6.0x for old and 7.x for new). Use the stack detection method above instead of relying on version numbers.

Environment variables do NOT persist between separate calls of the agent's shell/command tool, and interactive shell aliases (e.g., `switch_jdk11`, `switch_maven_39`) are not available there. Always prefix every Maven command with the env export chain, built from the **resolved** paths in `config.md`:

```bash
# Old technology stack — always use this pattern
export JAVA_HOME="<old_java_home>" && \
export PATH="<old_maven_home>/bin:$JAVA_HOME/bin:$PATH" && \
<your mvn command here>

# New technology stack — always use this pattern
export JAVA_HOME="<new_java_home>" && \
export PATH="<new_maven_home>/bin:$JAVA_HOME/bin:$PATH" && \
<your mvn command here> -Parquillian-cube
```

> Resolve `<old_java_home>`, `<new_java_home>`, `<old_maven_home>`, `<new_maven_home>` via `config.md` before running. Never copy the example paths from this knowledge base into a command.

## 2. WildFly Application Server Running

A WildFly instance must be running locally. The Arquillian config (`arquillian.xml`) defines the default container:

**Old stack** (WildFly 21, uses Arquillian Chameleon — no Maven profile needed):
```xml
<container qualifier="wildfly21-remote" default="true">
    <configuration>
        <property name="chameleonTarget">wildfly:16.0.0.Final:remote</property>
        <property name="managementAddress">localhost</property>
        <property name="managementPort">9990</property>
        <property name="username">admin</property>
        <property name="password">admin</property>
    </configuration>
</container>
```

**New stack** (WildFly 36, requires `-Parquillian-cube` Maven profile for the remote adapter):
```xml
<container qualifier="wildfly36-remote" default="true">
    <configuration>
        <property name="managementAddress">localhost</property>
        <property name="managementPort">9990</property>
        <property name="username">admin</property>
        <property name="password">admin</property>
    </configuration>
</container>
```

Requirements:

- **Management port**: 9990
- **Credentials**: `admin` / `admin`
- **Datasource**: configured in WildFly's `standalone.xml` (see `integration-tests-applications.md`)
- **Maven profile** (new stack only): `-Parquillian-cube` — activates the remote container adapter

> **Important**: Old and new stacks use **different WildFly versions** (WildFly 21 vs WildFly 36). You cannot run new-stack tests against an old-stack WildFly instance (or vice versa). The WildFly installation is at `<appserver_home>` (managed via directory junction by the user; resolve via `config.md`). Only ONE WildFly instance can listen on port 9990 at a time. If the wrong WildFly version is running, **ask the user via the question channel** to switch the junction and restart WildFly — do NOT attempt to manage WildFly installations or junctions autonomously.

> **Key difference between stacks**: The old stack uses Arquillian Chameleon which auto-resolves the correct container adapter at runtime (no profiles needed). The new stack dropped Chameleon and uses explicit Maven profiles: `arquillian-managed` (default, for starting WildFly) and `arquillian-cube` (for connecting to an already-running WildFly). Always use `-Parquillian-cube` when your WildFly is already running.

## 3. PostgreSQL Database

WildFly must have a datasource pointing to a running PostgreSQL instance. All integration tests use the same JNDI name (`java:jboss/datasources/PostgresDS`) but different persistence unit names — see the full datasource / persistence-unit table in `integration-tests-applications.md`.

## Verifying Prerequisites

Before running tests, verify that WildFly is up and the datasource is reachable:

```bash
# Check WildFly management port is responding
curl -s -o /dev/null -w "%{http_code}" http://localhost:9990/management
# Expected: 401 (authentication required) or 200 — means WildFly is running
# If connection refused → WildFly is not running

# Alternative: check if WildFly process is running
powershell -Command "Get-Process -Name 'java' -ErrorAction SilentlyContinue | Select-Object Id, ProcessName, Path | Format-Table"
```

If WildFly is not running, **ask the user to start it via the question channel**. Do not attempt to start the application server autonomously — it requires specific configuration and the user should control this manually.
