I built the sprint 46 retro page. It does not take votes from the whole team or show live totals, because a single HTML file can't do that.

I couldn't ask you anything, so I went with my recommended choices. The questions are in `tests/html-it/green/s15-gates.md`.
- **Form:** retro notes with a ballot and a tally box.
- **Theme:** Ivory.
- **Language:** English.
- **Depth:** Standard.

**File:** /tmp/claude-0/-home-user-2026-11-01-html-output-research/1f3b733c-8091-54cd-a758-95a05b900ada/scratchpad/ws-green2/tests/html-it/green/s15.html

**About the voting:** every copy of the file is separate, so it can't gather six people's votes or keep a running total.
- Each person ticks the ideas they support and the page writes one vote line, such as `Sprint 46 retro vote (Priya): 1, 3`. They copy it and paste it into the team channel.
- After the deadline, the facilitator pastes all the lines into the tally box. The page counts the latest line per person and shows a bar chart, plus a table of who voted for each idea.
- The page says this where readers reach the ballot.
- If the team wants a running count everyone can see, the chat tool's poll feature is the better choice.

The page opens with the result and the deadline. After the ballot it covers what went well and what to improve, with each problem linked to the idea meant to fix it. KT-948 and RB-04 are linked to a References list, and a short glossary explains the jargon.

**Message for the team channel:**
> Sprint 46 retro: please vote on our four action ideas before the deadline (Thursday 2026-11-06, to be confirmed).
> Open the attached page, tick the ideas you support, type your name and press Copy.
> Paste your vote line here. If you change your mind, post a new line; only your latest counts.
> The facilitator counts the lines in the page after the deadline.

**To confirm:**
- **Deadline:** the notes say "Thursday 2026-11-06", but 6 November 2026 is a Friday. The page keeps the original wording and marks it "to be confirmed".
- **Votes per person:** the notes don't set a limit, so the page lets each person tick as many ideas as they like.
- **Channel:** no channel is named, so the page just says "the booking team's channel".

**Checks:** both ID references are resolved and the page loads no outside libraries. The page checker passed with no failures or warnings, but I haven't opened it in a browser yet.

I can do one round of changes, for example a vote limit or the real channel name.
