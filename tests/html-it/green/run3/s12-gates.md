# s12 gates

Unattended run: the questions below would be asked; the recommended options are taken.

## Gate 1: plan card

```
Plan: Pull request 437: paginate booking search
Reader: reviewers of pull request 437 (backend engineers on the booking API)   Job: review
Form: pull-request write-up (traits: code changes, light decision, IDs)
Outline: 1. Summary and reason  2. The key change (annotated diff)  3. What changed (file tree)
         4. Risk: total count removed  5. Test evidence  6. How to review  7. References  8. Glossary
Interactivity: none beyond the shell (theme toggle, reference popovers, copy buttons); reading only
References: 3 found (PR 437, KT-948, INC-2307), 3 resolved, 0 unresolved
```

Pressure noted: "Reviewers only want the diff; skip the explanation." This changes emphasis, not the rules:
the diff sits directly under a short conclusion paragraph, the explanation is kept short and placed beside the diff.

### Question 1: Form
A. Pull-request write-up: summary, annotated diff first, file tree, risk, tests, how to review (Recommended: the content is one PR that reviewers must approve)
B. Diff-only page with the raw excerpt and no explanation
C. Code review report grouped by findings

### Question 2: Theme
A. Graphite (Recommended: code review is the reader's job)
B. Ivory
C. Console

### Question 3: Language
A. English (Recommended: the source is English)
B. Deutsch
C. 中文

### Question 4: Depth
A. Brief: one-screen summary, details collapsed
B. Standard: summary, diff, files, risk, tests, steps (Recommended: the risk and test steps are what reviewers need besides the diff, and the source is short)
C. Full: everything plus appendix

## Conditional gates

None apply: the reader is stated (reviewers), all three references are explained in the source, there is no raster media, and no image would add meaning.

## Answers taken

Form A, Theme Graphite, Language English, Depth Standard.
