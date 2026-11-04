Choices made without asking, as you requested: **Form** knowledge explainer, **Theme** Ivory, **Language** Deutsch, **Depth** Standard.

I wrote the page to `C:\Users\raymond.shen\AppData\Local\Temp\claude\D--git-2026-11-01-html-output-research\dabf728a-13de-4df0-8275-99bfcecb826a\scratchpad\ws3\s3\tests\html-it\green\s3.html`. The html-it checker passes it with 0 failures and 0 warnings.

**What the page is:** a German explainer for new team members. It opens with the one rule that matters most: a hotfix branches off the release branch, and every hotfix gets merged back into `master`. After that come a branch diagram (inline SVG), the cycle in five steps, how to read version numbers like 8.4.0.1, a made-up hotfix example, roles, common mistakes and a glossary.

**Interaction:** a light/dark switch, popovers on the R26.11 chip and on glossary terms, and a short self-test whose answers you click open. Everything is visible when printed. The page works offline as a single file.

**Ready to paste into Teams:**

> Release-Train für neue Teammitglieder erklärt (HTML im Anhang, öffnet offline):
> Alle 4 Wochen wird ein Release-Branch aus master erstellt, zuletzt R26.11 am 2026-11-02. Vorher muss die QA freigeben.
> Hotfixes zweigen vom Release-Branch ab und werden danach immer nach master zurückgemergt.
> Versionen: major.minor.patch.hotfix, z. B. 8.4.0.1 = erster Hotfix auf 8.4.0. Der Release-Manager wechselt monatlich.

**Not in your source, so the page marks them "zu bestätigen" (to be confirmed):**
- The next cut date. I calculated 2026-11-30 from "every 4 weeks", but the source does not say it.
- Who is release manager right now, and what day the role changes.
- Who in QA gives the sign-off.
- How release branches are named, and which release a version number belongs to.

**References:** one ID, R26.11. The source says what it is (the release branch cut on 2026-11-02), so it counts as resolved and has an entry in the References section.

**Libraries:** none. The diagram is drawn by hand as SVG.

The page was not published or uploaded anywhere. I can do one round of changes if you'd like, for example filling in the open points once you have the answers.
