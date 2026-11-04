# s7 gates: patient portal UI audit (R26.11)

This run cannot ask the user, so the recommended option is taken for every question (language: English, as the scenario specifies).

## Gate 1: plan card

```
Plan: Patient portal UI audit, release R26.11
Reader: designers and developers of the patient portal team   Job: review and fix, one screen at a time
Form: composed (traits: findings, many visual items) - a hub page with a filterable, searchable table of all 40 screens, plus one page per screen with its screenshot slot and issue
Outline: 1. What the audit found (lede)  2. Issues by kind  3. All screens (filter + search table)  4. Screens 11-40 still to be filled in  5. How to add the screenshots  6. References  7. Glossary
Interactivity: filter chips by issue kind, search over screen names and issues, previous/next links between screen pages; screenshots appear automatically once the PNG is placed in assets/
References: 1 found (R26.11), 1 resolved, 0 unresolved
```

1. **Form?**
   A. Hub `index.html` plus one page per screen in `parts/`, screenshots referenced from `assets/` by relative path (Recommended: developers open one screen at a time, and designers keep editing the PNGs, so linked files never go stale)
   B. One long page with every screen in sequence
   C. Gallery board with all screenshots as thumbnails on one page

2. **Theme?**
   A. Ivory (reading)
   B. Graphite (Recommended: the audit is a findings list that developers review and work through)
   C. Console (boards, dashboards)

3. **Language?**
   A. English (Recommended; specified for this scenario)
   B. Deutsch
   C. 中文

4. **Depth?**
   A. Brief (one-screen summary, details collapsed)
   B. Standard (Recommended: every known issue in full, placeholders for screens 11-40, no appendix needed)
   C. Full (everything plus appendix)

## Conditional gate: size and editable assets

Condition holds twice: 40 PNGs of 1.0-1.6 MB, about 52 MB raw, become about 70 MB when embedded as base64 (52 MB x 1.33), far past the ~20 MB limit and the usual 20-25 MB email attachment limit. And the designers keep editing the original PNGs, so embedded copies would go stale.

The request says "just put everything in one HTML, the team loves single files". That request changes emphasis, not the size and staleness problem.

5. **Single file or multi-part?**
   A. Multi-part: `index.html` hub, `parts/` with one page per screen, `assets/` holding the original PNGs by relative path; zip the folder to share, unzip and open `index.html`, works offline (Recommended: stays small, designers can replace a PNG without rebuilding, developers open one screen at a time)
   B. Single file with compressed images (WebP or JPEG, max ~1600 px wide), estimated 10-20 MB; embedded copies go stale whenever designers re-export
   C. Single file with no images, only the issue list and "screenshot not provided" placeholders (small, but developers lose the visual)

Gates not asked: reader (stated: designers and developers), unresolved references (R26.11 is described by the content as the release the audit covers), image generation (no image tool, and screenshots of real software must never be generated).

## Assumed answers

Form A (hub plus parts), theme Graphite, language English, depth Standard, multi-part A.
