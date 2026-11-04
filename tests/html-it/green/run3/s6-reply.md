Choices taken (I could not ask, so the recommended options were used; the questions are in `tests/html-it/green/s6-gates.md`):
- Form: knowledge explainer. Theme: Ivory. Language: English. Depth: Standard.
- Image: one generated concept illustration for the opening; all diagrams stay inline SVG.

The page is at:
C:\Users\raymond.shen\AppData\Local\Temp\claude\D--git-2026-11-01-html-output-research\dabf728a-13de-4df0-8275-99bfcecb826a\scratchpad\ws3\s6\tests\html-it\green\s6.html

What it is: an explainer for new backend engineers that opens with the answer (orders are stored as events and rebuilt by replay), then a "snapshot versus log" diagram for people coming from CRUD, the command-to-UI flow as a diagram with a five-step walkthrough, a worked example, the reasons from ADR-007, the three costs, a self-check, references and a glossary.
Interactions: a slider in the worked example replays an example order's events one at a time (the full table is visible without JavaScript and in print), four self-check questions with answers in collapsible panels, and pop-up definitions for every glossary term and for the ADR-007 chip. A theme toggle switches light and dark.

Ready to paste into Teams:
> New to the order service? This one-page explainer covers event sourcing: why we store every change to an order as an event instead of overwriting a row, how a command becomes an event and then a screen, and what ADR-007 (March 2025) chose it for: a billing audit trail, rebuildable read models and "what did this order look like on 1 March?" queries.
> It also covers the costs (event versioning, short read delays, snapshots every 500 events) and ends with a four-question self-check. Opens offline in any browser.

Notes:
- References: ADR-007 is explained from the brief itself; its full text and location were not given, and the page says so. Nothing is unresolved.
- The worked example uses a made-up order (dates in February and March 2026, 120.00 EUR); the page labels it as an example. The replay code is labelled pseudocode, because the service's language and code were not provided.
- Image: one illustration request is logged in `tests/html-it/green/s6-images.md`; the page currently holds the generated-image placeholder in its place, with alt text.
- No libraries or web fonts; everything is inline and the checker passes.

Happy to do one round of changes, for example a German version or a deck for an onboarding session.
