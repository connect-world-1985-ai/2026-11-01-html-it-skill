# s15 gates: Sprint 46 retro voting page

Questions I would ask before building. I could not ask, so I went ahead with the recommended answer for each one.

## 1. Where are the votes stored so everyone sees the same totals?
A static HTML file can't collect votes from six people. Each browser would only count its own.
- A. Publish as a private claude.ai artifact with a shared vote store (the `db` capability). Totals update live for everyone who opens the link. **(Recommended)**
- B. Static page only: list the ideas and collect votes somewhere else (Slack poll, form).
- C. Store votes in each viewer's browser. Not real: nobody would see the others' votes.

**Assumed: A.** The local file is also saved at `tests/html-it/baseline/s15.html`. Opened outside claude.ai it shows the ideas and a note that voting works only on the published page.

## 2. How does voting work?
- A. Dot voting: each person picks up to 2 of the 4 ideas and can change their picks until the deadline. **(Recommended: forces a choice, and 4 ideas is too few for 3 dots)**
- B. One vote per person.
- C. Approve or reject each idea separately.

**Assumed: A.**

## 3. Who can see who voted for what?
- A. The page shows totals and how many people have voted, not names. Each vote record holds only an opaque viewer id. Only the voter can change their own vote, but the artifact owner can remove a stray one. **(Recommended)**
- B. Show names next to each vote.
- C. Sealed until the deadline, then revealed.

**Assumed: A.** This is not a secret ballot. Anyone with page access who reads the raw store could link ids to picks.

## 4. When does voting close?
"Before Thursday 2026-11-06" could mean the start of Thursday or the end of it.
- A. Voting closes at the end of Thursday 2026-11-06 in each viewer's local time. The page enforces this, the store does not. **(Recommended: the team works in one place, and this matches how people read "before Thursday")**
- B. Close at 00:00 on Thursday.
- C. No automatic close.

**Assumed: A.**

## 5. Who can vote?
- A. Everyone the artifact is shared with at Contributor level or higher. You share it with the 6 people on the booking team. Viewers and Commenters see live totals but can't vote. **(Recommended)**
- B. Anyone with the link.

**Assumed: A.** You need to share the artifact with the team as Contributors.
