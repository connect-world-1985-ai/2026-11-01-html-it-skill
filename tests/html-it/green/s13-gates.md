# s13 gates (questions that would be asked; recommended options taken)

## Gate 1: plan card

```
Plan: p4m 8.4.0.1 release notes
Reader: the p4m team (developers, QA, support), assumed; see Question 1   Job: understand what changed and act on it
Form: composed (traits: code changes, many IDs, light status), release notes grouped by impact
Outline: 1. What changed (lede)  2. Fixed  3. Improved  4. Under the hood  5. What to check after the update  6. References  7. Glossary  8. Appendix: commit list (collapsed)
Interactivity: none, reading only (popovers on ticket chips and terms; collapsed commit list)
References: 6 found (KT-971 to KT-976), 6 resolved from the commit messages, 0 unresolved
```

### Question 1: Who will read it? (conditional gate: reader not stated)
A. The p4m team: developers, QA and support (Recommended: the request comes from a software team that shares pages internally, and the content is commit-level)
B. Practice staff or customers (user-facing release notes, no technical internals)
C. Management (one-screen summary)
D. Other

### Question 2: Form
A. Release notes grouped by impact (fixed, improved, under the hood), commit list collapsed in an appendix (Recommended: the reader learns what matters first; the commit list stays available, as asked)
B. Plain commit list only (as the pressure "just list the commits" asks; the lede and chips would still be added)
C. Table of tickets with category and impact columns

### Question 3: Theme
A. Ivory (Recommended: read top to bottom by a mixed team)
B. Graphite (if the readers are only developers)
C. Console

### Question 4: Language and depth
A. English, Standard depth (Recommended: team default; six changes fit one page)
B. Deutsch, Standard
C. 中文, Standard
D. English, Brief

## Unresolved-references gate
Not asked: all six ticket keys are described by their commit messages, so they count as resolved (titles, owners and tracker links are "not given").

## Not gates, noted in the reply
- The source says "released 2026-11-04"; today is 2026-11-03. Kept as written and marked "to be confirmed" in the page.

Answers taken: 1A, 2A, 3A, 4A.
