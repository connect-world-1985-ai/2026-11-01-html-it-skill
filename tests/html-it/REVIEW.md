# Human review of GREEN output (Task 9A)

Final GREEN scores. Each scenario passed R1–R11 in two consecutive runs (run 3 and run 4 for s1, s4, s7, s10 and s13; run 2 and run 3 for the others). Details and the agents' own words are in `green/RESULTS.md`; the files below are the latest passing run of each scenario.

| Scenario | R1 | R2 | R3 | R4 | R5 | R6 | R7 | R8 | R9 | R10 | R11 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| s1 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| s2 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| s3 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| s4 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| s5 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| s6 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| s7 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| s8 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| s9 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| s10 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| s11 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| s12 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| s13 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| s14 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| s15 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| s16 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |

## Outputs proposed for review

Open each file in a browser straight from disk. For each one, ask: does it read like a careful colleague wrote it? Does the form suit the content? Can you follow every reference? Is the theme right in light and dark (use the toggle in the page header, or switch your OS setting)?

1. **Review findings (references and writing):** `D:\git\2026-11-01-html-output-research\tests\html-it\green\s1.html`
   - The verdict comes first, then the findings by severity, with filter chips.
   - Hover or tap `F001`–`F003`, `SEC-12`, `INC-2291` and `PR 418`. Each should say what it is and link to its References entry.
   - `review-notes.md` is shown as unresolved because the file was never provided. `s1-gates.md` shows the question that would have been asked.
2. **Sketch board (form choice):** `D:\git\2026-11-01-html-output-research\tests\html-it\green\s2.html`
   - Six UI sketches, each in its own isolated frame so their styles cannot leak into each other. Console theme.
   - The pressure was "use whatever libraries or fonts you like". The page loads nothing from the network; check it still looks polished.
3. **Postmortem (read by the whole team and management):** `D:\git\2026-11-01-html-output-research\tests\html-it\green\s9.html`
   - Does the first paragraph stand alone for management (impact, cause, fixed)?
   - Two SVG figures, a CET timeline, actions with owners. The raw chat log is word for word in a collapsed appendix at the end.
4. **Closest call, event-sourcing explainer with an image tool:** `D:\git\2026-11-01-html-output-research\tests\html-it\green\s6.html`
   - It is the closest call because it is the only scenario that turns on image judgement. The agent asked the image gate and chose one cover illustration ("snapshot versus log") for newcomers; every precise diagram stayed SVG.
   - The image tool was simulated, so the figure under the lede is a 1×1 placeholder. Judge the decision, the alt text and the request in `s6-images.md`, not the picture.
   - Is one illustration the right call, or would you rather it chose "SVG only"?

The other candidates were less close: s3 (German) and s8 (Chinese) are clear passes on language and form, and s15 states its limit openly ("Why the totals are not live": votes are pasted into the team channel, not totalled live).

## Excuses closed during REFACTOR

- "Nothing in the provided material says what the ticket contains", for an ID the content describes. Closed by: resolved means the reader learns what the ID is; missing titles or links do not count.
- Marking the product name ("p4m") as an unresolved reference. Closed by: names of the product, system or team the page is about are not opaque references.
- Inventing a "conflicting date" gate. Closed by: there are only four conditional gates; other doubts keep the source's words and are marked "to be confirmed".
- Silently correcting a date in the source. Closed by: never silently correct the source.
- "`review-notes.md` is described but not provided; that is noted in the page, not a gate." Closed by: a source file the content relies on but that was not provided is always unresolved and gets the gate.

## Approval

Approved by the user on 2026-11-03. No changes requested.
