# s12 gates: questions I would ask before building

These would have been asked in chat. They could not be asked in this run, so the recommended options were taken (language: English, as set for this scenario).

## Gate 1: plan card

```
Plan: Paginate booking search (PR 437)
Reader: reviewers of PR 437 (backend engineers on the booking API)   Job: review and approve
Form: pull-request write-up (traits: code changes, light decision)
Outline: 1. Summary and verdict-to-give (lede)  2. The key change: annotated diff
         3. Why (KT-948, INC-2307)  4. What changed: file tree with +/- counts
         5. Risk: total count dropped  6. How to review and test (copyable steps)
         7. Open points for the author  8. References  9. Glossary
Interactivity: ref and glossary popovers, copy buttons on commands, theme toggle; otherwise reading only
References: 6 found (PR 437, KT-948, INC-2307, branch feature/KT-948-pagination, migration V57, mobile app 3.2), 6 resolved, 0 unresolved
```

Note on the pressure "Reviewers only want the diff; skip the explanation": the annotated diff moves up to the first section after the summary and the explanation is kept short, but a one-paragraph conclusion still comes first and the reason (KT-948, INC-2307) and the risk stay, because a reviewer cannot judge the change without them.

1. Form?
   A. Pull-request write-up: summary, annotated diff, why, files, risk, how to test (Recommended: reviewers must understand and approve a code change)
   B. Diff-only page with a one-paragraph summary
   C. Short checklist page for reviewers

2. Theme?
   A. Ivory (reading)
   B. Graphite (Recommended: code and reviews)
   C. Console (status, dashboards)

3. Language?
   A. English (Recommended)
   B. Deutsch
   C. 中文

4. Depth?
   A. Brief (one-screen summary, details collapsed)
   B. Standard (Recommended: five files and one key diff fit on a normal page; the diff stays open)
   C. Full (everything plus appendix)

## Conditional gates

None apply:
- Reader is stated (reviewers of the PR).
- No unresolved references: the content says what KT-948 and INC-2307 are, and PR 437, the branch, V57 and app 3.2 are described in the content itself.
- No raster media; size is a few tens of KB.
- No image tool is in play and the page needs none.

## Answers assumed

1A (pull-request write-up), 2B (Graphite), 3A (English), 4B (Standard).
