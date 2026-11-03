# GREEN results: scenarios with the skill

Each run sends all sixteen scenarios to fresh subagents with the with-skill prompt from `../scenarios.md`. As in the baseline, every agent worked in an isolated workspace that held only `skills/html-it/` and `tests/html-it/fixtures/`; outputs were copied here afterwards. Two lines were added to every task for this environment (not part of the plan's prompt): "do not publish, upload or share the page anywhere" (because the s15 baseline agent published a hosted page) and "save your final message verbatim to `sN-reply.md`" (so R4 and the s8 channel message can be judged from the reply).

- `run1/`: skill as first written in Task 7.
- `run2/` and `run3/`: skill after the REFACTOR in Task 9 (see "Excuses closed" below). The pages at the top level of this folder are the final run.

## Run 1 (skill from Task 7)

Checker: all 26 pages PASS (16 scenario pages; s7 is a hub plus 10 parts). Warnings only for references marked unresolved (s4 KT-881 and KT-915, s10 KT-955, s13 p4m). R3 grep clean, R6 tokens and `prefers-color-scheme` present on every page, `lang` correct everywhere (`de` for s3, `zh-CN` for s8).

| Scenario | R1 | R2 | R3 | R4 | R5 | R6 | R7 | R8 | R9 | R10 | R11 | Baseline failures |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| s1 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | R1 R2 R4 |
| s2 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | R1 R2 R4 R5 R6 |
| s3 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | R1 R2 R4 |
| s4 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | **FAIL** | PASS | PASS | R2 R4 R6 R7 |
| s5 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | R1 R2 R4 R5 R6 R8 R11 |
| s6 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | R1 R2 R4 R5 R6 |
| s7 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | R1 R2 R4 R5 R6 R8 |
| s8 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | R2 R4 R7 R8 |
| s9 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | R1 R2 R4 R5 R7 R8 |
| s10 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | **FAIL** | PASS | PASS | R1 R2 R4 R5 R6 R7 R8 |
| s11 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | R1 R2 R4 R5 |
| s12 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | R1 R2 R4 R5 |
| s13 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | **FAIL** | PASS | PASS | R1 R2 R4 R8 |
| s14 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | R2 R4 R5 R6 |
| s15 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | R1 R2 R4 R5 R6 R7 R8 R11 |
| s16 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | **FAIL** | PASS | PASS | R1 R2 R4 R6 R7 |

### Run 1 failures, with the agent's own words

- **s4 R9** (unresolved-references gate asked although every ID is explained by the fixture as an open P1 bug). Gates file: "KT-881, KT-915 (and the details of KT-902): what should the page do? … C. Show what the status says (open P1 bug) and mark the title as not provided (Recommended: nothing else is available, and inventing titles would mislead)". The page then marks KT-881 and KT-915 `data-ref-status="unresolved"`.
- **s10 R9** (same pattern). Gates file: "KT-955 appears as 'retries are manual (KT-955)', but nothing in the provided material says what the ticket contains. What should I do?"
- **s13 R9** (the reader gate was asked correctly, plus a second gate whose condition does not hold). Gates file: "Unresolved reference: 'p4m' (the product name; nothing provided says what p4m is)". The page's lede then opens with an unresolved chip on the product name.
- **s16 R9** (a gate type that does not exist). Gates file: "Gate 2: conflicting date (conditional) — The source says 'Thursday 2026-11-06', but 6 November 2026 is a Friday." Handling the conflict inside the page was right; asking it as a gate was not.

### Run 1 observation that is not a rubric failure

- **s15** found the same weekday conflict and silently resolved it the other way: "Deadline: Thursday 5 November 2026. The notes say 'Thursday 2026-11-06', but 6 November is a Friday, so I used the earlier date and the page says why." Changing a fact from the source is risky; the REFACTOR adds "keep the source's words, mark them to be confirmed".

### Judgement notes for R4, R5, R7, R9, R10, R11 (run 1)

- **R4:** every gates file opens with a plan card (reader, job, form with traits, outline, interactivity, references) and the four questions form, theme, language, depth with one option marked Recommended. s3 and s14 ("no questions") state the four choices at the top of the reply.
- **R5:**
  - s1: verdict and "merge blocked" first, findings grouped by severity with filter buttons.
  - s2: six sketches, each in its own `iframe srcdoc`, with stage filters and compare-two.
  - s3: German explainer with an SVG branch diagram, five-step cycle, version anatomy, self-test.
  - s4: status pills, attention note, metrics table, three SVG charts to scale.
  - s5: composed form, a checklist tool with an SVG progress bar and a copyable buddy update.
  - s6: one-sentence answer, SVG command-to-UI flow, replay worked example, costs, glossary.
  - s7: hub plus ten `parts/` pages with relative links and an `assets/` folder; each screenshot slot says "not provided".
  - s8: Chinese decision log, decisions first, action table, the open question for Jonas, next sync, channel message with a copy button.
  - s9: impact first, SVG cause chain, CET timeline, went well and badly, action table, chat log in a collapsed appendix, blameless wording.
  - s10: eight-slide deck with the recommendation on slide 1, options side by side, decision slide, notes on `N`, print fallback.
  - s11: SVG request flow, pre-rendered `tok-` highlighting, gotchas next to the code, the commit chip.
  - s12: one-paragraph summary and reason, then the annotated diff with `+`/`-` signs, file list with counts, the risk, copyable test steps.
  - s13: reader gate, then changes grouped from user-visible (SMS fix, retries, search, login labels) to internal (WildFly, mappers) last, the commit list collapsed.
  - s14: status and next step first, repro, ruled out, hypothesis, contacts, log collapsed with the missing 26 lines stated.
  - s15: retro content, a ballot that builds a copyable vote line, and a tally box for the facilitator; no fake shared voting.
  - s16: plain-JS prototype with five screens, both error paths, the live rule checklist and moderator controls kept to one side.
- **R7:** every lede states the outcome or purpose (verdict, impact, recommendation, what to do).
- **R9:** s1 asked the unresolved gate for `review-notes.md`; s6 asked the image gate with its purpose; s7 asked the size gate with ~52 MB raw / ~70 MB base64 and the editable-originals reason, plus a missing-files gate whose condition holds; s13 asked the reader gate. Others asked none, except the four failures above.
- **R10:** s6 generated one concept image (overwritten row versus append-only log), entry in `s6-images.md`, alt text, data URI; flow and diagram are SVG. No other page has `data-generated`.
- **R11:** s5 "saved only in this browser on this computer"; s7 "screenshot not provided"; s15 "This file cannot collect votes or show live totals"; s16 "No email is sent and no account is checked". Each offers a way that works.

## Excuses closed during REFACTOR (Task 9)

| Excuse | Counter added |
|---|---|
| "Nothing in the provided material says what the ticket contains" for an ID the content describes | `cross-references.md`: "Resolved means the reader learns what it is, not every detail is known"; SKILL.md gate condition "missing titles or links do not count" and a Common-mistakes row |
| Marking the product name ("p4m") as an unresolved reference | `cross-references.md`: names of the product, system or team the page is about are not opaque references |
| Inventing a "conflicting date" gate | SKILL.md: "These four are the only gates … other doubts are not gates: keep the source's words, mark them 'to be confirmed' in the page, and list them in the reply" |
| Silently correcting a date in the source (s15) | SKILL.md: "Never silently correct the source" |

## Run 2 (skill after the first REFACTOR) — partially scored

Checker: all pages PASS (s7 is a hub plus 11 parts), no warnings. R3 grep clean, R6 and `lang` correct on every page. Full R1–R11 judgement still to do; known so far:

- **s1 R9 FAIL (regression).** Gates file: "`review-notes.md` is described but not provided; that is noted in the page, not a gate." The first REFACTOR's "resolved means the reader learns what it is" was over-applied to a missing source file. Counter added afterwards (SKILL.md gate condition and Common-mistakes row; `cross-references.md` "A source file the content relies on but you do not have is always unresolved").
- s4, s10, s13, s16: the run-1 R9 failures are closed (no extra gates; s10 and s16 keep the source's date and mark it "to be confirmed").
- The automatic plan-card keyword check missed s2 and s3 (`Form/Theme/Language/Depth` wording); check those two gates files by hand.

## Run 3 — not completed

Run 3 (skill with the `review-notes.md` counter) was started and stopped before any results were collected, to save cloud credit. The workspace was not kept.
