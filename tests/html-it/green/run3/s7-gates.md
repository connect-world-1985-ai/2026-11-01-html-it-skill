# s7 gates: patient portal UI audit, release R26.11

Unattended run: these are the questions that would be asked. The recommended option is taken for each.

## Gate 1: plan card

```
Plan: Patient portal UI audit, R26.11
Reader: developers and designers of the patient portal   Job: review and fix, one screen at a time
Form: audit hub plus one page per screen (traits: findings, many visual items, many IDs/file names)
Outline: 1. Outcome and what to do  2. Issues by screen (filterable table)  3. Screens 11-40 still to be described
         4. How the folder works (where the PNGs go)  5. References  6. Glossary
         Each screen page: issue, screenshot slot, what to check, previous/next/hub links
Interactivity: text filter over the screen table on the hub; previous/next links between screen pages
References: 2 found (R26.11, the 40 screenshot PNG files), 1 resolved (R26.11), 1 unresolved (screenshot files not provided)
```

### Question 1: Form
A. Hub `index.html` plus one page per screen in `parts/`, screenshots as relative files in `assets/` (Recommended: developers want one screen at a time and designers keep editing the PNGs)
B. One long page with all ten described screens and a gallery
C. One page with a findings table only, no screenshot slots

### Question 2: Theme
A. Ivory (reading)
B. Graphite (Recommended: an audit/review read by developers)
C. Console (status boards)

### Question 3: Language
A. English (Recommended: team default)
B. Deutsch
C. 中文

### Question 4: Depth
A. Brief
B. Standard (Recommended: ten short issues, each fits on one page)
C. Full

## Conditional gate: size and editable assets

The 40 PNGs are about 52 MB raw; embedded as base64 that is about 70 MB (52 MB x 1.33), far above the ~20 MB typical attachment limit. The designers also keep editing the originals, so embedded copies would go stale. The request was "just put everything in one HTML".

A. Multi-part folder: hub plus `parts/`, PNGs referenced by relative path from `assets/`, zipped for sharing (Recommended: stays under limits, originals stay editable, matches one-screen-at-a-time)
B. Single file with screenshots compressed to WebP/JPEG at max ~1600 px (estimated 8-15 MB, but copies go stale when designers edit)
C. Single file with the PNGs embedded at full size (about 70 MB; too large for email and Teams attachments)

## Conditional gate: unresolved references

The screenshot files (`01-login.png` ... `40-*.png`) are listed but not provided in the repository.

A. Leave them marked "not provided" with a slot that shows where each PNG goes in `assets/` (Recommended: nothing to look further in; the page works once designers drop the files in)
B. Look further: tell me a folder or Figma export location
C. Explain from context you give me

Reader gate: not asked (developers and designers are implied by the content).
Image-generation gate: not asked (no image tool; generated images would not replace real screenshots).

## Answers assumed

Form A (multi-part), theme Graphite, language English, depth Standard, size gate A, unresolved gate A.
