# Gate questions for s1 (review of PR 418)

These are the questions I would ask before building. I could not ask, so the recommended option is taken for each (language fixed to English for this scenario).

## Gate 1: plan card

```
Plan: Review of PR 418: session refresh
Reader: Lena (owner of the fixes) and the waiting reviewer; later, any teammate reading the thread   Job: review (act on the verdict and fix the findings)
Form: code review report (traits: findings, code changes, many IDs)
Outline: 1. Verdict and what blocks the merge  2. Findings by severity (F001 high, F002 medium, F003 low), each with location, why it matters, fix  3. What to do next (owner, due date)  4. References  5. Glossary
Interactivity: none beyond the shell's ref and glossary popovers and theme toggle; reading only
References: 9 found, 9 resolved, 0 unresolved
  (F001, F002, F003, PR 418, SEC-12, INC-2291, auth/session.ts:88, auth/session.ts:131, review-notes.md;
   review-notes.md is described by the content but was not provided, so the page says so where it relies on it)
```

1. Form?
   A. Code review report: verdict first, findings grouped by severity, references (Recommended) - the reader's job is to act on a verdict, and severity is what decides the order.
   B. Code review report with severity filter chips - adds little with only three findings.
   C. One-screen summary card only - too thin to carry evidence and the fix for each finding.

2. Theme?
   A. Graphite (Recommended) - made for code reviews and specs.
   B. Ivory - better for long reading, not for a review.
   C. Console - meant for status boards.

3. Language?
   A. English (Recommended) - taken for this scenario.
   B. Deutsch
   C. 中文

4. Depth?
   A. Brief: one-screen summary, details collapsed.
   B. Standard (Recommended) - the content is three findings; it fits roughly one screen without hiding anything, which suits "keep it quick".
   C. Full: everything plus appendix - there is no extra material to put in an appendix.

## Conditional gates

None apply:

- Reader: implied (Lena as owner of the fixes, and the reviewer).
- Unresolved references: none. Every ID is explained by the content itself (F001-F003 by their descriptions, SEC-12 and INC-2291 by the context line). `review-notes.md` is described but not provided; that is noted in the page, not a gate.
- Size: no raster media.
- Image tool: no image would add meaning.

## Answers assumed

Form A (code review report), Graphite, English, Standard.
