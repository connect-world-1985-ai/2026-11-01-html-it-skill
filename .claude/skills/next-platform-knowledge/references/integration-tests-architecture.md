# Integration Tests — Architecture

> How the .next integration test stack fits together (Maven Failsafe → Arquillian → WildFly remote → Hibernate/PostgreSQL) and how Surefire/Failsafe split unit vs integration tests. For running them, see `integration-tests-running-and-results.md`.

## Architecture Overview

Every .next application uses the **same integration test pattern**:

```
[Maven Failsafe Plugin]
  → discovers *IntegrationTest.java classes
  → [Arquillian Framework]
      → connects to a RUNNING WildFly instance (remote mode)
      → [ArquillianSuiteDeployment]
          → builds a single WAR from test code + production code
          → deploys WAR to WildFly (ONCE for all test classes)
      → [Hibernate + PostgreSQL]
          → auto-creates schema on deploy (hbm2ddl.auto=create-drop)
          → auto-drops schema on undeploy
      → tests run INSIDE the container (real EJB, JPA, JTA, CDI)
```

### Key Components

| Component         | Typical Path                                                       | Purpose                                                                                 |
| ----------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| Arquillian config | `<it-module>/src/test/resources/arquillian.xml`                    | Container connection (host, ports, credentials)                                         |
| Test persistence  | `<it-module>/src/test/resources/META-INF/persistence-postgres.xml` | JPA config with `create-drop`                                                           |
| Suite deployment  | `<it-module>/.../ArchiveFactory.java`                              | `@ArquillianSuiteDeployment` — builds shared WAR                                        |
| Parent POM        | `<git_root>/parent/pom.xml`                                        | Configures surefire (exclude ITs) + failsafe (include ITs) — **shared across ALL apps** |

## How Surefire and Failsafe Split Tests

The `parent` POM defines the test plugin configuration inherited by **all** .next applications:

```xml
<!-- maven-surefire-plugin: runs unit tests, EXCLUDES integration tests -->
<exclude>**/*IntegrationTest.java</exclude>

<!-- maven-failsafe-plugin: runs ONLY integration tests -->
<include>**/*IntegrationTest.java</include>
```

This means:

- `mvn test` → unit tests only (surefire)
- `mvn verify` → unit tests AND integration tests (surefire + failsafe)
- `mvn verify -DskipUTs=true` → integration tests only (surefire skipped)
