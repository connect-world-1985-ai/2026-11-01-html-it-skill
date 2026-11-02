# Integration Tests — Server Logs & Debugging

> How to find and search the WildFly server log when debugging .next integration tests. **Resolve `<appserver_home>` via `config.md`** — the log path below is relative to it. For run/results, see `integration-tests-running-and-results.md`; for known failures, see `integration-tests-troubleshooting.md`.

The WildFly server log is located at:

```
<appserver_home>\standalone\log\server.log
```

This log captures all server-side output during test execution — EJB invocations, SQL statements (if logging is enabled), exceptions, and any `System.out.println` or `Logger` output from test beans and production code.

## Useful for:

- Diagnosing `EJBTransactionRolledbackException` — the server log shows the root cause (constraint violations, NPEs inside the container)
- Verifying SQL execution order when debugging cleanup/truncation issues
- Checking Hibernate SQL output (if `show_sql=true` in persistence config)
- Temporary `System.out.println` debug statements added to test beans appear here, not in the Maven console

## Enabling SQL Logging for Debugging

If you need to see the actual SQL statements Hibernate generates (useful for debugging constraint violations, unexpected query behavior, or data pollution issues), enable SQL logging in the corresponding `persistence-postgres.xml`:

```xml
<!-- Add or modify these properties in the persistence unit -->
<property name="hibernate.show_sql" value="true"/>
<property name="hibernate.format_sql" value="true"/>
<property name="hibernate.use_sql_comments" value="true"/>
```

The `persistence-postgres.xml` is located at:

- `<app>-integration-test/src/test/resources/META-INF/persistence-postgres.xml` (for apps with dedicated IT modules)
- `<app>-ejb/src/test/resources/META-INF/persistence-postgres.xml` (for components with embedded ITs)

> **Remember to revert** these changes before committing — SQL logging generates enormous output and is only needed for debugging.

## Searching Server Logs

The server log can grow large during a full test suite run. Here are approaches for searching it effectively.

**Using ripgrep (`rg`) — recommended for speed:**

```bash
# Search for exceptions during a specific test
rg "NullPointerException" "<appserver_home>/standalone/log/server.log"

# Search for SQL truncation statements
rg "TRUNCATE TABLE" "<appserver_home>/standalone/log/server.log"

# Search for a specific test's activity
rg "testReceiveORMMessageWithCopiesToResult" "<appserver_home>/standalone/log/server.log"

# Case-insensitive search with context lines
rg -i -C 5 "constraint violation" "<appserver_home>/standalone/log/server.log"

# Search for multiple patterns
rg "ERROR|WARN|Exception" "<appserver_home>/standalone/log/server.log"
```

**Using the agent's search / file-read tools:**

- **Search tool**: Supports full regex, context lines (`-A`, `-B`, `-C`), and can target the server log file path directly.
- **File-read tool**: Read specific line ranges from the log file using `offset` and `limit` parameters — useful for examining a known area of the log or reading the tail end.

**Using custom scripts for advanced analysis:**

The agent can write and execute ad-hoc scripts (Python, Bash, PowerShell) for more sophisticated log analysis. Examples:

- Extract all stack traces between two timestamps
- Count and group exceptions by type
- Correlate test method names with errors
- Parse and filter by log level, thread, or logger name

```bash
# PowerShell: get last N lines (tail equivalent on Windows)
powershell -Command "Get-Content '<appserver_home>\standalone\log\server.log' -Tail 100"

# Python: extract unique exception types
python -c "
import re
with open(r'<appserver_home>\standalone\log\server.log') as f:
    exceptions = set(re.findall(r'(\w+Exception)', f.read()))
    for e in sorted(exceptions): print(e)
"
```

> Do not limit yourself to the examples above. Be resourceful — combine tools, write purpose-built scripts, and use whatever approach best fits the debugging situation. The server log is just a text file; any text-processing technique applies.
