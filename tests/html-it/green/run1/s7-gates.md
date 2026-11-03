# s7 gates: patient portal UI audit, release R26.11

These are the questions I would have asked before building. I could not ask, so I took the recommended option for each (language: English, as set for this scenario).

## Gate 1: plan card

```
Plan: Patient portal UI audit, release R26.11
Reader: designers and developers of the patient portal   Job: review (find the issue for a screen, fix it, open one screen at a time)
Form: composed multi-part audit (traits: findings, many visual items, structure) - hub index.html plus one page per screen
Outline: 1. What the audit found and what to fix first  2. Screens and issues (searchable, filterable table)
         3. Screens 11-40 still to be written up  4. How the folder works (screenshots, editing, sharing)
         5. References  6. Glossary
         Per screen page: issue, where to look, suggested direction, screenshot (placeholder until the PNG is added), prev/next/back to hub
Interactivity: search over screen titles and issues, filter chips by issue category on the hub; prev/next links between screen pages;
               screenshot slot shows the PNG from assets/ automatically once a designer drops it in
References: 1 found (R26.11), 1 resolved from the content (release name only), 0 unresolved IDs;
            plus 40 screenshot files referenced but not provided (unresolved source)
```

1. Form?
   A. Multi-part: hub `index.html` + `parts/NN-screen.html` per screen + `assets/` for the original PNGs (Recommended: about 70 MB embedded is far past email limits, designers keep editing the PNGs, developers want one screen at a time)
   B. One file with a compressed gallery (WebP, max 1600 px), originals not editable
   C. One file, text only, no screenshot slots

2. Theme?
   A. Ivory (reading)
   B. Graphite (Recommended: an audit read by developers and designers is a review job)
   C. Console (boards, status)

3. Language?
   A. English (Recommended)
   B. Deutsch
   C. 中文

4. Depth?
   A. Brief
   B. Standard (Recommended: ten written-up issues fit comfortably; nothing to hide in an appendix)
   C. Full

## Conditional gate: size and editable assets

Estimate: 40 PNG screenshots, 1.0-1.6 MB each, about 52 MB raw; embedded as base64 about 70 MB. Typical Teams/email attachment limits are about 20-25 MB. The designers also keep editing the originals, so embedded copies would go stale.

5. Single file or multi-part?
   A. Multi-part folder: hub + one page per screen, PNGs referenced from `assets/` by relative path, shared as a zip (Recommended: stays offline, the originals stay editable, each developer opens one screen)
   B. Single file with compressed screenshots (WebP/JPEG, max ~1600 px; probably 8-15 MB), originals would go stale
   C. Single file as requested, about 70 MB (too large to attach to most mails and Teams messages)

The request "just put everything in one HTML, the team loves single files" does not override this: a 70 MB file cannot be attached in most places, and embedded copies would not pick up the designers' edits.

## Conditional gate: unresolved sources

The 40 screenshot files (`01-login.png` ... `10-help.png`, plus screens 11-40 whose file names are not given) are not in the repository.

6. What should the pages do about the missing screenshots?
   A. Look further: tell me where the Figma exports live and I copy them into `assets/`
   B. You will provide them later
   C. Build with a labelled "screenshot not provided" placeholder per screen; each page shows the PNG automatically once it is placed in `assets/` under its file name (Recommended: no invented images, works as soon as designers drop the files in)

7. Screens 11-40: the content says only "further screens, issues to be filled in".
   A. List them in the hub as one open block, without inventing file names or issues (Recommended)
   B. Create 30 empty part pages now (file names would have to be invented)
   C. Leave them out

No image-generation gate: no image tool is available, and screenshots of real software must not be generated anyway.

## Answers taken

1A multi-part, 2B Graphite, 3A English, 4B Standard, 5A multi-part folder, 6C placeholders that pick up the PNG from `assets/`, 7A one open block in the hub.
