I couldn't ask the plan questions in this run, so I went with the recommended options (full list in s12-gates.md):
- **Form:** pull-request write-up with the diff near the top
- **Theme:** Graphite
- **Language:** English
- **Depth:** Standard

The page is at:
C:\Users\raymond.shen\AppData\Local\Temp\claude\D--git-2026-11-01-html-output-research\dabf728a-13de-4df0-8275-99bfcecb826a\scratchpad\ws3\s12\tests\html-it\green\s12.html

**About "reviewers only want the diff":** the diff excerpt is the first section, right under a short conclusion paragraph. I kept a short note on each changed line, plus the risk and test steps, because reviewers need those to approve. There's no long prose and the page doesn't repeat the full diff.

**What the page contains:** the annotated diff, a short "Why" section, a file tree with +/− counts, a risk callout about the dropped total count, test evidence and a four-step "How to review" checklist. At the end are References and a Glossary. The only interactive parts are reference and term popovers, copy buttons on code blocks and a light/dark toggle. All content shows without JavaScript and when printed.

Summary to paste into Teams:
PR 437 "Paginate booking search" (feature/KT-948-pagination into master) is ready for review.
It replaces OFFSET paging with keyset pagination on (start_time, id) and adds the index slots(practice_id, start_time, id), so search stays fast past page 50 (KT-948).
Behaviour change: the response no longer has a total count. Mobile app 3.2 only uses it for a label, and the app team has checked this.
To test: run BookingSearchServiceIT, then GET /bookings/search?practice=17&size=5 and follow nextCursor.
The write-up page is attached.

**Notes:**
- **References:** all three resolve from the content (PR 437, KT-948, INC-2307). The source gave no links for them, and each entry says so.
- **Marked "to be confirmed" on the page:**
  - The source has no test run result.
  - The source doesn't say why the query fetches `size + 1` rows. The page asks reviewers to check that the extra row only signals whether there's a next page.
  - The source doesn't list other clients that might read the total count.
- **Limits:** no libraries are inlined and nothing loads from the network. The checker passed with 0 failures and 0 warnings.

Want one round of changes?
