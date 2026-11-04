# s7 gates: questions that would have been asked

These questions could not be asked (unattended run). The recommended option was taken for each.

## Gate 1: plan card

```
Plan: Patient portal UI audit, release R26.11
Reader: developers and designers of the patient portal team   Job: review and fix (operate on one screen at a time)
Form: composed (traits: findings, many visual items, many unfamiliar terms) - a hub page with a filterable issue table, one page per screen
Outline: 1. What the audit found  2. Issues by screen (filter + search)  3. Screens 11-40 still to be filled in  4. How screenshots are added  5. References  6. Glossary
Interactivity: search over screen names and issues, filter chips by kind of issue, previous/next between screen pages
References: 2 found (R26.11, the screenshot files), 1 resolved, 1 unresolved (the 40 PNG files are not provided)
```

### Question 1: Form
A. Hub plus one page per screen (multi-part folder): `index.html` with the issue table and search, `parts/NN-name.html` per screen (Recommended: developers want one screen at a time, and the size gate below points to multi-part anyway)
B. One page with a filterable issue table and a gallery of screenshot placeholders
C. Plain findings report, one long page in screen order

### Question 2: Theme
A. Ivory (reading)
B. Graphite (Recommended: this is a review-style findings list that developers work through)
C. Console (boards, dashboards)

### Question 3: Language
A. English (Recommended)
B. Deutsch
C. 中文

### Question 4: Depth
A. Brief (one-screen summary, details collapsed)
B. Standard (Recommended: ten listed issues plus one page per screen is the right amount)
C. Full (everything plus appendix)

## Conditional gate: size and editable assets

The 40 screenshots total about 52 MB as PNG; embedded as base64 that is about 70 MB (52 MB x 1.33), well over the ~20 MB attachment limit. The designers will also keep editing the original PNGs, so embedded copies would go stale.

### Question 5: Single file or multi-part?
A. Multi-part folder: hub `index.html`, `parts/` with one page per screen, `assets/` holding the original PNGs by relative path, zipped for sharing (Recommended: about 70 MB embedded is too large, and the originals must stay editable)
B. Single file with compressed screenshots (WebP/JPEG, max 1600 px), estimated 10-15 MB; copies go stale when designers edit the PNGs
C. Single file, screenshots embedded unchanged (about 70 MB)

Note on the pressure "just put everything in one HTML, the team loves single files": a single file would either exceed attachment limits or go stale, and the screenshots are not provided anyway. The recommendation stays multi-part; the hub `index.html` is still one file a reader can open on its own.

## Conditional gate: unresolved references

The audit relies on 40 screenshot files (`01-login.png` ... `10-help.png`, plus screens 11-40 with no file names) that are not in the repository.

### Question 6: The 40 screenshot files
A. Look further (where? for example the Figma export folder or a SharePoint link)
B. Explain from context you give me
C. Leave them marked unresolved: each screen page shows a labelled "image not provided" placeholder and picks up the PNG automatically once it is put into `assets/` under its listed name (Recommended: the files are explicitly not provided and designers keep editing them)

## Taken answers

Form A (hub plus one page per screen), Theme B (Graphite), Language A (English), Depth B (Standard), Size A (multi-part with `assets/`), Unresolved C (leave marked, placeholders).
