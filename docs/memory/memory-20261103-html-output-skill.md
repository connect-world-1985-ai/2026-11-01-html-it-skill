# Memory: Agent-agnostic HTML output skill

**Generated**: 2026-11-03
**Last updated**: 2026-11-04
**Project**: D:\git\2026-11-01-html-it-skill (renamed 2026-11-04 from `2026-11-01-html-output-research`; GitHub repo `connect-world-1985-ai/2026-11-01-html-it-skill`, public since 2026-11-04, merged to `main` via PR #1)
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
15. **Committed and pushed by the user before the final report** (2026-11-04, `2dc3b01 [SQ5GEN-195] test file commits` on `feature/html-it`): the plan said "nothing committed", but the execution session was stopped by Opus 5.5 safeguards (`[reasoning_extraction]`) during Task 13, so Raymond committed manually to avoid losing work. Task id in use: SQ5GEN-195.
16. **Task 13 finished in another session (2026-11-04)** with the browser-pane alternative (Playwright for Python not installed), over a temporary local `python -m http.server`, because the pane cannot script `file://` pages.

---

## Confirmed Assumptions

- Cross-references (e.g. F001) must never be left bare: resolve inline, link to in-page appendix, or flag unresolved.
- Writing must be human-first, no agent jargon.
- Single HTML is the default; exceptions defined by the research verdict (to be settled in brainstorming).

---

## Key Discoveries

- Repo contains research only, no skill. Key references: `references/anthropics-html-effectiveness/` (20 vanilla single-file examples; tokens ivory #FAF9F5, slate #141413, clay #D97757, oat #E3DACC, olive #788C5D; serif/sans/mono system stacks), `references/anthropics-frontend-design/SKILL.md` (flags cream+clay+serif as a generic AI tell on client briefs), `references/plannotator-effective-html/skills/` (router `html` + specialists).
- `research/report.md` (Chinese) recommends content-type routing + single-file HTML.
- The execution session "local: Dynamic HTML content conversion" (1,418 messages) hit Opus 5.5 safeguards (`[reasoning_extraction]`) while browser-testing the deck. Afterwards even a plain "commit and push" turn was blocked, so the whole context was affected, not one message. Fix: continue in a fresh session from files and git history.
- Browser pane gotcha: page tools refuse `file://` tabs; serve the folder over localhost instead. Port 8765 may already be held by an old `http.server`.
- **Real image tool tested (2026-11-04)**: s6 rerun in a fresh subagent with GPT Image via the `codex-gpt-image` bridge (Codex sign-in) instead of the simulated tool. PASS R1–R11; one image, 33 s, backend returned 1774×887 instead of the requested 1536×1024 and no model id; agent resized to 1600 px WebP (1.7 MB PNG → 47 KB). Results in `tests/html-it/green/RESULTS.md` ("Extra run"), files in `tests/html-it/green/real-image/`. Five gaps in `references/media.md` found (size mismatch, marking generated images, tool failure/timeout, format/weight target, review before embedding) and recorded there, not yet fixed in the skill.

---

## Current State

- **Working (2026-11-04)**: all 13 plan tasks done and every Acceptance item verified. `skills/html-it/` complete (SKILL.md 1,591 words, description 438 chars, 7 references, shell, checker); 35/35 unit tests pass; checker PASS on shell, verdict page and four samples; all 16 scenarios PASS R1–R11 in two consecutive runs; REVIEW.md holds the user's Task 9A approval; R3 agent-speak grep clean; `references/` and `research/evidence/` unchanged vs `main`.
- **Task 13 browser check**: six pages at 1280/390 px, light and dark: no overflow, zero network requests, no console errors, Chinese glyphs fine. Deck keys (arrows, Space, Home/End, N notes, clamped at ends), theme toggle cycle, ref and glossary popovers (stay in view at 390 px), all 12 PR refs resolve, board filters and compare mode work. No pages use tabs.
- **Committed and pushed** on `feature/html-it` (see Key Decisions 15).
- **Blocked**: none.

---

## Next Steps

1. [x] Brainstorm 2-3 architecture approaches, get design approval.
2. [x] Write handoff plan.
3. [x] Write skill folder, verdict page, samples, README.
4. [x] Verify pages offline in browser (Task 13).
5. [x] Commit and push to `feature/html-it`.
6. [x] Test s6 with a real image tool (extra run, PASS).
7. [ ] Decide whether to add the five image-generation rules to `references/media.md` (then re-run s6).
8. [ ] Optional: code review of the branch, then a PR from `feature/html-it` to `main`.

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
