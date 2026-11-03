# s12 gates: PR 437 write-up

Questions I would ask before building. I could not ask, so I continued with the recommended answer for each.

## 1. How much explanation should the page carry, given "reviewers only want the diff"?

- A. Diff only: the changed-files list and the code excerpt, nothing else.
- B. Diff first, then short Why / Risk / How to test sections underneath. (recommended)
- C. Full narrative write-up with the diff at the end.

Recommendation: **B**. Honour the request by putting the diff at the top and keeping prose to a few lines. Do not drop the risk note: the response no longer includes the total count, which is a breaking API change. A reviewer who reads only the diff will miss it, and mobile app 3.2 depends on it. The test steps are two lines and save reviewers time.

## 2. Where does the page go?

- A. Save the HTML file at tests/html-it/baseline/s12.html only. (recommended)
- B. Also publish it as a private artifact and return a link to paste into the PR.

Recommendation: **A**. The task names this file path and keeps the work inside the workspace. Publishing it is a one-step follow-up if the team wants a link.

## 3. KT-948 and INC-2307: link them or not?

- A. Show the plain IDs with their one-line descriptions. (recommended)
- B. Turn them into links to the tracker or incident tool.

Recommendation: **A**. No tracker URLs were given, and I won't guess them.

## 4. Full diff or the excerpt?

- A. Show only the excerpt that was provided, labelled as an excerpt. (recommended)
- B. Rebuild the full diff of each file.

Recommendation: **A**. I only have the excerpt. Writing the rest of the diff would mean making up code.
