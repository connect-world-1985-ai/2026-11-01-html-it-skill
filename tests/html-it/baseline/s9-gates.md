# s9 – questions I would ask before building (INC-2307 postmortem)

I cannot ask, so I went ahead with the recommended answer for each one.

## 1. How should the chat log appear under the summary?
The request: "Management only reads the top. Paste the chat log in as it is underneath."
- A. Raw paste in a monospace block, exactly as given.
- B. Summary, impact, and actions at the top. Below them, the log as a timeline: every line keeps its exact wording and time, and only the layout changes (time in one column, text in the other).
- C. Rewrite the log as a narrative timeline.

**Recommendation: B.** It does what was asked: the log sits under the summary with its wording unchanged. Option C would edit the record, and a postmortem needs the record left as it is. The timeline section is labelled "Chat log excerpt, verbatim (CET)" so readers know nothing was edited.

## 2. Should people's names stay in a blameless postmortem?
- A. Keep the names as given: Tomasz on call, and the owners of the action items.
- B. Replace them with roles everywhere.

**Recommendation: A.** Action items need named owners. The on-call acknowledgement is a neutral fact. The page names no person as the cause. The cause is described as a process gap: the migration file was missing from PR 402 and LT-12 does not cover search.

## 3. Which figures may be derived?
- A. Show only the figures as given.
- B. Also show intervals measured from the log times (3 min to acknowledge, 22 min to start the rollback, 29 min to recovery, 53 min to root cause), all counted from the 09:12 alert.

**Recommendation: B, all measured from the alert.** I do not invent an incident start time, because the input gives none.

## 4. Local file or published link?
- A. Save the file at the requested path only.
- B. Also publish it as a private shareable page.

**Recommendation: A** for this run, because the task asks for a file at a set path. Publishing can be offered afterwards.
