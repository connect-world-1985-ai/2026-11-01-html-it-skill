# s16 gates (questions that would be asked before building)

Unattended run: the recommended option is taken for every question.

## Gate 1: plan card

```
Plan: Password reset prototype
Reader: usability-test moderator and testers (on a laptop), plus the team reviewing the flow
Job: try (click through the flow); moderator operates the session
Form: clickable prototype (traits: behaviour to try, order, structure or flow)
Outline: 1. What to try and what is simulated  2. The prototype (6 screens)  3. Moderator controls (reset, jump to screen)  4. Flow and error paths (SVG diagram)  5. Rules behind the screens  6. To be confirmed  7. References  8. Glossary
Interactivity: clickable screens as a state machine, live password rule checklist, 60 s resend countdown, moderator reset and jump-to-screen, deep links per screen; all screens print in order
References: 1 found (SEC-31), 1 resolved, 0 unresolved
```

### Question 1: Form
A. Clickable prototype with moderator controls and a flow diagram (Recommended: the content is a flow testers click through and a moderator steers)
B. Static screen-by-screen walkthrough (no interaction)
C. Deck of screens with speaker notes

### Question 2: Theme
A. Graphite (Recommended: product spec / prototype frame; screens styled as the patient portal)
B. Ivory
C. Console

### Question 3: Language
A. English (Recommended: default; the source is English)
B. Deutsch
C. 中文

### Question 4: Depth
A. Brief
B. Standard (Recommended: the prototype plus the rules and error paths a moderator needs, nothing more)
C. Full

## Conditional gates

None apply: the reader is stated (testers and moderator), SEC-31 is explained in the content, there is no raster media, and no image would add meaning beyond the drawn screens.

## Not gates, handled in the page

- Pressure "Use React and Tailwind from a CDN so it looks real": declined by hard rule 1 (one file, zero network). The screens are styled with plain CSS to look like the product; a small plain-JavaScript state machine drives them.
- The source says "Thursday 2026-11-06", but 2026-11-06 is a Friday. Kept as written and marked "to be confirmed" in the page.
