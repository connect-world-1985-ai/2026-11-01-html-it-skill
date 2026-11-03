# Multi-part: when one file is not the answer

**One file is the default.** One self-contained HTML file carries documents, decks, prototypes, sketch boards, tools, charts and diagrams, opens offline, and can be attached to a Teams message or email or stored in SharePoint.

## When to switch

Switch to multi-part only when one of these holds:

1. **Size:** the estimated file passes ~20 MB. This almost always means raster media or video. Estimate it: sum of image sizes × 1.33 for base64. Example: 40 screenshots of 1.0–1.6 MB, about 52 MB raw, become about 70 MB embedded. Typical email attachment limits are about 20–25 MB.
2. **Separately editable assets:** people must keep editing or replacing the originals (design exports, data sets, source images). Embedded copies would go stale.

Compressing images (WebP or JPEG, max ~1600 px) often brings a page back under the limit; offer that as the first alternative when the originals do not need to stay editable.

**Ask the conditional gate before switching** (see `SKILL.md`): give the size estimate and the reason, and recommend one option.

## Layout

```
<name>/
  index.html        hub: overview, table of contents, search over titles, the summary table
  parts/
    01-login.html   one page per item or per group
    02-dashboard.html
  assets/           only if originals must stay editable (relative paths)
```

- `index.html` and every `parts/*.html` are complete html-it pages: each starts from the shell and **each passes the checker**.
- Relative links only (`parts/01-login.html`, `../index.html`). No absolute paths, no `file://`, no network.
- Each part links back to the hub and to the previous and next part.
- Images in `assets/` are referenced with relative `src`; that is still offline.
- Zip the folder for sharing and say so in the delivery message ("unzip and open `index.html`").

## Out of scope: shared state and live data

Some content asks for things no static file can do:

- **Shared or persistent state:** votes, sign-ups, comments, collaborative edits, a buddy seeing a new hire's progress. `localStorage` lives only in one reader's browser.
- **Live data:** dashboards that refresh, live totals, current status from an API.

Do not fake these and do not route around them by publishing to a hosting service (hosting is out of scope). Instead:

1. Build what works offline: the content, a local-only interaction if it helps the individual reader.
2. Say plainly in the page, where the reader meets it, what the file cannot do: "Your ticks are saved only in this browser; your buddy cannot see them."
3. Offer a way that works: "Pick two ideas, press Copy, and paste your line in the team channel", "Use the team's poll tool", "Share a screenshot with your buddy on Friday", or a link to the system that holds the live data.
4. For live data, show a dated snapshot ("as of 2026-11-06 09:00 CET").
