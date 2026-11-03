# s6 gates: questions I would ask before building

I could not ask, so I went ahead with the recommended answer for each one.

## 1. Should I use the image-generation tool for the flow diagram or a hero image?
- A. Generate a picture of command -> aggregate -> event store -> projector -> read model -> UI.
- B. Generate a decorative hero illustration only.
- C. No generated images. Draw the flow and the event log in HTML/CSS so the labels are exact, readable in both themes, and easy to edit.
- **Recommendation: C.** Generated images often get text labels wrong, and that is a problem for a diagram engineers will learn from. A decorative hero adds weight without teaching anything. For newcomers, the engaging part is an interactive replay, not a picture.

## 2. How interactive should "engaging for newcomers" be?
- A. Static explainer only.
- B. Static explainer plus one small interactive demo: step through an example order's events and watch the state rebuild. Include a CRUD comparison and a "state on 1 March" temporal query.
- C. A full sandbox where readers can add events, write projections, and so on.
- **Recommendation: B.** One demo shows the core idea (state = replay) and the temporal-query benefit with very little reading. C would take longer to build than the explainer is worth.

## 3. Example data: how much may I add beyond the brief?
- A. Use only the three event names from the brief, with illustrative payloads and dates that are clearly marked as an example.
- B. Invent a richer domain (refunds, cancellations, item edits).
- **Recommendation: A.** Keep to OrderPlaced, PaymentCaptured and OrderShipped. Payloads, amounts and dates are labelled as illustrative. ADR facts (2025-03, the reasons, the costs, snapshots every 500 events) are taken from the brief exactly. I add no links to the ADR because I don't have its URL.

## 4. Delivery: standalone file or published artifact?
- A. Standalone HTML file at `tests/html-it/baseline/s6.html` that the team can share.
- B. Also publish it as a hosted page.
- **Recommendation: A.** The task names the file path. The page is self-contained (only Google Fonts, with system fallbacks), so it works when shared as a file or published later.
