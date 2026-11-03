# Approved design: html-it skill (2026-11-03)

## Approach
A: one orchestrator SKILL.md + on-demand reference kit + shell template + stdlib checker.
Rejected: B router + specialist skills (install burden in every agent, duplicated rules, theme/ref handling drift, routing is a fixed mapping); C single big SKILL.md (always-loaded bulk, no reusable template/checker, inconsistent output).

## Part 1: Folder layout and process
```
skills/html-it/
  SKILL.md                 process, gates, hard rules (~250 lines)
  references/
    forms.md               trait -> form catalog (~12 forms, composable)
    components.md          snippets: ref chips, glossary, diff, tabs, callouts, timeline, gallery, screen-flow
    writing.md             human-first writing rules + agent-speak blacklist
    cross-references.md    finding/resolving/rendering IDs like F001
    theme.md               house theme Ivory + variants Graphite, Console; light/dark
    media.md               SVG-first, image-generation judgment, build-time inlining of libraries
    multi-part.md          when one page is not enough
  assets/shell.html        starter: tokens, theme toggle, TOC, ref popovers, print styles
  scripts/check_html.py    stdlib only: no network refs, no bare IDs, size, basic structure
```
Process: 1 Gather (content + read pointed-to files/PRs/tickets) -> 2 Analyse (audience, reader's job, traits, references) -> 3 Gate 1 plan card ALWAYS (outline in text + up to 4 questions: form, theme, language EN/DE/ZH, depth/interactivity; each with recommendation) -> 4 Conditional gates only when needed (audience unknown; unresolved refs: look up / explain from context / flag; single vs multi-part if huge; image if tool available and useful) -> 5 Build from shell -> 6 Verify (checker + browser if available) -> 7 Deliver (path, 2-line description, paste-ready Teams summary). Optional final revision gate.
Agent-agnostic gates: use the environment's question tool if any, else plain chat with lettered options. "fast"/"no questions" skips Gate 1 but states choices at top of reply.

## Part 2: Form selection, single-HTML verdict, refs, writing, images
Traits (not types) pull building blocks:
- decision -> recommendation first, options side by side, how to accept
- code changes -> file tree + annotated diff + risk notes
- order/time -> timeline/stepper (numbering only for true sequence)
- structure/flow -> inline SVG diagram
- many visual items -> gallery board with filters; each sketch isolated in iframe srcdoc
- behaviour to try -> clickable prototype (screens as state machine)
- numbers -> tables + to-scale SVG charts
- long narrative -> article with sticky TOC
- present -> deck mode (arrow keys)
- live tweaking -> small tool
forms.md gives ~12 worked combinations (PR write-up, explainer, design proposal, incident report, UI sketch board, status report, ...) as examples, not templates.

Single-HTML verdict: one file covers almost everything (incl. many UI sketches via gallery + isolated iframes, multi-screen prototypes, decks, interactive explainers). Real limits: raster media size (base64 +33%; dozens of screenshots/video exceed ~20-25 MB email limits); shared/persistent state (localStorage is per-browser); separately editable source assets; live data/backend. Rule: single file default; multi-part (index.html + parts folder, zipped, relative links, offline) only past ~20 MB or when editable separate assets are required. Shared state/live data: out of scope, page says so.

Cross-refs: scan for opaque IDs (F001, ABC-123, SHAs, paths, internal acronyms). Resolved -> ref chip "F001 · Login timeout finding" with hover/tap one-liner + link to References appendix (what it is, origin). Unresolved -> visibly marked chip + Gate 2. Jargon defined at first use + glossary. No bare ID; checker flags them.

Writing: conclusion first, for a teammate who wasn't there; full sentences, define terms, explain why, absolute dates, real names. Ban agent-speak ("I've implemented", "Let me", "leverage", "robust", status emoji, "as discussed", bold-fragment walls). Self-test: could a new teammate act on this page without asking anyone?

Images: SVG first for anything precise. Image generation only when a tool exists and the image adds meaning (concept illustration, sketch mood reference, cover). Inline as compressed data URI, alt text always.

## Part 3: Theme, verification, deliverables
Themes: Ivory (default; ivory/slate/clay/oat/olive, serif headings + sans body, ~68ch lines, generous spacing), Graphite (neutral engineering, cool greys, one blue accent, all sans, denser; reviews/specs), Console (dense dashboard, dark first, tabular nums, semantic status colours; status/boards). Each light+dark: follows OS, in-page toggle, three-state theme handled; tokens only; one :root swap. System font stacks with CJK fallbacks. Print styles.
Shell built-ins: sticky TOC, ref-chip popovers, glossary, copy buttons on code, theme toggle, generated-on/source footer, focus states, reduced motion; works from file:// with no network.
Checker (check_html.py, stdlib): fail on http(s) in src / link href / @import / url() / fetch; bare IDs not wrapped in ref chips; missing <title>, lang, alt. Reports size. Browser check wide+narrow, light+dark, console, if available; otherwise written checklist.
Deliverables:
1. skills/html-it/
2. research/single-html-verdict.html (explainer + decision, Ivory)
3. samples/: pr-writeup.html (this change, Graphite); cdn-assessment-zh.html (CDN-in-China assessment, Chinese); theme-sketch-board.html (three themes in isolated iframes, gallery); research-options-deck.html (report's 10-option comparison, keyboard deck)
4. README.md: skill description + install for Claude Code (~/.claude/skills/), Codex (~/.codex/skills/ or AGENTS.md reference), Cursor (.cursor/rules or skills), generic copy.
All pages pass checker and load with zero network requests.

## CDN assessment (input for cdn-assessment-zh sample)
Google Fonts blocked in mainland China; jsDelivr unreliable there since ICP licence loss late 2021 (DNS pollution/slow on and off); unpkg slow/unreliable; cdnjs usually reachable, sometimes slow; BootCDN/Staticfile fast in China but operated by the entity behind the 2024 polyfill.io supply-chain attack. Further arguments: security (third-party code next to internal content), durability (old links). Size mitigated because the agent renders: SVG diagrams instead of Mermaid (~3 MB), pre-rendered code highlighting instead of highlight.js, Chart.js (~200 KB) only for real interactive data. Typical page 30-150 KB, worst ~3 MB. Decision: offline at read time, fetch-at-build-time inlining (cdnjs/npm; npmmirror inside China). Confidence: from knowledge to mid-2026, not tested from inside China.
