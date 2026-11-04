The German release-train page for new team members is ready. You asked me not to ask questions, so I chose the following:

- **Form:** knowledge explainer for new team members (the alternatives were a one-page cheat sheet or an onboarding deck)
- **Theme:** Ivory
- **Language:** Deutsch
- **Depth:** Standard

**File:** `/tmp/claude-0/-home-user-2026-11-01-html-output-research/1f3b733c-8091-54cd-a758-95a05b900ada/scratchpad/ws-green1/tests/html-it/green/s3.html`

The page opens with the answer in two sentences. After that come a branch diagram (QA sign-off, cut, hotfix branch, merge-back to `master`, next cut after four weeks), the cycle as five steps, how to read the version number `8.4.0.1`, who is responsible, common mistakes and a short self-test. A glossary and references close the page. The only interactive parts are pop-up definitions for terms and for `R26.11`, plus self-test answers you click to open. Everything is readable without clicking, and when printed.

**Teams message, ready to paste:**

```
Für alle Neuen: So funktioniert unser Release-Train, als HTML-Seite zum Nachlesen (offline lesbar).
Kurz: Alle 4 Wochen wird nach der QA-Freigabe ein Release-Branch von master abgezweigt (zuletzt R26.11 am 2. November 2026).
Fehler im Release werden als Hotfix-Branch vom Release-Branch behoben; nach jedem Hotfix folgt der Merge-back nach master.
Versionsnummern: Major.Minor.Patch.Hotfix, z. B. 8.4.0.1. Der Release-Manager wechselt monatlich.
```

**Notes:**
- **Unresolved references:** none. Your notes explain `R26.11` (the branch cut on 2 November 2026).
- **Open points:** your notes don't answer these, so the page lists them under "Offene Punkte" instead of guessing:
  - who the release manager is right now
  - who gives the QA sign-off
  - which digit a regular release increases
  - whether the merge-back comes from the hotfix branch or from the release branch
  - how release names like R26.11 are formed
- **Next cut date:** 30 November 2026 is calculated (four weeks after 2 November). The page says the release manager's schedule is what counts.
- **Libraries:** none. The diagram is drawn directly into the file, so the page needs no internet connection.
- **Checks:** the page passed the html-it checker with no failures and no warnings. There was no browser available here, so I haven't seen it rendered at desktop or phone width, or in dark mode. Instead I went through the skill's written checklist.

If you can answer any of the open points, I'll add them to the page. I can also do one round of changes.
