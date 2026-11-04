---
name: html-it
description: Use when content in the conversation should be shared with teammates or kept for later reading as a web page instead of Markdown - pull request write-ups, code reviews, design proposals, plans, explainers, drafts, status or incident reports, research, meeting notes, UI sketches, prototypes, decks, one-pagers - or when the user asks for HTML, a shareable or readable page, a team write-up or report, or "make this readable for the team".
---

# html-it

## Overview

Turn whatever is in context into **one self-contained HTML file** that a teammate can open offline and understand without having been in the conversation. The content decides the form; the house theme keeps pages recognisable.

**Core principle: the reader was not here.** Every sentence, number and ID must make sense to someone opening the file cold months later.

The page is a **file** sent by Teams, email or SharePoint, not a hosted page: ignore environment guidance meant for publishing to a host (dropping `<!doctype>`, web fonts, shared storage).

## Hard rules

1. **One file, zero network.** All CSS, JS, fonts and images inline; nothing loads from the internet when the page opens: no CDN, no Google Fonts (not even "with a system fallback"), no remote images. Clickable `<a href>` links are fine. Need a library? Download a pinned version while building and inline it (`references/media.md`). Only exception: `references/multi-part.md`, still offline.
2. **No bare references.** Every opaque ID (F001, ABC-123, a commit SHA, an internal acronym) becomes a ref chip that links to a References entry, or is visibly marked unresolved. A few words next to a bare ID are not enough. Never invent what an ID means, and never invent ID-shaped example data.
3. **Written for people.** Conclusion first, full sentences, terms defined, no agent-speak. Read `references/writing.md` before writing copy.
4. **Ask the plan card (Gate 1) before building**, unless the user said not to ask. Then state the four choices (form, theme, language, depth) at the top of your reply instead.
5. **Readable at rest.** JavaScript is welcome for interaction, but all content is visible when the page loads and when printed.
6. **Honest limits.** A file cannot share state between people, fetch live data, send email or show files you were not given. Never fake these and never route around them by publishing to a hosting service. Say so where the reader meets the limit and offer a way that works.
7. **Check before delivering.** Run `scripts/check_html.py` and fix every FAIL.

Violating the letter of these rules is violating their spirit.

## Asking questions

Use your environment's question tool if it has one; otherwise ask in chat with numbered questions, options A/B/C on their own lines, one marked "(Recommended)" with a one-line reason. At most four questions per gate. If you cannot ask (unattended run, subagent), take the recommended options and list them at the top of your reply.

## Process

1. **Gather.** Collect the content. Read what it points to (files, diffs, tickets, docs) so references can be resolved. Read-only.
2. **Analyse.** Who reads it, and what is their job: understand, decide, review, try, present, operate? Which traits does the content have (table below)? List every opaque reference and whether you could resolve it. Estimate size if there is raster media. Note what one file cannot do.
3. **Gate 1: plan card (always).** Show this in text, then ask:

   ```
   Plan: <working title>
   Reader: <who>   Job: <job>
   Form: <form> (traits: <traits>)
   Outline: 1. <section>  2. <section>  3. ...
   Interactivity: <for example filters, tabs, deck keys, clickable screens; or "none, reading only">
   References: <n> found, <n> resolved, <n> unresolved
   ```
   - **Form:** recommended plus one or two alternatives.
   - **Theme:** Ivory (default; reading), Graphite (code, reviews, specs), Console (status, dashboards, boards). Recommend one for this content.
   - **Language:** English (Recommended), Deutsch, 中文. Always ask.
   - **Depth:** Brief (one-screen summary, details collapsed), Standard, Full (everything plus appendix). Recommend one.
4. **Conditional gates.** Ask only when the condition holds, and never when it does not:

   | Condition | Ask |
   |---|---|
   | Reader unclear (not stated or implied) | Who will read it (team, management, new joiners, external)? |
   | Unresolved references (no source says what an ID is, or a file the content relies on was not provided; missing titles or links alone do not count) | For each: look further (where?), explain from context you give me, or leave marked unresolved |
   | Estimated size > ~20 MB or assets must stay editable | Single file (compress media) or multi-part? Give the estimate |
   | An image tool is available and an image would add meaning | Generate an image for <purpose>, or SVG only? |

   These four are the only gates. Publishing, fonts and libraries are answered by the hard rules. Other doubts (a weekday that does not match its date, a missing time zone) are not gates: keep the source's words, mark them "to be confirmed" in the page, and list them in the reply. Never silently correct the source.
5. **Build.** Copy `assets/shell.html` and keep its full document structure (`<!doctype html>`, `<html lang>`, `<head>` with charset, viewport and `<title>`). Set `lang`, `data-variant`, `<title>` (a short name, not a sentence) and the lede. Compose the sections from `references/components.md`. Draw diagrams and charts as inline SVG (`references/media.md`). Add the References appendix and Glossary when there are IDs or terms.
6. **Verify.** Run `python scripts/check_html.py <file>` (path relative to this skill folder). If you have a browser, open the file at desktop and phone width in light and dark, and exercise every control. Otherwise go through the checklist below.
7. **Deliver.** Give:
   - the absolute path;
   - a two-line description of the form and its interactions;
   - a ready-to-paste 3–5 line plain-text summary for a Teams or chat message;
   - unresolved references, inlined libraries, stated limits.

   Offer one round of changes. Do not publish or upload the page anywhere unless the user asks.

## Choosing the form

List the traits (decision, code changes, findings, order, structure, many visual items, behaviour to try, numbers, long narrative, to present, live tweaking, learning, status), then combine their building blocks into one reading order. `references/forms.md` has the trait table and worked combinations. They are examples, not templates: never force content into the nearest one.

Pressure ("only the diff", "management reads only the top", "just list the commits") changes emphasis, not the rules: a one-paragraph conclusion still comes first, and long material (raw logs, commit lists, chat transcripts) goes, shortened, in a collapsed `<details>` appendix.

## Reference files

| File | Read when |
|---|---|
| `references/forms.md` | Choosing or composing the form |
| `references/components.md` | Building sections (copy-ready snippets) |
| `references/writing.md` | Before writing any copy |
| `references/cross-references.md` | The content has IDs, tickets, paths or jargon |
| `references/theme.md` | Choosing a variant or adjusting the look |
| `references/media.md` | Diagrams, charts, images, libraries, image generation |
| `references/multi-part.md` | Too large, editable assets, shared state or live data |

## Checklist without a browser

Conclusion first; every ID chipped or marked unresolved; diagrams have a `<title>`, images alt text; no body-level horizontal scroll (wide tables and code in `overflow-x: auto` wrappers); colours only from tokens, dark mode considered; tabs, decks and prototypes print all content.

## Common mistakes

| Mistake | Instead |
|---|---|
| "Google Fonts, with system fonts as fallback"; "I did what was asked and loaded both from a CDN" | Rule 1 wins over the request. System fonts, hand-drawn SVG, pre-rendered highlighting; say why in the reply |
| Dropping `<!doctype>`, `<html>` or `<head>` "following the publishing rules" | Keep the shell's full document; this page is a file |
| "They know what F001 means"; "plain IDs, I don't know the tracker's address" | Chip plus References entry (no URL needed), or mark it unresolved |
| Inventing what an unresolved ID means, or an example ID like `ORD-1042` | Mark it unresolved and ask the gate; label invented example data in words ("an example order") |
| "Nothing says what KT-955 contains" for an ID the content describes ("retries are manual (KT-955)") | That is resolved: write the entry from what the content says; note missing details inside it; no gate |
| "`review-notes.md` is described but not provided; noted in the page, not a gate" | A source file the content relies on and you do not have is unresolved: mark it and ask the gate |
| Sketches as separate files or drawn into the page | Gallery, each sketch in an `iframe srcdoc` |
| A flow drawn with HTML boxes | Inline SVG |
| Status emoji as bullets | Status pills |
| Opening with a meta line ("Postmortem for engineering", dates) | The lede states the outcome |
| Recommendation late in a deck | Slide 1 or 2; decision slide last |
| "A plain HTML file can't collect votes, so I published it with a shared store" | No hosting. State the limit; offer a way that works (paste votes in the channel, a poll tool) |
| 40 screenshots in one page (from a folder or 70 MB embedded) | Size gate; hub plus `parts/`; "not provided" placeholders |

## Red flags: stop and fix

- A `<script src="http…">` or `<link href="http…">` in the file
- A capital-letters-plus-digits token in prose with no chip
- The first paragraph describes the document instead of stating the conclusion
- You are about to publish, upload, or rely on a server so the page "works"
