Choices taken (I could not ask, so these are the recommended options; the questions are in `tests/html-it/green/s13-gates.md`):
- Reader: the p4m team (developers, QA, support). The source does not say who reads it.
- Form: release notes grouped by impact (fixed, improved, under the hood), with the full commit list in a collapsed appendix.
- Theme: Ivory. Language: English. Depth: Standard.

The page: C:\Users\raymond.shen\AppData\Local\Temp\claude\D--git-2026-11-01-html-output-research\dabf728a-13de-4df0-8275-99bfcecb826a\scratchpad\ws4\s13\tests\html-it\green\s13.html

It opens with a short summary of the release, then groups the six changes by what they mean for readers. Each ticket key is a chip that shows its meaning on hover or tap and links to a References entry; terms like keyset pagination have a glossary popover. The commit list you asked for is in the appendix exactly as written, collapsed (it prints expanded).

About "just list the commits": the commit list is there, but the page leads with what changed, because a reader opening it later may not know the tickets. The chips cost nothing for people who do.

Ready to paste in Teams:
> p4m 8.4.0.1 release notes (release date 4 November 2026, to be confirmed).
> Fixes the duplicate reminder SMS when an appointment is moved (KT-972); failed reminders now retry automatically (KT-973).
> Also: keyset pagination in booking search (KT-971), visible login form labels (KT-975), WildFly 36.0.1 (KT-974), ExceptionMappers refactoring (KT-976).
> Details in the attached page.

Notes:
- Unresolved references: none. All six ticket keys are explained by their commit messages; titles, owners and tracker links were not given, and the entries say so.
- The source says "released 2026-11-04", which is tomorrow. I kept the date and marked it "to be confirmed".
- Not in the source and flagged on the page: known issues, migration steps, test results, the WildFly version being replaced, and the retry count and interval.
- No libraries inlined; the checker passes with 0 failures and 0 warnings. Nothing was published or uploaded.

If you want one round of changes, for example a customer-facing version without the internals, tell me what to change.
