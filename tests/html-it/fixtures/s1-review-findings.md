# Review of PR 418: session refresh

Findings from review-notes.md:
- F001 (high): refresh token stored in localStorage, see auth/session.ts:88. Fix per SEC-12.
- F002 (medium): retry loop has no backoff; matches incident INC-2291.
- F003 (low): log line leaks user email at auth/session.ts:131.
Verdict: request changes. F001 blocks merge. Owner: Lena. Due 2026-11-07.
Context: F-numbers index the table in review-notes.md (not provided). SEC-12 is the team's security rule "no tokens in web storage". INC-2291 was the 2026-09-14 login outage caused by retry storms.
