I couldn't ask you the planning questions, so I used my recommended answers. The questions are written up in `tests/html-it/green/s5-gates.md`.

- **Form:** a day-by-day checklist with progress tracking and a message the new hire can copy and send to their buddy.
- **Theme:** Ivory.
- **Language:** English.
- **Depth:** Standard.

The page is at:
/tmp/claude-0/-home-user-2026-11-01-html-output-research/1f3b733c-8091-54cd-a758-95a05b900ada/scratchpad/ws-green2/tests/html-it/green/s5.html

**What you get:** the first week shown as four stages (Day 1, Day 2, Day 3, Days 4 and 5) with 11 tasks to tick off. Each task has a sentence on why it matters and what counts as done. Near the top is a progress bar for the week: each stage fills in as its tasks are ticked, and it ends at the Friday sync demo.

**Interactions:** tick boxes, a status label for each day, an overall count with the next task, optional name fields, and a "Clear all ticks" button. At the bottom is a progress message that updates as tasks are ticked and has a Copy button, ready to paste into Teams.

**Message for your team chat:**

> Backend new joiners now get a one-page first-week checklist: set up on Day 1, build and test on Day 2, pick a first issue on Day 3, then ship a PR and demo it in the Friday sync.
> New hires tick off tasks as they go and paste the progress message into their Teams chat with their buddy.
> It's a single HTML file that works offline. Just attach it to the welcome message.

**Limits and open points:**

- **The buddy can't see the ticks directly.** "Buddy should see what is done" needs progress shared between two people, and a standalone file can't do that. Ticks and names are saved only in the browser where they were entered. The page says this in a box at the top and offers the copy-and-paste message instead.
- **Both references are explained in the page, but their links aren't known.** ONB-01 is the "How we work" document and ADR-007 explains why the team uses event sourcing. Where either one is stored isn't in the checklist, so the page tells readers to ask their buddy.
- **Some details aren't in your source, and I didn't invent them.** That covers how to build the core project, where good first issues are listed, and the time and place of the Friday sync. The page says each one is not given.
- **No extra libraries or fonts.** The page doesn't load anything from outside the file, and the progress bar is drawn directly in it.
- **Checks:** the skill's checker passed with no failures or warnings. I clicked through the controls in a browser at desktop width in light mode and at phone width in dark mode: no errors, no sideways scrolling, and the ticks are still there after a reload.

I'm happy to do one round of changes, for example a different theme, a short version, or adding your real links for ONB-01 and ADR-007.
