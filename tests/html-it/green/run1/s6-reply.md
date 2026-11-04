I couldn't ask you the planning questions, so I picked the recommended option for each one. The questions, the options and my picks are in `/tmp/claude-0/-home-user-2026-11-01-html-output-research/1f3b733c-8091-54cd-a758-95a05b900ada/scratchpad/ws-green1/tests/html-it/green/s6-gates.md`.

- **Form:** a knowledge explainer.
- **Theme:** Ivory.
- **Language:** English.
- **Depth:** Standard.
- **Image:** one generated concept picture. The flow diagram is SVG.

The page is at `/tmp/claude-0/-home-user-2026-11-01-html-output-research/1f3b733c-8091-54cd-a758-95a05b900ada/scratchpad/ws-green1/tests/html-it/green/s6.html`. It's one HTML file that opens offline.

**How it reads:** It opens by saying that the order service stores every change as an event and gets the current order by replaying those events. Then it gives ADR-007's reasons for that choice and points newcomers to the parts to read first. After that come these sections:
- a picture contrasting an overwritten record with an ever-growing log, plus a table comparing CRUD with event sourcing;
- an SVG diagram of the flow, from command to aggregate to event store to projector to read model to the screen;
- a worked example of one order;
- the three reasons from ADR-007 and the three costs;
- a short self-check, the References entry and a glossary.

**What the reader can do:** To make it engaging for newcomers, the reader can try things instead of only reading:
- Step through the example order's three events with a slider or buttons. One button shows the order as it was "on 1 March 2026".
- Enter an order's number of events to see how many get replayed with a snapshot every 500 events.
- Open collapsed answers to three self-check questions.
- Hover over or tap any glossary term to see its definition.

The whole page is readable without JavaScript and prints in full.

**Message for the team channel:**
```
New-joiner explainer: event sourcing in the order service (attached HTML, opens offline).
Every change to an order is stored as an event and the current order is rebuilt by replaying those events. ADR-007 (March 2025) chose this for the medical billing audit trail, rebuildable read models and "as of a date" queries.
Walk through the example order, check the three costs (event versioning, read models that lag, replay time with snapshots every 500 events), then try the self-check.
```

**Things to know:**
- **References:** ADR-007 is the only ID. The notes explain what it decided, but I didn't have the ADR document, so the page doesn't link to it. Its References entry says to ask the order service team where the ADRs are kept. No references are unresolved.
- **Image:** I requested one image from the image tool; the request is in `/tmp/claude-0/-home-user-2026-11-01-html-output-research/1f3b733c-8091-54cd-a758-95a05b900ada/scratchpad/ws-green1/tests/html-it/green/s6-images.md`. For now the page shows the placeholder image, marked `data-generated="true"`. I drew the flow diagram by hand as SVG rather than generating it, because it has to be exact.
- **Example data:** The example order's dates are made up and are labelled as examples on the page. The note "a shipped order cannot be cancelled" is also worded as a possible rule, not a real one.
- **Libraries and fonts:** none are loaded, and nothing is published or uploaded.
- **Checks:** The page passes the skill's checker with no failures or warnings. I opened it in a browser at desktop width in light mode and at phone width in dark mode: there were no script errors, no sideways scrolling, and the controls worked.

If you'd like changes, for example a deck version for an onboarding session, I can do one round.
