# s15 gates: questions I would ask before building

This run cannot ask the user, so the recommended option of every question is taken (language: English, as the scenario specifies).

## Gate 1: plan card

```
Plan: Sprint 46 retro vote
Reader: the six people on the booking team (and anyone reading the retro later)   Job: decide (vote on the action ideas), then understand the retro outcome
Form: composed (traits: decision, status, small tool) - retro summary with a personal ballot and an offline tally
Outline: 1. Vote on the four action ideas  2. Count the votes (facilitator)  3. What went well  4. What to improve  5. References  6. Glossary
Interactivity: tick the ideas you support, the page builds a vote line to copy into the team channel; the facilitator pastes all lines into a tally box that counts them in the browser. No shared state, no live totals.
References: 3 found (KT-948, RB-04, release 8.4.0.0), 3 resolved from the content, 0 unresolved
```

Limit to state up front: a single HTML file cannot collect votes from six people or show live totals; there is no shared storage and nothing is published. The page says so where the reader votes and offers the copy-to-channel route plus an offline tally.

1. Form?
   A) Retro summary with a personal ballot (copy your vote line to the team channel) and an offline tally box for the facilitator (Recommended) - works in one offline file and gets real totals without a server.
   B) Retro summary only, with a note to vote in the team's poll tool - simplest, but the page does nothing to help voting.
   C) Ballot only, no retro summary - shorter, but readers lose the reasons behind the ideas.

2. Theme?
   A) Ivory (Recommended) - retro notes read top to bottom by the whole team.
   B) Graphite - denser, suits reviews and specs more.
   C) Console - suits live boards, which this file cannot be.

3. Language?
   A) English (Recommended)
   B) Deutsch
   C) 中文

4. Depth?
   A) Brief - ballot and one-screen summary only.
   B) Standard (Recommended) - ballot, tally, what went well and what to improve, references, glossary.
   C) Full - everything plus an appendix with the original notes.

## Clarifications (content questions)

5. The deadline says "Thursday 2026-11-06", but 6 November 2026 is a Friday. Which is meant?
   A) Thursday 5 November 2026, and say in the page that the source date was a Friday (Recommended) - the earlier date means no vote arrives late.
   B) Friday 6 November 2026.
   C) Leave it as written and mark the mismatch.

6. How does each person vote?
   A) Tick every idea you support, any number from none to four (Recommended) - matches "vote on the action ideas" without inventing a vote budget.
   B) Exactly two votes per person (dot voting).
   C) Rank all four ideas.

## Assumed answers

1A, 2A Ivory, 3A English, 4B Standard, 5A Thursday 5 November 2026 (mismatch stated), 6A tick any number.
No conditional gates apply: the reader is stated (the six-person booking team), every reference is explained in the content, there is no raster media, and no image tool is needed.
