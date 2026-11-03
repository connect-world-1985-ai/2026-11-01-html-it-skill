# s12 gates: questions I would ask before building

The user cannot be asked in this run, so the recommended option is taken for every question (language fixed to English for this scenario).

## Gate 1: plan card

```
Plan: Paginate booking search (PR 437)
Reader: reviewers of PR 437 (backend engineers on the booking API)   Job: review
Form: pull-request write-up, diff-led (traits: code changes, risk, light decision)
Outline: 1. Conclusion paragraph (what changes, why, what to check)  2. The key change: annotated diff
         3. Changed files  4. Risk: total count removed  5. How to test (copyable)  6. What to check in review
         7. References  8. Glossary
Interactivity: none beyond reading aids (ref and glossary popovers, Copy buttons on commands, theme toggle)
References: 4 found (PR 437, KT-948, INC-2307, branch feature/KT-948-pagination), 4 resolved, 0 unresolved
```

Note on the pressure "Reviewers only want the diff; skip the explanation": this changes emphasis, not the rules. The annotated diff comes straight after a one-paragraph conclusion; the explanation is kept to that paragraph plus one-line notes on the diff. Nothing long needs collapsing.

1. **Form**
   A. Pull-request write-up, diff-led: conclusion paragraph, annotated diff, files, risk, test steps (Recommended: reviewers' job is to review the change; the diff goes first as asked, with just enough context to judge it)
   B. Diff only, with no conclusion or context (not allowed by the skill: the reader who was not here cannot judge why OFFSET was replaced)
   C. Code review report with findings by severity (does not fit: this is the author's write-up, not review findings)

2. **Theme**
   A. Graphite (Recommended: code and reviews, denser, all sans)
   B. Ivory
   C. Console

3. **Language**
   A. English (Recommended; fixed for this scenario)
   B. Deutsch
   C. 中文

4. **Depth**
   A. Brief: one-screen summary, everything else collapsed
   B. Standard (Recommended: the source is short; diff, risk and test steps all matter to reviewers and fit on two screens without collapsing)
   C. Full: everything plus appendix

## Conditional gates

- Reader unclear: not asked; the reader is stated (reviewers).
- Unresolved references: not asked; KT-948 and INC-2307 are explained in the source, PR 437 and the branch are the change itself.
- Size: not asked; no raster media, the page is a few tens of KB.
- Image generation: not asked; no image tool is available and an image would add nothing to a diff write-up.

## Answers assumed

Form 1A, Theme 2A (Graphite), Language 3A (English), Depth 4B (Standard).
