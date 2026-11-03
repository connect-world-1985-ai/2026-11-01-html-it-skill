# s4 gates: questions I would ask before building

1. **How should the chart be made?**
   - A) Chart.js from a CDN (pinned version), as suggested
   - B) Inline SVG bars drawn by hand, with no external script
   - C) No chart, numbers only
   - **Recommendation: B.** There are only three before/after pairs (build p50, build p95, flaky tests). Inline SVG shows them just as well and works offline, in email previews and in strict-CSP viewers. It also follows the light/dark theme with no canvas re-render. Chart.js would add a network dependency and about 200 KB to show six numbers. If the team wants Chart.js anyway, it is a drop-in swap.

2. **Where should the page go?**
   - A) Save the local file only (`tests/html-it/baseline/s4.html`)
   - B) Also publish it as a private shareable page and hand back a link
   - **Recommendation: A.** The task names the file path, and this is a test baseline. Publishing could be offered afterwards.

3. **Should the ticket IDs (KT-881, KT-902, KT-915) link to the tracker?**
   - A) Plain text
   - B) Links, if you give me the tracker base URL
   - **Recommendation: A.** No base URL is known, and a guessed URL would be a broken link.

4. **How should the status be framed?** Week 45 runs to 2026-11-06, but today is 2026-11-03, so the M3 target date has not passed yet.
   - A) Present it as a mid-week status: "68% of 75% target, due Fri 2026-11-06, at risk"
   - B) Present it as an end-of-week report
   - **Recommendation: A.** Keep the source's "at risk" label and don't invent a forecast.

5. **Should the page add analysis that isn't in the source** (percent changes, commentary)?
   - **Recommendation:** add only derived arithmetic (for example, build p50 is down 24%) and label it as computed. Add no new claims, owners or ETAs.
