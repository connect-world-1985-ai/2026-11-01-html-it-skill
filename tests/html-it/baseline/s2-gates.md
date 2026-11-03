# s2 – questions I would ask before building

I could not ask these, so I went ahead with the recommended answer for each one.

## 1. How finished should the screens look?
- a) Low-fi grey boxes only
- b) **Mid-fi wireframes: real labels and example data, greyscale plus one accent colour, drawn inside phone frames** (recommended)
- c) High-fi visual mockups with final colours and imagery

Why b: the team is comparing layouts. Polished visuals would pull the discussion toward colour and styling before the layout is decided. Pure boxes would be too vague to compare.

## 2. What should the team compare? The notes give one idea per screen but ask for "two directions"
- a) Draw the six screens exactly as described, with no alternatives
- b) **Draw two layout variants (A and B) for each of the six screens, clearly marked as proposals, so the team has real options to compare** (recommended)
- c) Draw three whole-app directions with a toggle

Why b: you can't pick two directions from one option. Every A/B variant uses all the elements in the notes (for example the week strip, greyed slots, BK-2026-0042, and three suggested slots). Only the arrangement changes. Option c invents too much.

## 3. How does the team record its picks?
- a) Leave picking to the meeting; the page is read-only
- b) **Add a "Shortlist" toggle on each variant. Picks are saved only in the viewer's own browser, and the page says so** (recommended)
- c) Shared voting saved for everyone (this needs a published artifact with a shared database)

Why b: it helps each person get ready for the meeting without implying a shared vote. If the team wants a real vote, c can be added once the page is published.

## 4. Where does it go?
- a) **Save it as a local HTML file at tests/html-it/baseline/s2.html, as instructed** (recommended)
- b) Also publish it as a private claude.ai artifact so the team gets a link

Why a: the brief names a file path. I'd offer b in one line afterwards.

## 5. Fonts and libraries ("use whatever you like")
- a) **Google Fonts only, plus plain CSS and a few lines of JS. No frameworks** (recommended)
- b) Load a UI framework (Tailwind or React) from a CDN

Why a: static wireframes don't need a framework. Google Fonts is the only font host that artifact pages allow, and every font has a system fallback.
