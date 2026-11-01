# Context: why this research exists (written by Mary, Raymond's primary agent, 2026-11-01)

## Raymond's intention
Raymond is a software engineer. He often has AI agents produce feature designs, PR write-ups, code reviews, plans, reports and teaching material. He likes the rich HTML output style of Claude, and wants his agents to produce rich, self-contained single-file HTML documents instead of long Markdown, choosing the right HTML format for each content type.
He does NOT want a skill built yet. This repo is a collection point for all the research so he can continue the work here later (e.g. design and build his own HTML-output skill for his agents).

## Timeline
- 2026-10-30 ~13:50 Asia/Shanghai: Secretary (his research agent) delivered the adaptive HTML research report and a 68-page teaching deck. Recommendation: a "content-type routing skill/prompt + single-file HTML output" stack, rather than any single tool. See secretary-research/report.md and the .pptx.
- 2026-10-30 ~20:14: Secretary found the repo Raymond remembered: anthropics/html-effectiveness by Thariq Shihipar (Claude Code team), companion to the blog post "Using Claude Code: the unreasonable effectiveness of HTML" (2026-05-20). 20 self-contained HTML examples, MIT. See secretary-research/followup-anthropic-html-repo.md.
- 2026-11-01: Mary checked installability. The Anthropic repo ships no skill, only examples. Related installable skills:
  - anthropics/skills -> skills/frontend-design (official; visual quality of HTML) and web-artifacts-builder.
  - plannotator/effective-html (community, NOT Anthropic): 8 skills (html, big-pics-little-words, one-pager, design-artifact, html-wireframe, html-prototype, html-plan, html-diagram); install via `npx skills add plannotator/effective-html`, also Claude Code / Codex plugins.
- Raymond's agents run on Grok Bot, which has a shared global skill library (one SKILL.md per folder), so a future skill should be written in that portable SKILL.md form.

## Key links
- https://github.com/anthropics/html-effectiveness
- https://thariqs.github.io/html-effectiveness/
- https://claude.com/blog/using-claude-code-the-unreasonable-effectiveness-of-html
- https://news.ycombinator.com/item?id=48071940
- https://github.com/anthropics/skills (frontend-design, web-artifacts-builder, brand-guidelines, theme-factory, canvas-design)
- https://github.com/plannotator/effective-html
- https://www.effectivehtml.com/

## Open questions noted by the research
- Whether Thariq Shihipar is still at Anthropic (X bio says "formerly Claude Code").
- Whether anthropics has other HTML-related repos (search API returned 403).
- Source and ownership of the `html-plan@claude-community` plugin.
