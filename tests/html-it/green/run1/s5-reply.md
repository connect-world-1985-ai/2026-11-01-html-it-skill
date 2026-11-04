I couldn't ask you anything during this run, so I picked the recommended option for each question. The questions are in `tests/html-it/green/s5-gates.md`:

- **Form:** a five-day checklist the new hire can tick off, with a progress bar for the week and a progress message they can copy for their buddy.
- **Theme:** Ivory.
- **Language:** English.
- **Depth:** Standard.

**File:** `/tmp/claude-0/-home-user-2026-11-01-html-output-research/1f3b733c-8091-54cd-a758-95a05b900ada/scratchpad/ws-green1/tests/html-it/green/s5.html`

**What it is:** a working checklist rather than a document to read. The week is split into four stages (day 1, day 2, day 3, and days 4–5). Each item has one sentence on what to do and why. At the top, a drawn bar fills in for each stage as items are ticked, with a counter and a "Next:" hint. Ticks and an optional name are saved only in the reader's browser.

**The surprise:** the page writes the buddy update for you. As you tick items, it builds a "done / still open" message, and one Copy button puts it on the clipboard ready to paste into Teams. If you print the page, you get a paper checklist.

**Limit:** you asked that the buddy can see what is done. A single file can't do that, because ticks stay on the new hire's own computer. The page says so in a highlighted note right above the message, and the daily copied message to the buddy in Teams is the replacement.

Message for Teams:

```
New onboarding page for backend hires: "Your first week as a backend engineer" (attached HTML, opens offline).
It is a checklist for days 1 to 5: set up, build and test the core project, pick a good first issue, ship and demo the first PR on Friday.
New hires tick items as they go, and a progress bar shows the week. Ticks stay in their own browser.
At the end of each day they copy the progress message from the page and send it to their buddy here.
```

**References:** both IDs are explained by the checklist itself: ONB-01 is "How we work" and ADR-007 is the decision on event sourcing. Neither has a link in the material, so the page tells readers to ask their buddy where to find them. I didn't invent any links.

**Not in the material:** the repository location, where the good first issues are listed, and the time of the Friday sync. These are collected in an "Ask your buddy on day 1" section rather than guessed.

**Checks:** no outside libraries or fonts. The skill's page checker passes with no failures and no warnings. I opened the page in a browser at desktop width (light) and phone width (dark), ticked items, typed a name and reloaded. Ticks were kept, the page did not scroll sideways and no script errors appeared.

I can do one round of changes, for example switching to Console for a more dashboard-like look or adding real links for ONB-01 and ADR-007 if you send them.
