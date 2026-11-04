# s1 gates (questions I would have asked; recommended answers assumed)

## Gate 1: plan card

```
Plan: Review of pull request 418 (session refresh)
Reader: Lena (PR author) and the reviewer team   Job: review / act on findings
Form: Code review report (traits: findings, code changes, many IDs)
Outline: 1. Verdict and what blocks  2. Findings by severity (filter chips)  3. Next steps  4. References  5. Glossary
Interactivity: severity filter chips on the findings list; ref and glossary popovers; theme toggle
References: 9 found (PR 418, F001, F002, F003, SEC-12, INC-2291, auth/session.ts:88, auth/session.ts:131, review-notes.md), 8 resolved, 1 unresolved (review-notes.md)
```

### Question 1: Form
A. Code review report: verdict first, findings grouped by severity with filter chips (Recommended: the content is review findings with a verdict; the author needs the blocker first)
B. Short one-screen note with a findings table
C. Walkthrough deck for a review meeting

### Question 2: Theme
A. Ivory
B. Graphite (Recommended: house variant for code reviews)
C. Console

### Question 3: Language
A. English (Recommended)
B. Deutsch
C. 中文

### Question 4: Depth
A. Brief
B. Standard (Recommended: three findings fit on one page with location, evidence and fix each)
C. Full

## Conditional gate: unresolved references

The findings come "from review-notes.md", and F001 to F003 "index the table in review-notes.md", but that file was not provided. The three findings themselves are described in the content and are resolved from that description; the source file is not.

### Question 5: review-notes.md (not provided)
A. Look further: tell me where review-notes.md lives (repository path or PR attachment)
B. Explain from context you give me (paste the finding table)
C. Leave it marked unresolved in the page and build from the summary given (Recommended: the three findings are described well enough to act on; the page says plainly that the full table was not available)

Not asked: reader (implied: the reviewer and the PR author), size (no media), image generation (not useful here).

## Assumed answers

Form A (code review report), Theme B (Graphite), Language A (English), Depth B (Standard), review-notes.md C (left marked unresolved).
