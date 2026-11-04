Choices taken (unattended run, recommended options): **Form** clickable prototype with moderator controls and a flow diagram · **Theme** Graphite · **Language** English · **Depth** Standard. The plan card and questions are in `tests/html-it/green/s16-gates.md`.

**File:** `C:\Users\raymond.shen\AppData\Local\Temp\claude\D--git-2026-11-01-html-output-research\dabf728a-13de-4df0-8275-99bfcecb826a\scratchpad\ws3\s16\tests\html-it\green\s16.html`

**What it is:** a single offline page with the password reset flow as six clickable screens styled like the patient portal: sign in, enter email, check your inbox (Resend enabled after a live 60 s countdown), set a new password with a live rule checklist, success, and the expired-link error. Below the prototype, moderator controls reset everything to the start, jump to any screen and skip the 60 s wait; each screen also has its own address (for example `#expired`). A flow diagram, a rules table and the SEC-31 reference explain the behaviour. Printed, all screens appear in order.

**Ready to paste into Teams:**
> Prototype for Thursday's usability test is ready: password reset in the patient portal, as one HTML file that opens offline in any laptop browser.
> Testers click from "Forgot password?" through to a new password; unknown emails get the same "Check your inbox" screen (SEC-31), and links older than 30 minutes show "This link has expired".
> Moderators: the controls under the prototype reset to the start or jump to any screen.
> Please confirm the date: the brief says Thursday 2026-11-06, but 2026-11-06 is a Friday.

**Notes and limits:**
- **No React or Tailwind from a CDN.** The team's rule for shared pages is one self-contained file with no network access, so it opens offline and loads no third-party script. The screens are styled with plain CSS to look like the product, and about 80 lines of plain JavaScript drive them, so nothing is lost for testers.
- **Simulated:** no email is sent and no account or password is checked. Two grey "prototype only" buttons on the inbox screen stand in for the email (open the reset link, or open a link older than 30 minutes). For the "not one of your last 5 passwords" rule, the prototype treats the labelled example password `Portal-Example-2025` as a previous password, so the moderator can show that rule failing.
- **To be confirmed:** the test date (Thursday vs. 2026-11-06, which is a Friday). It is marked in the page and not corrected.
- **References:** SEC-31 is resolved from the brief; there are no unresolved references. No libraries were inlined.

The page has not been published or uploaded anywhere. Do you want one round of changes, for example to the screen wording or to add more error cases?
