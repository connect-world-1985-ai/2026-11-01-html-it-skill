# Forms: composed from the content's traits

**The form comes from the content's traits.** First list which traits are present. Each trait brings its building blocks; combine them into one page with one reading order. The worked combinations below are examples to learn from, **not templates to force content into.** For content that matches none of them, compose from the traits (see "When nothing fits" at the end).

## Trait → building blocks

| Trait (how to spot it) | Building blocks (see `components.md`) |
|---|---|
| A decision is needed ("should we", options, trade-offs) | Recommendation first; options side by side; trade-off matrix; a "to accept this" callout with who and by when |
| Code changes (diffs, PRs, commits) | File tree with change markers; annotated diff excerpts; test evidence; risk notes; "how to review" checklist |
| Findings (review comments, audit items, bugs) | Findings list grouped by severity with filter chips; each finding: location, evidence, suggestion, ref chip |
| Order or time (steps, phases, history) | Timeline or stepper. Numbering only if the order is real |
| Structure or flow (architecture, data flow, states) | Inline SVG diagram plus a short prose walkthrough |
| Many visual items (sketches, variants, screenshots) | Gallery board, isolated `iframe srcdoc` per sketch, filters, compare mode |
| Behaviour to try (flows, interactions) | Clickable prototype with screen state machine, reset, notes |
| Numbers (metrics, benchmarks, budgets) | Tables with units; SVG charts drawn to scale; KPI row only if numbers are the point |
| Long narrative (drafts, essays, specs) | Article layout with sticky table of contents, margin notes, open-question callouts |
| Something to present (walkthrough, talk) | Deck mode with speaker notes and print fallback |
| Live tweaking (calculators, what-if, tuning) | Small tool with labelled inputs and an example state at load |
| Learning (concepts, onboarding, teaching) | One-sentence answer, mental-model diagram, worked example, stepper, glossary, optional self-check |
| Many unfamiliar terms or IDs | Glossary section plus ref chips plus References appendix (always when present) |
| Status (progress, health) | Status pills at the top; done / next / blocked; owners and dates |

Most content has two or three traits. One of them is dominant: it serves the reader's main job and sets the reading order. The others contribute blocks in support.

## Worked combinations

### 1. Pull-request write-up (code changes + light decision)
- **Fits:** a branch or PR that reviewers must understand and approve.
- **Reading order:** one-paragraph summary and reason; what changed (file tree with +/- counts); annotated diff excerpts of the key files; test evidence; risks; how to review (copyable steps); References.
- **Theme:** Graphite.
- **Do not:** paste the full diff as the page. Reviewers have the diff; the page explains it.

### 2. Code review report (findings + code changes)
- **Fits:** review comments on someone else's change.
- **Reading order:** verdict (approve / request changes) and what blocks; findings grouped by severity with filter chips, each with location, evidence and suggestion; optional annotated excerpts; References.
- **Theme:** Graphite.
- **Do not:** list findings by file order when severity is what the author needs first.

### 3. Design proposal / ADR (decision + structure)
- **Fits:** a choice between approaches that someone must sign off.
- **Reading order:** recommendation and who decides by when; problem; options side by side (effort, cost, risk); architecture diagram of the recommended option; trade-off matrix; consequences; "to accept this" callout.
- **Theme:** Ivory.
- **Do not:** hide the recommendation until after the options.

### 4. Knowledge explainer (learning + structure)
- **Fits:** "how does X work", onboarding to a concept or process.
- **Reading order:** one-sentence answer; mental-model diagram; walkthrough; worked example; costs and pitfalls; glossary; optional self-check.
- **Theme:** Ivory.
- **Do not:** start with history or definitions before the answer.

### 5. Implementation plan / roadmap (order + status)
- **Fits:** phases or tasks with owners and dates.
- **Reading order:** goal and current state; stepper or timeline of phases with status pills; per-phase detail in disclosures; risks and dependencies; open questions.
- **Theme:** Graphite.
- **Do not:** number items that can be done in any order.

### 6. Status report (status + numbers)
- **Fits:** weekly or milestone status, health checks.
- **Reading order:** status pills and the one thing that needs attention; done / next / blocked; metrics table with units and comparison; SVG charts to scale; owners and dates.
- **Theme:** Console.
- **Do not:** use a KPI tile row when there are only two numbers; a sentence is clearer.

### 7. Incident report / postmortem (order + structure + findings)
- **Fits:** an outage or near-miss, blameless format.
- **Reading order:** impact in plain words (duration, users affected, data loss); cause as an SVG chain; timeline with times and time zone; what went well and badly; action table (owner, due date); raw logs collapsed in an appendix.
- **Theme:** Console or Ivory (Ivory when management is a main reader).
- **Do not:** name a person as the cause; the cause is the process gap.

### 8. UI sketch board (many visual items)
- **Fits:** several screen ideas or variants to compare.
- **Reading order:** what the team must decide; gallery of sketches, each isolated in an `iframe srcdoc`, with annotations; filter chips by tag; compare mode for two side by side.
- **Theme:** Console (the board) — the sketches carry their own look.
- **Do not:** put sketches in the page's own DOM, where page CSS and sketch CSS clash.

### 9. Interactive prototype (behaviour to try)
- **Fits:** a flow testers or stakeholders should click through.
- **Reading order:** what to try and what is not real; the prototype (screens as states, hotspots); moderator controls (reset, jump to screen) kept apart; notes panel.
- **Theme:** Graphite for the frame; screens styled as the product.
- **Do not:** pull in a framework from a CDN; a small state machine in plain JavaScript is enough.

### 10. Draft for feedback (long narrative)
- **Fits:** an essay, spec or document people will comment on.
- **Reading order:** purpose and the feedback wanted; the article with sticky table of contents; margin notes and open-question callouts where the text is uncertain.
- **Theme:** Ivory.
- **Do not:** chop paragraphs into bullets to make it "scannable".

### 11. Walkthrough deck (something to present)
- **Fits:** a talk, review meeting or demo on a big screen.
- **Reading order:** title; the recommendation or key message early; one idea per slide; summary; decision or next step. Speaker notes per slide.
- **Theme:** Ivory (or the variant matching the content).
- **Do not:** make a deck that is unreadable when printed or opened without JavaScript.

### 12. Research comparison (decision + numbers)
- **Fits:** evaluating tools, libraries, vendors or approaches.
- **Reading order:** verdict; comparison matrix with sortable headers; per-option detail in disclosures or tabs; method and sources.
- **Theme:** Ivory.
- **Do not:** give every option equal space when two are clearly out.

### 13. Meeting notes / decision log (decisions + status)
- **Fits:** syncs, reviews, planning meetings.
- **Reading order:** decisions first; action table (owner, due date); open questions with who answers them; next meeting; attendees; optional paste-ready channel message with a copy button.
- **Theme:** Ivory or Graphite.
- **Do not:** reproduce the chronology of the discussion.

### 14. Small tool or calculator (live tweaking)
- **Fits:** what-if questions, estimates, configuration helpers.
- **Reading order:** what the tool answers; inputs with labels; output that updates on input; explanation of the formula; limits.
- **Theme:** Graphite.
- **Do not:** start with empty inputs; load with a sensible example state.

## When nothing fits

1. List the traits you see.
2. Pick the dominant reader job: **understand, decide, review, try, present, operate**.
3. Let that job set the reading order. Understand → answer first, then model, then example. Decide → recommendation, options, how to accept. Review → verdict, items by priority, evidence. Try → what to try, the interactive, what is not real. Present → slides. Operate → status, actions, owners.
4. Add the other traits' blocks in support.
5. State the composed form in Gate 1 as `Form: composed (traits: …)`, for example `Form: composed (traits: order, status, live tweaking) — a checklist tool with progress`.

If the content asks for something one offline file cannot do (shared state, live data, a real backend, files that were not provided), the form still works: build what does work, say plainly where the reader meets the limit, and offer a way that works (see `multi-part.md` and `SKILL.md`).
