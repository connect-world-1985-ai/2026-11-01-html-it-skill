# Cross-references: no bare IDs, no undefined jargon

Agent-written content is full of pointers that only make sense inside the conversation that produced them: `F001`, `KT-902`, `7c41e9a`, "see section 4.2". A teammate who opens the page later cannot follow them. html-it resolves every one of them or marks it visibly as unresolved.

## What counts as an opaque reference

- finding or requirement indexes (`F001`, `R-12`, `REQ-7`, `AI-1`, `D-14`);
- ticket keys (`ABC-123`, `KT-902`, `BUG-3188`, `OPS-77`);
- pull-request and issue numbers ("PR 418", "#431");
- commit SHAs (`7c41e9a`);
- file paths and line numbers (`auth/session.ts:88`);
- internal acronyms and code names (`ONB-01`, `RB-04`, "Project Kite");
- release and milestone names (`R26.11`, `M3`) when the reader may not know them;
- "see section 4.2" pointers into other documents;
- people's handles (`@lena`) and team aliases.

## Finding them

1. Scan the source content and list every token of the kinds above.
2. The checker's default pattern, `\b[A-Z]{1,6}-?\d{2,6}(?:[-.]\d{1,6})*\b`, catches whole compound IDs such as `F001`, `ABC-123`, `BK-2026-0042` and `R26.11` in visible prose. It does **not** catch SHAs, paths, handles, "PR 418" or code names: check those by eye.
3. Count them for the plan card: found, resolved, unresolved.

## Resolving them, in this order

1. **The content itself.** Fixtures and notes often say what an ID means ("SEC-12 is the team's security rule…").
2. **Files or links the content points to.** Read them.
3. **The repository.** Search for the ID (`git log --grep`, a text search).
4. **Tools available to you,** read-only: issue trackers, pull-request APIs, wikis.

**Never invent an explanation.** If none of the four sources explains an ID, it is unresolved. A plausible guess presented as fact is worse than an honest "not found".

### Resolved means "the reader learns what it is", not "every detail is known"

An ID is **resolved** when any source says what it is, even in a few words. "Open P1 bugs: 3 (KT-881, KT-902, KT-915)" resolves all three as open P1 bugs; "retries are manual (KT-955)" resolves KT-955 as the ticket about manual retries. Write the entry from exactly that: "KT-881: an open P1 bug listed in the week 45 status; its title is not given in the status." Missing titles, owners or URLs are **not** a reason to mark an ID unresolved or to ask the unresolved-references gate; say "not given" inside the entry.

An ID is **unresolved** only when no source says what it is at all, for example `F001` pointing into a table that was not provided with no description.

A **source file** the content relies on but you do not have ("Findings from review-notes.md", "see the attached audit export") is always unresolved, even when the IDs taken from it are described: mark it unresolved, list it under "Could not be resolved", and ask the unresolved-references gate (look further, explain from context, or leave it marked).

The names of the product, system or team the page is about ("p4m", "booking API", "the platform team") are not opaque references: the readers use them daily. Do not chip or gate them; define them in the glossary only if a new joiner would not know them.

## Rendering a resolved reference

In the prose, a chip:

```html
<a class="ref" data-ref="F001" href="#ref-F001"><span class="ref-id">F001</span> refresh token in localStorage</a>
```

The text after the ID is a short plain-language name, so the sentence reads well even if the reader ignores the ID.

In the References appendix (an `<h2 id="references">` followed by `<ol class="references">`), one entry per ID:

```html
<li id="ref-F001"><b>F001</b> <span class="ref-summary">High-severity review finding: the refresh token is stored in
  localStorage, where any script on the page can read it.</span>
  Source: <code>review-notes.md</code> (finding table, not provided), location <code>auth/session.ts:88</code>.</li>
```

Each entry contains:

- the ID;
- a one- to two-sentence explanation inside `<span class="ref-summary">`, which is what the shell's popover shows on hover, focus or tap (without it, the popover shows the whole entry);
- where it comes from: file path, ticket, or URL as a clickable `<a href>`;
- if useful, the quoted original line.

IDs that contain dots or other characters are fine in `data-ref` and `id` (`ref-R26.11`, `ref-BK-2026-0042`).

## Rendering an unresolved reference

```html
<span class="ref" data-ref="ABC-123" data-ref-status="unresolved"><span class="ref-id">ABC-123</span> not found in the provided material</span>
```

Also list it in the References appendix under a heading "Could not be resolved", saying where you looked. Then ask the unresolved-references gate (see `SKILL.md`): look further (where?), explain it from context the user gives, or leave it marked. Report every unresolved reference in the delivery message.

A referenced **file** that was not provided (for example `review-notes.md`) is an unresolved source: say so where the page relies on it and in the References appendix.

## Later mentions

After the first chip, later mentions may be chips again (preferred in long pages, because readers jump around) or plain text if the chip is visible on the same screen. The checker warns, but does not fail, on plain-text mentions of an ID that has an entry.

## Places the checker does not scan

- **SVG labels.** Text inside `<svg>` is not scanned. Label diagram boxes with plain-language names, or with an ID that also appears as a chip in the prose next to the diagram.
- **Code.** IDs inside `<code>`, `<pre>`, `<kbd>` and `<samp>` are not scanned. If the surrounding prose relies on them, explain them in prose.
- **Scripts and styles.**
- **Titles and headings in `<head>`.** Headings in the body *are* scanned: an ID in a heading needs a chip or an entry like anywhere else.

## Not references

Standards, formats and version names are not opaque references: `ISO-8601`, `ES2020`, `H264`, `UTF-8`, `HTTP2`. Allow them in the page head:

```html
<meta name="html-it:allow-ids" content="ISO-8601, ES2020">
```

or on the command line: `python scripts/check_html.py page.html --allow ISO-8601,ES2020`. Do not use the allow-list to silence a real ticket key.

## Glossary

Jargon a new teammate might not know gets `<dfn>` at first use, with a one-sentence definition in `data-gloss`:

```html
<dfn data-gloss="Pagination that continues after the last row seen instead of skipping a row count.">keyset pagination</dfn>
```

The shell shows `data-gloss` as a popover, the same way as ref chips. Collect every term in a Glossary section at the end:

```html
<h2 id="glossary">Glossary</h2>
<dl class="glossary">
  <dt id="gloss-keyset">Keyset pagination</dt>
  <dd>Pagination that continues after the last row seen (for example by start time and ID) instead of skipping a row count with OFFSET.</dd>
</dl>
```

## Order of the closing sections

1. References (resolved entries, then "Could not be resolved").
2. Glossary.
3. Appendices (raw logs, full tables), collapsed in `<details>`.
