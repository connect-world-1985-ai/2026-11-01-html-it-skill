# GREEN results: scenarios with the skill

Each run sends all sixteen scenarios to fresh subagents with the with-skill prompt from `../scenarios.md`. As in the baseline, every agent worked in an isolated workspace that held only `skills/html-it/` and `tests/html-it/fixtures/`; outputs were copied here afterwards. Two lines were added to every task for this environment (not part of the plan's prompt): "do not publish, upload or share the page anywhere" (because the s15 baseline agent published a hosted page) and "save your final message verbatim to `sN-reply.md`" (so R4 and the s8 channel message can be judged from the reply).

- `run1/`: skill as first written in Task 7.
- `run2/`: skill after the first REFACTOR in Task 9 (see "Excuses closed" below).
- `run3/` (all 16) and `run4/` (s1, s4, s7, s10, s13): skill after REFACTOR 2 (the missing-source-file counter).
- Top level of this folder: each scenario's latest passing run (run 4 for s1, s4, s7, s10, s13; run 3 for the others).

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
| "`review-notes.md` is described but not provided; that is noted in the page, not a gate" (s1, run 2) | REFACTOR 2: SKILL.md gate condition and a Common-mistakes row; `cross-references.md`: "A source file the content relies on but you do not have is always unresolved" |

## Run 2 (skill after the first REFACTOR)

Checker: all 27 pages PASS (16 scenario pages; s7 is a hub plus 11 parts), no failures and no warnings. R3 grep clean on every page. R6: every page has `prefers-color-scheme` and the `--bg`, `--fg`, `--accent` tokens. R8: `lang="de"` for s3, `lang="zh-CN"` for s8, `lang="en"` elsewhere, and the prose matches. The automatic plan-card check missed s2 and s3; both gates files were checked by hand and do contain a full plan card with form, theme, language and depth, each with a recommendation (s3 in German). s16 has no `s16-reply.md`; R4 for s16 is judged from its gates file, which is enough.

| Scenario | R1 | R2 | R3 | R4 | R5 | R6 | R7 | R8 | R9 | R10 | R11 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| s1 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | **FAIL** | PASS | PASS |
| s2 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| s3 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| s4 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| s5 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| s6 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| s7 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| s8 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| s9 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| s10 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| s11 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| s12 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| s13 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| s14 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| s15 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| s16 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |

### Run 2 failure, with the agent's own words

- **s1 R9 FAIL (regression).** Gates file: "`review-notes.md` is described but not provided; that is noted in the page, not a gate." The first REFACTOR's "resolved means the reader learns what it is" was over-applied to a missing source file. REFACTOR 2 (applied before run 3): SKILL.md gate condition and a Common-mistakes row; `cross-references.md` "A source file the content relies on but you do not have is always unresolved".

### Judgement notes for R4, R5, R7, R9, R10, R11 (run 2)

- **R4:**
  - s1, s2, s4–s13, s15, s16: the gates file opens with a plan card (reader, job, form with traits, outline, interactivity, references), then form, theme, language and depth, each with one option marked Recommended.
  - s3, s14 ("no questions"): the gates file still holds the card, and the reply states the four choices in its first lines (s3 in German: Form, Theme Ivory, Sprache Deutsch, Tiefe Standard; s14: Graphite, English, Standard).
- **R5:**
  - s1: "Request changes" verdict first, then findings by severity.
  - s2: six sketches, each in its own `iframe srcdoc`, an SVG flow, pick-two and compare.
  - s3: German explainer with an SVG branch diagram, step-by-step cycle, version anatomy, hotfix example, self-test.
  - s4: status at a glance, the at-risk milestone first, three SVG charts, bug table; no chart library.
  - s5: a checklist tool with an SVG progress bar and a copyable progress message for the buddy.
  - s6: one-sentence answer, snapshot-versus-log section, SVG flow, replay worked example, costs, self-check, glossary.
  - s7: hub plus 11 parts with relative links, an issue table, and "Why this is a folder, not one file".
  - s8: Chinese decision log: decisions D-14 and D-15 first, action table, the open question for Jonas, next sync, channel message.
  - s9: impact first, SVG cause chain, CET timeline, went well and badly, actions, chat log in a collapsed appendix.
  - s10: 8-slide deck (arrow keys, PageDown, `n / 8` counter, print styles), recommendation on slide 1, options compared, decision slide for Lena.
  - s11: SVG flow, pre-rendered `tok-` spans and no highlighter script, three gotchas next to the code, "Where to start reading".
  - s12: summary and reason first, file list with counts, `+`/`-` diff with `add`/`del` classes, risk, how to review.
  - s13: user-visible changes first, platform and internal changes (KT-974, KT-976) after them, the commit list in an appendix.
  - s14: status and next step first, repro, hypothesis, ruled out, who to ask, log in a collapsed appendix.
  - s15: action ideas with a ballot that builds a vote line to paste in the channel, a tally box, and "What this file cannot do".
  - s16: plain-JS prototype, no React or Tailwind, five screens plus both error paths, moderator controls below the prototype.
- **R7:** every lede states the outcome or purpose: s1 the merge block, s4 the at-risk milestone, s9 the impact, s10 the recommendation, s14 the status and next step, and the rest what the page is for and what the reader does with it.
- **R9:**
  - Holds and asked: s6 the image gate, s7 the size and multi-part gate (52 MB raw, about 70 MB as base64, editable originals), s13 the reader gate.
  - Holds but not asked: s1 (see above).
  - Every other scenario lists the four conditions as not holding and asks nothing extra. s4, s10, s13 and s16 no longer ask the run-1 gates.
- **R10:** s6 has one generated concept image ("snapshot versus log") with purpose, alt text and data URI, and the flow is SVG. No other page has `data-generated`.
- **R11:**
  - s5: "Your ticks stay in this browser … your buddy does not see your ticks".
  - s7: the screenshot slots are marked not provided.
  - s15: "This file cannot collect votes or show live totals".
  - s16: "No email is sent and no account is checked".
  - The others make no claim they cannot keep.

### Run plan after run 2 (decided by the user)

To save cost, the remaining runs use fewer scenarios rather than a cheaper model; a cheaper model would mix models with the earlier Opus runs and make model weaknesses look like skill gaps. s1, s4, s7, s10 and s13 depend on the reference-gate fixes, so they get two more runs (run 3 and run 4). The other 11 scenarios passed all of R1–R11 in run 2 (confirmed above), so run 2 plus one more passing run (run 3) gives them two consecutive passing runs.

## Run 3 (skill after REFACTOR 2, all 16 scenarios)

Run locally with the same method as runs 1 and 2: one fresh Opus 5.5 subagent per scenario at medium effort, each in an isolated workspace holding only copies of `skills/html-it/` and `tests/html-it/fixtures/`, with the Appendix E.2 prompt plus the two extra lines (publish nothing; save the final message to `sN-reply.md`). Outputs are in `run3/`.

Checker: all 26 pages PASS (16 scenario pages; s7 is a hub plus 10 parts), no failures. Warnings: s1 `review-notes.md` is marked unresolved (expected); s7 the screenshot files are marked unresolved on the hub and every part (expected); s4 has one `KT-902` as plain text inside a status pill, while the same ID is a chip with a References entry in the lede (R2 holds, since the checker reports no reference failure). R3 grep clean on every page. R6: every page has `prefers-color-scheme` and the `--bg`, `--fg`, `--accent` tokens. R8: `lang="de"` for s3, `lang="zh-CN"` for s8, `lang="en"` elsewhere, and the prose matches. No page loads a script from anywhere.

| Scenario | R1 | R2 | R3 | R4 | R5 | R6 | R7 | R8 | R9 | R10 | R11 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| s1 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| s2 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| s3 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| s4 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| s5 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| s6 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| s7 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| s8 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| s9 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| s10 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| s11 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| s12 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| s13 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| s14 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| s15 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| s16 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |

### Judgement notes for R4, R5, R7, R9, R10, R11 (run 3)

- **R4:**
  - Every gates file opens with a plan card (reader, job, form with traits, outline, interactivity, references), then form, theme, language and depth, each with one option marked Recommended.
  - s3 and s14 ("no questions") keep the card in the gates file and state the choices at the top of the reply. s3: "Choices made without asking, as you requested: **Form** knowledge explainer, **Theme** Ivory, **Language** Deutsch, **Depth** Standard."
- **R5:**
  - s1: verdict first, then findings by severity.
  - s2: six sketches, each in its own `iframe srcdoc`, Console theme.
  - s3: German explainer with an SVG branch diagram.
  - s4: status at a glance, three SVG charts drawn to scale, no Chart.js.
  - s5: a checklist tool with a section "What this page cannot do".
  - s6: explainer with two SVG diagrams, a replay slider, a self-check and one concept image.
  - s7: hub plus 10 parts with relative links and an assets README.
  - s8: Chinese meeting record with decisions D-14 and D-15 first, an action table and a channel message.
  - s9: postmortem with the impact first, two SVG figures, a CET timeline and the chat log in a collapsed appendix.
  - s10: 8-slide deck with a counter, arrow and PageDown keys and print styles.
  - s11: SVG flow, Java colouring written into the HTML, no highlighter script.
  - s12: PR write-up in Graphite with the diff right after a one-paragraph conclusion.
  - s13: release notes grouped by impact, commit list in an appendix.
  - s14: status and next step first, the log as given (4 of 30 lines) in a collapsed appendix, with the missing lines stated rather than invented.
  - s15: ballot that builds a vote line to paste in the channel, plus a tally box.
  - s16: plain-JS clickable prototype with five screens and the error paths; no React or Tailwind.
- **R7:** every lede states the outcome or purpose first: s1 the verdict, s4 the at-risk milestone, s8 the two decisions, s9 the impact (29 minutes, about 1,140 failed bookings), s10 the recommendation, s12 what the PR does and the one behaviour change, s14 "not fixed yet" and the next step, and the rest what the page is for.
- **R9:**
  - Holds and asked: s1 the unresolved-references gate for `review-notes.md` (Question 5, recommended "Leave it marked unresolved"), so REFACTOR 2 works; s6 the image gate (Question 5); s7 the size gate (52 MB raw, about 70 MB as base64, editable originals; multi-part recommended) and the unresolved gate for the screenshot files, whose condition also holds; s13 the reader gate.
  - Every other scenario lists the four conditions as not holding and asks nothing extra.
- **R10:** s6 has one generated concept image with purpose, alt text and data URI (`data-generated="true"`), and its request in `s6-images.md`; the diagrams stay SVG. No other page has `data-generated`.
- **R11:**
  - s5: "What this page cannot do" (progress stays in this browser).
  - s7: the screenshot slots are marked not provided.
  - s15: "Why the totals are not live. This page is a file. Everyone who opens it has a separate copy …"
  - s16: the email step is labelled "Prototype only, stands in for the email".
  - The others make no claim they cannot keep. The weekday conflicts in s10, s15 and s16 are kept as written and marked "to be confirmed".

No failures in run 3, so no new counter was needed.

## Run 4 (s1, s4, s7, s10, s13; same skill as run 3)

Same method as run 3. Outputs are in `run4/`. Checker: all 15 pages PASS (s7 is a hub plus 10 parts), no failures. Warnings: s1 `review-notes.md` unresolved and s7 the screenshot files unresolved, both expected. The run-3 `KT-902` plain-text warning in s4 does not recur. R3 grep clean, R6 tokens and `prefers-color-scheme` present, `lang="en"` on every page. The s7 agent hit a rate limit after writing its gates file and was resumed with the same transcript to finish; its `assets/` folder is empty (run 3 put a README there).

| Scenario | R1 | R2 | R3 | R4 | R5 | R6 | R7 | R8 | R9 | R10 | R11 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| s1 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| s4 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| s7 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| s10 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| s13 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |

### Judgement notes for R4, R5, R7, R9, R10, R11 (run 4)

- **R4:** all five gates files open with the plan card and the four Gate 1 questions, each with a recommendation.
- **R5:**
  - s1: code review report in Graphite, verdict first, findings by severity with filter chips.
  - s4: status report in Console with three SVG charts drawn to scale (M3 progress against the 75 % target, build time p50/p95, flaky tests); Chart.js declined, and the reply says why.
  - s7: hub plus one page per screen, issue table and search on the hub; screens 11 to 40 are "to be filled in" rows, nothing invented.
  - s10: 7-slide deck with speaker notes, an SVG diagram and a print and no-JS fallback.
  - s13: release notes grouped by impact (fixed, improved, under the hood), the commit list as written in a collapsed appendix.
- **R7:** s1 opens with the verdict, s4 with the status at a glance, s7 with what the audit found, s10 with the recommendation ("we recommend a message queue"), s13 with what changed in 8.4.0.1.
- **R9:** s1 asks the unresolved-references gate for `review-notes.md` (Question 5, recommended "Leave it marked unresolved"); s7 asks the size and editable-assets gate (about 70 MB embedded, designers keep editing the PNGs; multi-part recommended) and the unresolved gate for the screenshot files; s13 asks the reader gate (Question 1, recommended the p4m team: developers, QA and support). s4 and s10 list the four conditions as not holding and ask nothing extra.
- **R10:** no page has `data-generated`; every figure is SVG.
- **R11:** s7 says the screenshots are not provided and the issue kinds are the agent's grouping; s10 marks the date (Friday 2026-11-07 is a Saturday), the time zone of the 02:00 peak and the sprint length "to be confirmed"; s13 marks the release date "to be confirmed".

## Final result: two consecutive passing runs per scenario

| Scenario | Consecutive passing runs | R1–R11 |
|---|---|---|
| s1 | run 3, run 4 | all PASS in both |
| s2 | run 2, run 3 | all PASS in both |
| s3 | run 2, run 3 | all PASS in both |
| s4 | run 3, run 4 | all PASS in both |
| s5 | run 2, run 3 | all PASS in both |
| s6 | run 2, run 3 | all PASS in both |
| s7 | run 3, run 4 | all PASS in both |
| s8 | run 2, run 3 | all PASS in both |
| s9 | run 2, run 3 | all PASS in both |
| s10 | run 3, run 4 | all PASS in both |
| s11 | run 2, run 3 | all PASS in both |
| s12 | run 2, run 3 | all PASS in both |
| s13 | run 3, run 4 | all PASS in both |
| s14 | run 2, run 3 | all PASS in both |
| s15 | run 2, run 3 | all PASS in both |
| s16 | run 2, run 3 | all PASS in both |

**Reduced-run decision (made by the user after run 2).** The remaining runs used fewer scenarios rather than a cheaper model, because mixing models with the earlier Opus runs would make model weaknesses look like skill gaps. s1, s4, s7, s10 and s13 depend on the reference-gate fixes, so they got two runs (3 and 4) with the final skill. The other 11 passed all of R1–R11 in run 2, and REFACTOR 2 only touched the missing-source-file rule, which none of them hits; run 2 plus run 3 are their two consecutive passes.
