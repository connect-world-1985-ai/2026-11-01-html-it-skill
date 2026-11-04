I couldn't ask you questions on this run, so I went with the recommended options. All the questions and their options are in `tests/html-it/green/s13-gates.md`:

- **Form:** composed release notes. A short summary comes first, then the changes grouped by who notices them, a "what to check" table, References, a Glossary, and the raw commit list in a collapsed appendix.
- **Theme:** Ivory
- **Language:** English
- **Depth:** Standard
- **Reader:** the source says nothing about who reads this. I assumed the internal team and the people closest to it: developers, QA, support and product.

About "just list the commits; everyone knows the tickets": all six commits are on the page, word for word, in the collapsed appendix. The page still opens with a one-paragraph summary, and every ticket key is a chip that links to a References entry. Someone opening the file later, or from support or product, can't make use of bare commit lines.

**File:** `C:\Users\raymond.shen\AppData\Local\Temp\claude\D--git-2026-11-01-html-output-research\dabf728a-13de-4df0-8275-99bfcecb826a\scratchpad\ws3\s13\tests\html-it\green\s13.html`

**What the page is:** a single page you read top to bottom, covering the release notes for p4m 8.4.0.1. Hovering over or focusing a ticket chip or a defined term shows a popover. The commit list is collapsed and opens on click (printing expands it), and a theme toggle switches between system, light and dark.

**Text to paste into Teams:**

```
p4m 8.4.0.1 (release 2026-11-04, date to be confirmed) is a small patch on top of 8.4.0.0.
Users: moving an appointment no longer sends the reminder SMS twice, reminder retries are now automatic, booking search uses keyset pagination, and the login form has visible labels.
Under the hood: WildFly 36.0.1 and a refactoring of the server's error handling (ExceptionMappers).
QA, operations and developers each have a short "what to check" list in the attached page.
```

**Things to know:**
- **References:** 6 found (KT-971 to KT-976), all 6 resolved from their commit messages, none unresolved. The commits give no ticket titles, owners or tracker links, and the References entries say so.
- **Release date:** the source says "released 2026-11-04", which is one day after the page was made (2026-11-03). I kept the date and marked it "To be confirmed".
- **Not stated in the source:** the retry count and interval for automatic reminder retries, the WildFly version before the update, and any performance figures for the pagination change. The page says these are missing and doesn't guess.
- **Libraries:** none inlined. The page has no network access, uses system fonts only, and passes `check_html.py` (0 failures, 0 warnings).
- **Limits:** none apply. It's a page for reading only.

I can make one round of changes, for example rewording it for practice staff or customers, which would mean product wording and no internal ticket keys. Nothing was published or uploaded.
