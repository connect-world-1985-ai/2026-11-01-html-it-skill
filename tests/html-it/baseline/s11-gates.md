# s11 gates: questions I would ask before building

I could not ask, so I went ahead with the recommended answer for each one.

## 1. Loading highlight.js and Mermaid from a CDN
The request asks for both libraries from a CDN. The page still has to be readable if a script fails to load or is blocked.
- A. Load both from cdnjs at exact versions (highlight.js 11.9.0, Mermaid 10.9.1). Inline the highlight.js theme CSS, keep the code readable as plain `<pre>`, and keep a plain numbered list of the flow next to the diagram. **(Recommended)**
- B. Load both from a CDN at floating versions with the stock theme stylesheet. This breaks when the version changes, and the stylesheet is blocked if the page is published as an artifact.
- C. Skip the libraries: hand-colored code and an inline SVG diagram.

Recommendation: A. It does what was asked, and pinned versions keep the page stable. The fallbacks mean Priya can read the content even without the scripts. The diagram is rendered by a script I call myself (not a `pre.mermaid` block), so a viewer that renders Mermaid natively does not draw it twice.

## 2. Where the page lives
- A. Save it to `tests/html-it/baseline/s11.html` as a standalone HTML file that the team can share. Offer to publish it as a private link. **(Recommended)**
- B. Publish it as an artifact link straight away.

Recommendation: A, since the request named a file path.

## 3. Links for ADR-011, BUG-3120, the commit and the source files
The source gives no URLs for these.
- A. Show them as plain identifiers in monospace and do not invent links. **(Recommended)**
- B. Guess at tracker or repo URLs.
- C. Leave placeholders for the team to fill in.

Recommendation: A. Guessed URLs could send a new hire to the wrong place.

## 4. Linking the gotchas to the code
- A. Add short per-line notes on the snippet that say which line each gotcha applies to. Use only facts from the source. **(Recommended)**
- B. Copy the source as it is: flow, then code, then a bullet list.

Recommendation: A. A walkthrough for someone new should show where each rule bites in the code.

## 5. Code version
- A. Label the snippet as a snapshot of `BookingService.java` at `7c41e9a` on `master` that may have changed since. **(Recommended)**
- B. Show the code with no version label.
