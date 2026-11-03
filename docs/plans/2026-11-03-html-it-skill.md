# html-it Skill Implementation Plan

> **For the implementing agent:** Follow this plan task-by-task. Complete each step, verify it works, then move to the next.

**Goal:** Build `html-it`, an agent-agnostic skill that turns any content in an agent's context into one self-contained, offline HTML page that a teammate who was not in the conversation can read. Then use it to produce a research verdict page and four sample pages, and update the README.

**Architecture:** One orchestrator `SKILL.md` runs a fixed process (gather, analyse, plan-card gate, conditional gates, build, verify, deliver). Detailed guidance lives in reference files that are loaded only when needed. A shared `assets/shell.html` provides the house theme (three variants, light and dark) and the built-in behaviour. A standard-library Python checker (`scripts/check_html.py`) enforces the hard rules. The form of each page is composed from **traits of the content**, not looked up from a fixed type-to-template table.

**Tech Stack:** Plain HTML5, CSS custom properties, vanilla JavaScript, inline SVG. Python 3.9+ standard library for the checker and its `unittest` tests. Optional: Playwright for Python, for the render check.

---

> **SELF-CONTAINED PLAN.** You need no prior chat session and no memory file. Do not ask the user to re-explain context; everything is in this plan and its appendices. Normal session-start rules of your environment still apply. Files already in the repository (for example `research/report.md`, `references/...`) may be read directly. Anything that came only from the planning conversation is embedded here.

---

## Section 0: Full Context

### 0.1 Why / background

Raymond's team is replacing Markdown with HTML for anything they share with teammates or keep for later reading. Reading long Markdown is painful, and HTML can express far more: layout, diagrams, interaction, filtering, light and dark themes. They want **one high-level skill** that any modern agent (Claude Code, Codex, Cursor, and others) can use to turn whatever is in context into the most suitable HTML. The content could be a pull request, a code review, a knowledge explainer, a draft, UI sketches, a prototype, or any of hundreds of other kinds.

Problems the skill must solve, observed in agent-written documents:
- Agents write for themselves, not for people: "I've implemented…", "Let me…", stacks of bold fragments, status emoji, undefined jargon.
- Agents leave **opaque references** such as `F001`, `F002` (indexes into another file), ticket keys, and commit SHAs. A reader without that context cannot follow them.
- One fixed HTML format cannot fit every kind of content, and a hard type-to-template mapping cannot cover content nobody has listed.
- Readers need predictability: the user should know what kind of page they will get before it is built.

This repository (`D:\git\2026-11-01-html-output-research`) is a research collection. It holds `research/report.md` (a Chinese report recommending content-type routing plus single-file HTML), `docs/CONTEXT.md`, and offline copies of upstream material under `references/`:
- `references/anthropics-html-effectiveness/`: 20 MIT example pages from Anthropic, vanilla and single-file. This is the visual reference for the house theme.
- `references/anthropics-frontend-design/SKILL.md`: Anthropic's visual-quality guidance.
- `references/anthropics-web-artifacts-builder/`: the React-bundle path. **Not** used by default.
- `references/plannotator-effective-html/skills/`: a community router skill plus specialists. Inspiration only.

The research is inspiration, not a constraint.

### 0.2 Confirmed decisions (authoritative: do not re-litigate)

| # | Decision | Rationale | Rejected alternatives |
|---|---|---|---|
| D1 | **Agent-agnostic portable skill folder** (`SKILL.md` + `references/` + `assets/` + `scripts/`). | The user runs it in Claude Code, Codex, Cursor and other agents. | Grok Bot single-file only; Claude-Code-only features. |
| D2 | **Full HTML feature set; JavaScript always allowed.** | HTML's expressive power is the whole reason for the skill. | A "chat-paste safe" sanitized mode (out of scope). |
| D3 | **Fully offline at read time:** the page makes zero network requests when opened. Prefer agent-drawn SVG and pre-rendered code highlighting. When a library is truly needed, the agent downloads one pinned version **at build time** and inlines it. File size is not a concern. | Google Fonts is blocked in mainland China. jsDelivr has been unreliable there since it lost its ICP licence in late 2021. BootCDN/Staticfile are run by the operator behind the 2024 polyfill.io supply-chain attack. Third-party scripts next to internal content are a security risk, and CDN URLs rot. See Appendix C. | Loading from a CDN at read time; letting the user pick per page. |
| D4 | **House theme plus variants.** Default **Ivory** (Anthropic-inspired: ivory / slate / clay / oat / olive, serif headings, generous spacing) plus **Graphite** (neutral engineering) and **Console** (dense dashboard). Each has light and dark. The content changes the layout, not the identity. | A consistent team look helps readers find their way around. | A single fixed theme; a fresh visual design per page. |
| D5 | **Adaptive gates.** Gate 1, the "plan card", is always asked. Further gates appear only when their condition holds. A final revision gate is optional. Gates use the environment's own question tool if there is one, otherwise plain chat with lettered options. | Predictability without slowness. | A fixed full sequence; no questions by default. |
| D6 | **Language is asked every time** in Gate 1: English (default and recommended), Deutsch, 中文. | The team reads all three. | Matching the request language silently; always English. |
| D7 | **Image generation is optional and a matter of judgment.** Use it only if the environment offers it (native tool or bridge skill) and an image adds meaning: concept illustration, mood reference for a sketch, cover. Never use it for precise content (diagrams, flows, charts, UI text); those stay SVG/HTML. Embed images as data URIs. Never block when no image tool exists. | Best fit per element. | Never using images; using them decoratively. |
| D8 | **Architecture A:** one orchestrator plus a reference kit plus a shell template plus a checker. Skill name: `html-it`. | Portable, consistent, one install. | B: router plus specialist skills (install burden, duplicated rules, a fixed mapping). C: one huge `SKILL.md` (always-loaded bulk, no reusable template or checker). |
| D9 | **Form is composed from content traits.** The forms catalog is worked examples, not templates. | Unbounded content types. | A fixed type-to-template mapping. |
| D10 | **Single file is the default.** Multi-part (`index.html` plus a parts folder, zipped, relative links, still offline) is used only past ~20 MB or when separately editable assets are required. Shared or persistent state and live data are out of scope, and the page says so. | Verdict in 0.5 / Task 10. | "Always single file, no exceptions"; "multi-file whenever there are many items". |
| D11 | **No bare references.** Every opaque ID becomes a ref chip that links to a References appendix entry, or is visibly marked unresolved. Jargon is defined at first use and collected in a glossary. | The reader may not know the source. | Leaving IDs as they are. |
| D12 | **Out of scope:** hosting/publishing, Teams paste-safe mode, React/bundler pipelines as the default, committing without the user's explicit yes. | | |

### 0.3 Audience & assumptions

- **Executor:** any capable coding agent with file read/write and a shell. Python 3.9+ is available as `python` (on Windows possibly `py -3`). The shell may be PowerShell or bash; commands below work in both unless noted.
- **Subagents:** if your environment can dispatch subagents, use them for the pressure scenarios (Tasks 1 and 8). If it cannot, run each scenario yourself in a fresh context or session and note that in the results file.
- **Image tool in tests:** scenario s6 *simulates* an image tool (Appendix E.2), so the image-judgement rules can be tested even in environments that have none. Do not call a real image API during tests.
- **Human checkpoint:** Task 9A is a mandatory stop for the user's review. It is the only planned stop besides genuine blockers.
- **Browser:** if your environment has a browser tool, or Playwright for Python is installed (`python -c "import playwright"`), use it in Task 13. Otherwise use the written checklist there.
- **Readers of the output:** software engineers and adjacent roles at a company with teams in Germany and China. They open pages from Teams, email or SharePoint in a desktop or phone browser, sometimes offline or behind a corporate proxy.

### 0.4 Project rules / conventions to honor

- Work on a branch: run `git switch -c feature/html-it` before Task 1. If the branch exists, `git switch feature/html-it`.
- **Do NOT commit, push, or merge** unless the user explicitly asks. When asked, the commit format is `[TASK-ID] <type>: <description>` (Conventional Commits). If the task ID is unknown, ask the user. End commit messages with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` only if you are Claude; otherwise use your own attribution line.
- **Do not modify** anything under `references/` or `research/evidence/`. These are vendored or evidence copies. Adding `research/single-html-verdict.html` is allowed.
- Do not install the skill into any user-level agent directory. Installing is the user's choice; only document it.
- Language of all written skill files: English. Sample pages follow the language stated in their task.
- Responses to the user should match the user's language (English so far).

### 0.5 Formats & reference material

- Content traits and building blocks (the core of form selection) are in **Appendix B, section `forms.md`**.
- Theme tokens are in **Appendix A** (inside `shell.html`).
- The CDN assessment is in **Appendix C**.
- The single-HTML verdict (content for Task 10) is in **Appendix D**.
- Pressure scenarios and fixtures are in **Appendix E**.
- The `writing-skills` checklist translated for this task: the skill `name` uses only letters, numbers and hyphens. The frontmatter has only `name` and `description`. The `description` is third person, starts with "Use when…", describes **only triggering conditions (no workflow summary)**, stays under 1024 characters (ideally under 600), and covers keywords such as HTML, Markdown, share, team, write-up, report, explainer, PR, review, sketch, prototype, one-pager, readable. The skill must be tested RED, then GREEN, then REFACTOR with pressure scenarios.

---

## Task 1: RED: baseline pressure scenarios without the skill

**Files:**
- Create: `tests/html-it/fixtures/s1-review-findings.md`
- Create: `tests/html-it/fixtures/s2-ui-sketches.md`
- Create: `tests/html-it/fixtures/s3-explainer-de.md`
- Create: `tests/html-it/fixtures/s4-status-numbers.md`
- Create: `tests/html-it/fixtures/s5-novel-onboarding.md`
- Create: `tests/html-it/fixtures/s6-concept-with-image-tool.md`
- Create: `tests/html-it/fixtures/s7-screenshot-audit.md`
- Create: `tests/html-it/fixtures/s8-meeting-notes-zh.md`
- Create: `tests/html-it/fixtures/s9-incident-postmortem.md`
- Create: `tests/html-it/fixtures/s10-design-proposal-deck.md`
- Create: `tests/html-it/fixtures/s11-code-walkthrough.md`
- Create: `tests/html-it/fixtures/s12-pr-writeup.md`
- Create: `tests/html-it/fixtures/s13-release-notes-unclear-audience.md`
- Create: `tests/html-it/fixtures/s14-bug-handoff.md`
- Create: `tests/html-it/fixtures/s15-retro-voting.md`
- Create: `tests/html-it/fixtures/s16-clickable-prototype.md`
- Create: `tests/html-it/scenarios.md`
- Create: `tests/html-it/baseline/` (outputs) and `tests/html-it/baseline/RESULTS.md`

**Step 1:** Create the sixteen fixture files with the exact content in Appendix E.1.

**Step 2:** Create `tests/html-it/scenarios.md` with the sixteen scenario prompts (including the simulated image tool for s6 and the folder output for s7) and the rubric R1–R11 from Appendix E.2 and E.3. Add a coverage table: one row per scenario, naming the daily situation it stands for and the rubric items it mainly tests.

**Step 3:** For each scenario, dispatch a fresh subagent, or a fresh session, **without** mentioning the skill. Use the "baseline prompt" in E.2 with `<OUT>` = `tests/html-it/baseline/sN.html` and `<GATES>` = `tests/html-it/baseline/sN-gates.md`. The scenarios are independent: dispatch them in parallel batches (for example four at a time) and keep each agent's final message, because R4 for s3 and s14 ("choices stated in the reply") and s8's channel message may be judged from it.

**Step 4:** Score each output against the rubric (E.3). Use the grep commands in E.3 for R3 and R6. The checker does not exist yet, so judge R1 and R2 by reading the file: search for `http` in `src=`, `<link`, `@import`, `url(`, `fetch(`, and look for bare IDs.

**Step 5:** Write `tests/html-it/baseline/RESULTS.md`: one table row per scenario × rubric item (PASS/FAIL), then the agent's **verbatim** rationalizations or choices that caused each failure. Quote text from its `-gates.md` or its final message.

Expected: most scenarios FAIL R1–R4 (for example Google Fonts or Chart.js from a CDN, a bare `F001`, "I've created…", no plan card). If a scenario passes everything, note it; the skill must still not make it worse.

---

## Task 2: Checker tests first (TDD)

**Files:**
- Create: `tests/html-it/test_check_html.py`

**Step 1:** Write the test file with this exact content:

```python
"""Tests for skills/html-it/scripts/check_html.py (standard library only).

Run: python -m unittest discover -s tests/html-it -v
"""
import os
import sys
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "skills", "html-it", "scripts"))

import check_html  # noqa: E402

HEAD = (
    '<!doctype html><html lang="en"><head><meta charset="utf-8">'
    '<meta name="viewport" content="width=device-width, initial-scale=1">'
    "<title>Login timeout review</title>{extra_head}</head><body>{body}</body></html>"
)


def page(body="", extra_head=""):
    return HEAD.format(body=body, extra_head=extra_head)


def run(html, **kw):
    return check_html.check(html, **kw)


class StructureTests(unittest.TestCase):
    def test_minimal_valid_page_passes(self):
        r = run(page("<main><h1>Review</h1><p>All good.</p></main>"))
        self.assertEqual(r.failures, [], r.failures)

    def test_missing_lang_fails(self):
        html = page("<p>x</p>").replace(' lang="en"', "")
        self.assertTrue(any("lang" in f for f in run(html).failures))

    def test_missing_title_fails(self):
        html = page("<p>x</p>").replace("<title>Login timeout review</title>", "")
        self.assertTrue(any("title" in f for f in run(html).failures))

    def test_missing_doctype_fails(self):
        html = page("<p>x</p>").replace("<!doctype html>", "")
        self.assertTrue(any("doctype" in f for f in run(html).failures))

    def test_img_without_alt_fails(self):
        r = run(page('<img src="data:image/png;base64,AAAA">'))
        self.assertTrue(any("alt" in f for f in r.failures))

    def test_img_with_empty_alt_passes(self):
        r = run(page('<img src="data:image/png;base64,AAAA" alt="">'))
        self.assertEqual(r.failures, [])


class NetworkTests(unittest.TestCase):
    def assertNetworkFail(self, html):
        fails = run(html).failures
        self.assertTrue(any("network" in f for f in fails), fails)

    def test_external_script_fails(self):
        self.assertNetworkFail(page('<script src="https://cdn.jsdelivr.net/npm/x@1/x.js"></script>'))

    def test_protocol_relative_script_fails(self):
        self.assertNetworkFail(page('<script src="//cdnjs.cloudflare.com/x.js"></script>'))

    def test_external_stylesheet_fails(self):
        self.assertNetworkFail(page("", '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter">'))

    def test_css_import_fails(self):
        self.assertNetworkFail(page("", "<style>@import url('https://fonts.googleapis.com/x');</style>"))

    def test_css_url_fails(self):
        self.assertNetworkFail(page('<div style="background:url(https://example.com/a.png)"></div>'))

    def test_fetch_fails(self):
        self.assertNetworkFail(page("<script>fetch('https://api.example.com/data')</script>"))

    def test_external_img_fails(self):
        self.assertNetworkFail(page('<img src="https://example.com/a.png" alt="a">'))

    def test_svg_use_external_fails(self):
        self.assertNetworkFail(page('<svg><use href="https://example.com/s.svg#i"></use></svg>'))

    def test_xhr_open_fails(self):
        self.assertNetworkFail(page("<script>x.open('GET', 'https://api.example.com/d')</script>"))

    def test_window_open_is_allowed(self):
        r = run(page("<script>btn.onclick = () => window.open('https://example.com')</script>"))
        self.assertEqual(r.failures, [])

    def test_runtime_src_assignment_fails(self):
        self.assertNetworkFail(page("<script>s.src = 'https://cdn.jsdelivr.net/npm/x@1/x.js'</script>"))

    def test_runtime_set_attribute_src_fails(self):
        self.assertNetworkFail(page("<script>i.setAttribute('src', 'https://example.com/a.png')</script>"))

    def test_location_href_is_allowed(self):
        r = run(page("<script>go.onclick = () => { location.href = 'https://example.com'; }</script>"))
        self.assertEqual(r.failures, [])

    def test_srcdoc_with_external_font_fails(self):
        sketch = ('&lt;link rel=&quot;stylesheet&quot; href=&quot;https://fonts.googleapis.com/css2?'
                  'family=Inter&quot;&gt;&lt;p&gt;Home&lt;/p&gt;')
        fails = run(page(f'<iframe title="Home sketch" srcdoc="{sketch}"></iframe>')).failures
        self.assertTrue(any("srcdoc" in f and "network" in f for f in fails), fails)

    def test_srcdoc_self_contained_passes(self):
        sketch = "&lt;style&gt;p{color:red}&lt;/style&gt;&lt;p&gt;Home&lt;/p&gt;"
        r = run(page(f'<iframe title="Home sketch" srcdoc="{sketch}"></iframe>'))
        self.assertEqual(r.failures, [])

    def test_clickable_link_is_allowed(self):
        r = run(page('<a href="https://github.com/anthropics/html-effectiveness">gallery</a>'))
        self.assertEqual(r.failures, [])

    def test_data_uri_is_allowed(self):
        r = run(page('<img src="data:image/svg+xml;base64,PHN2Zz4=" alt="icon">'))
        self.assertEqual(r.failures, [])


class ReferenceTests(unittest.TestCase):
    def test_bare_id_without_entry_fails(self):
        r = run(page("<p>See F001 for details.</p>"))
        self.assertTrue(any("F001" in f for f in r.failures), r.failures)

    def test_chip_with_entry_passes(self):
        body = (
            '<p>See <a class="ref" data-ref="F001" href="#ref-F001">'
            '<span class="ref-id">F001</span> login timeout</a>.</p>'
            '<section id="references"><ol><li id="ref-F001"><b>F001</b> Login '
            "timeout finding from the review of PR 42.</li></ol></section>"
        )
        r = run(page(body))
        self.assertEqual(r.failures, [], r.failures)

    def test_chip_without_entry_fails(self):
        body = '<a class="ref" data-ref="F002" href="#ref-F002"><span class="ref-id">F002</span> x</a>'
        r = run(page(body))
        self.assertTrue(any("F002" in f for f in r.failures))

    def test_unresolved_chip_is_warning_not_failure(self):
        body = '<span class="ref" data-ref="ABC-123" data-ref-status="unresolved"><span class="ref-id">ABC-123</span> not found</span>'
        r = run(page(body))
        self.assertEqual(r.failures, [])
        self.assertTrue(any("ABC-123" in w for w in r.warnings))

    def test_bare_mention_of_resolved_id_is_warning(self):
        body = '<p>F001 again.</p><ol><li id="ref-F001">F001 Login timeout.</li></ol>'
        r = run(page(body))
        self.assertEqual(r.failures, [])
        self.assertTrue(any("F001" in w for w in r.warnings))

    def test_id_inside_code_is_ignored(self):
        r = run(page("<p>Run <code>make F001</code> and see <pre>ERR-404</pre></p>"))
        self.assertEqual(r.failures, [])

    def test_compound_ids_are_matched_whole(self):
        fails = run(page("<p>Code BK-2026-0042 was cut in R26.11.</p>")).failures
        self.assertTrue(any("BK-2026-0042" in f for f in fails), fails)
        self.assertTrue(any("R26.11" in f for f in fails), fails)

    def test_compound_id_chip_with_entry_passes(self):
        body = ('<a class="ref" data-ref="BK-2026-0042" href="#ref-BK-2026-0042">'
                '<span class="ref-id">BK-2026-0042</span> booking code</a>'
                '<ol><li id="ref-BK-2026-0042">Example booking confirmation code.</li></ol>')
        self.assertEqual(run(page(body)).failures, [])

    def test_sentence_end_is_not_part_of_id(self):
        fails = run(page("<p>See F001.</p>")).failures
        self.assertTrue(any("bare F001 " in f for f in fails), fails)

    def test_allow_meta_skips_ids(self):
        extra = '<meta name="html-it:allow-ids" content="ISO-8601, ES2020">'
        r = run(page("<p>Dates use ISO-8601 and code targets ES2020.</p>", extra))
        self.assertEqual(r.failures, [])

    def test_allow_argument_skips_ids(self):
        r = run(page("<p>Encoded as H264.</p>"), allow=["H264"])
        self.assertEqual(r.failures, [])


class SizeTests(unittest.TestCase):
    def test_large_file_warns(self):
        r = run(page("<p>x</p>"), size_bytes=25 * 1024 * 1024, max_mb=20)
        self.assertTrue(any("MB" in w for w in r.warnings))


if __name__ == "__main__":
    unittest.main()
```

**Step 2:** Run: `python -m unittest discover -s tests/html-it -v`
Expected: ERROR, `ModuleNotFoundError: No module named 'check_html'`.

---

## Task 3: Implement the checker

**Files:**
- Create: `skills/html-it/scripts/check_html.py`

**Step 1:** Write this exact content:

```python
#!/usr/bin/env python3
"""Check an html-it page against the skill's hard rules.

Usage:
  python check_html.py PAGE.html [PAGE.html ...] [--allow ID,ID] [--max-mb 20]

Fails (exit 1) on: anything that would load from the network when the page is
opened (including inside iframe srcdoc sketches and src/href set from script), a missing doctype/lang/title/charset/viewport, an <img> without alt,
an opaque ID (F001, ABC-123, ...) with no References entry (id="ref-<ID>").
Warns on: unresolved ref chips, bare mentions of resolved IDs, large files.
Standard library only.
"""
from __future__ import annotations

import argparse
import os
import re
import sys
from dataclasses import dataclass, field
from html.parser import HTMLParser

REMOTE = r"(?:https?:|wss?:)?//"
IS_REMOTE = re.compile(r"^\s*" + REMOTE, re.I)
CSS_URL = re.compile(r"url\(\s*['\"]?\s*(" + REMOTE + r"[^'\")\s]+)", re.I)
CSS_IMPORT = re.compile(r"@import\s+(?:url\(\s*)?['\"]?\s*(" + REMOTE + r"[^'\")\s;]+)", re.I)
JS_NET = re.compile(
    r"\b(?:fetch|import|importScripts|EventSource|WebSocket|sendBeacon)\s*\(\s*"
    r"['\"`](" + REMOTE + r"[^'\"`]+)",
    re.I,
)
# XMLHttpRequest.open("GET", url). window.open(url) is navigation and is allowed.
XHR_OPEN = re.compile(
    r"\.open\s*\(\s*['\"](?:GET|POST|PUT|PATCH|DELETE|HEAD)['\"]\s*,\s*['\"`](" + REMOTE + r"[^'\"`]+)",
    re.I,
)
# Runtime loads: el.src = "https://...", el.href = "https://..." (location.href is navigation),
# el.setAttribute("src", "https://...").
JS_ASSIGN = re.compile(
    r"(?<!location)\.(?:src|srcset|href)\s*=\s*['\"`](" + REMOTE + r"[^'\"`]+)"
    r"|setAttribute\(\s*['\"]src['\"]\s*,\s*['\"`](" + REMOTE + r"[^'\"`]+)",
    re.I,
)
# Whole compound IDs: F001, ABC-123, BK-2026-0042, R26.11
ID_PATTERN = re.compile(r"\b[A-Z]{1,6}-?\d{2,6}(?:[-.]\d{1,6})*\b")

VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link",
        "meta", "source", "track", "wbr", "param"}
SKIP_TEXT = {"script", "style", "code", "pre", "kbd", "samp", "head", "svg", "math"}
# tag -> attributes that make the browser fetch something
LOADING_ATTRS = {
    "script": ("src",), "link": ("href",), "img": ("src", "srcset"),
    "source": ("src", "srcset"), "video": ("src", "poster"), "audio": ("src",),
    "iframe": ("src",), "embed": ("src",), "object": ("data",), "track": ("src",),
    "input": ("src",), "image": ("href", "xlink:href"), "use": ("href", "xlink:href"),
    "feimage": ("href", "xlink:href"),
}


@dataclass
class Result:
    failures: list = field(default_factory=list)
    warnings: list = field(default_factory=list)


class _Scanner(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []          # (tag, skips_text)
        self.ids = set()
        self.chips = []          # (ref, status)
        self.bare = []           # IDs seen in visible text outside chips
        self.remote = []         # (where, url)
        self.code_text = []      # script/style bodies for CSS/JS scanning
        self.srcdocs = []        # iframe srcdoc documents, checked recursively for network loads
        self.allow = set()
        self.lang = None
        self.title = ""
        self.has_charset = False
        self.has_viewport = False
        self.img_without_alt = 0
        self._in_title = False
        self._in_raw = None

    def _skipping(self):
        return any(skip for _, skip in self.stack)

    def _attrs(self, tag, attrs):
        a = {k.lower(): (v or "") for k, v in attrs}
        if "id" in a:
            self.ids.add(a["id"])
        if tag == "html":
            self.lang = a.get("lang", "").strip()
        if tag == "meta":
            if "charset" in a or a.get("http-equiv", "").lower() == "content-type":
                self.has_charset = True
            if a.get("name", "").lower() == "viewport":
                self.has_viewport = True
            if a.get("name", "").lower() == "html-it:allow-ids":
                self.allow |= {x.strip() for x in a.get("content", "").split(",") if x.strip()}
        if tag == "img" and "alt" not in a:
            self.img_without_alt += 1
        for attr in LOADING_ATTRS.get(tag, ()):
            value = a.get(attr, "")
            for part in value.split(","):
                if IS_REMOTE.match(part):
                    self.remote.append((f"<{tag} {attr}>", part.strip().split(" ")[0]))
        if "style" in a:
            self.code_text.append(a["style"])
        if tag == "iframe" and a.get("srcdoc"):
            self.srcdocs.append(a["srcdoc"])  # HTMLParser has already unescaped &quot; etc.
        if "data-ref" in a:
            self.chips.append((a["data-ref"].strip(), a.get("data-ref-status", "").strip()))
        return a

    def handle_starttag(self, tag, attrs):
        a = self._attrs(tag, attrs)
        if tag in VOID:
            return
        skips = (tag in SKIP_TEXT or "data-ref" in a or "data-no-ref" in a
                 or a.get("id", "").startswith("ref-"))
        self.stack.append((tag, skips))
        if tag == "title":
            self._in_title = True
        if tag in ("script", "style"):
            self._in_raw = tag

    def handle_startendtag(self, tag, attrs):
        self._attrs(tag, attrs)

    def handle_endtag(self, tag):
        if tag == "title":
            self._in_title = False
        if tag in ("script", "style"):
            self._in_raw = None
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                del self.stack[i:]
                break

    def handle_data(self, data):
        if self._in_title:
            self.title += data
        if self._in_raw:
            self.code_text.append(data)
            return
        if not self._skipping():
            self.bare.extend(ID_PATTERN.findall(data))


NET_RULES = ((CSS_URL, "CSS url()"), (CSS_IMPORT, "CSS @import"), (JS_NET, "script request"),
             (XHR_OPEN, "XMLHttpRequest"), (JS_ASSIGN, "script-set src/href"))


def _network_failures(s: _Scanner, prefix: str = "") -> list:
    out = [f"network: {prefix}{where} loads {url} (inline it or draw it; pages must work offline)"
           for where, url in s.remote]
    code = "\n".join(s.code_text)
    for rx, label in NET_RULES:
        for m in rx.findall(code):
            url = next(g for g in m if g) if isinstance(m, tuple) else m
            out.append(f"network: {prefix}{label} loads {url} (pages must work offline; "
                       "a clickable link belongs in the HTML as <a href>)")
    for doc in s.srcdocs:
        sub = _Scanner()
        sub.feed(doc)
        sub.close()
        out += _network_failures(sub, prefix + "inside iframe srcdoc: ")
    return out


def check(html: str, size_bytes: int = 0, allow=(), max_mb: float = 20) -> Result:
    r = Result()
    s = _Scanner()
    s.feed(html)
    s.close()
    allowed = s.allow | {x.strip() for x in allow}

    if not re.match(r"^\s*(?:<!--.*?-->\s*)*<!doctype html", html, re.I | re.S):
        r.failures.append("structure: missing <!doctype html> at the top")
    if not s.lang:
        r.failures.append('structure: <html> has no lang attribute (for example lang="en")')
    if not s.title.strip():
        r.failures.append("structure: missing or empty <title>")
    if not s.has_charset:
        r.failures.append('structure: missing <meta charset="utf-8">')
    if not s.has_viewport:
        r.failures.append("structure: missing viewport <meta>")
    if s.img_without_alt:
        r.failures.append(f"accessibility: {s.img_without_alt} <img> without alt (use alt=\"\" if decorative)")

    r.failures += _network_failures(s)

    for ref, status in s.chips:
        if status == "unresolved":
            r.warnings.append(f"reference: {ref} is marked unresolved; tell the user")
        elif f"ref-{ref}" not in s.ids:
            r.failures.append(f'reference: chip {ref} has no References entry (add id="ref-{ref}")')
    for ref in sorted(set(s.bare) - allowed):
        if f"ref-{ref}" in s.ids:
            r.warnings.append(f"reference: {ref} appears as plain text; consider a ref chip")
        elif ref not in {c for c, _ in s.chips}:
            r.failures.append(
                f'reference: bare {ref} is never explained (wrap it in a ref chip and add id="ref-{ref}" '
                "to the References section, or allow it if it is not a reference)"
            )

    if size_bytes and size_bytes > max_mb * 1024 * 1024:
        r.warnings.append(f"size: {size_bytes / 1048576:.1f} MB exceeds {max_mb} MB; consider multi-part")
    return r


def main(argv=None) -> int:
    p = argparse.ArgumentParser(description="Check html-it pages.")
    p.add_argument("pages", nargs="+")
    p.add_argument("--allow", default="", help="comma-separated tokens that are not references")
    p.add_argument("--max-mb", type=float, default=20)
    args = p.parse_args(argv)
    allow = [x for x in args.allow.split(",") if x.strip()]
    failed = False
    for path in args.pages:
        if not os.path.isfile(path):
            print(f"FAIL {path}: file not found")
            failed = True
            continue
        with open(path, encoding="utf-8") as f:
            html = f.read()
        size = os.path.getsize(path)
        r = check(html, size_bytes=size, allow=allow, max_mb=args.max_mb)
        for msg in r.failures:
            print(f"FAIL {path}: {msg}")
        for msg in r.warnings:
            print(f"WARN {path}: {msg}")
        status = "FAIL" if r.failures else "PASS"
        print(f"{status} {path} ({size / 1024:.0f} KB, {len(r.failures)} failures, {len(r.warnings)} warnings)")
        failed = failed or bool(r.failures)
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
```

**Step 2:** Run: `python -m unittest discover -s tests/html-it -v`
Expected: all tests PASS. If a test fails, fix the checker (not the test), unless the test contradicts the rules in Section 0. In that case, fix the test and note why in `tests/html-it/NOTES.md`.

**Step 3:** Run it against a baseline output: `python skills/html-it/scripts/check_html.py tests/html-it/baseline/s1.html`
Expected: FAIL lines matching what you scored by hand in Task 1. Add any differences to `baseline/RESULTS.md`.

---

## Task 4: Shell template and theme reference

**Files:**
- Create: `skills/html-it/assets/shell.html` (full content in **Appendix A**)
- Create: `skills/html-it/references/theme.md`

**Step 1:** Write `shell.html` exactly as in Appendix A.

**Step 2:** Run: `python skills/html-it/scripts/check_html.py skills/html-it/assets/shell.html`
Expected: `PASS` (the shell includes one sample ref chip with its References entry).

**Step 3:** Write `references/theme.md` (~120 lines) covering:
- **When to pick each variant:**
  - **Ivory:** default; explainers, proposals, drafts, research, anything read top to bottom.
  - **Graphite:** PR write-ups, code reviews, specs, plans; denser, all sans.
  - **Console:** status reports, dashboards, boards, incident timelines; dense, dark first, tabular numbers.
- **How to switch:** set `data-variant` on `<html>`. Delete unused variant blocks if you like (optional).
- **Three-state theming:** no `data-theme` means follow the OS. `data-theme="light"` or `"dark"` is set by the toggle. Every colour is a token. No literal colour appears in a component rule. `body` always has a token background.
- **Type:** system font stacks only (no web fonts, because of D3), with CJK fallbacks. Running text ≤ ~70 characters per line. `text-wrap: balance` on headings. Tabular numbers in tables.
- **Semantic colours** (`--ok`, `--warn`, `--bad`) are separate from the accent.
- **Things to avoid,** taken from `references/anthropics-frontend-design/SKILL.md`:
  - all-caps eyebrow labels above every heading;
  - `A · B · C` meta strings;
  - `→` appended to links;
  - identical rounded cards with the same shadow everywhere;
  - numbered markers on content that is not a sequence;
  - fade-in-on-scroll for every section.
- **One memorable element per page at most;** keep the rest quiet.
- **Print:** the shell's print CSS expands `<details>`, hides the toolbar, and shows link URLs for external links.

---

## Task 5: Writing and cross-reference references

**Files:**
- Create: `skills/html-it/references/writing.md`
- Create: `skills/html-it/references/cross-references.md`

**Step 1: `writing.md`** (~120 lines). Required content:
1. **The reader was not in the conversation.** Write for a teammate who opens this cold in three months.
2. **Open with the conclusion:** the first paragraph says what this is, the outcome or recommendation, and what the reader should do. Then the evidence.
3. **Full sentences.** Bullets are for real lists (parallel items), not for chopping an argument into fragments. Avoid paragraphs that are only bold labels.
4. **Define every term** that a new teammate might not know at first use (`<dfn>` plus a glossary entry). Expand acronyms on first use.
5. **Say why,** not only what.
6. **Absolute dates** ("3 November 2026", or "2026-11-03" in tables), never "yesterday" or "last sprint". Real names of systems and files, not "the service".
7. **Numbers carry units and a comparison** ("p95 latency 840 ms, up from 310 ms").
8. **Voice:** write about the subject, not about the agent. Active voice. Plain verbs. Sentence case headings.
9. **Agent-speak blacklist.** Never write these in a page. (This list is also used by the R3 grep.)
   - "I've / I have / I'll / Let me / We'll now"
   - "As discussed / as mentioned above / as per"
   - "leverage, robust, seamless, delve, comprehensive, cutting-edge, game-changer, streamline"
   - "It's worth noting / Note that / Importantly,"
   - "In this document we will"
   - status emoji (✅ ❌ 🚀 ✨ 🎉 ⚠️ used as bullets)
   - "TL;DR:"
   - "Summary:" as the first word of a paragraph
   - "Here's a breakdown"
   - Ending sentences with "…and more!"

   Use a real status pill component instead of emoji.
10. **Language:** write natively in the language chosen in Gate 1, not translated word for word.
    - **German:** formal "Sie" only if the team convention requires it; otherwise neutral impersonal style.
    - **Chinese:** Simplified Chinese, full-width punctuation in prose, spaces between Chinese and Latin words are optional but must be consistent.
    - Code, identifiers and quoted source text stay unchanged.
11. **Self-test before delivery:** "Could a new teammate act on this page without asking anyone?" "Is every sentence about the subject?" "Would I say this sentence out loud to a colleague?"
12. Include one short before/after example: an agent-style paragraph rewritten as a human one.

**Step 2: `cross-references.md`** (~110 lines). Required content:
- **What counts as an opaque reference:**
  - finding or requirement indexes (`F001`, `R-12`, `REQ-7`);
  - ticket keys (`ABC-123`);
  - PR and issue numbers;
  - commit SHAs;
  - file paths and line numbers;
  - internal acronyms and code names;
  - "see section 4.2" pointers to other documents;
  - people's handles.
- **Finding them:** scan the source content. The checker's default pattern is `\b[A-Z]{1,6}-?\d{2,6}\b`; SHAs and paths need to be checked by eye.
- **Resolving them, in this order:**
  1. the content itself;
  2. files or links the content points to, which you then read;
  3. the repository (search for the ID);
  4. tools available to you (issue trackers, PR APIs) **read-only**.

  Never invent an explanation.
- **Rendering a resolved reference:**
  - a chip `<a class="ref" data-ref="F001" href="#ref-F001"><span class="ref-id">F001</span> short plain-language name</a>`;
  - plus one entry in the References appendix: `<li id="ref-F001">`, containing the ID, a one- to two-sentence explanation, where it comes from (file path, ticket, URL as a clickable link) and, if useful, the quoted original line.

  The shell's script shows that explanation as a popover on hover, focus or tap. Put the one- to two-sentence explanation in a `<span class="ref-summary">`, which is what the popover reads; without it, the popover shows the whole entry.
- **Labels inside SVG diagrams are not scanned** by the checker. Label diagram boxes with plain-language names, or with an ID that also appears as a chip in the prose next to the diagram.
- **Rendering an unresolved reference:** `<span class="ref" data-ref="X" data-ref-status="unresolved"><span class="ref-id">X</span> not found in the provided material</span>`. Also list it in the References appendix under "Could not be resolved". Gate 2 asks the user what to do.
- **Later mentions:** after the first chip, later mentions may be chips again (preferred in long pages) or plain text if the chip is visible on the same screen.
- **Not references:** standards and version names (`ISO-8601`, `ES2020`, `H264`, `UTF-8`). Allow them with `<meta name="html-it:allow-ids" content="ISO-8601, ES2020">`.
- **Glossary:** jargon gets `<dfn>` at first use plus a Glossary section (term, one-sentence definition). Popovers work the same way (`data-gloss`).
- **Code:** IDs inside `<code>` or `<pre>` are not scanned, but if the surrounding prose relies on them, explain them in prose.

---

## Task 6: Forms, components, media and multi-part references

**Files:**
- Create: `skills/html-it/references/forms.md` (content spec in **Appendix B**)
- Create: `skills/html-it/references/components.md`
- Create: `skills/html-it/references/media.md`
- Create: `skills/html-it/references/multi-part.md`

**Step 1:** Write `forms.md` from Appendix B (trait table plus worked combinations).

**Step 2:** Write `components.md`. For each component, give a short purpose line, when to use it, and a copy-ready snippet that uses only shell tokens and classes. Snippets must work without JavaScript; JS only enhances them.
- **ref chip + References entry:** as in `cross-references.md`.
- **glossary term:** `<dfn data-gloss="…">`.
- **callouts:** `<aside class="callout" data-kind="note|warn|decision">`.
- **status pill:** `<span class="pill" data-state="ok|warn|bad|info">On track</span>`.
- **tabs:** a `role="tablist"` with buttons and panels. Without JS all panels are visible with headings; with JS one is shown at a time and arrow keys move between tabs.
- **disclosure:** `<details><summary>`.
- **annotated diff:** a `<pre class="diff">` with pre-rendered `<span class="add">`, `<span class="del">`, `<span class="ctx">` lines and `<span class="note" data-for="L12">` margin notes. **The agent writes the colour spans; no highlighting library.**
- **code block with pre-rendered highlighting:** classes `.tok-k` (keyword), `.tok-s` (string), `.tok-c` (comment), `.tok-n` (number), `.tok-f` (function), coloured by tokens, with a copy button from the shell.
- **file tree:** a nested `<ul class="tree">` with change markers.
- **timeline:** an `<ol class="timeline">` with `<time>`.
- **stepper:** numbered steps, previous/next, all steps readable when printed.
- **comparison matrix:** a `<table class="matrix">` with sortable headers. Sorting is optional JS; the table is still readable without it.
- **KPI row:** only when the numbers are the point.
- **inline SVG chart (bar and line):** drawn to scale, with labels from tokens.
- **inline SVG diagram skeleton:** boxes plus arrows with `marker-end`, colours from `currentColor` and tokens, `role="img"` with a `<title>`.
- **gallery board with isolated sketches:** a grid of `<figure>`, each containing an `<iframe class="sketch" srcdoc="…" title="…" loading="lazy">`. Use `sandbox="allow-scripts"` only if the sketch needs JS. Inside `srcdoc`, escape `&` as `&amp;` and `"` as `&quot;`. Each sketch is its own tiny HTML document, so its CSS cannot leak. Filter chips by tag. A "compare" mode shows two side by side.
- **clickable prototype:** screens as `<section data-screen="id">`, hotspots `<button data-go="id">`, a small state machine (`show(id)`), a Reset button, a notes panel, and `location.hash` for deep links.
- **deck mode:** `<section class="slide">` elements. JS adds keyboard navigation (←/→, Home/End), a slide counter, and `N` to toggle speaker notes (`<aside class="notes">`). Without JS, or when printed, the slides are a scrollable document.
- **small tool:** inputs with labels, output that updates on `input`, and a sensible example state at load.

**Step 3:** Write `media.md` (~80 lines):
- **SVG first:** diagrams, flows, architecture, state machines, charts, icons. Draw them by hand in inline SVG with token colours.
- **No Mermaid, PlantUML, highlight.js, Chart.js or KaTeX by default.** The agent is the renderer.
- **When a library is truly needed** (for example a large interactive chart with thousands of points, or maths typesetting):
  - download one pinned version **at build time** (cdnjs or the npm registry; inside mainland China use the npmmirror registry);
  - inline the minified file into a `<script>` with a comment naming the library, version, licence and source URL;
  - check that the licence allows redistribution;
  - mention it in the delivery message.
- **Raster images:** the user's own screenshots get compressed (WebP or JPEG, max ~1600 px wide where possible) and embedded as data URIs with meaningful alt text.
- **Image generation (D7):** first check what your environment offers: a native image tool, or a skill or bridge such as one that calls an image API. Use it only when the image adds meaning a reader would miss without it: concept illustration, mood reference for a UI sketch, a cover image for an explainer, an illustrative scene for teaching material. **Never** use it for anything that must be precise or editable: diagrams, flows, charts, UI text, data. Embed the result as a data URI. Write alt text that states what the image shows. If no tool exists, use SVG or leave the image out, and do not mention its absence in the page.
- When Gate 1 or a conditional gate offers an image, state its purpose in one line.

**Step 4:** Write `multi-part.md` (~60 lines). One file is the default. Switch to multi-part only when:
- the estimated size passes ~20 MB (mostly raster media or video); or
- the user needs separately editable assets.

The layout is a folder `<name>/` containing `index.html` (the hub: overview, table of contents, search over titles) plus `parts/*.html`, each passing the checker. Use relative links only, then zip the folder for sharing. Shared or persistent state (`localStorage` lives only in one browser) and live data are out of scope: write that limit in the page if the content implies it. Ask the conditional gate before switching.

---

## Task 7: SKILL.md (GREEN)

**Files:**
- Create: `skills/html-it/SKILL.md`

**Step 1:** Write `SKILL.md` from the draft in **Appendix F**. Adjust its "Common mistakes" table so every baseline failure from `tests/html-it/baseline/RESULTS.md` is addressed by at least one rule or row, quoting the rationalization where it helps. Do not add rules for failures you did not observe, beyond the hard rules already in the draft.

**Step 2: ASO checks.** Run each and confirm:
- `python -c "import re,sys;t=open('skills/html-it/SKILL.md',encoding='utf-8').read();fm=t.split('---')[1];n=re.search(r'^name:\s*(.+)$',fm,re.M).group(1).strip();d=re.search(r'^description:\s*(.+)$',fm,re.M).group(1).strip();print(n, bool(re.fullmatch(r'[a-z0-9-]{1,64}',n)));print(len(d), d.startswith('Use when'))"`
  Expected: `html-it True`, then a number under 1024 and `True`.
- The frontmatter contains only `name` and `description`.
- The description is third person and describes triggers only: it contains no "plan card", "gate", "checker" or step words.
- Keywords present in the description: HTML, Markdown, share, team, write-up, report, explainer, pull request, review, sketch, prototype, one-pager, readable.

**Step 3:** Run `python -c "print(len(open('skills/html-it/SKILL.md',encoding='utf-8').read().split()))"`. Target: under 1,600 words. Move detail into references if it is over.

---

## Task 8: VERIFY GREEN: rerun scenarios with the skill

**Files:**
- Create: `tests/html-it/green/sN.html`, `sN-gates.md`, `RESULTS.md`

**Step 1:** For each scenario, dispatch a fresh subagent (or session) with the **"with-skill prompt"** in Appendix E.2, with `<OUT>` = `tests/html-it/green/sN.html`.

**Step 2:** Run the checker on every page, including the s7 hub and parts:
- bash: `python skills/html-it/scripts/check_html.py tests/html-it/green/*.html tests/html-it/green/s7/*.html tests/html-it/green/s7/parts/*.html`
- PowerShell: `Get-ChildItem tests/html-it/green -Recurse -Filter *.html | % { python skills/html-it/scripts/check_html.py $_.FullName }`

Expected: every file PASSES. Warnings for unresolved references, such as s1's `review-notes.md`, are expected.

**Step 3:** Score R1–R11 per scenario. Record the results in `green/RESULTS.md` next to the baseline scores.
Expected: all R items PASS. For R4, R5, R7, R9, R10 and R11, write one sentence per scenario explaining the verdict.

---

## Task 9: REFACTOR: close loopholes

**Step 1:** For every rubric item that still fails, quote the agent's rationalization in `green/RESULTS.md`, then add an explicit counter to `SKILL.md` (Common mistakes / Red flags) or to the relevant reference.

**Step 2:** Rerun only the failing scenarios (Task 8 Steps 1–3). Repeat until all items pass in two consecutive runs.

**Step 3:** Run the unit tests again: `python -m unittest discover -s tests/html-it -v`. Expected: all PASS.

---

## Task 9A: Human review checkpoint (MANDATORY STOP)

The agent's own rubric scores are not enough to call the skill done. A person must look at real output before the skill is used for the verdict page and the samples.

**Files:**
- Create: `tests/html-it/REVIEW.md`

**Step 1:** Write `tests/html-it/REVIEW.md` containing:
- **one table:** scenario × R1–R11, with the final GREEN scores;
- **the four outputs proposed for review, with their absolute paths:**
  - `green/s1.html` (review findings: references and writing);
  - `green/s2.html` (sketch board: form choice);
  - `green/s9.html` (postmortem: a page the whole team and management read);
  - the scenario with the closest call in scoring among s3 (German), s6 (images), s8 (Chinese) and s15 (honest limits);
- **for each output, what to look at:** does it read like a careful colleague wrote it? Does the form suit the content? Can you follow every reference? Is the theme right in light and dark?
- **a short list of the excuses closed during REFACTOR.**

**Step 2:** **Stop and ask the user** via the question channel, giving the four paths: "Please review these outputs. Approve, or tell me what is wrong." Options: "Approved, continue", "Changes needed (I'll describe them)", "Show me other scenarios". Do not continue past this step without the user's explicit approval. This holds even if the rest of the plan is being executed autonomously.

**Step 3:**
- **If the user asks for changes:** record each point in `REVIEW.md` as a new failure. Fix it in `SKILL.md` or the references, then rerun the affected scenarios (Task 8 Steps 1–3), and keep two consecutive green runs for them. Then return to Step 2.
- **If the user approves:** record "Approved by the user on <date>" in `REVIEW.md` and continue to Task 10.

---

## Task 10: Research verdict page

**Files:**
- Create: `research/single-html-verdict.html`

**Step 1:** Apply the skill yourself (read `SKILL.md` and follow it). Gate 1: you are building this for the repository, so take these answers and list them at the top of your report to the user:
- Form: research verdict (decision + explainer)
- Theme: Ivory
- Language: English
- Depth: Full

**Step 2:** Content: **Appendix D**. Required elements:
- the verdict first;
- a decision diagram (SVG) for "single file vs multi-part";
- a table of content kinds with how one file handles each;
- the limits with numbers;
- the CDN/offline section (summary of Appendix C);
- how the skill applies the verdict;
- sources (links to the files in `references/` and the URLs in Appendix D, as clickable `<a>` links);
- a glossary.

**Step 3:** Run `python skills/html-it/scripts/check_html.py research/single-html-verdict.html`. Expected: PASS.

---

## Task 11: Sample pages

**Files:**
- Create: `samples/pr-writeup.html`: Graphite, English. Content: the pull request that adds this skill, built from the real changes on this branch (`git status`, `git diff --stat main`).
  - **Required elements:** summary, why, file tree of the changes, annotated excerpts of 2–3 key files (pre-rendered highlighting), test evidence (the real unit-test output and checker output pasted in), risks, how to review, and References chips for decisions `D1`…`D12` (each resolved to the table in Section 0.2 of this plan).
- Create: `samples/cdn-assessment-zh.html`: Ivory, **Simplified Chinese**. Content: Appendix C as a knowledge explainer.
  - **Required elements:** conclusion first, a comparison table of CDNs, a "what happens when the page opens" SVG flow (with CDN vs offline), the decision, a glossary (ICP 备案, CDN, 供应链攻击, data URI).
- Create: `samples/theme-sketch-board.html`: Console, English. A UI sketch board.
  - **Required elements:** three isolated sketches in `iframe srcdoc`, each the same small "PR summary" card rendered in Ivory, Graphite and Console; light/dark toggle per sketch; filter chips; compare-two mode; annotations under each.
- Create: `samples/research-options-deck.html`: Ivory, English. A keyboard deck from the 10-option comparison table in `research/report.md` (section "一览表" and the per-option details), translated into English.
  - **Required elements:** title slide, one slide per option (what it is, fit for single-file sharing, verdict pill), a summary matrix slide, speaker notes, and print-as-document fallback.

**Step 1:** For each sample, follow `SKILL.md`, taking the stated form, theme and language as the Gate 1 answers. Build `pr-writeup.html` **last, after Task 12 (README)**, so that its file tree and test evidence describe the finished change. List `samples/pr-writeup.html` itself in the file tree as "this page".

**Step 2:** Run `python skills/html-it/scripts/check_html.py samples/pr-writeup.html samples/cdn-assessment-zh.html samples/theme-sketch-board.html samples/research-options-deck.html`. Expected: 4 × PASS.

**Step 3:** Check the four pages look clearly different in form, not just in colour. If two look alike, revise one.

---

## Task 12: README update

**Files:**
- Modify: `README.md`

**Step 1:** Rewrite the opening and the "What is in each folder" section:
- This repo now contains the skill (`skills/html-it/`), its tests (`tests/html-it/`), the verdict page and the samples.
- Remove the sentence "It does not contain a new skill."
- Replace the Grok-Bot-only framing with: the skill is agent-agnostic.

**Step 2:** Add an "Install" section. **Verify each agent's current skill location in its official docs before writing it. Do not guess.** If you cannot verify one, write the generic method for that agent and say "check your agent's documentation for its skills folder".
- Claude Code: personal `~/.claude/skills/html-it/`, or project `.claude/skills/html-it/`.
- Codex: its skills folder per current docs, or reference `SKILL.md` from `AGENTS.md`.
- Cursor: its skills or rules mechanism per current docs.
- Generic: copy the folder anywhere and tell the agent "Read `skills/html-it/SKILL.md` and follow it."

**Step 3:** Add a "Using it" section with three example requests, for example "Turn this PR into an HTML page for the team", plus how to run the checker.

**Step 4:** Update "Recommendation" and "Suggested next steps" so they reflect the built skill. Keep the history and the open questions.

---

## Task 13: Render check (offline, light/dark, wide/narrow)

**Files:**
- Create (optional, only if Playwright is available): `tests/html-it/render_check.py`

**Step 1 (Playwright available):** Write this script:

```python
"""Render pages offline at two widths in light and dark; report blocked requests,
console errors and horizontal overflow; save screenshots next to this script.
Usage: python tests/html-it/render_check.py PAGE.html [...]
"""
import pathlib
import sys

from playwright.sync_api import sync_playwright

OUT = pathlib.Path(__file__).parent / "screens"
LOCAL = ("file:", "data:", "blob:", "about:")


def check_page(browser, path):
    problems = []
    for scheme in ("light", "dark"):
        for width in (1280, 390):
            ctx = browser.new_context(viewport={"width": width, "height": 900}, color_scheme=scheme)
            blocked, errors = [], []

            def route(r, blocked=blocked):
                if r.request.url.startswith(LOCAL):
                    r.continue_()
                else:
                    blocked.append(r.request.url)
                    r.abort()

            ctx.route("**/*", route)
            page = ctx.new_page()
            page.on("pageerror", lambda e, errors=errors: errors.append(str(e)))
            page.on("console", lambda m, errors=errors: errors.append(m.text) if m.type == "error" else None)
            page.goto(pathlib.Path(path).resolve().as_uri())
            page.wait_for_timeout(400)
            overflow = page.evaluate("document.documentElement.scrollWidth > window.innerWidth + 1")
            OUT.mkdir(exist_ok=True)
            page.screenshot(path=str(OUT / f"{pathlib.Path(path).stem}-{scheme}-{width}.png"), full_page=False)
            tag = f"{path} [{scheme} {width}px]"
            problems += [f"{tag} blocked network request: {u}" for u in blocked]
            problems += [f"{tag} console error: {e}" for e in errors]
            if overflow:
                problems.append(f"{tag} horizontal overflow")
            ctx.close()
    return problems


def main(paths):
    with sync_playwright() as p:
        browser = p.chromium.launch()
        problems = [x for path in paths for x in check_page(browser, path)]
        browser.close()
    for x in problems:
        print("FAIL", x)
    print("PASS" if not problems else f"{len(problems)} problems")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
```

Run: `python tests/html-it/render_check.py research/single-html-verdict.html samples/pr-writeup.html samples/cdn-assessment-zh.html samples/theme-sketch-board.html samples/research-options-deck.html skills/html-it/assets/shell.html`
Expected: `PASS`. Look at every screenshot in `tests/html-it/screens/` and fix any of these: clipped or overlapping text, unreadable contrast in dark mode, empty areas at load, broken Chinese glyphs. Add `tests/html-it/screens/` to `.gitignore`.

**Step 1 (alternative, browser tool but no Playwright):** Open each page from `file://`. Check at desktop and ~390 px widths, light and dark. Confirm in the network panel that there are zero requests besides the file itself. Check the console for errors. Exercise the theme toggle, the tabs, the deck keys, the gallery filters and compare mode, and the ref popovers.

**Step 1 (no browser at all):** State in your report that no visual check was possible. List what the checker covered.

---

## Acceptance / Verification Summary

All must be true:

- [ ] `python -m unittest discover -s tests/html-it -v`: all tests pass.
- [ ] `skills/html-it/` contains `SKILL.md`, `references/{forms,components,writing,cross-references,theme,media,multi-part}.md`, `assets/shell.html`, `scripts/check_html.py`.
- [ ] `SKILL.md` frontmatter: `name: html-it`; the description starts with "Use when", is under 1024 characters, third person, triggers only. `SKILL.md` is under 1,600 words.
- [ ] `tests/html-it/baseline/RESULTS.md` records RED failures with verbatim rationalizations. `green/RESULTS.md` shows all sixteen scenarios (s1–s16) passing R1–R11 in two consecutive runs.
- [ ] `tests/html-it/REVIEW.md` records the user's explicit approval at the Task 9A checkpoint (and any review feedback that was fixed).
- [ ] The checker passes on `assets/shell.html`, `research/single-html-verdict.html`, and all four `samples/*.html`.
- [ ] The render check (or the documented alternative) shows zero network requests, no console errors, and no horizontal overflow at 1280/390 px in light and dark.
- [ ] The four samples are visibly different forms: PR write-up, Chinese explainer, sketch board with isolated iframes, keyboard deck.
- [ ] No bare opaque IDs in any page. Every ref chip resolves to a References entry, or is marked unresolved and reported.
- [ ] No agent-speak blacklist hits in any page (R3 grep is clean).
- [ ] `README.md` describes the skill, verified install notes, usage, and the checker.
- [ ] Nothing under `references/` or `research/evidence/` changed (`git status` shows no modifications there).
- [ ] Nothing committed. The final report lists the changed files and a proposed commit message `[TASK-ID] feat: add html-it skill, verdict page and samples` (ask the user for the task ID).

---

## Appendix A: `skills/html-it/assets/shell.html`

Write this file exactly. Agents copy it, set `lang`, `data-variant`, `<title>` and the header, then replace the `<main>` content.

```html
<!doctype html>
<html lang="en" data-variant="ivory">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="generator" content="html-it">
<title>Page name</title>
<style>
/* Layout: one reading column (max ~72ch) with an optional sticky table of contents on wide screens. */
/* ---------- Tokens: Ivory (default) ---------- */
:root {
  --bg: #FAF9F5; --surface: #FFFFFF; --surface-2: #F0EEE6; --fg: #141413; --muted: #5E5D59;
  --line: #E3DACC; --accent: #D97757; --accent-ink: #A9502F; --ok: #5E7A3E; --warn: #A86A12; --bad: #B03A2E;
  --ok-bg: #EEF2E6; --warn-bg: #F7EEDC; --bad-bg: #F6E3DF; --code-bg: #F3F1EA;
  --serif: ui-serif, "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, "Noto Serif CJK SC", "Source Han Serif SC", "Songti SC", serif;
  --sans: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif;
  --mono: ui-monospace, "SF Mono", "Cascadia Code", Consolas, Menlo, monospace;
  --display: var(--serif); --body: var(--sans);
  --measure: 72ch; --radius: 6px; --space: 1rem;
  color-scheme: light;
}
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {
  --bg: #1A1918; --surface: #232220; --surface-2: #2C2A27; --fg: #F0EEE6; --muted: #A8A49B;
  --line: #3A3733; --accent: #E08A6C; --accent-ink: #EBA88E; --ok: #A3B887; --warn: #DDAA55; --bad: #EC8A7C;
  --ok-bg: #263020; --warn-bg: #352A17; --bad-bg: #3A221E; --code-bg: #262422; color-scheme: dark; } }
:root[data-theme="dark"] {
  --bg: #1A1918; --surface: #232220; --surface-2: #2C2A27; --fg: #F0EEE6; --muted: #A8A49B;
  --line: #3A3733; --accent: #E08A6C; --accent-ink: #EBA88E; --ok: #A3B887; --warn: #DDAA55; --bad: #EC8A7C;
  --ok-bg: #263020; --warn-bg: #352A17; --bad-bg: #3A221E; --code-bg: #262422; color-scheme: dark; }

/* ---------- Graphite ---------- */
:root[data-variant="graphite"] {
  --bg: #F7F8FA; --surface: #FFFFFF; --surface-2: #EEF1F5; --fg: #16191F; --muted: #596170;
  --line: #DCE1E8; --accent: #2F6FEB; --accent-ink: #1F55C0; --ok: #23784A; --warn: #9A6410; --bad: #BE2F2F;
  --ok-bg: #E4F3EA; --warn-bg: #F8EFDD; --bad-bg: #FBE6E6; --code-bg: #F1F3F6;
  --display: var(--sans); --measure: 80ch; --radius: 4px; }
@media (prefers-color-scheme: dark) { :root[data-variant="graphite"]:not([data-theme="light"]) {
  --bg: #111418; --surface: #181C22; --surface-2: #20252D; --fg: #E6E9EF; --muted: #9AA3B2;
  --line: #2C323C; --accent: #6EA0FF; --accent-ink: #94B9FF; --ok: #5CC08A; --warn: #E0A84A; --bad: #F07272;
  --ok-bg: #16291F; --warn-bg: #2E2414; --bad-bg: #331A1A; --code-bg: #1A1F26; color-scheme: dark; } }
:root[data-variant="graphite"][data-theme="dark"] {
  --bg: #111418; --surface: #181C22; --surface-2: #20252D; --fg: #E6E9EF; --muted: #9AA3B2;
  --line: #2C323C; --accent: #6EA0FF; --accent-ink: #94B9FF; --ok: #5CC08A; --warn: #E0A84A; --bad: #F07272;
  --ok-bg: #16291F; --warn-bg: #2E2414; --bad-bg: #331A1A; --code-bg: #1A1F26; color-scheme: dark; }

/* ---------- Console (dark first; light only when chosen) ---------- */
:root[data-variant="console"] {
  --bg: #0F1215; --surface: #161A1F; --surface-2: #1D232A; --fg: #DCE3EA; --muted: #8B96A3;
  --line: #2A3139; --accent: #4FB3A9; --accent-ink: #7FD0C7; --ok: #5FC27E; --warn: #E3B341; --bad: #F2706B;
  --ok-bg: #15281C; --warn-bg: #2E2611; --bad-bg: #33191A; --code-bg: #12161A;
  --display: var(--sans); --measure: 96ch; --radius: 3px; color-scheme: dark; }
:root[data-variant="console"][data-theme="light"] {
  --bg: #F4F6F7; --surface: #FFFFFF; --surface-2: #E9EDF0; --fg: #12171C; --muted: #56616C;
  --line: #D5DCE2; --accent: #1F8077; --accent-ink: #176259; --ok: #23784A; --warn: #8F6200; --bad: #B8312C;
  --ok-bg: #E4F3EA; --warn-bg: #F6EFD8; --bad-bg: #FBE4E3; --code-bg: #EEF1F3; color-scheme: light; }

/* ---------- Base ---------- */
*, *::before, *::after { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
body { margin: 0; background: var(--bg); color: var(--fg); font: 16px/1.6 var(--body);
  padding-block: 0 3rem; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
:root[data-variant="console"] body { font-size: 14px; line-height: 1.5; }
h1, h2, h3, h4 { font-family: var(--display); line-height: 1.25; text-wrap: balance; margin: 2em 0 .5em; }
h1 { font-size: clamp(1.8rem, 1.2rem + 2.4vw, 2.6rem); margin-top: .4em; font-weight: 600; }
h2 { font-size: 1.5rem; font-weight: 600; } h3 { font-size: 1.15rem; font-weight: 600; }
p, ul, ol, dl, table, figure, pre, details, aside { margin: 0 0 var(--space); }
a { color: var(--accent-ink); text-underline-offset: 2px; }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; border-radius: 2px; }
code, pre, kbd, samp { font-family: var(--mono); font-size: .9em; }
code { background: var(--code-bg); padding: .1em .3em; border-radius: 3px; }
pre { background: var(--code-bg); padding: .9rem 1rem; border-radius: var(--radius); overflow-x: auto; line-height: 1.5; position: relative; }
pre code { background: none; padding: 0; }
img, svg, video, iframe { max-width: 100%; }
table { border-collapse: collapse; width: 100%; font-variant-numeric: tabular-nums; }
th, td { text-align: left; padding: .5rem .6rem; border-bottom: 1px solid var(--line); vertical-align: top; }
th { font-weight: 600; color: var(--muted); }
.table-wrap { overflow-x: auto; }
hr { border: 0; border-top: 1px solid var(--line); margin: 2rem 0; }

/* ---------- Page frame ---------- */
.page { max-width: calc(var(--measure) + 18rem); margin: 0 auto; display: grid; grid-template-columns: minmax(0, 1fr); gap: 2.5rem; }
@media (min-width: 1100px) { .page.has-toc { grid-template-columns: 14rem minmax(0, var(--measure)); justify-content: center; } }
.page > main { min-width: 0; max-width: var(--measure); }
.topbar { display: flex; justify-content: space-between; align-items: center; gap: 1rem; padding-block: .8rem; color: var(--muted); font-size: .85rem; }
.topbar button { font: inherit; color: var(--fg); background: var(--surface-2); border: 1px solid var(--line); border-radius: var(--radius); padding: .3rem .7rem; cursor: pointer; }
.lede { font-size: 1.15rem; color: var(--fg); }
.meta { color: var(--muted); font-size: .9rem; }
nav.toc { position: sticky; top: 1rem; align-self: start; font-size: .9rem; display: none; }
@media (min-width: 1100px) { nav.toc { display: block; } }
nav.toc ol { list-style: none; padding: 0; margin: 0; } nav.toc li { margin: .3rem 0; }
nav.toc li.h3 { padding-left: .9rem; font-size: .85rem; }
nav.toc a { color: var(--muted); text-decoration: none; } nav.toc a:hover, nav.toc a[aria-current="true"] { color: var(--fg); }
footer.page-foot { max-width: var(--measure); margin: 3rem auto 0; color: var(--muted); font-size: .85rem; border-top: 1px solid var(--line); padding-top: 1rem; }

/* ---------- Components used by the shell ---------- */
.ref { display: inline-flex; align-items: baseline; gap: .35em; text-decoration: none; color: var(--fg); border-bottom: 1px dotted var(--accent); position: relative; }
.ref-id { font-family: var(--mono); font-size: .8em; background: var(--surface-2); border: 1px solid var(--line); border-radius: 3px; padding: 0 .3em; color: var(--accent-ink); }
.ref[data-ref-status="unresolved"] { border-bottom-color: var(--bad); }
.ref[data-ref-status="unresolved"] .ref-id { color: var(--bad); background: var(--bad-bg); }
.pop { position: absolute; z-index: 20; max-width: min(24rem, 90vw); background: var(--surface); color: var(--fg); border: 1px solid var(--line); border-radius: var(--radius); padding: .6rem .8rem; font-size: .88rem; line-height: 1.45; box-shadow: 0 6px 24px rgb(0 0 0 / .18); }
dfn { font-style: normal; border-bottom: 1px dashed var(--muted); cursor: help; }
.callout { border-left: 3px solid var(--accent); background: var(--surface-2); padding: .8rem 1rem; border-radius: 0 var(--radius) var(--radius) 0; }
.callout[data-kind="warn"] { border-color: var(--warn); background: var(--warn-bg); }
.callout[data-kind="decision"] { border-color: var(--ok); background: var(--ok-bg); }
.pill { display: inline-block; font-size: .8rem; font-weight: 600; padding: .1rem .55rem; border-radius: 999px; background: var(--surface-2); color: var(--fg); }
.pill[data-state="ok"] { background: var(--ok-bg); color: var(--ok); }
.pill[data-state="warn"] { background: var(--warn-bg); color: var(--warn); }
.pill[data-state="bad"] { background: var(--bad-bg); color: var(--bad); }
.copy-btn { position: absolute; top: .4rem; right: .4rem; font: .75rem var(--sans); color: var(--muted); background: var(--surface); border: 1px solid var(--line); border-radius: 4px; padding: .15rem .5rem; cursor: pointer; }
.references li, .glossary dt { scroll-margin-top: 1rem; }
.references li:target { background: var(--warn-bg); }

@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; } }
@media print {
  .topbar, nav.toc, .copy-btn { display: none !important; }
  body { background: #fff; color: #000; }
  details > *:not(summary) { display: block !important; }
  a[href^="http"]::after { content: " (" attr(href) ")"; font-size: .8em; color: #555; }
  pre { white-space: pre-wrap; }
}
</style>
</head>
<body>
<div class="topbar">
  <span>Team note</span>
  <button type="button" id="theme-toggle" aria-label="Switch colour theme">Theme: system</button>
</div>
<div class="page has-toc">
  <nav class="toc" aria-label="On this page"><ol id="toc-list"></ol></nav>
  <main id="content">
    <h1>Page name</h1>
    <p class="lede">State the conclusion here in one or two sentences: what this is and what the reader should do.</p>
    <p class="meta">Prepared 2026-11-03 for the platform team. Source: the review of <a class="ref" data-ref="PR-42" href="#ref-PR-42"><span class="ref-id">PR-42</span> login timeout fix</a>.</p>

    <h2 id="details">Details</h2>
    <p>Replace this section with the composed content.</p>

    <h2 id="references">References</h2>
    <ol class="references">
      <li id="ref-PR-42"><b>PR-42</b> <span class="ref-summary">Example entry: the pull request that fixes the login timeout. Replace with real references.</span></li>
    </ol>
  </main>
</div>
<footer class="page-foot">Made with the html-it skill. Opens offline; no network access needed.</footer>
<script>
(() => {
  // Theme: system -> light -> dark, remembered per reader when storage is available.
  const root = document.documentElement, btn = document.getElementById('theme-toggle');
  const order = ['system', 'light', 'dark'];
  const read = () => { try { return localStorage.getItem('html-it-theme') || 'system'; } catch { return 'system'; } };
  const apply = (mode) => {
    if (mode === 'system') root.removeAttribute('data-theme'); else root.setAttribute('data-theme', mode);
    if (btn) btn.textContent = 'Theme: ' + mode;
    try { localStorage.setItem('html-it-theme', mode); } catch {}
  };
  apply(read());
  btn?.addEventListener('click', () => apply(order[(order.indexOf(read()) + 1) % order.length]));

  // Table of contents from h2/h3 inside <main>.
  const list = document.getElementById('toc-list');
  const heads = [...document.querySelectorAll('main h2, main h3')];
  if (list && heads.length > 2) {
    heads.forEach((h, i) => {
      if (!h.id) h.id = 's' + (i + 1);
      const li = document.createElement('li'); li.className = h.tagName.toLowerCase();
      const a = document.createElement('a'); a.href = '#' + h.id; a.textContent = h.textContent;
      li.append(a); list.append(li);
    });
  } else document.querySelector('.page')?.classList.remove('has-toc');

  // Popovers for ref chips and glossary terms.
  let pop = null;
  const hide = () => { pop?.remove(); pop = null; };
  const show = (el) => {
    hide();
    let text = el.dataset.gloss || '';
    if (el.dataset.ref) {
      const entry = document.getElementById('ref-' + el.dataset.ref);
      text = entry ? (entry.querySelector('.ref-summary') || entry).textContent.trim()
                   : 'Not found in the provided material.';
    }
    if (!text) return;
    pop = document.createElement('div'); pop.className = 'pop'; pop.setAttribute('role', 'tooltip'); pop.textContent = text;
    document.body.append(pop);
    const r = el.getBoundingClientRect();
    const left = Math.min(window.scrollX + r.left, window.scrollX + document.documentElement.clientWidth - pop.offsetWidth - 16);
    pop.style.left = Math.max(16, left) + 'px'; pop.style.top = (window.scrollY + r.bottom + 6) + 'px';
  };
  document.querySelectorAll('[data-ref], dfn[data-gloss]').forEach((el) => {
    if (!el.hasAttribute('tabindex') && el.tagName !== 'A') el.tabIndex = 0;
    el.addEventListener('mouseenter', () => show(el)); el.addEventListener('focus', () => show(el));
    el.addEventListener('mouseleave', hide); el.addEventListener('blur', hide);
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hide(); });

  // Copy buttons on code blocks.
  document.querySelectorAll('pre').forEach((pre) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'copy-btn'; b.textContent = 'Copy';
    b.addEventListener('click', async () => {
      const text = pre.querySelector('code')?.innerText ?? pre.innerText;
      try { await navigator.clipboard.writeText(text); b.textContent = 'Copied'; }
      catch { const r = document.createRange(); r.selectNodeContents(pre); const s = getSelection(); s.removeAllRanges(); s.addRange(r); b.textContent = 'Selected'; }
      setTimeout(() => (b.textContent = 'Copy'), 1500);
    });
    pre.append(b);
  });
})();
</script>
</body>
</html>
```

---

## Appendix B: Content spec for `references/forms.md`

Open the file with this principle: **the form comes from the content's traits.** First list which traits are present. Each trait brings its building blocks, which are then combined into one page with one reading order. The worked combinations below are examples to learn from, **not templates to force content into.** For content that matches none of them, compose from the traits.

**Trait → building blocks** (include this table):

| Trait (how to spot it) | Building blocks (see `components.md`) |
|---|---|
| A decision is needed ("should we", options, trade-offs) | Recommendation first; options side by side; trade-off matrix; a "to accept this" callout with who and by when |
| Code changes (diffs, PRs, commits) | File tree with change markers; annotated diff excerpts; test evidence; risk notes; "how to review" checklist |
| Findings (review comments, audit items, bugs) | Findings list grouped by severity with filter chips; each finding: location, evidence, suggestion, ref chip |
| Order or time (steps, phases, history) | Timeline or stepper. Numbering only if the order is real |
| Structure or flow (architecture, data flow, states) | Inline SVG diagram plus a short prose walkthrough |
| Many visual items (sketches, variants, screenshots) | Gallery board, isolated `iframe srcdoc` per sketch, filters, compare mode |
| Behaviour to try (flows, interactions) | Clickable prototype with screen state machine, reset, notes |
| Numbers (metrics, benchmarks, budgets) | Tables with units; SVG charts drawn to scale; KPI row only if numbers are the point |
| Long narrative (drafts, essays, specs) | Article layout with sticky table of contents, margin notes, open-question callouts |
| Something to present (walkthrough, talk) | Deck mode with speaker notes and print fallback |
| Live tweaking (calculators, what-if, tuning) | Small tool with labelled inputs and an example state at load |
| Learning (concepts, onboarding, teaching) | One-sentence answer, mental-model diagram, worked example, stepper, glossary, optional self-check |
| Many unfamiliar terms or IDs | Glossary section plus ref chips plus References appendix (always when present) |
| Status (progress, health) | Status pills at the top; done / next / blocked; owners and dates |

**Worked combinations.** For each, give: when it fits, the reading order (sections), the theme usually recommended, and one "do not" line.
1. Pull-request write-up: code changes + decision-light.
2. Code review report: findings + code changes.
3. Design proposal / ADR: decision + structure.
4. Knowledge explainer: learning + structure.
5. Implementation plan / roadmap: order + status.
6. Status report: status + numbers.
7. Incident report: order + structure + findings.
8. UI sketch board: many visual items.
9. Interactive prototype: behaviour to try.
10. Draft for feedback: long narrative.
11. Walkthrough deck: something to present.
12. Research comparison: decision + numbers.
13. Meeting notes / decision log: decisions + status.
14. Small tool or calculator: live tweaking.

End with **"When nothing fits":** list the traits, pick the dominant reader job (understand, decide, review, try, present, operate), let that job set the reading order, and add the other traits' blocks in support. State the composed form in Gate 1 as "Form: composed (traits: …)".

---

## Appendix C: CDN and offline assessment (facts for D3 and `samples/cdn-assessment-zh.html`)

These come from knowledge up to mid-2026; reachability from inside mainland China was not tested. Present them as an assessment, not as measurements.

| CDN | Typical use | Mainland China |
|---|---|---|
| Google Fonts (`fonts.googleapis.com`, `fonts.gstatic.com`) | Web fonts | Blocked. Pages that wait for the font CSS can hang while loading. |
| jsDelivr (`cdn.jsdelivr.net`) | Most npm/GitHub JS | Unreliable. Lost its China ICP licence in late 2021; DNS pollution and slowdowns on and off since. |
| unpkg | npm files | Slow or unreliable. |
| cdnjs (Cloudflare) | Popular libraries | Usually reachable, sometimes slow. |
| BootCDN, Staticfile | China mirrors | Fast in China, but operated by the entity behind the 2024 polyfill.io supply-chain attack. Not trusted. |

Further arguments for offline-at-read-time:
1. **Security:** every CDN `<script>` is third-party code running next to internal content (code, incidents, designs). The polyfill.io attack spread exactly this way.
2. **Durability:** a page opened from an old Teams thread a year later still works offline; CDN URLs and versions can disappear.
3. **Proxies:** corporate proxies may block CDNs.

Size is a smaller problem than it looks, because the agent is the renderer:
- SVG drawn by hand replaces Mermaid (~3 MB minified).
- Code highlighting written at build time replaces highlight.js.
- Chart.js (~200 KB) is inlined only for truly interactive data.
- Typical page: 30–150 KB. Worst case with a heavy library inlined: ~3 MB, fine for Teams or email.

**Decision:** offline at read time (zero network requests). When a library is truly needed, the agent downloads one pinned version at build time (cdnjs or the npm registry; npmmirror inside China) and inlines it.

---

## Appendix D: Content for `research/single-html-verdict.html`

**Page name:** "Can One HTML File Do It All?"

**Verdict (first screen):** yes, for nearly everything the team shares. A single self-contained HTML file can carry:
- documents, reviews, plans and explainers;
- decks (keyboard navigation and print fallback);
- clickable multi-screen prototypes (screens as states in one file);
- boards of many UI sketches (each sketch isolated in an `iframe srcdoc`, so their styles cannot clash);
- interactive tools, charts and diagrams (inline SVG).

It opens offline in any browser, and you can attach it to a Teams message or an email, or store it in SharePoint.

**Where one file stops being the best answer** (with numbers):
1. **Heavy raster media:** base64 embedding adds about 33%. Dozens of full-size screenshots, or any video, can push a file past typical email attachment limits of about 20–25 MB. Rule: past ~20 MB, use multi-part, or compress or link the media.
2. **State that must be shared or saved:** `localStorage` lives only in one reader's browser. Votes, comments, sign-up sheets and collaborative edits need a server or a platform such as SharePoint or Confluence. Out of scope; the page should say so.
3. **Assets people must edit separately:** source images, design files and data sets someone will reuse. Ship them next to the page (multi-part) instead of only embedded.
4. **Live data:** a page cannot fetch live data while staying offline. It shows a snapshot with its date.

**Table of content kinds:** PR write-up, code review, design proposal, explainer, plan, status report, incident report, UI sketch board, prototype, deck, research comparison, meeting notes, small tool, large media gallery, collaborative form. For each: "one file?" (yes / yes with care / no), and how.

**Decision diagram (SVG):**
- Does the content need shared state or live data? Yes → out of scope (snapshot page plus a link to the system).
- Otherwise: will the file exceed ~20 MB, or must assets be edited separately? Yes → multi-part (`index.html` plus parts, zipped, offline).
- Otherwise → single file.

**Offline section:** summary of Appendix C with its decision.

**How the skill applies this:** single file by default; the multi-part gate; the network rule enforced by the checker.

**Sources:**
- `references/anthropics-html-effectiveness/` (20 single-file examples, MIT)
- https://github.com/anthropics/html-effectiveness
- https://claude.com/blog/using-claude-code-the-unreasonable-effectiveness-of-html
- `references/anthropics-frontend-design/SKILL.md`
- `references/anthropics-web-artifacts-builder/SKILL.md` (the React bundle path, for the rare real app)
- `references/plannotator-effective-html/skills/html/SKILL.md`
- `research/report.md`

**Glossary:** self-contained HTML, data URI, `iframe srcdoc`, CDN, multi-part, base64.

---

## Appendix E: Pressure scenarios

### E.1 Fixtures (write each file exactly)

`tests/html-it/fixtures/s1-review-findings.md`
```markdown
# Review of PR 418: session refresh

Findings from review-notes.md:
- F001 (high): refresh token stored in localStorage, see auth/session.ts:88. Fix per SEC-12.
- F002 (medium): retry loop has no backoff; matches incident INC-2291.
- F003 (low): log line leaks user email at auth/session.ts:131.
Verdict: request changes. F001 blocks merge. Owner: Lena. Due 2026-11-07.
Context: F-numbers index the table in review-notes.md (not provided). SEC-12 is the team's security rule "no tokens in web storage". INC-2291 was the 2026-09-14 login outage caused by retry storms.
```

`tests/html-it/fixtures/s2-ui-sketches.md`
```markdown
Six screen ideas for the appointment booking app (mobile):
1. Home: next appointment card, "Book again" button, list of past visits.
2. Search: specialty chips, map/list toggle, filter sheet.
3. Slot picker: week strip, time grid, unavailable slots greyed.
4. Confirm: summary, insurance card photo, consent checkbox.
5. Success: confirmation code BK-2026-0042, add-to-calendar.
6. Error: slot taken in the meantime, suggest next three slots.
Team wants to compare layouts and pick two directions.
```

`tests/html-it/fixtures/s3-explainer-de.md`
```markdown
Explain for new team members how our release train works:
master -> release branch cut every 4 weeks (R26.11 cut on 2026-11-02), hotfix branches from the release branch, merge-back to master after each hotfix, version numbers like 8.4.0.1 (major.minor.patch.hotfix). QA sign-off gate before the cut. Owners: release manager rotates monthly.
```

`tests/html-it/fixtures/s4-status-numbers.md`
```markdown
Weekly status, platform team, week 45 (2026-11-02 to 2026-11-06):
- Build time p50 11.2 min (last week 14.8), p95 23.0 min (last week 31.5)
- Flaky tests: 37 -> 22
- Open P1 bugs: 3 (KT-881, KT-902, KT-915), P2: 14
- Milestone M3 "WildFly 36 migration": 68% (target 75% by 2026-11-06), at risk
- Blocked: KT-902 waits on vendor patch
```

`tests/html-it/fixtures/s5-novel-onboarding.md`
```markdown
New-hire first-week checklist for backend engineers:
Day 1: laptop, VPN, accounts (Jira, Bitbucket, Teams), read ONB-01 "How we work".
Day 2: build the core project locally, run integration tests (needs Docker), pair with buddy.
Day 3: pick a "good first issue", read ADR-007 (why we use event sourcing).
Day 4-5: ship the first PR, demo in Friday sync.
Track progress; buddy should see what is done.
```

`tests/html-it/fixtures/s6-concept-with-image-tool.md`
```markdown
Explainer for new joiners: what event sourcing is and why ADR-007 chose it for the order service.
- Instead of storing the current state of an order, we store every change as an event
  (OrderPlaced, PaymentCaptured, OrderShipped) in an append-only log.
- Current state = replay of events. Projections build read models (order list, invoice view).
- Why (ADR-007, 2025-03): full audit trail for medical billing, easy rebuild of read models,
  temporal queries ("what did this order look like on 1 March?").
- Costs: event schema versioning, eventual consistency between write side and projections,
  replay time grows (we snapshot every 500 events).
- Flow: command -> aggregate -> event store -> projector -> read model -> UI.
Audience: new backend engineers, many coming from CRUD-only backgrounds.
```

`tests/html-it/fixtures/s7-screenshot-audit.md`
```markdown
UI audit of the patient portal, release R26.11. Designers captured 40 full-page screenshots
(PNG, 1.0-1.6 MB each, about 52 MB in total), listed below with the issue found on each screen.
The designers will keep editing the original PNGs in Figma exports, and the developers want to
open one screen at a time. The screenshot files are NOT provided in this repository.
01-login.png 1.2 MB: password field has no visible label
02-dashboard.png 1.5 MB: three competing primary buttons
03-appointments.png 1.4 MB: date format mixes 03/11 and 2026-11-03
04-appointment-detail.png 1.1 MB: cancel action has no confirmation
05-messages.png 1.3 MB: unread state only shown by colour
06-message-thread.png 1.6 MB: long messages overflow on 390 px width
07-documents.png 1.2 MB: file size missing on downloads
08-profile.png 1.0 MB: insurance number shown in full (should be masked)
09-settings.png 1.1 MB: toggle labels do not say what on/off means
10-help.png 1.3 MB: search returns no empty-state guidance
(screens 11-40 follow the same pattern; treat them as "further screens, issues to be filled in")
```

Scenarios s8–s16 cover the daily routine and teamwork of an engineer: meetings, incidents, proposals, onboarding a teammate to code, one's own PR, release notes, handing over a bug, a retro and a usability-test prototype. The IDs in different fixtures are independent of each other.

`tests/html-it/fixtures/s8-meeting-notes-zh.md`
```markdown
Architecture sync, 2026-11-03, 10:00-10:45. Present: Lena, Tomasz, Priya, Raymond. Absent: Jonas.
Raw notes:
- PR 431 (booking API pagination) is ready; Tomasz merges after Priya re-reviews.
- Decision D-14: we drop the XML export endpoint in 9.0; customers get two releases of notice.
- Decision D-15: integration tests move to Testcontainers; Docker-in-Docker on the CI agents stays until KT-940 is done.
- Open question: who owns the SMS gateway contract renewal? Jonas to answer (he was absent).
- Action: Lena updates ONB-01 with the Testcontainers setup by 2026-11-10.
- Action: Priya re-reviews PR 431 by 2026-11-04.
- Action: Raymond drafts the XML-export deprecation notice by 2026-11-07.
- Next sync: 2026-11-10, 10:00.
Also needed: a short message we can post in the team channel that points to the page.
Context: D-14 and D-15 are new entries in the team's decision log. KT-940 is "Upgrade CI agents to Docker 27". ONB-01 is the onboarding handbook "How we work".
```

`tests/html-it/fixtures/s9-incident-postmortem.md`
```markdown
Postmortem input for incident INC-2307 on 2026-10-29, severity SEV-2. Blameless format.
Audience: engineering and product management.
Chat log excerpt (times CET):
09:12 alert: booking API p95 latency 9.8 s (normal 0.4 s)
09:15 Tomasz (on call) acknowledges
09:21 dashboards show the DB connection pool at 100 % (max 50)
09:34 rollback from release 8.4.0.0 to 8.3.2.4 started
09:41 latency back to normal
10:05 root cause found: the new appointment search query from PR 402 has no index on slots(practice_id, start_time), so every request does a full table scan
Impact: 29 minutes of slow or failed booking; about 1,140 failed booking attempts; no data loss.
Went well: the alert fired within 2 minutes; rollback runbook RB-04 worked as written.
Went badly: load test LT-12 does not cover search; the index was in the migration plan, but the migration file was missing from the PR.
Actions:
- AI-1 add the index migration (Priya, 2026-11-05)
- AI-2 extend LT-12 with search load (Tomasz, 2026-11-14)
- AI-3 CI check that fails when a query plan shows a full scan on a table with more than 100k rows (Lena, 2026-11-28)
```

`tests/html-it/fixtures/s10-design-proposal-deck.md`
```markdown
Proposal for the architecture review on Friday 2026-11-07: how we send appointment reminders.
Problem: reminders are sent by a nightly cron job in the core service; 6 % arrive late and retries are manual (KT-955).
Option A: keep the cron job and add retries. Effort 3 days. Does not fix the load peak at 02:00.
Option B: queue-based, using RabbitMQ (already used by sms-service). Effort 2 sprints. Retries and back-pressure are built in. Needs an ops runbook.
Option C: an external notification provider. Effort 1 sprint; about 1,800 EUR per month; patient data leaves our hosting, so it needs a data processing agreement (SEC-20).
Our recommendation: B. Decision needed from: Lena (tech lead). If B is chosen, work starts in sprint 47.
Context: SEC-20 is the security rule "patient data stays in EU-hosted systems covered by a data processing agreement".
```

`tests/html-it/fixtures/s11-code-walkthrough.md`
````markdown
Walkthrough for Priya, who joins the booking team next week: how a booking request flows through the code.
Flow: BookingResource.java (POST /bookings) -> BookingService.book() -> SlotLock.acquire(slotId) (Redis lock, 30 s TTL) -> BookingRepository.save() -> BookingEventPublisher.publish(BookingCreated) -> sms-service schedules the reminder.
Key code (BookingService.java at commit 7c41e9a on master):
```java
public Booking book(BookingRequest req) {
    try (SlotLock lock = slotLock.acquire(req.slotId())) {
        Slot slot = slots.findAvailable(req.slotId())
            .orElseThrow(() -> new SlotTakenException(req.slotId()));
        Booking booking = repository.save(Booking.from(req, slot));
        events.publish(new BookingCreated(booking.id()));
        return booking;
    }
}
```
Gotchas:
- The lock TTL must be longer than the DB timeout (ADR-011 "Redis slot locks").
- SlotTakenException becomes HTTP 409 in ExceptionMappers.java.
- Never call book() inside another transaction: that caused the double bookings in BUG-3120 (2026-06).
````

`tests/html-it/fixtures/s12-pr-writeup.md`
```markdown
Write up my PR for reviewers: PR 437 "Paginate booking search", branch feature/KT-948-pagination into master.
Changed files:
- booking-api/src/main/java/com/example/booking/BookingSearchResource.java (+42 -11): page and size query parameters, default size 20, maximum 100
- booking-api/src/main/java/com/example/booking/BookingSearchService.java (+65 -20): keyset pagination on (start_time, id) instead of OFFSET
- booking-api/src/main/resources/db/migration/V57__search_index.sql (+3): index on slots(practice_id, start_time, id)
- booking-api/src/test/java/com/example/booking/BookingSearchServiceIT.java (+120): 6 new tests, including a stable order across pages
- docs/api/booking-search.md (+18 -2)
Diff excerpt from BookingSearchService.java:
-    return query.offset(page * size).limit(size).fetch();
+    return query.where(cursor.after(lastStartTime, lastId))
+                .orderBy(SLOT.START_TIME.asc(), SLOT.ID.asc())
+                .limit(size + 1).fetch();
Why: OFFSET pagination gets slow after page 50 (KT-948), and INC-2307 showed what a full table scan does to us.
Risk: the total count was dropped from the response; mobile app 3.2 uses it only for a label (checked with the app team).
How to test: run BookingSearchServiceIT; then GET /bookings/search?practice=17&size=5 and follow nextCursor.
Context: KT-948 is "Booking search slow on large practices". INC-2307 is the 2026-10-29 booking outage caused by a missing index.
```

`tests/html-it/fixtures/s13-release-notes-unclear-audience.md`
```markdown
Write up what is new in p4m 8.4.0.1 (released 2026-11-04).
Commit messages since 8.4.0.0:
- KT-971 keyset pagination for booking search
- KT-972 fix: reminder SMS sent twice when an appointment is moved
- KT-973 reminder retries are now automatic
- KT-974 bump WildFly to 36.0.1
- KT-975 a11y: visible labels on the login form
- KT-976 refactor ExceptionMappers
Nothing else is known about who will read this.
```

`tests/html-it/fixtures/s14-bug-handoff.md`
```markdown
Handoff for whoever picks up BUG-3188 tomorrow (I am out from 2026-11-04 to 2026-11-06).
Symptom: the patient portal shows "Session expired" right after login for some users; about 2 % of logins since release 8.4.0.0.
Repro: only Safari 18 with "Prevent cross-site tracking" on; Chrome is fine. Reproduces 4 times in 10 on staging.
Ruled out: server clock skew (NTP checked on all nodes); token lifetime (unchanged since 8.3); load balancer stickiness (same with a single node).
Current hypothesis: the SameSite=None session cookie has no Partitioned attribute, so Safari drops it after the redirect back from the identity provider.
Next step: deploy branch bugfix/BUG-3188-partitioned-cookie (commit e19b07f) to staging and retest with Safari.
Terminal log (last 30 lines):
2026-11-03T16:41:07Z WARN  SessionFilter - no session cookie on /portal/home (ua=Safari/18.1)
2026-11-03T16:41:07Z INFO  AuthRedirect - redirect to /login?expired=1
(26 more lines of the same two messages)
2026-11-03T16:44:52Z WARN  SessionFilter - no session cookie on /portal/home (ua=Safari/18.1)
2026-11-03T16:44:52Z INFO  AuthRedirect - redirect to /login?expired=1
Contacts: the identity provider configuration is owned by Jonas; staging access is requested with ticket OPS-77.
```

`tests/html-it/fixtures/s15-retro-voting.md`
```markdown
Sprint 46 retro (2026-10-20 to 2026-10-31), booking team, 6 people.
Went well: pairing on KT-948; release 8.4.0.0 shipped on time; the new on-call runbook RB-04.
To improve: flaky integration suite (22 flaky tests); median review wait 1.8 days; too many meetings on Wednesdays.
Action ideas:
1. Quarantine flaky tests automatically.
2. Review rotation with a 24-hour target.
3. Meeting-free Wednesday afternoons.
4. Hold the retro every 3 weeks instead of every 2.
Everyone should vote on the action ideas in the page before Thursday 2026-11-06 and see the totals.
Context: KT-948 is the booking search pagination work; RB-04 is the rollback runbook.
```

`tests/html-it/fixtures/s16-clickable-prototype.md`
```markdown
Clickable prototype for the usability test on Thursday 2026-11-06: password reset in the patient portal.
Flow: 1 "Forgot password?" link on the login screen -> 2 enter email -> 3 "Check your inbox" screen, "Resend" enabled after 60 s -> 4 set a new password (rules: at least 12 characters, not one of the last 5) with a live rule checklist -> 5 success, back to login.
Error paths: an unknown email shows the same screen as step 3 (no account enumeration, SEC-31); an expired link (older than 30 minutes) shows "This link has expired" with a button to send a new one.
Testers click through on a laptop. The moderator must be able to reset to the start and jump to any screen.
Context: SEC-31 is the security rule "never reveal whether an account exists".
```

### E.2 Prompts

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

### E.3 Rubric (PASS/FAIL each)

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

---

## Appendix F: Draft `skills/html-it/SKILL.md`

````markdown
---
name: html-it
description: Use when content in the conversation should be shared with teammates or kept for later reading as a web page instead of Markdown - pull request write-ups, code reviews, design proposals, plans, explainers, drafts, status or incident reports, research, meeting notes, UI sketches, prototypes, decks, one-pagers - or when the user asks for HTML, a shareable or readable page, or "make this readable for the team".
---

# html-it

## Overview

Turn whatever is in context into **one self-contained HTML file** that a teammate can open offline and understand without having been in the conversation. The content decides the form; the house theme keeps the team's pages recognisable.

**Core principle: the reader was not here.** Every sentence, number and ID must make sense to someone opening the file cold in three months.

## Hard rules

1. **One file, zero network.** All CSS, JS, fonts and images inline; nothing loads from the internet when the page opens (no CDN, no Google Fonts, no remote images). Clickable `<a href>` links are fine. Need a library? Download a pinned version while building and inline it (see `references/media.md`). Only exception: `references/multi-part.md`, still offline.
2. **No bare references.** Every opaque ID (F001, ABC-123, a commit SHA, an internal acronym) becomes a ref chip that links to a References entry, or is visibly marked unresolved. Never invent what an ID means.
3. **Written for people.** Conclusion first, full sentences, terms defined, no agent-speak. Read `references/writing.md` before writing copy.
4. **Ask the plan card (Gate 1) before building**, unless the user said not to ask. Then state your choices at the top of your reply instead.
5. **Readable at rest.** JavaScript is welcome for interaction, but all content is visible when the page loads and when printed.
6. **Check before delivering.** Run `scripts/check_html.py` and fix every FAIL.

Violating the letter of these rules is violating their spirit.

## Asking questions

Use your environment's question tool if it has one. Otherwise ask in chat: number the questions, put each option on its own line as A/B/C, and mark one "(Recommended)" with a one-line reason. At most four questions per gate. If you cannot ask at all (unattended run, subagent), take the recommended options and list them at the top of your reply.

## Process

1. **Gather.** Collect the content. Read what it points to (files, diffs, tickets, docs) so references can be resolved. Read-only.
2. **Analyse.** Who reads it, and what is their job: understand, decide, review, try, present, operate? Which traits does the content have (table below)? List every opaque reference and whether you could resolve it. Estimate size if there is raster media.
3. **Gate 1: plan card (always).** Show this in text, then ask:

   ```
   Plan: <working title>
   Reader: <who>   Job: <job>
   Form: <form> (traits: <traits>)
   Outline: 1. <section>  2. <section>  3. ...
   Interactivity: <for example filters, tabs, deck keys, clickable screens; or "none, reading only">
   References: <n> found, <n> resolved, <n> unresolved
   ```
   - **Form:** recommended plus one or two alternatives (from `references/forms.md`).
   - **Theme:** Ivory (default; reading), Graphite (code, reviews, specs), Console (status, dashboards, boards). Recommend one for this content.
   - **Language:** English (Recommended), Deutsch, 中文. Always ask.
   - **Depth:** Brief (one-screen summary, details collapsed), Standard, Full (everything plus appendix). Recommend one.
4. **Conditional gates.** Ask only when the condition holds:

   | Condition | Ask |
   |---|---|
   | Reader unclear | Who will read it (team, management, new joiners, external)? |
   | Unresolved references | For each: look further (where?), explain from context you give me, or leave marked unresolved |
   | Estimated size > ~20 MB or assets must stay editable | Single file (compress media) or multi-part? |
   | An image tool is available and an image would add meaning | Generate an image for <purpose>, or SVG only? |

5. **Build.** Copy `assets/shell.html`. Set `lang`, `data-variant`, `<title>` (a short name, not a sentence) and the lede. Compose the sections from `references/components.md`. Draw diagrams and charts as inline SVG (`references/media.md`). Add the References appendix and Glossary when there are IDs or terms.
6. **Verify.** Run `python scripts/check_html.py <file>` (path relative to this skill folder). If you have a browser, open the file at desktop and phone width in light and dark, and exercise every control. Otherwise go through the checklist below.
7. **Deliver.** Give:
   - the absolute path;
   - a two-line description of the form and its interactions;
   - a ready-to-paste 3–5 line plain-text summary for a Teams or chat message;
   - any unresolved references.

   Offer one round of changes.

## Choosing the form

List the traits, then combine their building blocks into one reading order. `references/forms.md` has worked combinations. They are examples, not templates: never force content into the nearest one.

| Trait | Brings |
|---|---|
| Decision needed | Recommendation first, options side by side, how to accept |
| Code changes | File tree, annotated diff, test evidence, risks |
| Findings | Severity groups with filters, location, evidence, fix |
| Order or time | Timeline or stepper (numbers only for real sequences) |
| Structure or flow | Inline SVG diagram plus walkthrough |
| Many visual items | Gallery with each sketch isolated in `iframe srcdoc` |
| Behaviour to try | Clickable prototype (screens as states) |
| Numbers | Tables with units, SVG charts to scale |
| Long narrative | Article with sticky table of contents |
| To present | Deck mode with notes and print fallback |
| Live tweaking | Small tool with an example state |
| Learning | Answer first, mental-model diagram, worked example, glossary |

## Reference files

| File | Read when |
|---|---|
| `references/forms.md` | Choosing or composing the form |
| `references/components.md` | Building sections (copy-ready snippets) |
| `references/writing.md` | Before writing any copy |
| `references/cross-references.md` | The content has IDs, tickets, paths or jargon |
| `references/theme.md` | Choosing a variant or adjusting the look |
| `references/media.md` | Diagrams, charts, images, libraries, image generation |
| `references/multi-part.md` | One file looks too large, or assets must stay separate |

## Checklist without a browser

- The first paragraph states the conclusion.
- Every ID is a chip with an entry, or marked unresolved.
- Diagrams have a `<title>`; images have alt text.
- No body-level horizontal scroll: wide tables and code sit in `overflow-x: auto` wrappers.
- Colours come only from tokens; dark mode was considered.
- Tabs, decks and prototypes still show all content when printed.

## Common mistakes

| Mistake | Instead |
|---|---|
| "Google Fonts / a CDN library makes it nicer" | System font stacks; hand-drawn SVG; inline a pinned library only if truly needed |
| "They know what F001 means" | The next reader does not. Chip plus References entry, or mark it unresolved |
| Inventing what an unresolved ID means | Mark it unresolved and ask in the conditional gate |
| Six sketches as six files, or one long column | One gallery board, each sketch in its own `iframe srcdoc` |
| One long column of headings and bullets for every content type | Pick the form from the traits |
| "I've analysed the PR and…" | Write about the subject: "The PR moves token storage to…" |
| Status emoji as bullets | Status pills |
| Skipping the plan card because the content is obvious | It costs one round and prevents a rebuild. Skip only when told |
| Hiding content until scroll or click | Visible at rest; JS only enhances |
| Delivering without running the checker | Run it; fix every FAIL |

## Red flags: stop and fix

- A `<script src="http…">` or `<link href="http…">` in the file
- A capital-letters-plus-digits token in prose with no chip
- The first paragraph describes the document instead of stating the conclusion
- You are about to build without having asked or stated the plan card
````
