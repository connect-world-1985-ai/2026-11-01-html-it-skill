I couldn't ask you the planning questions, so I chose the recommended answers. The questions and their options are in `tests/html-it/green/s6-gates.md`:
- **Form:** a knowledge explainer for newcomers. It goes from a short answer to a "snapshot versus log" comparison, then a flow diagram, a worked example you can replay, why the team chose it, what it costs, and a self-check.
- **Theme:** Ivory.
- **Language:** English.
- **Depth:** Standard.
- **Image:** one generated illustration contrasting a snapshot with a log. Everything that has to be exact stays as inline SVG or HTML.

The page is ready at:
/tmp/claude-0/-home-user-2026-11-01-html-output-research/1f3b733c-8091-54cd-a758-95a05b900ada/scratchpad/ws-green2/tests/html-it/green/s6.html

To make it engaging for newcomers I added things to try rather than decoration:
- **Replay slider:** in the worked example, it replays an example order one event at a time (OrderPlaced, PaymentCaptured, OrderShipped) and shows the order's state after each event. It also answers "what did this order look like on 1 March?"
- **Snapshot calculator:** shows how snapshots every 500 events shorten replay.
- **Self-check:** four questions with collapsible answers.
- **Pop-up definitions:** hovering a term or the ADR-007 chip shows its meaning, and the same definitions are in a glossary at the end.

All of it is readable with JavaScript off and when printed.

Summary to paste into Teams:
New-joiner explainer: event sourcing in the order service. Instead of overwriting an order's current state, the service stores every change as an event in an append-only log and builds the current state by replaying them. ADR-007 (March 2025) chose this for the medical billing audit trail, easy rebuilds of read models, and questions like "what did this order look like on 1 March?". The page also covers the costs: event schema versioning, screens that lag briefly behind the log, and snapshots every 500 events to keep replay fast. It includes a replay slider and a short self-check, and opens offline.

Things to know:
- **ADR-007:** I worked out what it is from your notes. Its title, author and link weren't given, so the References entry asks readers to get the link from the backend team. If you send me the link, I'll add it.
- **Example data is invented:** the example order's dates, times and EUR 120.00 amount are made up for teaching and labelled that way on the page. So is the 1,240-event figure in the calculator. The event names, the three reasons and the 500-event snapshot interval come from your notes.
- **The image is a placeholder for now:** I wrote the image request (prompt, purpose, where it goes, alt text) to `tests/html-it/green/s6-images.md`, and the page has a 1×1 placeholder marked `data-generated="true"` in its place. The page still makes sense without the picture, because the comparison table under it says the same thing.
- **No libraries:** the flow diagram is drawn by hand as inline SVG, with no Mermaid or other library. The page loads nothing from the internet and doesn't depend on any hosting.

The page passed the skill's checker with no failures or warnings. I also opened it in a headless browser at phone width (390 px, dark) and desktop width (1280 px, light). It had no script errors and no sideways scrolling, and the replay slider and calculator both worked. I haven't published or uploaded it anywhere.

If you'd like changes, for example a shorter Brief version or a different example order, tell me and I'll make them in one round.
