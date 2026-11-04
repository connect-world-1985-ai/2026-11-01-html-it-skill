# Handoff: continue executing the html-it plan (from the cloud session, 2026-11-03)

Paste this into the local agent session. It continues `docs/plans/2026-11-03-html-it-skill.md` (read it fully first; Section 0 decisions are final). Work on branch `feature/html-it` (pull it from origin; the cloud session pushed it). Same guardrails as before: do not modify `references/` or `research/evidence/`; do not install the skill into user-level agent folders; never call a real image API; do not commit, push or merge without the user's explicit yes.

## Done (committed on `feature/html-it`)

- **Task 1 (RED):** `tests/html-it/fixtures/` (s1–s16, extracted verbatim from Appendix E.1), `tests/html-it/scenarios.md` (prompts, rubric, coverage table), `tests/html-it/baseline/` (16 outputs, gates files, agents' replies as `sN-reply.md`, `RESULTS.md` with scores and verbatim rationalizations). Every baseline scenario failed R2 and R4; most failed R1 (Google Fonts, CDN scripts).
- **Tasks 2–3:** `tests/html-it/test_check_html.py` and `skills/html-it/scripts/check_html.py`, exact from the plan. `python -m unittest discover -s tests/html-it -v` → 35 tests OK.
- **Task 4:** `skills/html-it/assets/shell.html` (exact, checker PASS) and `references/theme.md`.
- **Tasks 5–6:** `references/{writing,cross-references,forms,components,media,multi-part}.md`.
- **Task 7:** `skills/html-it/SKILL.md` (ASO checks pass: `html-it True`, description 438 chars, starts "Use when", all keywords; 1,591 words, under 1,600).
- **Task 8, run 1:** `tests/html-it/green/run1/`: all 26 pages pass the checker; R9 failed for s4, s10, s13, s16 (gates asked whose condition did not hold). Scored in `tests/html-it/green/RESULTS.md`.
- **Task 9 REFACTOR 1:** counters added (resolved-vs-unresolved definition, product names are not references, only four gates exist, never silently correct the source).
- **Task 8, run 2:** `tests/html-it/green/run2/`: all pages pass the checker; s1 R9 regressed (missing `review-notes.md` not gated). **REFACTOR 2** already applied to SKILL.md and `cross-references.md` (a missing source file is always unresolved → gate).

## How the scenario runs were done

Each scenario ran in a fresh subagent inside an isolated copy of the workspace holding only `skills/html-it/` and `tests/html-it/fixtures/` (so the agent could not read the plan/rubric). Task text = Appendix E.2 with-skill prompt plus two environment lines: "do not publish, upload or share the page anywhere" and "also save your final message verbatim to `tests/html-it/green/sN-reply.md`". Outputs were then copied into `tests/html-it/green/runN/`.

## Remaining work

1. **Finish scoring run 2** in `tests/html-it/green/RESULTS.md` (full R1–R11 table; hand-check s2 and s3 plan cards).
2. **Run 3 and run 4** with the current skill, all 16 scenarios (at minimum s1, s4, s7, s10, s13 twice, since REFACTOR 2 touched the reference gate). Acceptance needs all 16 passing R1–R11 in two consecutive runs. Put the final run's pages at the top level of `tests/html-it/green/` (`sN.html`, `sN-gates.md`, `s7/…`).
3. **Task 9 Step 3:** rerun unit tests.
4. **Task 9A (mandatory stop):** write `tests/html-it/REVIEW.md` (score table; the four review pages: green/s1, green/s2, green/s9 and the closest call among s3/s6/s8/s15; what to look at; excuses closed) and ask the user to approve. Do not continue without approval.
5. **Tasks 10–12:** `research/single-html-verdict.html`, the four `samples/*.html`, README update. `samples/pr-writeup.html` last.
6. **Task 13:** render check. Python Playwright is installable with `pip install playwright`; if `chromium.launch()` fails because the matching browser is missing, launch with an existing Chromium (`executable_path=`) and note that deviation; otherwise use the plan's browser or written-checklist alternative. Add `tests/html-it/screens/` to `.gitignore`.

## Notes and verified facts for the README (Task 12)

- Claude Code (verified from https://code.claude.com/docs/en/skills): personal `~/.claude/skills/html-it/SKILL.md`, project `.claude/skills/html-it/SKILL.md`.
- Codex (from search excerpts of https://developers.openai.com/codex/skills; the page itself was blocked by the cloud network, re-verify): repo `.agents/skills/`, user `$HOME/.agents/skills/`, admin `/etc/codex/skills`.
- Cursor (from search excerpts of https://cursor.com/docs/skills; blocked, re-verify): project `.cursor/skills/` or `.agents/skills/`, user `~/.cursor/skills/` or `~/.agents/skills/`; Cursor also reads `.claude/skills/` and `.codex/skills/`.

## Things the user should know

- The s15 **baseline** agent published its retro page as a private claude.ai artifact (https://claude.ai/artifact/K3RH2epJREE2nKM64sK3QX) to get shared voting. It was not asked to; delete it if unwanted.
- Fixture date conflicts found by agents: s15/s16 "Thursday 2026-11-06" (a Friday), s10 "Friday 2026-11-07" (a Saturday). The skill now says to keep the source's words and mark them "to be confirmed".
- The commit format is `[TASK-ID] <type>: <description>`; the task ID was never given, so the interim commit uses `[HTML-IT]`. Ask the user for the real ID before the final commit.
