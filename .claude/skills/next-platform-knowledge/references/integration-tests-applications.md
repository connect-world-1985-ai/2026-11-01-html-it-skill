# Integration Tests — Applications, Datasources & Persistence Units

> Which .next applications have integration tests, which Maven module holds them, and the datasource / persistence-unit each app uses. For how to run them, see `integration-tests-running-and-results.md`; for prerequisites and stack detection, see `integration-tests-prerequisites.md`.

## Which Applications Have Integration Tests?

All .next applications share the same test infrastructure pattern (Maven Failsafe + Arquillian + WildFly remote + PostgreSQL). Some have a dedicated integration test Maven module, while others embed integration tests within their EJB module.

| #   | Application        | Git Directory                | Integration Test Module        | Stack (master, as checked 2026-10) | Notes                   |
| --- | ------------------ | ---------------------------- | ------------------------------ | ---------------------------------- | ----------------------- |
| 1   | portal4med (p4m)   | `d:\git\p4m-next\`           | `p4m.next-integration-test`    | New (JDK 21)                       | Dedicated module        |
| 2   | Adminapp           | `d:\git\admin-app\`          | `admin-app-integration-test`   | New (JDK 21)                       | Dedicated module        |
| 3   | booking4med        | `d:\git\b4m.next\`           | `b4m.next-integration-test`    | New (JDK 21)                       | Dedicated module        |
| 4   | smsservice         | `d:\git\sms-service\`        | `sms-service-integration-test` | New (JDK 21)                       | Dedicated module        |
| 5   | core-framework     | `d:\git\core-framework\`     | `ejb-framework`                | New (JDK 21)                       | Tests within EJB module |
| 6   | order-component    | `d:\git\order-component\`    | `order-component-ejb`          | New (JDK 21)                       | Tests within EJB module |
| 7   | person-component   | `d:\git\person-component\`   | `person-component-ejb`         | New (JDK 21)                       | Tests within EJB module |
| 8   | document-component | `d:\git\document-component\` | `document-component-ejb`       | New (JDK 21)                       | Tests within EJB module |

> **Note**: Some applications have BOTH old-stack release branches and new-stack master branches. Always use the detection method in `integration-tests-prerequisites.md` → Stack Detection to confirm the stack for your specific branch. The "Stack (master)" column above was checked from the master root pom parent (6.x = NEW); release branches of the same apps are usually OLD (see `platform-lines-old-new.md`).

> Git directories above use the example root `d:\git\`. Resolve the actual root per developer via `config.md` (`git_root`).

## Datasource & Persistence Units

WildFly must have a datasource pointing to a running PostgreSQL instance. All integration tests use the same JNDI name but different persistence unit names:

| Application            | Datasource JNDI Name                                      | Persistence Unit  |
| ---------------------- | --------------------------------------------------------- | ----------------- |
| p4m-next               | `java:jboss/datasources/PostgresDS`                       | `p4m`             |
| admin-app              | `java:jboss/datasources/PostgresDS`                       | `ADMIN_APP`       |
| booking4med (b4m.next) | `java:jboss/datasources/PostgresDS`                       | `b4mPU`           |
| core-framework         | `java:jboss/datasources/PostgresDS`                       | `TEST`            |
| order-component        | `java:jboss/datasources/PostgresDS`                       | `p4m`             |
| person-component       | `java:jboss/datasources/PostgresDS`                       | `p4m`             |
| document-component     | `java:jboss/datasources/PostgresDS`                       | `p4m`             |
| sms-service            | *(check `persistence-postgres.xml` or project structure)* | *(check project)* |

The test persistence unit always uses:

- `hibernate.dialect` = `org.hibernate.dialect.PostgreSQL95Dialect` (or auto-detected in newer stacks)
- `hbm2ddl.auto` = `create-drop` (schema auto-managed per deployment)
- `hibernate.search` = `RAMDirectoryProvider` (in-memory, no filesystem)
