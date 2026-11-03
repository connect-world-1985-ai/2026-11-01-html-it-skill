# Media: diagrams, charts, images and libraries

The page must open offline, so every visual is either drawn by the agent or embedded in the file. The agent is the renderer.

## SVG first

Draw these by hand as inline `<svg>`:

- diagrams, flows, architecture, sequence and state machines;
- cause chains (incidents), branch models (release trains), request flows (code walkthroughs);
- bar and line charts (compute every length from the data and state the scale in a comment);
- icons.

Rules:

- `role="img"` and a `<title>` (and `aria-labelledby` pointing at it) that says what the picture shows.
- Colours from tokens through classes or `style="fill: var(--surface-2)"`, strokes and arrows in `currentColor`, so light and dark both work.
- `viewBox` plus `width: 100%; height: auto` so it scales; for wide diagrams provide a vertical layout or an `overflow-x: auto` wrapper so phones do not scroll the body sideways.
- Label boxes in plain language. Text inside SVG is not scanned by the checker, so an ID used as a label must also appear as a ref chip in the prose next to it.
- Follow the diagram with a short prose walkthrough; the diagram supports the text, it does not replace it.

Snippets: `components.md` (inline SVG chart, inline SVG diagram skeleton).

## No rendering libraries by default

No Mermaid, PlantUML, highlight.js, Prism, Chart.js, D3 or KaTeX by default, even when the user asks for one "from a CDN". Hand-drawn SVG replaces Mermaid (about 3 MB minified); pre-rendered `<span class="tok-…">` highlighting replaces highlight.js. Tell the user in the delivery message that you drew it instead and why (offline, no third-party script next to internal content).

The same holds for UI frameworks: React, Vue, Tailwind's CDN build or Bootstrap are not needed for prototypes or sketches; plain HTML, CSS and a small state machine are enough.

## When a library is truly needed

Examples: an interactive chart with thousands of points, real maths typesetting, a diff viewer over a very large file.

1. Download one pinned version **at build time**: from cdnjs or the npm registry; inside mainland China use the npmmirror registry (`registry.npmmirror.com`).
2. Check that the licence allows redistribution (MIT, BSD, Apache-2.0 are fine).
3. Inline the minified file into a `<script>` with a comment naming the library, version, licence and source URL:
   ```html
   <script>/* uPlot 1.6.30, MIT, https://cdnjs.cloudflare.com/ajax/libs/uPlot/1.6.30/uPlot.iife.min.js */ …</script>
   ```
4. Mention it in the delivery message.

Never leave a `<script src="https://…">` or `<link href="https://…">` in the page, and never add one "as a fallback".

## Fonts

System font stacks only (see `theme.md`). No Google Fonts, no other font CDN, not even with a system fallback: a blocked font request can stall rendering, and it leaks the reader's IP to a third party. If a special font is truly required, embed it as a base64 `@font-face` data URI and check its licence.

## Raster images

- The user's own screenshots and photos: compress (WebP or JPEG, at most about 1600 px wide where possible) and embed as `data:` URIs.
- Meaningful `alt` text that says what the image shows; `alt=""` only for decoration.
- Never invent or mock a screenshot that was not provided. If the content refers to images you do not have, show a labelled placeholder naming the file and saying "image not provided".
- Base64 adds about 33 %. Estimate the total; past ~20 MB see `multi-part.md`.

## Image generation (only when it adds meaning)

1. **Check what your environment offers:** a native image tool, or a skill or bridge that calls an image API. If there is none, use SVG or leave the image out, and do not mention its absence in the page.
2. **Use it only when the image adds meaning a reader would miss without it:**
   - a concept illustration (for example "a log of changes versus a single snapshot");
   - a mood reference for a UI sketch;
   - a cover image for an explainer or teaching material;
   - an illustrative scene for teaching.
3. **Never use it for anything that must be precise or editable:** diagrams, flows, charts, UI text, data, screenshots of real software. Those stay SVG or HTML.
4. At most one or two images per page.
5. Embed the result as a `data:` URI; write alt text that states what the image shows.
6. Ask the image gate first (see `SKILL.md`): state each image's purpose in one line and offer "SVG only" as the alternative.

## Video and audio

Short clips can be embedded as data URIs, but they quickly pass the size limit. Prefer a poster frame plus a clickable link to where the video lives, or multi-part.
