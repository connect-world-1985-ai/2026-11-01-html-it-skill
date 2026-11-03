# Memory: Agent-agnostic HTML output skill

**Generated**: 2026-11-03
**Last updated**: 2026-11-03
**Project**: D:\git\2026-11-01-html-output-research
**Focus**: Design and build one high-level skill that turns any in-context content into the best-fit self-contained HTML for team sharing.

---

## Goal & Scope

Raymond's team is replacing Markdown with HTML for anything shared with teammates or kept for later reading. Build ONE high-level, agent-agnostic skill (Claude Code, Codex, Cursor, ...) that understands the content in context and dynamically picks the best HTML representation (PR write-up, explainer, draft, UI sketch, prototype, ... unbounded types). No locked type->template mapping: a pattern catalog guides, the agent decides. Repo research is inspiration only.

Deliverables (all confirmed):
1. Skill folder `skills/<name>/` (SKILL.md + references + starter template).
2. Research verdict page (HTML, built with the skill): can single HTML serve every purpose; limits and what to do there.
3. 3-4 sample pages from real repo content, browser-checked with network off.
4. README update incl. install notes per agent.

Out of scope: hosting/publishing, Teams paste-safe mode, React/bundler pipeline as default, committing without explicit yes.

---

## Key Decisions

1. **Agent-agnostic portable folder**: user runs it in any modern agent; gates use the agent's native question tool if present, else plain chat.
2. **Full HTML feature set, JS always allowed**: the point is HTML's expressive power. Rejected: chat-paste/sanitized mode.
3. **Fully offline at read time**: zero network requests when opened. Prefer agent-drawn SVG and pre-rendered code highlighting; if a library is truly needed, agent fetches a pinned version at build time and inlines it. Size is not a concern. Rejected: CDN at read time (Google Fonts blocked in mainland China, jsDelivr unreliable there since ICP loss 2021, BootCDN/Staticfile tied to 2024 polyfill.io operator; also supply-chain + durability risk for internal content).
4. **House theme + variants**: Anthropic-inspired default (ivory/slate/clay, serif headings, generous spacing, light+dark), plus 2-3 alternates offered at a gate; content type changes layout, not identity. Rejected: single fixed theme; fully adaptive per page.
5. **Adaptive gates**: Gate 1 "plan card" always (content type, form, outline, theme, interactivity, language); extra gates only when ambiguous; optional post-render check. Rejected: fixed full sequence; no-questions default.
6. **Language asked every time on the plan card**: English default/recommended; German and Chinese offered.
7. **Image generation optional, judgment-based**: use when environment provides it (Cursor/Codex native, bridge skills like codex-gpt-image) for illustrative/concept/mood/cover imagery; never for precise content (diagrams, flows, charts, UI text) which stays SVG/HTML. Embed as data URI. Never block when unavailable.
8. **Architecture A approved**: orchestrator SKILL.md + reference kit + shell template + stdlib checker; skill name `html-it`. Form composed from content traits, catalog = worked examples. Full design: `./memory-20261103-html-output-skill/approved-design.md`.
9. **Rejected: router + specialists (B), single big SKILL.md (C)**: install burden/drift/fixed mapping; always-loaded bulk and inconsistent output.
10. **Single HTML default; multi-part fallback** only past ~20 MB or when separately editable assets are needed.
11. **Next step chosen: formal handoff plan via `writing-plans`** (self-contained, for another agent/session).
12. **Reversed: skill name `html-for-humans`**: renamed to `html-it` on 2026-11-03 at the user's request (shorter, verb-like, fits verb-first naming; triggering relies on the description). Plan files renamed to `docs/plans/2026-11-03-html-it-skill*.md`; localStorage key `html-it-theme`; branch `feature/html-it`.
13. **Test design extended**: added scenarios s6 (simulated image tool; tests image judgement, SVG for flows) and s7 (40-screenshot audit, ~52 MB; tests multi-part gate, no fake screenshots); rubric R9 (conditional gates appear exactly when their condition holds) and R10 (image use); new Task 9A mandatory human review stop of 3 GREEN outputs before verdict/samples. Not added: cross-agent run (depends on which agents the user has set up).
14. **Test suite extended to 16 scenarios** (user asked for at least 12 covering daily engineering and teamwork): s8 meeting notes to decision log in Chinese, s9 incident postmortem, s10 design proposal as a deck, s11 code walkthrough (CDN highlighter pressure), s12 own PR write-up, s13 release notes with unclear reader (reader gate), s14 bug handoff ("no questions"), s15 retro with voting (shared-state limit), s16 clickable prototype (React CDN pressure). New rubric R11 Honest limits. Task 9A now reviews four outputs (s1, s2, s9, closest call). Scenarios run in parallel batches.

---

## Confirmed Assumptions

- Cross-references (e.g. F001) must never be left bare: resolve inline, link to in-page appendix, or flag unresolved.
- Writing must be human-first, no agent jargon.
- Single HTML is the default; exceptions defined by the research verdict (to be settled in brainstorming).

---

## Key Discoveries

- Repo contains research only, no skill. Key references: `references/anthropics-html-effectiveness/` (20 vanilla single-file examples; tokens ivory #FAF9F5, slate #141413, clay #D97757, oat #E3DACC, olive #788C5D; serif/sans/mono system stacks), `references/anthropics-frontend-design/SKILL.md` (flags cream+clay+serif as a generic AI tell on client briefs), `references/plannotator-effective-html/skills/` (router `html` + specialists).
- `research/report.md` (Chinese) recommends content-type routing + single-file HTML.

---

## Current State

- **Working**: requirements confirmed; design approved; handoff plan written (`docs/plans/2026-11-03-html-it-skill.md` + `-PROMPT-execute.md`). Embedded checker (27 unittest cases) and shell template were extracted to a scratch dir and verified: all tests pass, shell passes checker, shell JS parses.
- **Plan reviewed (think-mcp)** and fixes applied: checker now scans iframe srcdoc recursively and script-set src/href (location.href allowed); compound IDs (BK-2026-0042, R26.11) matched whole; .ref-summary + SVG-label rule documented; pr-writeup built last; plan card has Interactivity line. Extracted tests: 35/35 pass.
- **Tests**: 16 pressure scenarios (s1–s16), rubric R1–R11, human review stop Task 9A (four outputs).
- **Pending**: execution in a new session (paste the PROMPT-execute file). Nothing committed.
- **Blocked**: none.

---

## Next Steps

1. [x] Brainstorm 2-3 architecture approaches, get design approval.
2. [x] Write handoff plan.
3. [ ] Write skill folder, verdict page, samples, README.
3. [ ] Verify pages offline in browser.
4. [ ] Code review gate, then ask before commit (Conventional Commits; task id unknown -> ask).

---

## References

- `README.md` -- repo overview and prior recommendation
- `docs/CONTEXT.md` -- Mary's context note
- `research/report.md` -- main research report
- `references/` -- vendored upstream skills and examples
- `./memory-20261103-html-output-skill/approved-design.md` -- full approved design + CDN assessment
- `docs/plans/2026-11-03-html-it-skill.md` -- self-contained handoff plan (13 tasks, appendices A-F)
- `docs/plans/2026-11-03-html-it-skill-PROMPT-execute.md` -- paste into a new session to execute

---

**Confirmed at**: 2026-11-03
