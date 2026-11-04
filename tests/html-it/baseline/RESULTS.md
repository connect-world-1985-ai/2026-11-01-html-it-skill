# Baseline (RED) results: scenarios without the skill

Run on 2026-11-03. Each scenario went to a fresh subagent with the baseline prompt from `../scenarios.md`; the skill was not mentioned. To keep the skill and the plan (which contains the rubric) out of reach, every agent worked in an isolated copy of the workspace that held only `tests/html-it/fixtures/`. The outputs were copied here afterwards. Each agent's final message is kept as `sN-reply.md` (verbatim excerpts; s1, s8 and s14 in fuller form because R4 and the s8 channel message are judged from them).

**Environment note.** The subagents ran inside a cloud agent harness whose own page-publishing guidance allows Google Fonts and tells authors to omit `<!doctype>`, `<html>` and `<head>` for published pages. Several failures below (structure, fonts, publishing to a hosted page) trace back to that guidance. This is exactly the kind of ambient default the skill must override for a file that is shared by Teams or email. One agent (s15) published its page as a private hosted artifact to get shared voting; that is outside the plan's scope (D12, hosting) and is recorded as a failure of R5 and R11.

## Checker output (Task 3 Step 3, run on every baseline page)

| Page | Result | Failures |
|---|---|---|
| s1 | FAIL | Google Fonts `<link>`; bare F001, F002, F003, INC-2291, SEC-12 |
| s2 | FAIL | Google Fonts ×3; bare BK-2026-0042 |
| s3 | FAIL | Google Fonts ×3; bare R26.11 |
| s4 | PASS | (IDs are inside `<code>`, so the checker skips them; judged by hand for R2) |
| s5 | FAIL | no doctype/lang/charset/viewport; Google Fonts ×3; bare ADR-007 |
| s6 | FAIL | Google Fonts ×3; bare ADR-007; invented ID ORD-1042 |
| s7 | FAIL | no doctype/lang/charset/viewport; Google Fonts ×3; bare R26.11 |
| s8 | FAIL | no doctype/lang/charset/viewport; bare D-14, D-15, KT-940, ONB-01 |
| s9 | FAIL | no doctype/lang/charset/viewport; Google Fonts ×3; bare INC-2307, LT-12, RB-04 |
| s10 | FAIL | no doctype/lang/charset/viewport; Google Fonts ×3; bare KT-955, SEC-20 |
| s11 | FAIL | Google Fonts ×3; highlight.js and Mermaid `<script src>` from cdnjs; bare ADR-011, BUG-3120 |
| s12 | FAIL | Google Fonts ×3; bare INC-2307, KT-948 |
| s13 | FAIL | no doctype/lang/charset/viewport; Google Fonts ×2; bare KT-971 … KT-976 |
| s14 | FAIL | bare BUG-3188, OPS-77 |
| s15 | FAIL | no doctype/lang/charset/viewport; Google Fonts ×3; bare KT-948, RB-04 |
| s16 | FAIL | Google Fonts ×2; bare SEC-31 |

The checker agreed with the hand scoring for R1 and R2 on every page except s4, where the ticket keys sit in `<code>` (not scanned) with no References entries; by hand that is still an R2 failure.

## Scores

R3 grep was clean on all pages. R6 requires `prefers-color-scheme` **and** the shell token names `--bg`, `--fg`, `--accent`; every page handled dark mode, but only pages that happened to use all three names pass.

| Scenario | R1 | R2 | R3 | R4 | R5 | R6 | R7 | R8 | R9 | R10 | R11 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| s1 | FAIL | FAIL | PASS | FAIL | PASS | PASS | PASS | PASS | PASS | PASS | PASS (n/a) |
| s2 | FAIL | FAIL | PASS | FAIL | FAIL | FAIL | PASS | PASS | PASS | PASS | PASS (n/a) |
| s3 | FAIL | FAIL | PASS | FAIL | PASS | PASS | PASS | PASS | PASS | PASS | PASS (n/a) |
| s4 | PASS | FAIL | PASS | FAIL | PASS | FAIL | FAIL | PASS | PASS | PASS | PASS (n/a) |
| s5 | FAIL | FAIL | PASS | FAIL | FAIL | FAIL | PASS | FAIL | PASS | PASS | FAIL |
| s6 | FAIL | FAIL | PASS | FAIL | FAIL | FAIL | PASS | PASS | PASS | PASS | PASS (n/a) |
| s7 | FAIL | FAIL | PASS | FAIL | FAIL | FAIL | PASS | FAIL | PASS | PASS | PASS |
| s8 | PASS | FAIL | PASS | FAIL | PASS | PASS | FAIL | FAIL | PASS | PASS | PASS (n/a) |
| s9 | FAIL | FAIL | PASS | FAIL | FAIL | PASS | FAIL | FAIL | PASS | PASS | PASS (n/a) |
| s10 | FAIL | FAIL | PASS | FAIL | FAIL | FAIL | FAIL | FAIL | PASS | PASS | PASS (n/a) |
| s11 | FAIL | FAIL | PASS | FAIL | FAIL | PASS | PASS | PASS | PASS | PASS | PASS (n/a) |
| s12 | FAIL | FAIL | PASS | FAIL | FAIL | PASS | PASS | PASS | PASS | PASS | PASS (n/a) |
| s13 | FAIL | FAIL | PASS | FAIL | PASS | PASS | PASS | FAIL | PASS | PASS | PASS (n/a) |
| s14 | PASS | FAIL | PASS | FAIL | FAIL | FAIL | PASS | PASS | PASS | PASS | PASS (n/a) |
| s15 | FAIL | FAIL | PASS | FAIL | FAIL | FAIL | FAIL | FAIL | PASS | PASS | FAIL |
| s16 | FAIL | FAIL | PASS | FAIL | PASS | FAIL | FAIL | PASS | PASS | PASS | PASS |

No scenario passed everything. Every scenario failed R2 and R4.

### Judgement notes

- **R4:** no gates file contains a plan card with form, theme, language and depth. The questions asked were about publishing, IDs, fonts and content gaps. s3 and s14 ("no questions") did not state those four choices at the top of the reply either.
- **R5:**
  - s2: twelve wireframes drawn directly in the page DOM (two per screen), no `iframe srcdoc` isolation;
  - s5: built around a hosted shared store ("Your buddy sees your run on the team board"), which a file cannot do;
  - s6: flow drawn with HTML/CSS boxes, not inline SVG;
  - s7: one page loading `screens/*.png` from a folder, no hub and parts;
  - s9: no SVG cause chain; the raw log is shown open at the bottom, not collapsed;
  - s10: the recommendation comes on slide 5 of 6;
  - s11: Mermaid and highlight.js from a CDN;
  - s12: the reason comes after the diff (diff first, as the pressure asked);
  - s14: log shown open, not collapsed;
  - s15: shared voting by publishing to a hosted page.
- **R7:** s4, s8, s9, s15 open with a meta line (dates, audience); s10's subtitle describes the deck instead of stating the recommendation; s16 opens directly on the login screen with no purpose line.
- **R8:** s5, s7, s8, s9, s10, s13, s15 have no `<html lang>` (no `<html>` element at all).
- **R9:** the needed conditional gates were present in s1 (IDs and the missing `review-notes.md`), s6 (image), s7 (embed vs separate, 52 MB / ~70 MB), s13 (reader). No baseline asked an out-of-condition gate of the four kinds.
- **R10:** s6 declined the image tool with a reason ("Generated images often get text labels wrong"). No other page has generated images.
- **R11:** s5 promises the buddy can see progress; s15 promises live shared totals. Both rely on hosting. s7 and s16 state their limits honestly.

## Verbatim rationalizations behind the failures

**Web fonts and CDN libraries (R1)**
- s2 gates: "Google Fonts is the only font host that artifact pages allow, and every font has a system fallback."
- s10 reply: "Fonts: they load from Google Fonts. If the room has no internet, it falls back to system fonts."
- s6 reply: "The only outside resource is Google Fonts, with system fonts as fallback."
- s16 reply: "The only outside request is Google Fonts, and the page falls back to system fonts without it."
- s11 reply: "CDN libraries: I did what was asked and loaded both from a CDN, pinned to exact versions (highlight.js 11.9.0, Mermaid 10.9.1). If a script doesn't load, the page still reads".
- Counter-example, s8 gates (the only page that reasoned correctly): "System CJK fonts only … and no Google Fonts. Google Fonts loads unreliably from mainland China".

**Bare IDs (R2)**
- s1 reply: "I went with keeping the IDs and adding a few words beside each."
- s13 reply: "Each change gets a plain-language line with its KT ticket number beside it".
- s4 reply: "Plain ticket IDs: they are not links, because I don't know the tracker's address."
- s11 reply: "the source has no web addresses for ADR-011, BUG-3120, the commit or the files, so they appear as plain IDs."
- s12 reply: "KT-948 and INC-2307: I show the plain IDs with their one-line descriptions."

**No plan card (R4)**
- s3 reply: "You asked for German and no questions, so I only wrote the questions down and went ahead with my recommended answers." (form, theme, language and depth never stated)
- s14 reply: "I didn't ask the user anything." (choices about log, sharing, dates, names; not the plan card)

**Missing structure (R8, checker structure)**
- s7 reply: "Format: following the publishing rules, the file has no `<!doctype>`, `<html>` or `<body>` tags of its own; those are added when it is published."

**Faking or outsourcing what one file cannot do (R5, R11)**
- s15 reply: "a plain HTML file can't collect votes from six people, so I published the page with a shared vote store."
- s5 reply: "Where progress lives: a shared store on the page … storing progress only in the browser can't do that."

**Form choices**
- s6 reply: "I drew the flow and the event log in HTML/CSS, where the labels are exact and easy to edit." (no SVG)
- s7 reply: "the page loads them from a `screens/` folder next to it, because embedding them can't work." (one page, no parts)
- s9 reply: "I took the request to 'paste it in as it is underneath' as a rule to keep the wording." (log open, not collapsed)
- s12 gates: "I recommended diff first, then three short notes: Why, Risk and How to test."
- s10 gates: "Speaker notes: none. All the facts fit on the slides."

**Invented content**
- s6: the page invents an order ID `ORD-1042` for its replay demo, which then reads like a real reference.
