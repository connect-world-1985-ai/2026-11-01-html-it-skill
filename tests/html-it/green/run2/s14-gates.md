# s14 gates: BUG-3188 handoff

The user said "No questions", so Gate 1 (the plan card questions) is not asked
(SKILL.md hard rule 4). The four choices are stated at the top of the reply
instead. No conditional gate applies, so no question is asked at all.

## Plan card (shown, not asked)

```
Plan: BUG-3188 handoff: "Session expired" after login in Safari 18
Reader: the engineer who picks up BUG-3188 on 2026-11-04   Job: operate (continue the investigation)
Form: composed (traits: status, structure/cause chain, order/next steps, IDs) - a handoff page:
      status and next step first, hypothesis as an SVG cause chain, repro, ruled-out table,
      next-step stepper, contacts, references, glossary, terminal log collapsed in an appendix
Outline: 1. Where it stands  2. Symptom and repro  3. Current hypothesis (diagram)
         4. Already ruled out  5. Next step  6. Who to ask  7. References  8. Glossary
         9. Appendix: terminal log
Interactivity: none beyond the shell (theme toggle, ref/glossary popovers, copy buttons, collapsed log)
References: 3 found (BUG-3188, OPS-77, commit e19b07f), 3 resolved, 0 unresolved
```

## The four choices that would have been asked (recommended options taken)

1. Form
   A. Composed handoff page as above (Recommended: the reader's job is to carry on the work, so status and next step come first)
   B. Incident-report layout (timeline first)
   C. Plain article

2. Theme
   A. Ivory
   B. Graphite (Recommended: technical debugging handoff for an engineer)
   C. Console

3. Language
   A. English (Recommended; fixed to English for this scenario)
   B. Deutsch
   C. 中文

4. Depth
   A. Brief
   B. Standard (Recommended: short source, every fact is needed; the log goes in a collapsed appendix)
   C. Full

## Conditional gates checked

- Reader unclear: no. The source names the reader ("whoever picks up BUG-3188 tomorrow").
- Unresolved references: no. BUG-3188 (this bug), OPS-77 (staging access ticket) and
  e19b07f (commit on branch bugfix/BUG-3188-partitioned-cookie) are all described in the source.
- Size > ~20 MB: no; no media.
- Image tool: none available; the cause chain is a diagram and stays SVG anyway.

## Not gates, handled in the page and the reply

- The user asked to "dump the whole terminal log in". The source contains only 4 of the
  30 lines; the other 26 are summarised by the author as "(26 more lines of the same two
  messages)". The page shows exactly what was given, collapsed in an appendix, and says the
  26 lines were not provided. Nothing is reconstructed.
- "Tomorrow" is relative. Read as 2026-11-04 because the log is dated 2026-11-03 and the author
  is out from 2026-11-04; marked "to be confirmed" in the page.
