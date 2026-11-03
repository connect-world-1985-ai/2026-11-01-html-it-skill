Proposal for the architecture review on Friday 2026-11-07: how we send appointment reminders.
Problem: reminders are sent by a nightly cron job in the core service; 6 % arrive late and retries are manual (KT-955).
Option A: keep the cron job and add retries. Effort 3 days. Does not fix the load peak at 02:00.
Option B: queue-based, using RabbitMQ (already used by sms-service). Effort 2 sprints. Retries and back-pressure are built in. Needs an ops runbook.
Option C: an external notification provider. Effort 1 sprint; about 1,800 EUR per month; patient data leaves our hosting, so it needs a data processing agreement (SEC-20).
Our recommendation: B. Decision needed from: Lena (tech lead). If B is chosen, work starts in sprint 47.
Context: SEC-20 is the security rule "patient data stays in EU-hosted systems covered by a data processing agreement".
