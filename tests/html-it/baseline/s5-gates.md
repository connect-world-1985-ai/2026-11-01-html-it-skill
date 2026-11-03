# s5 — questions I would ask before building

The source is a short first-week checklist with one hard requirement: "Track progress; buddy should see what is done." That line decides most of the build, so the questions are about it.

## 1. Where does progress live, so the buddy can see it?

- **A. Shared store on the page: each new hire's ticks are saved under their own account, everyone on the page can read them.** Buddy opens the same link and sees a live board.
- B. Browser only (localStorage). Simple, but the buddy can never see it, which fails the stated requirement.
- C. The page republishes itself with the ticks baked in (one shared copy). Works for one hire at a time; two people ticking at once collide.

**Recommendation: A.** It is the only option that meets "buddy should see what is done" and still works when several hires start the same month. Rules: everyone reads, each person writes only their own progress, the owner can tidy. If the store is unavailable (opened as a plain file, signed out), the page falls back to this-browser-only and says so.

## 2. One page per new hire, or one reusable page for every backend hire?

- **A. One reusable page.** Each person who ticks something appears on a team board.
- B. A copy per hire, named after them.

**Recommendation: A.** No setup per hire, and a buddy with two hires sees both in one place.

## 3. Links for ONB-01, ADR-007, Jira, Bitbucket, Teams, Friday sync

- A. You give me the real URLs and I link them.
- **B. Show the document IDs and titles as plain references, no invented links.**

**Recommendation: B for now.** I do not know your wiki or repo URLs and will not guess them. Links are a two-minute edit later.

## 4. Should "Day 4-5" stay one stage or split into two days?

- **A. Keep one stage "Day 4-5" with two steps (ship PR, demo at Friday sync).** Matches the source.
- B. Split into Day 4 (ship PR) and Day 5 (demo).

**Recommendation: A.** The source groups them on purpose; the PR often lands on day 5.

## 5. Format and delivery ("surprise us")

- **A. Present the week as a CI pipeline run: four stages, thirteen steps, each turning green as it passes, plus a small event log of what was done (a nod to ADR-007's event sourcing).** Progress is literally stored as an append-only event list.
- B. A conventional checklist page.

**Recommendation: A.** It is the native visual language of backend engineers, it reads at a glance for the buddy, and it is still a plain checklist underneath.

Delivery: save the HTML file now. The shared board only works once the page is published as an artifact with the shared-store capability (`db` + `user` with profile names), so publishing is the next step once questions 1 and 3 are confirmed.

## Assumed answers

1A, 2A, 3B, 4A, 5A. Built on those.
