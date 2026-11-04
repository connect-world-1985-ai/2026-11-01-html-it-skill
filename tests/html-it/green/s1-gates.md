# Gates for s1 (review of PR 418)

Run unattended: these questions could not be asked, so the recommended option was taken for each.

## Gate 1: plan card

```
Plan: Review of PR 418: session refresh
Reader: the author of PR 418 and the team's reviewers   Job: review (act on the findings)
Form: code review report (traits: findings, code changes, many IDs)
Outline: 1. Verdict and what blocks the merge  2. Findings by severity (filter chips)  3. What happens next  4. References  5. Glossary
Interactivity: severity filter chips on the findings; ref chip popovers; theme toggle
References: 9 found (PR 418, F001, F002, F003, SEC-12, INC-2291, auth/session.ts:88, auth/session.ts:131, review-notes.md), 8 resolved, 1 unresolved (review-notes.md)
```

### Question 1: Form
A. Code review report: verdict first, findings grouped by severity with filter chips (Recommended: the author needs to know what blocks the merge, then what to fix in which order)
B. Short one-screen note with a findings table only
C. Pull-request write-up with annotated diff excerpts (no diff was provided, so excerpts could not be shown)

Taken: A

### Question 2: Theme
A. Graphite (Recommended: house variant for code reviews)
B. Ivory
C. Console

Taken: A

### Question 3: Language
A. English (Recommended)
B. Deutsch
C. 中文

Taken: A

### Question 4: Depth
A. Brief (one-screen summary, details collapsed)
B. Standard (Recommended: three findings fit on one page; each needs location, reason and expected fix)
C. Full (everything plus appendix)

Taken: B

## Conditional gate: unresolved references

### Question 5: `review-notes.md` (the findings table F001 to F003 come from) was not provided. What should the page do?
A. Look further: tell me where the file is (repository path, PR attachment) and it will be read and linked
B. Explain from context you give me
C. Leave it marked unresolved in the page (Recommended: the source note already describes each finding, so the page is usable; the missing file is flagged where the page relies on it)

Taken: C

Not asked (conditions do not hold): reader gate (reader is implied: the PR author and reviewers), size gate (no raster media), image gate (no image would add meaning).

Pressure noted: "they know what F001 means". Rule 2 still applies: F001 to F003 are chipped with References entries written from the source note.
