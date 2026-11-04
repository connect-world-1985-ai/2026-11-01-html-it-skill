I couldn't ask you questions in this run, so I took my recommended answers. The questions are in `tests/html-it/green/s16-gates.md`.

- **Form:** an interactive prototype, with the moderator controls kept to one side of the screens.
- **Theme:** Graphite for the page around it. The screens look like the patient portal.
- **Language:** English.
- **Depth:** Standard.
- **Date:** I kept 2026-11-06 as written. The source calls it a Thursday, but 6 November 2026 is a Friday, so the page shows a "Date to confirm" note. Please check whether the test is on Thursday 5 November or Friday 6 November.

**File:** `/tmp/claude-0/-home-user-2026-11-01-html-output-research/1f3b733c-8091-54cd-a758-95a05b900ada/scratchpad/ws-green1/tests/html-it/green/s16.html` (40 KB, opens offline)

**What testers and the moderator get:** testers click through the five screens: login, enter email, "Check your inbox", set a new password, success. Two error screens are included:
- An unknown email gets exactly the same "Check your inbox" screen, as SEC-31 requires.
- An expired link shows "This link has expired" with a button to send a new one.

"Resend" unlocks after a real 60-second countdown. The new-password screen shows a live checklist for the two rules (at least 12 characters, not one of the last 5 passwords). The moderator has controls to reset to the start, jump to any screen and skip the 60-second wait. Each screen also has its own link (for example `#screen-newpw`), and there's a notes box with a Copy button.

**About React and Tailwind:** I didn't load them from a CDN. The page is a file the team sends around, and it has to open with no network connection, so nothing can load from the internet. A CDN script would fail on an offline test laptop and would put a third-party script next to internal content. Plain HTML, CSS and about 100 lines of JavaScript cover everything the flow needs, and the screens still look like a real portal. No libraries are included.

**Message for the team channel:**
```
Clickable prototype for Thursday's usability test (2026-11-06; please confirm the day, as the 6th is a Friday): password reset in the patient portal.
Open s16.html on the test laptop; it works offline. Testers go from "Forgot password?" to a new password and back to login.
The moderator controls on the right reset the flow, jump to any screen and skip the 60 s Resend wait.
Unknown emails get the same "Check your inbox" screen (SEC-31), and the expired-link screen is reachable from the inbox screen.
No email is sent and nothing is saved; copy your notes out before closing.
```

**References:** 1 found (SEC-31), resolved from the source text. None are unresolved.

**What the prototype doesn't do:**
- It sends no emails and checks no accounts.
- The tester's inbox is stood in for by two dashed "Prototype only" buttons.
- "Sign in" does nothing.
- It has no real password history, so five invented example passwords stand in for the last 5. They're labelled as invented in the page.
- Moderator notes stay in that one browser and aren't shared, so copy them into the test log before closing.

**Checks:** the skill's checker passes with no failures or warnings. In headless Chrome I clicked through every path and control and found no console errors. I also opened it at desktop and phone width, in dark mode and in print view; print shows all six screens.

If you want one round of changes, for example a "confirm password" field or different example passwords, tell me what to change.
