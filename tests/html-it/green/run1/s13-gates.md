# s13 gates: questions that would have been asked before building

These questions could not be asked (unattended run). The recommended option was taken for each one, except language, which is English for this scenario.

## Gate 1: plan card

```
Plan: p4m 8.4.0.1 release notes
Reader: the p4m development team, plus QA and operations who test and deploy the release (assumed, see question 5)
Job: understand what changed, then test and deploy it
Form: composed release notes (traits: code changes, status, many IDs) — outcome first, changes grouped by what they mean for the reader, "before you deploy" checks, commit list collapsed in an appendix
Outline: 1. What changes (grouped: fixes, behaviour changes, accessibility, platform upgrade, internal)  2. Before you deploy  3. Open questions the commits do not answer  4. References  5. Glossary  6. Appendix: commit list since 8.4.0.0
Interactivity: none, reading only (ref and glossary popovers from the shell, copy button on the commit list)
References: 7 found, 6 resolved, 1 unresolved
```

(The six resolved references are the ticket keys KT-971 to KT-976; each is explained only by its own commit message, and no tracker address is known. The unresolved one is the product name "p4m".)

Pressure noted: "Just list the commits; everyone knows the tickets." This changes emphasis, not the rules: the commit list is kept verbatim in a collapsed appendix, but the page still opens with the outcome, and every ticket key gets a chip and a References entry, because a reader months from now (or anyone outside the team) does not know the tickets.

1. **Form**
   A. Composed release notes: outcome first, changes grouped by what they mean, deploy checks, commit list in an appendix (Recommended — readers need to know what to test and what changes in behaviour, not only which commits landed)
   B. Plain changelog: one table of the six commits with ticket chips and a one-line explanation each
   C. Two-part page: short "what's new" for non-developers on top, technical notes below

2. **Theme**
   A. Ivory (reading)
   B. Graphite (code, reviews, specs) (Recommended — this is a technical change list read by developers, QA and operations)
   C. Console (status, dashboards)

3. **Language**
   A. English (Recommended; fixed for this scenario)
   B. Deutsch
   C. 中文

4. **Depth**
   A. Brief (one-screen summary, details collapsed)
   B. Standard (Recommended — six changes fit on a page with their explanations and deploy checks)
   C. Full (everything plus appendix)

## Conditional gates

5. **Reader unclear** (the fixture says "Nothing else is known about who will read this"). Who will read it?
   A. The team: developers, QA and operations who build, test and deploy p4m (Recommended — the source is commit messages with ticket keys, which suits an internal technical audience; customer-facing notes would need product input on wording and impact)
   B. Management or product owners (would shift to impact and risk, fewer technical terms)
   C. New joiners (more definitions, more background)
   D. External: customers or practice staff using p4m (would need a different, non-technical page; ticket keys and the WildFly upgrade would be left out)

6. **Unresolved reference: "p4m"** (the product name; nothing provided says what p4m is). What should happen?
   A. Look further — where? (for example a repository README or product wiki; none was provided)
   B. Explain it from context you give me (one sentence on what p4m is)
   C. Leave it marked unresolved on the page (Recommended — no source explains it and guessing would be worse; the page still makes sense, since readers of release notes generally know the product)

   Ticket keys KT-971 to KT-976 are treated as resolved from their commit messages only. If you can give the issue tracker's address, the References entries can link to each ticket.

Size gate and image gate: not asked (no raster media; no image would add meaning).
