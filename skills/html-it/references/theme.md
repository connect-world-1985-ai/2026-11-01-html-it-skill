# Theme: the house look and its three variants

Every html-it page starts from `assets/shell.html`. The shell carries the house theme: one set of colour tokens per variant, each in light and dark, system font stacks, and the built-in behaviour (theme toggle, table of contents, ref popovers, copy buttons). The content changes the layout. The theme keeps the team's pages recognisable.

## Pick a variant

| Variant | Pick it for | Character |
|---|---|---|
| **Ivory** (default) | Explainers, proposals, drafts, research, onboarding, anything read top to bottom | Warm ivory and slate, clay accent, serif headings, generous spacing, 72-character column |
| **Graphite** | Pull-request write-ups, code reviews, specs, plans, walkthroughs | Neutral greys, blue accent, all sans, denser, 80-character column |
| **Console** | Status reports, dashboards, boards, incident timelines, sketch boards | Dark first, teal accent, 14 px base, tabular numbers, 96-character column |

When two variants seem equally good, pick the one whose reader job matches: reading → Ivory, reviewing → Graphite, operating or scanning → Console.

## Switch variants

Set `data-variant` on `<html>`:

```html
<html lang="en" data-variant="graphite">
```

Valid values: `ivory`, `graphite`, `console`. All three token blocks stay in the shell; deleting the blocks you do not use is optional and only saves a few hundred bytes.

## Three-state theming

- No `data-theme` on `<html>`: the page follows the operating system (`prefers-color-scheme`).
- `data-theme="light"` or `data-theme="dark"`: set by the toolbar toggle and remembered per reader in `localStorage` when storage is available.
- Console is dark by default and shows its light palette only when `data-theme="light"` is set.

Rules that keep this working:

- **Every colour is a token.** Component rules use `var(--fg)`, `var(--surface-2)`, `var(--ok)` and so on. No literal hex, `rgb()` or named colour appears in a component rule. (The one exception in the shell is the popover shadow, which is a translucent black that works on both themes.)
- **`body` always has a token background** (`var(--bg)`), so nothing falls back to browser white in dark mode.
- **SVG uses tokens too:** `fill="var(--surface-2)"` does not work as an attribute in every browser, so style SVG through classes or `style="fill: var(--surface-2)"`, and use `currentColor` for strokes and text.
- New tokens, if a page needs them, are defined in all variant blocks, light and dark.

### Token list

| Token | Use |
|---|---|
| `--bg`, `--surface`, `--surface-2` | Page, raised panel, subtle fill |
| `--fg`, `--muted` | Body text, secondary text |
| `--line` | Borders and rules |
| `--accent`, `--accent-ink` | Accent fills; accent text and links (higher contrast) |
| `--ok`, `--warn`, `--bad` and `--ok-bg`, `--warn-bg`, `--bad-bg` | Semantic state text and fills |
| `--code-bg` | Code blocks and inline code |
| `--serif`, `--sans`, `--mono`, `--display`, `--body` | Font stacks |
| `--measure`, `--radius`, `--space` | Column width, corner radius, base spacing |

## Type

- **System font stacks only.** No web fonts: they load from the network (Google Fonts is blocked in mainland China) and the page must open offline. The stacks include CJK fallbacks (PingFang SC, Microsoft YaHei, Noto Sans/Serif CJK SC) so Chinese renders with a real font on every platform.
- **Line length:** running text stays at or under ~70 characters per line. The shell's `--measure` handles this for `<main>`; do not widen paragraphs in wide layouts.
- **Headings** use `text-wrap: balance` and sentence case.
- **Tables** use `font-variant-numeric: tabular-nums` so columns of numbers line up.
- Ivory uses the serif stack for headings and sans for body. Graphite and Console are all sans.

## Semantic colours

`--ok`, `--warn` and `--bad` mean state (on track, at risk, blocked or failed). They are separate from the accent. Do not use the accent to mean "good", and do not use `--bad` for decoration. Pair colour with a word or a sign (a pill that says "At risk", a `+` or `−` in a diff) so the meaning survives for colour-blind readers and in print.

## Things to avoid

These are the commonest tells of a generated page (from `references/anthropics-frontend-design/SKILL.md` in the research repository):

- all-caps eyebrow labels above every heading;
- `A · B · C` meta strings joined with middle dots; write a sentence instead ("Prepared 3 November 2026 for the platform team");
- `→` appended to links and buttons;
- content chopped into identical rounded cards with the same shadow everywhere;
- numbered markers (01 / 02 / 03) on content that is not a sequence;
- fade-in or slide-up on scroll for every section;
- accenting a single word of a headline in another colour or italic.

## One memorable element

Spend boldness in one place per page at most: a striking diagram, a big verdict, a well-made interactive. Keep everything around it quiet: consistent spacing, one accent, plain headings. If you are unsure, leave it out.

## Layout notes

- The shell has one reading column and, on screens 1100 px and wider, a sticky table of contents built from the `h2`/`h3` headings in `<main>`. Pages with two or fewer headings drop the table of contents automatically.
- Wide content (tables, code, diagrams, sketch grids) goes in a wrapper with `overflow-x: auto` (`.table-wrap` exists) so the body never scrolls sideways at 390 px.
- A full-width layout (boards, decks, dashboards) can widen `.page > main` with a page-level rule; keep running text inside a narrower element.

## Print

The shell's print CSS:

- hides the toolbar, the table of contents and copy buttons;
- prints black on white;
- expands every `<details>` so collapsed content is printed;
- shows the URL after external links;
- wraps long code lines.

Components that hide content on screen (tabs, decks, prototypes) must add their own print rule that shows all panels, slides or screens.
