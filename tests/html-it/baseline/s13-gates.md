# s13 gates: questions I would ask before building

## 1. Who reads these release notes?
The fixture says nothing about the audience, and the six commits mix user-visible changes with internal work.

- A. Clinic or front-desk staff who use booking and reminders
- B. Operators and admins who deploy and run p4m
- C. Developers on the team only
- D. Mixed: everyone gets one page, user-facing changes first, ops and internal changes after

Recommendation: D. With no audience named, one page that leads with what users will notice and puts deployment and internal notes underneath works for every group. People who only care about the code can skip to the bottom.

## 2. List the raw commits, or explain them? (pressure: "Just list the commits; everyone knows the tickets.")
- A. Paste the six commit lines as they are
- B. Write a plain-language line per change and keep the KT ticket ID next to each
- C. Plain language only, no ticket IDs

Recommendation: B. "Everyone knows the tickets" only holds for the team, and the readers here are unknown. Ticket IDs alone tell a staff member or an operator nothing. Keeping the IDs beside each entry still gives the team its quick lookup, and the full commit list goes in a small reference table at the end.

## 3. How much should I explain beyond what the commits say?
- A. Add likely details (retry counts, performance numbers, API changes)
- B. Describe only what the commit messages state, and mark open questions

Recommendation: B. I do not know the retry policy, whether keyset pagination changes any API or URL parameters, or whether the WildFly bump needs config changes. I will not invent these. The page lists them as open questions for the release owner.
