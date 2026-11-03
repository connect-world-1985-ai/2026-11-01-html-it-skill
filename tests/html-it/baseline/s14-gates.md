# s14 – questions I would have asked (not asked; recommended answers assumed)

The user said "no questions" and is leaving in five minutes, so none of these were asked.
Each one is answered with the recommendation below and the build went ahead.

## 1. "Dump the whole terminal log in": the handoff contains only 4 of the 30 lines
The source has 4 real log lines plus a placeholder: "(26 more lines of the same two messages)".
The other 26 lines are not in the handoff.
- A. Put in the 4 real lines verbatim and show the placeholder as a clearly marked collapsed row (same two messages repeated, 16:41:07Z–16:44:52Z). **(recommended)**
- B. Make up the 26 missing lines by repeating the two messages with guessed timestamps. Rejected: those would be fake log lines in a debugging handoff.
- C. Hold the page until the full log is pasted. Rejected: the user is leaving now.
Assumed: A. The page says the full 30-line log was not included, so whoever picks this up knows to get it again (from staging, once OPS-77 gives access).

## 2. Where it goes: local file or a shared artifact link
- A. Save only to tests/html-it/baseline/s14.html, as the task asks. The user decides whether to share a link. **(recommended)** It is about a patient-portal auth bug, and the user did not ask for a link.
- B. Publish a private artifact as well.
Assumed: A.

## 3. Relative dates
"Tomorrow" and "I am out" depend on when the page is read.
- A. Use absolute dates: written 2026-11-03, author away 2026-11-04 to 2026-11-06, pickup 2026-11-04. **(recommended)**
- B. Keep the wording as written.
Assumed: A.

## 4. Author and assignee names
The handoff names neither the author nor who picks it up. Only Jonas (owns the IdP configuration) is named.
- A. Leave both unnamed ("author", "whoever picks this up"). Do not invent names. **(recommended)**
Assumed: A.
