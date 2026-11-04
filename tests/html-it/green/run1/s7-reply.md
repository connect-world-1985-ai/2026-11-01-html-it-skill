I built the audit as a folder, not a single file. The choices below are my recommended answers; I couldn't ask you first, so the questions and options are in `tests/html-it/green/s7-gates.md`.

- **Form:** a hub page (`index.html`) plus one page per screen in `parts/`, with an `assets/` folder for the original screenshots
- **Theme:** Graphite
- **Language:** English
- **Depth:** Standard

**Why not one HTML file:** the 40 screenshots are about 52 MB. Embedded in one page they'd come to about 70 MB, well over the roughly 20–25 MB that email and chat attachments usually accept. The designers also keep editing the original PNGs, so copies baked into a page would go out of date. The folder still opens offline and needs no server. Zip it to share; readers unzip it and open `index.html`. If you'd still rather have one file and the originals don't need to stay editable, I can embed compressed copies instead (WebP, at most 1600 px wide, probably around 8–15 MB).

**Files**
- Hub: `/tmp/claude-0/-home-user-2026-11-01-html-output-research/1f3b733c-8091-54cd-a758-95a05b900ada/scratchpad/ws-green1/tests/html-it/green/s7/index.html`
- Screen pages: `/tmp/claude-0/-home-user-2026-11-01-html-output-research/1f3b733c-8091-54cd-a758-95a05b900ada/scratchpad/ws-green1/tests/html-it/green/s7/parts/` (from `01-login.html` to `10-help.html`)
- Screenshot folder: `/tmp/claude-0/-home-user-2026-11-01-html-output-research/1f3b733c-8091-54cd-a758-95a05b900ada/scratchpad/ws-green1/tests/html-it/green/s7/assets/` (empty apart from a README listing the file names it expects)

**What it is:** the hub opens with what to fix first, followed by a table of all ten screens that you can search and filter by issue category. Each screen page gives the issue, a suggested fix, and a slot for the screenshot, with links to the previous screen, the next screen and the hub. A screenshot appears on its page as soon as a designer copies the PNG into `assets/` under its file name. Until then the page shows a labelled "screenshot not provided" placeholder.

**Text you can paste into Teams:**
> UI audit of patient portal release R26.11: one issue is written up on each of the first 10 of 40 screens.
> Fix first: the profile shows the full insurance number (it should be masked), and appointments can be cancelled without a confirmation.
> Three more issues are accessibility problems: the login field label, unread messages shown only by colour, and unclear toggle labels.
> Unzip the folder and open index.html; each screen has its own page. Designers: drop your PNG exports into assets/.

**Gaps and limits**
- **Screenshots:** none of the 40 PNGs were provided, so every screen page shows a placeholder. I didn't invent any images.
- **Screens 11–40:** the brief has no file names or issues for them. The hub lists them as one "to be filled in" block, and I didn't create pages for them.
- **R26.11:** the brief only says it is the release being audited. Its date and scope weren't given.
- **My additions:** the issue categories, the fix-first order and the suggested fixes are mine, not the designers' audit notes, and the pages say so.
- **Checks:** all 11 pages pass `check_html.py` with no failures and no warnings. Nothing loads from the network and no libraries are used. I couldn't open the pages in a browser, so I haven't checked them visually.

If you want one round of changes, tell me what to adjust.
