# HTML output research

Research collection for Raymond. The goal is to get AI agents to produce rich, self-contained single-file HTML instead of long Markdown, and to choose the HTML shape from the kind of content (feature design, pull-request write-up, code review, teaching material, and similar). This repository gathers the research so that work can continue here later. It does not contain a new skill.

Raymond’s agents run on Grok Bot, which loads a portable `SKILL.md` (one file per skill folder). A future skill should be written in that form. Nothing here is installed into that library.

## What is in each folder

### `docs/`

`docs/CONTEXT.md` is Mary’s note (2026-11-01) on why the research exists, the timeline, the key links, and the open questions. It is unchanged from the research bundle. Paths inside it still say `secretary-research/`; those files now live under `research/`.

### `research/`

Secretary’s material from 2026-10-30, copied unchanged:

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

Secretary’s conclusion: do not look for one universal Markdown-to-HTML converter. Use a **content-type routing skill or prompt, plus single-file HTML**.

The agent classifies the job (feature design, pull request, code review, and later types), picks a layout for that type, and writes **one self-contained HTML file** (CSS and JS inlined) that a teammate can open with no account. `frontend-design` is the strongest ready-made guidance for visual quality. `web-artifacts-builder` is the ready-made path when the page is a real React app that must be bundled down to one `bundle.html`. The `html-effectiveness` examples are the reference for no-build, vanilla, single-file pages, which match most of Raymond’s documents.

Useful alongside that, not instead of it:

- Claude Artifacts, or Cursor Pages / Grok Bot Pages, for iteration and preview.
- reveal.js when the piece is a slide walkthrough. Slidev’s true single-file export was still in conflict in the sources Secretary checked.
- Pandoc or Quarto with `embed-resources` for a long written report.
- json-render and CopilotKit when the UI lives inside an application. They are a poor fit for emailing one HTML file.

The community `plannotator/effective-html` set is a packaging of this style (a broad `html` skill plus specialists). It is inspiration and a checklist, not an Anthropic product.

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

Build the skill later, in its own change. A practical sequence:

1. Freeze the first content types: feature design, pull-request write-up, and code review. For each one, write the sections the HTML must contain (for example a review gets severity, affected files, and suggested changes; a design gets problem, approach, and how to accept it).
2. Fix the output contract: one `.html` file, styles and scripts inlined, opens offline in a browser, no login required to read it. Treat the MIT examples in `references/anthropics-html-effectiveness/` as the pattern for that contract. Use `web-artifacts-builder` only when a page actually needs a React bundle.
3. Draft one portable skill folder with a single `SKILL.md` for the Grok Bot library. The skill should route on content type, then emit HTML. Take visual constraints from `frontend-design` (avoid generic “AI” styling) and routing ideas from the community `html` skill, and write Raymond’s own instructions rather than installing those skills as-is.
4. Add one fixture per content type and a check that the file still renders with the network blocked.
5. Keep reveal.js and Pandoc/Quarto as optional exports for decks and long reports. Do not make them the default path for the three everyday types.
