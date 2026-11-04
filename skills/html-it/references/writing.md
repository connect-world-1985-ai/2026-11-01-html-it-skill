# Writing: pages for people, not for the agent

Read this before writing any copy for an html-it page. The form and the theme get a reader to the right place; the writing decides whether they understand and act.

## 1. The reader was not in the conversation

Write for a teammate who opens this file cold in three months, from an old Teams thread, with no access to the chat that produced it. They do not know what "the fix", "option 2" or "F001" means unless the page tells them. Before writing, name that reader to yourself: "a backend engineer who joined last month", "the product manager who owns booking".

## 2. Open with the conclusion

The first paragraph under the `<h1>` (the `.lede`) says three things:

1. what this is;
2. the outcome or recommendation;
3. what the reader should do, if anything.

Then the evidence, then the detail. A manager who reads only the first paragraph should leave with the right picture.

> Request changes: the session refresh in pull request 418 stores the refresh token where any script on the page can read it. That finding blocks the merge; Lena fixes it by 7 November 2026. Two smaller findings can follow in the same pull request.

## 3. Full sentences

Bullets are for real lists: parallel items of the same kind (files, owners, steps). They are not for chopping an argument into fragments. An explanation, a reason or a trade-off is a paragraph. Avoid paragraphs that are only bold labels ("**Impact:** high. **Effort:** low."); use a table if the content really is a grid.

## 4. Define every term

Any term a new teammate might not know gets defined at first use: wrap it in `<dfn data-gloss="one-sentence definition">term</dfn>` and add it to the Glossary section. Expand acronyms on first use: "service-level objective (SLO)". Internal code names and IDs follow `references/cross-references.md`.

## 5. Say why

"We moved token storage to an HttpOnly cookie" is half a sentence. "…so that scripts on the page, including injected ones, can no longer read it" is the half the reader needs to judge it.

## 6. Absolute dates and real names

- Dates: "3 November 2026" in prose, "2026-11-03" in tables. Never "yesterday", "last sprint", "next week".
- Times carry a time zone: "09:12 CET".
- Name the real system, file or person: "`auth/session.ts`", "the booking API", "Priya". Not "the service", "the file", "the team".

## 7. Numbers carry units and a comparison

"p95 latency 840 ms, up from 310 ms last week." A bare number ("840") makes the reader guess both the unit and whether it is good.

## 8. Voice

- Write about the subject, not about the agent or the document. "The retry loop has no backoff", not "I found that the retry loop…".
- Active voice, plain verbs: "Lena fixes it", not "it will be addressed".
- Sentence case headings: "What changes for practice staff", not "What Changes For Practice Staff".
- Errors and limits are stated plainly and say what to do instead.

## 9. Agent-speak blacklist

Never write these in a page:

- "I've / I have / I'll / Let me / We'll now"
- "As discussed / as mentioned above / as per"
- "leverage, robust, seamless, delve, comprehensive, cutting-edge, game-changer, streamline"
- "It's worth noting / Note that / Importantly,"
- "In this document we will"
- status emoji used as bullets or labels (✅ ❌ 🚀 ✨ 🎉 ⚠️)
- "TL;DR:"
- "Summary:" as the first word of a paragraph
- "Here's a breakdown"
- ending a sentence with "…and more!"

Use a real status pill (`<span class="pill" data-state="ok">On track</span>`) instead of emoji. The test grep for these words is:

```
grep -niE "I've|I have|I'll|Let me|as discussed|as mentioned|leverag|robust|seamless|delve|worth noting|TL;DR|✅|❌|🚀|✨|🎉" page.html
```

It also matches inside code and comments, so keep those clean too.

## 10. Language

Write natively in the language chosen in Gate 1. Do not translate an English draft word for word.

- **English:** plain international English; avoid idioms that do not travel ("ballpark", "boil the ocean").
- **German (Deutsch):** use the formal "Sie" only if the team convention requires it; otherwise a neutral, impersonal style ("Der Release-Branch wird alle vier Wochen erstellt"). Compound nouns are fine; English technical terms that the team uses (Branch, Merge, Hotfix) stay English. Set `lang="de"`.
- **Chinese (中文):** Simplified Chinese, full-width punctuation in prose (，。：；（）), and a consistent choice about spaces between Chinese and Latin words (either always or never). Set `lang="zh-CN"`.
- In every language, code, identifiers, file names, people's names, ticket keys and quoted source text stay exactly as written.

Interface labels (buttons, toggle text, "References", "Glossary") are in the page language too.

## 11. Self-test before delivery

- Could a new teammate act on this page without asking anyone?
- Is every sentence about the subject?
- Would I say this sentence out loud to a colleague?
- Does the first paragraph still make sense if it is the only thing read?

If any answer is no, rewrite that part.

## 12. Before and after

Agent-style:

> ✅ **Summary:** I've analysed the PR and it's worth noting there are a few issues. Let me break it down:
> - **F001** – high – localStorage
> - **F002** – medium – backoff
> TL;DR: needs changes 🚀

Human:

> Pull request 418 should not be merged yet. Its new session refresh keeps the refresh token in `localStorage`, where any script on the page can read it; the team's security rule "no tokens in web storage" forbids that. Lena moves the token to an HttpOnly cookie by 7 November 2026. Two smaller issues, a retry loop without backoff and a log line that prints the user's email, can be fixed in the same pull request.
