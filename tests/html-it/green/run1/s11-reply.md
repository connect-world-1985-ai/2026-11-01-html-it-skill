I built Priya's walkthrough as one HTML file. It opens offline and has no CDN scripts, so Mermaid and highlight.js are not in it (more on that below).

I couldn't ask you the planning questions, so I took my recommended answers. The questions and options are in `tests/html-it/green/s11-gates.md`.

- **Form:** a code walkthrough (onboarding explainer)
- **Theme:** Graphite
- **Language:** English
- **Depth:** Standard

**File:** `/tmp/claude-0/-home-user-2026-11-01-html-output-research/1f3b733c-8091-54cd-a758-95a05b900ada/scratchpad/ws-green1/tests/html-it/green/s11.html`

**What's on the page:** The page opens with a one-paragraph summary of the flow and the three rules Priya needs before she changes it. Next comes a diagram of the request path. It marks where the slot lock is held and where a taken slot turns into HTTP 409. After that:
- a step-by-step walkthrough of the path;
- the `book()` method with syntax colouring and notes on each line;
- the three rules, each with the reason behind it;
- a table of files to read in order;
- References and a Glossary.

The interactive parts are the theme toggle, hover pop-ups on IDs and terms, and a Copy button on the code. Everything is visible when the page loads and when it is printed.

**Mermaid and highlight.js:** I drew the diagram by hand as SVG and coloured the code ahead of time, rather than loading either library from a CDN. A file sent over Teams or email has to open offline. Loading third-party scripts next to internal code also sends readers' requests to an outside server, and Mermaid alone is about 3 MB. The result looks the same and works with no network.

**Message for the team chat:**
```
Booking walkthrough for Priya (HTML, opens offline): how a POST /bookings request moves through BookingResource, BookingService.book(), the Redis slot lock, save, and the BookingCreated event that sms-service uses to schedule the SMS reminder.
It includes a flow diagram, the book() method with notes on each line, and three rules that prevent double bookings: keep the lock TTL (30 s) above the DB timeout (ADR-011), let a taken slot return HTTP 409, and never call book() inside another transaction (BUG-3120).
```

**Things to know:**
- **References:** ADR-011, BUG-3120 and commit 7c41e9a are all explained using your notes, so none are unresolved. I didn't have the ADR document or the bug ticket themselves, and the page says so.
- **Inference in the BUG-3120 section:** the page explains why an outer transaction causes double bookings by reasoning from the code. That reasoning is labelled as not coming from the ticket.
- **Database timeout:** your notes don't give its value. The page tells readers to check the configured value before changing either number.
- **Package paths:** they aren't in your notes, so the file table lists file names only.
- **Libraries:** none are inlined.

The checker passes with no failures or warnings. If you want changes, I can do one round. For example, I can add the database timeout value or the full file paths.
