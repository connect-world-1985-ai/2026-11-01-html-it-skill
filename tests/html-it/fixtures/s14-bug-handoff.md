Handoff for whoever picks up BUG-3188 tomorrow (I am out from 2026-11-04 to 2026-11-06).
Symptom: the patient portal shows "Session expired" right after login for some users; about 2 % of logins since release 8.4.0.0.
Repro: only Safari 18 with "Prevent cross-site tracking" on; Chrome is fine. Reproduces 4 times in 10 on staging.
Ruled out: server clock skew (NTP checked on all nodes); token lifetime (unchanged since 8.3); load balancer stickiness (same with a single node).
Current hypothesis: the SameSite=None session cookie has no Partitioned attribute, so Safari drops it after the redirect back from the identity provider.
Next step: deploy branch bugfix/BUG-3188-partitioned-cookie (commit e19b07f) to staging and retest with Safari.
Terminal log (last 30 lines):
2026-11-03T16:41:07Z WARN  SessionFilter - no session cookie on /portal/home (ua=Safari/18.1)
2026-11-03T16:41:07Z INFO  AuthRedirect - redirect to /login?expired=1
(26 more lines of the same two messages)
2026-11-03T16:44:52Z WARN  SessionFilter - no session cookie on /portal/home (ua=Safari/18.1)
2026-11-03T16:44:52Z INFO  AuthRedirect - redirect to /login?expired=1
Contacts: the identity provider configuration is owned by Jonas; staging access is requested with ticket OPS-77.
