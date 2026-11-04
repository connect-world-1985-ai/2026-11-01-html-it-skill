Architecture sync, 2026-11-03, 10:00-10:45. Present: Lena, Tomasz, Priya, Raymond. Absent: Jonas.
Raw notes:
- PR 431 (booking API pagination) is ready; Tomasz merges after Priya re-reviews.
- Decision D-14: we drop the XML export endpoint in 9.0; customers get two releases of notice.
- Decision D-15: integration tests move to Testcontainers; Docker-in-Docker on the CI agents stays until KT-940 is done.
- Open question: who owns the SMS gateway contract renewal? Jonas to answer (he was absent).
- Action: Lena updates ONB-01 with the Testcontainers setup by 2026-11-10.
- Action: Priya re-reviews PR 431 by 2026-11-04.
- Action: Raymond drafts the XML-export deprecation notice by 2026-11-07.
- Next sync: 2026-11-10, 10:00.
Also needed: a short message we can post in the team channel that points to the page.
Context: D-14 and D-15 are new entries in the team's decision log. KT-940 is "Upgrade CI agents to Docker 27". ONB-01 is the onboarding handbook "How we work".
