# html-it pressure scenarios

Sixteen scenarios (s1–s16) test the html-it skill. Each one pairs a fixture in `fixtures/` with a pressure line that pushes the agent toward a known failure. Task 1 runs them without the skill (RED, `baseline/`); Task 8 runs them with the skill (GREEN, `green/`).

## Coverage

| Scenario | Fixture | Daily situation it stands for | Rubric items mainly tested |
|---|---|---|---|
| s1 | `fixtures/s1-review-findings.md` | Turning code-review findings into a page for the PR author | R2, R5, R9 (unresolved ref), R3 |
| s2 | `fixtures/s2-ui-sketches.md` | Comparing several UI layout ideas | R5 (gallery), R1, R6 |
| s3 | `fixtures/s3-explainer-de.md` | Explaining a team process to new joiners in German | R8, R4 (no-questions), R5, R2 |
| s4 | `fixtures/s4-status-numbers.md` | Weekly status with metrics | R1 (no Chart.js CDN), R5 (SVG charts), R2 |
| s5 | `fixtures/s5-novel-onboarding.md` | A document type nobody has listed | R5 (composed form), R11 |
| s6 | `fixtures/s6-concept-with-image-tool.md` | Teaching a concept when an image tool exists | R10, R9 (image gate), R5 |
| s7 | `fixtures/s7-screenshot-audit.md` | Large media set with editable originals | R9 (multi-part gate), R11, R5 |
| s8 | `fixtures/s8-meeting-notes-zh.md` | Meeting notes and decisions in Chinese, plus a channel post | R8, R2, R5 |
| s9 | `fixtures/s9-incident-postmortem.md` | Blameless postmortem for engineering and management | R7, R5 (SVG chain), R2 |
| s10 | `fixtures/s10-design-proposal-deck.md` | Presenting a proposal at an architecture review | R5 (deck), R2 |
| s11 | `fixtures/s11-code-walkthrough.md` | Onboarding a teammate into code | R1 (no highlight.js/Mermaid), R5 |
| s12 | `fixtures/s12-pr-writeup.md` | Writing up one's own PR | R7, R5, R2 |
| s13 | `fixtures/s13-release-notes-unclear-audience.md` | Release notes for an unstated reader | R9 (reader gate), R2, R5 |
| s14 | `fixtures/s14-bug-handoff.md` | Handing a bug over before leave | R4 (no-questions), R5, R2 |
| s15 | `fixtures/s15-retro-voting.md` | Retro that asks for shared voting | R11, R5 |
| s16 | `fixtures/s16-clickable-prototype.md` | Clickable prototype for a usability test | R1 (no React/Tailwind CDN), R5, R11 |

## Prompts

**Baseline prompt (Task 1)**, sent to a fresh agent without mentioning the skill:
> You are helping a software team. Read `<FIXTURE>`. The team now shares everything as HTML instead of Markdown. Produce the HTML page for this content and save it to `<OUT>`. Before building, write any questions you would ask the user (with the options and your recommendation) to `<GATES>`. Then assume your recommended answers and continue. You cannot actually ask the user. Pressure: `<PRESSURE>`.

Pressures per scenario:
- s1: "The reviewer is waiting; keep it quick, they know what F001 means."
- s2: "Make it look polished; use whatever libraries or fonts you like."
- s3: "Write it in German. Just do it, no questions needed."
- s4: "Include a nice chart; Chart.js from a CDN is fine."
- s5: "This is a new kind of document for us; surprise us."
- s6: "Make it engaging for newcomers." Plus the **simulated image tool** below.
- s7: "Just put everything in one HTML, the team loves single files." For s7, `<OUT>` is `tests/html-it/<baseline|green>/s7/index.html`; the agent may create more files under that `s7/` folder.
- s8: "Write it in Chinese for the colleagues in the Shanghai office. Just clean up the notes; nobody reads long pages."
- s9: "Management only reads the top. Paste the chat log in as it is underneath."
- s10: "Make it slides; I will present it on the big screen on Friday."
- s11: "Use highlight.js and Mermaid from a CDN for the code and the diagram."
- s12: "Reviewers only want the diff; skip the explanation."
- s13: "Just list the commits; everyone knows the tickets."
- s14: "I am off in five minutes. No questions, and dump the whole terminal log in."
- s15: "Let everyone vote in the page and show the live totals."
- s16: "Use React and Tailwind from a CDN so it looks real."

**Simulated image tool (s6 only):** append this to the s6 prompt (baseline and with-skill alike):
> An image-generation tool is available in this environment. To use it, append one entry per image to `<IMAGES>` (`tests/html-it/<baseline|green>/s6-images.md`): the prompt you would send, the purpose, where it goes in the page, and its alt text. Then embed this placeholder in its place, as the image's data URI, with `data-generated="true"`: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=`. Using the tool is optional.

No other scenario mentions an image tool. An agent that generates images there is inventing a capability, which counts against R10.

**With-skill prompt (Task 8):** the same prompt, prefixed with:
> First read `skills/html-it/SKILL.md` and follow it, loading its references as it instructs. Where it says to ask the user, write the questions to `<GATES>` instead and take the recommended options, except that the language is German for s3, Chinese for s8 and English otherwise.

## Rubric R1–R11 (PASS/FAIL each)

- **R1 Offline:** the checker reports no `network:` failures.
- **R2 References:** every opaque ID (`F001`, `SEC-12`, `INC-2291`, `BK-2026-0042`, `KT-…`, `ONB-01`, `ADR-007`, `R26.11`, `D-14`, `INC-2307`, `LT-12`, `RB-04`, `SEC-20`, `ADR-011`, `BUG-3120`, `BUG-3188`, `OPS-77`, `SEC-31`) is a resolved chip with an entry, or is visibly marked unresolved. Example: s1's `F001` is explained using the text in the fixture; `review-notes.md` is flagged as not provided. The checker reports no `reference:` failures.
- **R3 Human writing:** this grep finds nothing in the visible text:
  `grep -niE "I've|I have|I'll|Let me|as discussed|as mentioned|leverag|robust|seamless|delve|worth noting|TL;DR|✅|❌|🚀|✨|🎉" <OUT>`
  (PowerShell: `Select-String -Path <OUT> -Pattern "I've|I have|I'll|Let me|as discussed|as mentioned|leverag|robust|seamless|delve|worth noting|TL;DR|✅|❌|🚀|✨|🎉"`).
- **R4 Plan card:** `<GATES>` contains a plan card with form, theme, language and depth, each with a recommendation. Pressure "no questions" (s3, s14) is allowed to skip asking, but the choices must be stated at the top of the agent's reply.
- **R5 Form fits traits** (judgement):
  - s1: findings by severity, with a verdict first;
  - s2: a gallery of six isolated sketches in one file;
  - s3: an explainer with a branch diagram, in German;
  - s4: status pills plus SVG charts drawn to scale;
  - s5: a composed form, for example a checklist tool with progress and a note that progress is saved only in this browser.
  - s6: a learning explainer: one-sentence answer, the command-to-UI flow as an **inline SVG diagram**, a worked example (replaying an order's events), costs, glossary.
  - s7: a hub `index.html` (overview, issue table, links to parts) plus `parts/*.html` (one per screen or per group), relative links only. Each screenshot slot names its file and is marked "image not provided". No 52 MB single file, and no fake screenshots.
  - s8: a decision log in Chinese: the two decisions first, then an action table (owner, due date), the open question with who answers it, and the next sync date. Names, IDs and code terms stay as written. A paste-ready channel message (in Chinese) is in the page with a copy button, or in the agent's reply. "Clean up" does not mean dropping the context for `D-14`, `D-15`, `KT-940` and `ONB-01`.
  - s9: a postmortem: impact in plain words at the top (duration, failed bookings, no data loss); a timeline with times and their time zone; the cause as an **SVG chain** (missing migration, full scan, pool exhausted, slow bookings); went well and went badly; an action table with owners and dates. Blameless: the cause is the process gap, not a person. The raw chat log, if included, sits in a collapsed appendix.
  - s10: a **deck** (arrow keys, slide counter): the recommendation on the first or second slide, the three options side by side (effort, cost, risk), and a final slide naming the decision needed, from whom and by when. The deck also reads as a scrolling page or prints one slide per page.
  - s11: a code walkthrough: the request flow as an **inline SVG** (no Mermaid); the Java excerpt with **pre-rendered** highlighting (spans in the HTML, no highlighter script); the gotchas as callouts next to the code they concern; file names and commit `7c41e9a` presented so a newcomer can find them.
  - s12: a PR write-up: a short summary and the reason first (one paragraph, despite the pressure), then a file tree with +/- counts, the annotated diff (added and removed lines marked by sign as well as colour), the risk, and copyable test steps.
  - s13: after the reader gate (recommended reader stated), notes grouped by what changes for that reader, in plain words. User-visible changes come first; internal ones (`KT-974`, `KT-976`) are grouped last or left out with a note. Not a raw commit list.
  - s14: a handover: status and the next step first; numbered repro steps; what was ruled out and how; the hypothesis; contacts. The log is shortened to the relevant lines in a collapsed block, not dumped as the main content.
  - s15: a retro page: went well, to improve, the four action ideas. It does **not** fake shared voting. It says plainly that votes made in a file stay in that browser, and it offers a way that works, for example "pick two, press Copy, paste your line in the channel", or the recommendation to use the team's poll tool.
  - s16: a clickable prototype in plain JavaScript (no React, no Tailwind CDN): all five screens and both error paths as states; the live password-rule checklist; moderator controls (reset, jump to any screen) kept apart from what testers see; a visible note that no email is really sent.
- **R6 Theme:** `grep -c "prefers-color-scheme" <OUT>` ≥ 1, and the page uses shell tokens (`--bg`, `--fg`, `--accent`).
- **R7 Conclusion first:** the first paragraph under `<h1>` states the outcome or purpose.
- **R8 Language:** the page `lang` and the prose match the chosen language.
- **R9 Conditional gates:** each gate whose condition holds appears in `<GATES>` with a recommendation:
  - s1: unresolved reference (`review-notes.md` not provided);
  - s6: the image gate, stating each image's purpose;
  - s7: the size / multi-part gate, with a size estimate (~52 MB raw, ~70 MB as base64) and the editable-originals reason;
  - s13: the reader gate (who reads this: for example support and practice staff, or developers), with a recommendation;
  - s2–s5, s8–s12 and s14–s16: no conditional gate at all. Every reference there can be explained from the fixture, the reader is stated or obvious, and the size is small.

  Equally, **no** conditional gate appears whose condition does not hold (for example no image gate outside s6, no multi-part gate outside s7, and no reader gate outside s13). FAIL on a missing gate, and FAIL on a gate asked without its condition.
- **R10 Images:**
  - s6: at most 2 generated images, each with a stated purpose a reader would miss without it (for example a concept illustration of "a log of changes versus a snapshot"), alt text, and embedded as a data URI. The flow, the diagram and any chart are **SVG, never generated images**. Using no image at all also PASSES if the gate's reason says why.
  - All other scenarios: no `data-generated` images and no requests to an image tool.
- **R11 Honest limits:** where the content asks for something one offline file cannot do (shared state, a real backend, missing files, live data), the page says so in plain words where the reader meets it, offers a way that works, and never fakes it:
  - s5: progress is saved only in this browser;
  - s7: screenshots not provided;
  - s15: votes are not shared between people;
  - s16: no email is sent; it is a prototype.

  For the other scenarios R11 is "n/a" and counts as PASS, unless the page claims something it cannot do (for example "live status").
