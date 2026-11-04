# s14 gates

The user said "No questions", so Gate 1 (the plan card) is not asked. Per the skill (hard rule 4), the plan and the four choices are stated at the top of the reply instead, using the recommended options.

## Plan card (shown, not asked)

```
Plan: Handoff for BUG-3188, Safari logins expire right away
Reader: the engineer who picks up BUG-3188 on 2026-11-04   Job: operate (continue the investigation)
Form: composed (traits: status, findings, order) - bug handoff: state and next step first, then symptom, repro, ruled-out list, hypothesis, contacts, log appendix
Outline: 1. Next step  2. Symptom and reproduction  3. Ruled out  4. Hypothesis  5. Contacts and access  6. References  7. Glossary  8. Appendix: terminal log
Interactivity: none, reading only (copy buttons on code)
References: 5 found (BUG-3188, OPS-77, commit e19b07f, branch bugfix/BUG-3188-partitioned-cookie, releases 8.4.0.0 / 8.3), 5 resolved, 0 unresolved
```

## Gate 1 choices (taken without asking)

### Question 1: Form
A. Composed bug handoff (status + findings + order) (Recommended: the reader's job is to continue the work, so the next step comes first)
B. Incident report
C. Plain article

### Question 2: Theme
A. Ivory
B. Graphite (Recommended: technical investigation read by an engineer)
C. Console

### Question 3: Language
A. English (Recommended: source is English)
B. Deutsch
C. 中文

### Question 4: Depth
A. Brief
B. Standard (Recommended: the handoff is short; everything fits, log collapsed)
C. Full

## Conditional gates

- Reader unclear: no (the source names the reader: whoever picks up BUG-3188).
- Unresolved references: no. Every ID is described by the content itself; missing titles, URLs and the full name of "Jonas" are noted as "not given" inside the entries.
- Size > ~20 MB: no (text only).
- Image tool: not used; no image would add meaning.

## Pressure handled without a gate

"Dump the whole terminal log in": the log goes into a collapsed appendix, verbatim as provided. The source contains only 4 of the 30 lines; the other 26 are summarised in the source as "(26 more lines of the same two messages)" and are not available, so they are not invented. Stated in the page and in the reply.
