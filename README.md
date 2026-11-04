# HTML output research and the html-it skill

Research collection for Raymond, and the skill built from it. The team now shares write-ups as HTML instead of Markdown. This repository holds:

- **`skills/html-it/`**: an agent-agnostic skill that turns whatever is in the conversation (a pull request, a review, a plan, meeting notes, UI sketches, a status report, an incident) into one self-contained HTML file for teammates. It picks the form from the content, keeps a house theme (Ivory, Graphite or Console, each with light and dark), turns every opaque ID into an explained reference, and makes zero network requests when the page opens.
- **`tests/html-it/`**: the skill's tests: 16 pressure scenarios, the baseline without the skill, the runs with it, the human review, and unit tests for the checker.
- **`research/single-html-verdict.html`**: the research verdict "Can one HTML file do it all?", built with the skill.
- **`samples/`**: four sample pages built with the skill.
- The original research (report, evidence, vendored references), unchanged.

The skill is a plain folder with a `SKILL.md`, references, a starter page and a checker script. It works in any agent that can read files: Claude Code, Codex, Cursor, Grok Bot and others.

## Install

Copy the whole `skills/html-it/` folder, not only `SKILL.md`: the skill reads its `references/`, `assets/` and `scripts/`. The locations below were checked in each agent's official documentation on 2026-11-03.

| Agent | Personal (all projects) | One project | Source |
| --- | --- | --- | --- |
| Claude Code | `~/.claude/skills/html-it/` | `.claude/skills/html-it/` | [Claude Code skills](https://code.claude.com/docs/en/skills) |
| Codex | `~/.agents/skills/html-it/` | `.agents/skills/html-it/` in the repository (Codex also looks in each parent folder up to the repository root) | [Codex skills](https://developers.openai.com/codex/skills) |
| Cursor | `~/.agents/skills/html-it/` or `~/.cursor/skills/html-it/` | `.agents/skills/html-it/` or `.cursor/skills/html-it/` (Cursor also reads `.claude/skills/` and `.codex/skills/`) | [Cursor skills](https://cursor.com/docs/skills) |

Notes:

- Cursor requires the skill's `name` to match its folder name, so keep the folder name `html-it`.
- Codex can also be pointed at the skill from `AGENTS.md`, for example: "For pages to share with the team, read `skills/html-it/SKILL.md` and follow it."
- **Any other agent:** copy the folder anywhere it can read and tell it: "Read `skills/html-it/SKILL.md` and follow it." If your agent has its own skills folder, check your agent's documentation for its location.

The checker needs Python 3 and nothing else.

## Using it

Ask for a page in your own words. For example:

- "Turn this PR into an HTML page for the team."
- "Make the review findings above readable for the PR author."
- "Write up today's meeting notes as a page for the Shanghai office, in Chinese."

Before building, the agent shows a short plan card (form, theme, language, depth), each with a recommendation, and asks you to confirm. It asks more only when it must: when the reader is unclear, when it cannot resolve a reference, when the page would pass about 20 MB, or when an image tool is available and an image would help. Say "no questions" to skip the card; the agent then states its choices at the top of its reply.

To check a page yourself:

```bash
python skills/html-it/scripts/check_html.py path/to/page.html
```

The checker fails on anything loaded from the network, on bare IDs that are not explained, and on a missing title, language or alt text. It also reports the size.

## What is in each folder

### `skills/html-it/`

| File | What it is |
| --- | --- |
| `SKILL.md` | The process, the gates and the hard rules. |
| `references/` | Read on demand: forms, components, writing, cross-references, theme, media, multi-part. |
| `assets/shell.html` | The starter page: theme tokens, theme toggle, table of contents, reference popovers, print styles. |
| `scripts/check_html.py` | Standard-library checker for the network, reference and structure rules. |

### `tests/html-it/`

`scenarios.md` holds the 16 pressure scenarios and the rubric (R1 to R11). `fixtures/` holds their inputs, `baseline/` the results without the skill, `green/` the results with it (every scenario passed R1 to R11 in two consecutive runs), and `REVIEW.md` the human review. `test_check_html.py` holds the checker's unit tests: `python -m unittest discover -s tests/html-it`. The visual check (offline, light and dark, 1280 and 390 px) is described in Task 13 of the plan; this run did it in a browser because Playwright for Python was not installed.

### `samples/`

Four pages built with the skill, each a different form:

- `pr-writeup.html`: the pull request that adds the skill (Graphite).
- `cdn-assessment-zh.html`: the CDN assessment, in Chinese (Ivory).
- `theme-sketch-board.html`: the three themes as isolated sketches (Console).
- `research-options-deck.html`: the report's ten options as a keyboard deck (Ivory).

### `docs/`

`docs/plans/` holds the implementation plan for the skill and its execute prompt. `docs/CONTEXT.md` is Mary’s note (2026-11-01) on why the research exists, the timeline, the key links, and the open questions. It is unchanged from the research bundle. Paths inside it still say `secretary-research/`; those files now live under `research/`.

### `research/`

`single-html-verdict.html` is the research verdict, built with the skill. The rest is Secretary’s material from 2026-10-30, copied unchanged:

| File | What it is |
| --- | --- |
| `report.md` | Main research report, in Chinese, with an English spoken summary. Compares Claude Artifacts, Anthropic skills, a custom routing skill, Cursor Canvas / Grok Bot Pages, ChatGPT Sites, reveal.js, Slidev, Pandoc/Quarto, json-render, and CopilotKit. |
| `followup-anthropic-html-repo.md` | Follow-up that identifies `anthropics/html-effectiveness` as the gallery Raymond remembered. |
| `2026-10-30-adaptive-html-teaching.pptx` | 68-page teaching deck. |
| `2026-10-30-adaptive-html-teaching-contact.jpg` | Contact sheet of that deck. |
| `evidence/` | Notes and page snapshots used while writing the report, including saved copies of the two Anthropic `SKILL.md` files as they were fetched that day. The licensed upstream copies are under `references/`, not here. |

### `references/`

Public sources copied so this repo can be read offline. Each folder has the upstream license and a `SOURCE.md` with the origin URL and commit SHA. `SOURCE.md` is the only file added locally; everything else is an unchanged copy.

| Folder | Who | License | What was copied |
| --- | --- | --- | --- |
| `anthropics-html-effectiveness/` | **Official Anthropic** | MIT | `index.html` plus all 20 example HTML files from [anthropics/html-effectiveness](https://github.com/anthropics/html-effectiveness) at `58c305be97f47b26b678f2c07dec01d4242268ec` |
| `anthropics-frontend-design/` | **Official Anthropic** | Apache 2.0 (`LICENSE.txt`) | `skills/frontend-design/` from [anthropics/skills](https://github.com/anthropics/skills) at `ca45fc496a3436251f191354091d557da31c15b5` |
| `anthropics-web-artifacts-builder/` | **Official Anthropic** | Apache 2.0 (`LICENSE.txt`) | `skills/web-artifacts-builder/` from the same `anthropics/skills` commit, including `scripts/` |
| `plannotator-effective-html/` | **Community, not Anthropic** | MIT | `skills/` from [plannotator/effective-html](https://github.com/plannotator/effective-html) at `5ce160a3e76dc1c0f9301f8a1903704ec607636a` |

The two Anthropic skill folders are Apache 2.0, not MIT. Apache 2.0 allows redistribution when the license ships with the files, so they were copied. No requested folder was dropped for license reasons.

Not vendored, on purpose: the rest of `anthropics/skills` (including `brand-guidelines`, `theme-factory`, `canvas-design`, and the source-available document skills `docx`, `pdf`, `pptx`, `xlsx`), the rest of `anthropics/html-effectiveness` (README and project docs), and the rest of `plannotator/effective-html` (site, examples, plugin manifests). No other repositories were copied. The community README credits `big-pics-little-words` and `one-pager` to [backnotprop/bro](https://github.com/backnotprop/bro); that repo was not vendored.

## Key links

- Official gallery: https://github.com/anthropics/html-effectiveness
- Gallery site: https://thariqs.github.io/html-effectiveness/
- Claude Blog, 2026-05-20, “Using Claude Code: the unreasonable effectiveness of HTML”: https://claude.com/blog/using-claude-code-the-unreasonable-effectiveness-of-html
- Hacker News thread: https://news.ycombinator.com/item?id=48071940
- Official skills repo: https://github.com/anthropics/skills (`frontend-design`, `web-artifacts-builder`; also `brand-guidelines`, `theme-factory`, `canvas-design`, which are not copied here)
- Community skills, not Anthropic: https://github.com/plannotator/effective-html
- Community guide: https://www.effectivehtml.com/

## Recommendation

Use the **html-it** skill. It follows Secretary’s conclusion: do not look for one universal Markdown-to-HTML converter; choose the shape from the content and write one self-contained HTML file. It makes two changes, based on the research:

- **Traits instead of a fixed list of types.** The agent lists the content’s traits (a decision, code changes, findings, numbers, many visual items, something to try or present) and combines their building blocks. Worked examples guide it, and a new kind of content needs no new template.
- **Offline when the page opens.** No CDN and no web fonts. The verdict page explains why (reachability in mainland China, supply-chain risk, durability), and the checker enforces it.

The verdict itself: one file covers nearly everything the team shares, including decks, clickable prototypes and boards of many UI sketches. Use a multi-part folder only past about 20 MB or when assets must stay editable. Shared state and live data are out of scope, and pages say so.

Secretary’s original recommendation, kept for the record: a **content-type routing skill or prompt, plus single-file HTML**. In that recommendation:

- `frontend-design` is the strongest ready-made guidance for visual quality.
- `web-artifacts-builder` is the path when the page is a real React app that must be bundled into one `bundle.html`.
- The `html-effectiveness` examples are the reference for single-file pages with no build step.
- Useful alongside them: Claude Artifacts, Cursor Pages or Grok Bot Pages for iteration and preview; reveal.js for slide walkthroughs; Pandoc or Quarto with `embed-resources` for long reports; json-render and CopilotKit when the UI lives inside an application.
- The community `plannotator/effective-html` set is inspiration and a checklist, not an Anthropic product.

## Open questions

From `docs/CONTEXT.md` and the follow-up:

- Whether Thariq Shihipar is still at Anthropic. The X bio said “formerly Claude Code”; the May 2026 Claude Blog byline said member of technical staff. Employment was not re-checked for this collection. The MIT examples do not depend on that answer.
- Whether Anthropic has more HTML-related repositories. A GitHub search API call returned 403 during the follow-up, so the search was not exhaustive.
- Who owns and publishes the `html-plan@claude-community` plugin. The follow-up only saw an X install instruction, not a confirmed source tree.

The main report also left these unverified. They matter if a later skill depends on them:

- Whether Slidev officially supports a stable single-file flag (`--single-file` / `--standalone-bundle`). A third-party post, a rejected pull request, and the CLI docs disagreed.
- The exact official date and wording for ChatGPT Canvas being removed (third parties said 2026-05-28).
- Whether Cursor Canvas or Grok Bot Pages has an official “export one self-contained `.html`” action.
- Quarto’s GitHub license metadata (`NOASSERTION`) versus the website’s “1.4+ MIT” statement.
- Whether a Claude Code artifact can be shared publicly under every Team or Enterprise policy.

The report’s note that the Anthropic skills license text was unverified is resolved for the two folders above: both are Apache 2.0, and the license files are in `references/`.

## Suggested next steps

1. Install the skill in the agents the team uses (see Install), and use it for a week on real pull requests, reviews and status reports.
2. Collect the pages that miss: a form that did not fit, a reference left bare, writing that sounds like an agent. Add each one as a scenario in `tests/html-it/scenarios.md`, watch it fail, then fix the skill.
3. Run the scenarios in a second agent, for example Codex or Cursor, to confirm the skill really works in any agent. So far every run has used one model.
4. Test from inside mainland China that the pages open without delay, and review the CDN assessment, which is based on knowledge, not measurements.
5. Keep reveal.js and Pandoc/Quarto as optional exports for decks and long reports; they are not the default path.
