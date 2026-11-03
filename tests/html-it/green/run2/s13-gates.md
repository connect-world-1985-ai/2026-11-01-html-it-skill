# s13 gates: questions that would have been asked

These questions could not be asked (unattended run). The recommended option was taken for each; the language is English for this scenario.

## Gate 1: plan card

```
Plan: p4m 8.4.0.1 release notes
Reader: not stated (see conditional gate below; assumed: the internal p4m team plus colleagues who support users)
Job: understand what changes, and operate (deploy and answer user questions)
Form: composed (traits: code changes, status, many IDs) — release notes: user-visible changes first, then platform and internal changes, then the raw commit list collapsed
Outline: 1. What changes (summary)  2. Changes users notice  3. Platform and internal changes  4. Before you deploy  5. References  6. Glossary  7. Appendix: commit list (collapsed)
Interactivity: none, reading only (ref-chip and glossary popovers, theme toggle, copy button on the commit list)
References: 6 found (KT-971 to KT-976), 6 resolved from the commit messages, 0 unresolved
```

1. **Form**
   A. Composed release notes: user-visible changes first, technical changes second, commit list collapsed in an appendix (Recommended: the reader is unclear, so the page must work for people who do not read code, and the conclusion comes first even under the pressure "just list the commits")
   B. Plain changelog: the six commits as a table with ref chips and one line each
   C. Two-tab page: "For users" and "For engineers"

2. **Theme**
   A. Ivory (Recommended: a reading page for a mixed audience)
   B. Graphite (code-oriented; fits if only engineers read it)
   C. Console (status boards; does not fit release notes)

3. **Language**
   A. English (Recommended; and fixed to English for this scenario)
   B. Deutsch
   C. 中文

4. **Depth**
   A. Brief (one-screen summary, details collapsed)
   B. Standard (Recommended: six changes fit on one page with a short paragraph each)
   C. Full (everything plus appendix)

## Conditional gate: reader unclear

The source says: "Nothing else is known about who will read this."

5. **Who will read it?**
   A. The internal p4m team and colleagues who support users: engineers, QA, product, support (Recommended: the content is commit messages with internal ticket keys, which suits an internal page; leading with user-visible effects keeps it useful to non-engineers)
   B. Management only (short outcome and risk summary)
   C. External customers (would need product wording, no ticket keys, and confirmation of what may be promised publicly)
   D. New joiners (more background on the system)

## Conditional gates not asked

- Unresolved references: none. Each of KT-971 to KT-976 is described by its own commit message, so all six are resolved (titles beyond the commit message, owners and tracker links are "not given").
- Size: no raster media; the page is a few tens of kilobytes.
- Image tool: none needed; no image adds meaning to release notes.
