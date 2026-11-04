I couldn't ask you the plan questions, so I went with the recommended answers. The questions and options are in `/tmp/claude-0/-home-user-2026-11-01-html-output-research/1f3b733c-8091-54cd-a758-95a05b900ada/scratchpad/ws-green2/tests/html-it/green/s12-gates.md`.

- **Form:** a pull-request write-up
- **Theme:** Graphite (the house look for code and reviews)
- **Language:** English
- **Depth:** Standard

The page is at `/tmp/claude-0/-home-user-2026-11-01-html-output-research/1f3b733c-8091-54cd-a758-95a05b900ada/scratchpad/ws-green2/tests/html-it/green/s12.html`. It's one HTML file that opens offline, and the page checker passes it with no failures or warnings.

**About "reviewers only want the diff":** the annotated diff is now the first section, right after a one-paragraph summary, and the explanation is short. I kept three things anyway, because without them a reviewer can't judge the change:
- **The summary:** what the PR does and what reviewers should do.
- **The reason:** KT-948 and INC-2307.
- **The risk:** the total count is dropped from the response.

**What's on the page:**
1. The summary, branch and file counts.
2. The diff with a note on each line, and a small diagram comparing OFFSET with keyset pagination.
3. Why the change was needed.
4. A tree of the changed files with +/- counts.
5. A warning about the dropped total count.
6. Five review steps, with a copy button on the test request.
7. Open points for you.
8. References and a glossary.

**Interaction:** hovering over or focusing a ticket ID or term shows a short explanation, and there's a light/dark theme switch. Everything is visible when the page loads and when printed.

**Ready to paste into Teams:**
> PR 437 "Paginate booking search" is ready for review. It replaces OFFSET pagination with keyset pagination on (start_time, id) and adds migration V57, an index on slots(practice_id, start_time, id), so search on large practices stays fast beyond page 50 (KT-948) and can't fall back to a full table scan like the 29 October outage (INC-2307).
> Behaviour change: the search response no longer includes the total count. Mobile app 3.2 only uses it for a label (checked with the app team).
> To test: run BookingSearchServiceIT, then GET /bookings/search?practice=17&size=5 and follow nextCursor.
> Write-up attached as an HTML file.

**References:** all 4 IDs on the page are explained in your notes: PR 437, KT-948, INC-2307 and migration V57. None are unresolved. Your notes didn't include links to the PR, the ticket or the incident, so their entries say "no link was given".

**Points I marked "to be confirmed" instead of guessing:**
- How the `page` parameter relates to `nextCursor`.
- Whether a `size` above 100 is capped or rejected.
- Why the query fetches `size + 1` rows.

**Limits:**
- No libraries are used. The diff colours and the diagram are written into the page itself.
- The page is a static file. It doesn't link to or update the live pull request.
- I didn't publish or upload it anywhere.

I can do one round of changes if you'd like, for example dropping the diagram or the open points.
