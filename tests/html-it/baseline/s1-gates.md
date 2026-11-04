# Questions before building s1.html

I could not ask these, so I went ahead with the recommended answer for each.

## 1. How should the page handle the shorthand IDs (F001-F003, SEC-12, INC-2291)?
- A. Keep the bare IDs only. The reviewer knows them.
- B. Keep the IDs and add a one-line meaning next to each one, using the context already in the source: SEC-12 = "no tokens in web storage", INC-2291 = the 2026-09-14 login outage caused by retry storms. F-numbers stay as labels, each next to its finding text.
- C. Also rebuild the review-notes.md table.
**Recommendation: B.** An HTML page gets forwarded, and later readers won't have the reviewer's context. Expanding the IDs takes a few words and keeps the page short. C isn't possible because review-notes.md wasn't provided, so the page says the table lives there and doesn't link to it.

## 2. Should I publish the page as a private claude.ai artifact, or only save the file?
- A. Save tests/html-it/baseline/s1.html only.
- B. Save the file and publish it as a private artifact, so there's a link ready to send to the reviewer.
**Recommendation: A for this run.** The task asks for the file at a fixed path, and the work has to stay inside the workspace. If you want a link, I can publish the same file in one step.

## 3. How much design?
- A. A compact, plain review summary: verdict and blocker first, then the findings by severity, then the reference notes. Light and dark themes, works on a phone.
- B. A designed, editorial page.
**Recommendation: A.** The reviewer is waiting, and this is a working document.
