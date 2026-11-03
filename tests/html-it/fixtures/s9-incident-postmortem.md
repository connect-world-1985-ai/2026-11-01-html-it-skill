Postmortem input for incident INC-2307 on 2026-10-29, severity SEV-2. Blameless format.
Audience: engineering and product management.
Chat log excerpt (times CET):
09:12 alert: booking API p95 latency 9.8 s (normal 0.4 s)
09:15 Tomasz (on call) acknowledges
09:21 dashboards show the DB connection pool at 100 % (max 50)
09:34 rollback from release 8.4.0.0 to 8.3.2.4 started
09:41 latency back to normal
10:05 root cause found: the new appointment search query from PR 402 has no index on slots(practice_id, start_time), so every request does a full table scan
Impact: 29 minutes of slow or failed booking; about 1,140 failed booking attempts; no data loss.
Went well: the alert fired within 2 minutes; rollback runbook RB-04 worked as written.
Went badly: load test LT-12 does not cover search; the index was in the migration plan, but the migration file was missing from the PR.
Actions:
- AI-1 add the index migration (Priya, 2026-11-05)
- AI-2 extend LT-12 with search load (Tomasz, 2026-11-14)
- AI-3 CI check that fails when a query plan shows a full scan on a table with more than 100k rows (Lena, 2026-11-28)
