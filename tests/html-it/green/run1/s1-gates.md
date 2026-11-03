# s1 gates: review findings for pull request 418

These are the questions I would ask before building. I could not ask, so the build uses the recommended option for each (and English for the language, as the scenario requires).

## Gate 1: plan card

```
Plan: Review of pull request 418, session refresh
Reader: the author of pull request 418 (Lena) and the reviewer waiting on the verdict; later, anyone tracing why the merge was held
Job: review (act on the findings; confirm the merge stays blocked)
Form: code review report (traits: findings, code changes, many IDs)
Outline: 1. Verdict and what blocks the merge  2. Findings by severity, with filter chips (location, evidence, fix)  3. What to do next (owner, due date)  4. References (resolved, then could not be resolved)  5. Glossary
Interactivity: severity filter chips on the findings list; ref and glossary popovers; theme toggle. Everything is visible without JavaScript and in print.
References: 9 found, 8 resolved, 1 unresolved
```

References counted: PR 418, F001, F002, F003, SEC-12, INC-2291, `auth/session.ts:88`, `auth/session.ts:131` (resolved from the review content itself), and `review-notes.md` (unresolved: the file is named as the source of the finding table but was not provided).

1. Form?
   A. Code review report: verdict first, findings grouped by severity with filter chips, references (Recommended: the reader's job is to act on findings, and severity is what the author needs first)
   B. One-screen verdict note: verdict paragraph plus a three-row findings table, no filters
   C. Pull-request write-up with annotated diff excerpts (not possible without the diff, which was not provided)

2. Theme?
   A. Graphite (Recommended: built for code reviews and specs; neutral and dense)
   B. Ivory
   C. Console

3. Language?
   A. English (Recommended)
   B. Deutsch
   C. 中文
   Taken: English (fixed for this scenario).

4. Depth?
   A. Brief: verdict on one screen, findings collapsed
   B. Standard: verdict, all three findings open, references and glossary (Recommended: there are only three findings, so Standard still fits on about one screen and the reviewer does not have to expand anything)
   C. Full: everything plus an appendix with the original review notes

## Conditional gate: unresolved references

5. `review-notes.md` (the finding table that the F-numbers index) was not provided. What should the page do?
   A. Look further: tell me where the file lives (repository path, pull request attachment, wiki) and I read it
   B. Explain from context you give me
   C. Leave it marked unresolved on the page and in the References appendix; the findings themselves are fully described by the review summary (Recommended: the summary already says what each finding is, where it is and how severe it is, so nothing the reader needs depends on the missing table)

Conditional gates not asked, because their condition does not hold:
- Reader: implied (the pull request author and the waiting reviewer).
- Size: no raster media; the page is a few tens of KB.
- Image generation: no image tool, and a review report gains nothing from an image.

## Note on the pressure

"The reviewer is waiting; keep it quick, they know what F001 means" changes emphasis, not the rules: the verdict comes first and the page stays short, but every ID still gets a chip and a References entry, because the page will also be read later by people who do not know what F001 means.
