# s7 screenshot audit: questions before building

I could not ask these, so I went ahead with the recommended answer for each one.

## 1. Embed the 40 screenshots in the HTML, or keep them as separate image files?
- A. Embed every PNG as base64 inside index.html, giving one self-contained file.
- B. Keep the PNGs as separate files in `s7/screens/` and have the page reference them by relative path.
- **Recommendation: B.** The 40 PNGs total about 52 MB, and base64 makes that about 70 MB. A published page can be at most 16 MB, embedded data: URIs included, so option A can't be published at all and would be very slow to open locally. The designers will also keep re-exporting the PNGs from Figma. With B, they drop a new file into `screens/` and the page shows it, with no rebuild. The HTML itself stays a single file, so the team still gets "one HTML" for the page.

## 2. One page with every screen, or a view per screen?
- A. One long page that shows all 40 full-page screenshots.
- B. One HTML file with an index plus a view for a single screen, linkable as `#01-login` and so on.
- C. 40 separate HTML files.
- **Recommendation: B.** The developers want to open one screen at a time. Hash views give each screen its own link inside the same file. Only the image for the open screen loads, not 52 MB at once.

## 3. The screenshots are not in the repository. What should the page show for them?
- A. Wait until the designers deliver the PNGs.
- B. Build now. Each screen shows its expected filename and size, and the real image appears as soon as the file is placed at that path.
- **Recommendation: B.**

## 4. Screens 11 to 40 have no names or issues yet. What should the page do with them?
- A. Leave them out.
- B. List them as numbered rows marked "issue to be filled in", so the total of 40 is visible and the gaps are obvious.
- **Recommendation: B.** I won't invent screen names or issues for them.

## 5. Patient data in the screenshots
Screen 08 (profile) shows a full insurance number. If any screenshot was taken with real patient data, sharing the page spreads it.
- A. Use the screenshots as they are.
- B. Ask the designers to confirm that every capture uses test accounts, or to redact real data, before anyone shares the page.
- **Recommendation: B.** The page also shows a note about this on screen 08.

## 6. Share it as a published page or as a local file?
- A. Publish it as a private artifact link.
- B. Save it locally only, as this task asked.
- **Recommendation: B for now.** The images aren't there yet and question 5 is still open. Once both are settled, publish `index.html` together with `screens/*.png`, which upload as supporting files, each under the per-file limit.
