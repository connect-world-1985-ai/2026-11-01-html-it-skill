I couldn't ask you questions on this run, so I took the recommended answers. The questions are in `tests/html-it/green/s15-gates.md`:
- **Form:** a retro summary plus two small tools: a ballot that builds a vote line to copy, and a counter that totals the vote lines people paste.
- **Theme:** Ivory.
- **Language:** English.
- **Depth:** Standard.

The page is at:
`C:\Users\raymond.shen\AppData\Local\Temp\claude\D--git-2026-11-01-html-output-research\dabf728a-13de-4df0-8275-99bfcecb826a\scratchpad\ws3\s15\tests\html-it\green\s15.html`

**Live totals for everyone aren't possible.** The page is a single file sent by Teams or email, so each person opens a separate copy and their ticks stay in that copy. No one else sees them, so the page can't show a shared running total. I didn't fake it, and I didn't publish the page anywhere. Here's what the page does instead, and it says so right where the reader starts voting:
1. Each person ticks the ideas they support, types their name and presses *Copy my vote*. That copies a line like `Retro 46 vote | Name | 1, 3`, which they paste in the team channel.
2. The facilitator pastes all the lines from the channel into "Count the votes". The table shows the votes per idea and how many of the 6 people have been counted. If someone voted twice, only their last line counts.

If the team wants instant totals, a poll in your chat tool with the same four ideas will do that.

**How the page is laid out:** a short summary with the deadline, the four action ideas as a ballot, the counting table, then "What went well" and "What to improve" side by side, followed by References and a Glossary. Everything is visible when the page opens and when printed. It works offline and loads no libraries.

**Message for the team channel:**
> Sprint 46 retro: please vote on our four action ideas by Thursday 2026-11-06 (the exact date is still to be confirmed).
> Open the attached page, tick the ideas you support, press "Copy my vote" and paste the line here.
> The ideas: 1) quarantine flaky tests automatically, 2) review rotation with a 24-hour target, 3) meeting-free Wednesday afternoons, 4) retro every 3 weeks instead of 2.
> I'll paste everyone's lines into the page and post the totals here.

**Still open:**
- **Deadline:** the notes say "Thursday 2026-11-06", but 6 November 2026 is a Friday, and no time is given. The page keeps the original wording, marks it "to be confirmed" and suggests voting by Thursday 5 November to be safe.
- **Votes per person:** the notes don't say how many ideas each person may vote for, so the page allows one vote for each ticked idea and says so.
- **References:** both IDs are explained using only what the notes say: KT-948 is the booking search pagination work and RB-04 is the rollback runbook. Their titles and links weren't given.

The page passed the checker with no failures or warnings. I couldn't open it in a browser here, so the ballot and the counter haven't been clicked through yet.

Want one round of changes, for example a fixed number of votes per person?
