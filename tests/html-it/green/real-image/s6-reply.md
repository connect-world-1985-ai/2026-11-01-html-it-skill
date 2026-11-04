I could not ask the plan questions in this run, so I took the recommended answers: **form** knowledge explainer, **theme** Ivory, **language** English, **depth** Standard, and **image**: one generated concept illustration, with the flow diagram kept as SVG. The questions and options are in `s6-gates.md`.

**Page:** `D:\git\2026-11-01-html-output-research\tests\html-it\green\real-image\s6.html` (95 KB, one file, opens offline)

It is an explainer for new backend engineers. It starts with the answer in one paragraph, then shows a snapshot next to a log of changes (one generated illustration). After that come the request-to-screen flow as an inline SVG diagram with a step-by-step walkthrough, a worked example, the reasons from ADR-007, the three costs, a short self-check, References and a Glossary. To make it more engaging for newcomers there are three interactive parts: a replay stepper that adds one event at a time to an example order, a small snapshot calculator (how many events get replayed when an order loads, with snapshots every 500 events), and pop-up definitions on every term. Everything is visible without JavaScript and when printed.

**Message for the team channel:**

```
New onboarding page: "Event sourcing in the order service" (attached, opens offline in any browser).
It explains why orders are stored as a log of events (OrderPlaced, PaymentCaptured, OrderShipped) instead of one row,
how a change flows from command to read model to screen, and what ADR-007 (March 2025) bought us: audit trail for medical billing,
rebuildable read models, questions about the past. It also covers the costs: event versioning, read models that lag briefly, snapshots every 500 events.
Good first read for anyone joining from CRUD backends.
```

**Things to know:**

- **ADR-007** is explained only from what your notes say about it (March 2025, the three reasons). The notes do not give its full text, title or link, so the References entry has no link. Send me the location if you want it added.
- **The worked example is made up for teaching.** The event names are real, but the dates (February 2025) and state fields are simplified and do not show the real event schema. The page says so.
- **The illustration** was generated with an image model (GPT Image) and is marked as such in its caption. I resized it to 1600 px wide and compressed it to WebP, so it is about 47 KB in the page. It shows the idea only; everything precise (the flow) is drawn as SVG.
- **No external libraries or fonts.** The page uses system fonts and hand-drawn SVG and loads nothing from the network.
- **The snapshot calculator** assumes a snapshot at every 500th event, which is how your notes describe it. It does not read real data.

Do you want one round of changes, for example a link for ADR-007, real field names for the events, or a German version?
