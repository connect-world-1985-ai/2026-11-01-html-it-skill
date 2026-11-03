I couldn't ask you questions on this run, so I went with my recommended answers. The questions, options and reasons are in `/tmp/claude-0/-home-user-2026-11-01-html-output-research/1f3b733c-8091-54cd-a758-95a05b900ada/scratchpad/ws-green2/tests/html-it/green/s11-gates.md`.

- **Form:** knowledge explainer: the short answer, a flow diagram, a step-by-step walkthrough, the annotated `book()` method, the three gotchas, a reading order, then references and a glossary.
- **Theme:** Graphite, because it's a code walkthrough.
- **Language:** English.
- **Depth:** Standard.

**The page:** `/tmp/claude-0/-home-user-2026-11-01-html-output-research/1f3b733c-8091-54cd-a758-95a05b900ada/scratchpad/ws-green2/tests/html-it/green/s11.html`

It's a single HTML file for reading, written for Priya. It opens with the whole flow in one paragraph, then a diagram of the request path that marks how long the slot lock is held and shows the HTTP 409 branch. After that come the six steps, the `book()` code with five lines highlighted and explained, and the three gotchas. The only interactive parts are pop-ups on the ID links and glossary terms, a light/dark theme toggle and a Copy button on the code block. Everything is visible without them, and when printed. The house checker passes it with no failures and no warnings.

**I didn't use highlight.js or Mermaid.** The page has to open offline as one file, and loading third-party scripts from a CDN into a page about internal code isn't allowed. I coloured the Java code by hand and drew the diagram as inline SVG instead. It looks about the same, and nothing loads from the internet.

**Message for Teams:**

```
Walkthrough for Priya: how a booking request flows through the code (attached, opens offline).
POST /bookings -> BookingService.book() -> 30 s Redis slot lock -> availability check -> save -> BookingCreated event -> sms-service schedules the reminder.
Three gotchas: lock TTL must be longer than the DB timeout (ADR-011), a taken slot becomes HTTP 409 via ExceptionMappers.java, and never call book() inside another transaction (BUG-3120 double bookings, June 2026).
Includes the annotated book() code from commit 7c41e9a on master, plus a glossary.
```

**References:** there were three IDs, and the notes explain all of them: commit 7c41e9a, ADR-011 and BUG-3120. Their links, titles and locations weren't given, and each References entry says so.

**To be confirmed:**
- **Start date:** the notes only say Priya joins "next week". The page leaves the date out; tell me her start date if you want it shown.
- **Database timeout:** this value wasn't given, and the page marks it "not given".
- **Cause of the BUG-3120 double bookings:** the notes don't explain how they happened. The page offers a likely reason (the outer transaction commits after the lock is released) and labels it "to be confirmed with the team".
- **File paths:** full paths weren't given, so the page tells readers to search by file name.

Nothing was published or uploaded. I can do one round of changes if you'd like any.
