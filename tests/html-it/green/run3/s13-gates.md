# s13 gates: questions that would have been asked

This run could not ask the user, so the recommended option of each question was taken.

## Gate 1: plan card

```
Plan: What is new in p4m 8.4.0.1
Reader: not stated (see question 5); assumed the p4m team and the people around it (developers, QA, support, product)
Job: understand what changed and whether it affects their work
Form: composed release notes (traits: code changes, findings-like change list, unfamiliar terms and IDs)
Outline: 1. Summary (lede)  2. What changes for users  3. Under the hood  4. What to check after the update  5. References  6. Glossary  7. Appendix: commit list (collapsed)
Interactivity: none, reading only (popovers on ticket chips and terms, collapsed commit list)
References: 6 found (KT-971 to KT-976), 6 resolved from the commit messages, 0 unresolved
```

Pressure noted: "Just list the commits; everyone knows the tickets." Per the skill, pressure changes emphasis, not the rules: a short conclusion still comes first, every ticket key gets a chip and a References entry, and the raw commit list goes in a collapsed appendix.

### Question 1: Form
A. Composed release notes: summary, changes grouped by who notices them, raw commit list collapsed at the end (Recommended: readers outside the team cannot use bare commit lines; grouping says who is affected)
B. Commit list only, each line with a ticket chip (follows the pressure, but gives no conclusion and no impact)
C. Pull-request style write-up with file tree and diffs (no diffs were provided)

### Question 2: Theme
A. Ivory (Recommended: read top to bottom by a mixed audience)
B. Graphite (good if only developers read it)
C. Console

### Question 3: Language
A. English (Recommended: team default)
B. Deutsch
C. 中文

### Question 4: Depth
A. Brief
B. Standard (Recommended: six changes fit on one page with short explanations)
C. Full

## Conditional gate: reader unclear

The content says "Nothing else is known about who will read this."

### Question 5: Who will read it?
A. The internal team and adjacent roles: developers, QA, support, product (Recommended: the request comes from the software team and the material is commit-level; the page separates user-visible changes so support and product can use it too)
B. Management
C. Practice staff / customers (external release notes; would need product wording and no internal ticket keys)
D. New joiners

## Not gates

- Unresolved references: none. Each ticket key is described by its commit message, so all six are resolved; titles, owners and links are "not given" inside the entries.
- Size: no raster media.
- Image tool: not needed.
- Other doubt (listed in the page and reply, not a gate): the source says "released 2026-11-04", which is one day after this page was prepared (2026-11-03). The date is kept as given and marked "to be confirmed".
