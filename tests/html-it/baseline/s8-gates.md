# s8 gates: questions I would ask before building

I cannot ask, so each question lists the options and the answer I assumed (marked **Recommended**).

## 1. Which Chinese, and what stays untranslated?
- A. **Recommended:** Simplified Chinese (Shanghai office). Keep people's names (Lena, Tomasz, Priya, Raymond, Jonas), IDs (PR 431, D-14, D-15, KT-940, ONB-01), product terms (Testcontainers, Docker-in-Docker, XML) and version "9.0" in Latin script, so they stay searchable and match Jira, GitHub and the decision log.
- B. Translate everything, including the ticket titles.
- C. Bilingual page (Chinese with English underneath).

## 2. How short is "just clean up the notes"?
- A. **Recommended:** One screen. Decisions, action items (owner and due date), and the open question first; attendance and next sync as a header line. Nothing is dropped: every decision, action, owner and date from the raw notes appears once.
- B. Shorter still: only action items.
- C. Full minutes with discussion context (there is none in the notes, so I would have to invent it; rejected).

## 3. Time zone for 10:00 (this meeting and the next sync on 2026-11-10)?
The notes don't say. Shanghai readers will read "10:00" as Beijing time, which is probably wrong if the meeting is held elsewhere.
- A. **Recommended:** Show "10:00" exactly as in the notes and add a short note that the time zone is the organizer's and not stated in the notes. Do not convert, because a guessed conversion would be wrong.
- B. Convert to Beijing time (needs the source time zone from you).

## 4. Fonts?
- A. **Recommended:** System CJK fonts only (PingFang SC, Microsoft YaHei, Noto Sans CJK SC) and no Google Fonts. Google Fonts loads unreliably from mainland China, and a CJK web font is several MB.
- B. Load Noto Sans SC from Google Fonts.

## 5. Channel message language and where it lives?
- A. **Recommended:** A short Simplified Chinese message, delivered next to the page (in my reply) so it can be pasted into the channel. The link stays a placeholder until the page has a URL.
- B. English message.
- C. Put the message inside the page as well.

## 6. Publish or file only?
- A. **Recommended:** Save the file at `tests/html-it/baseline/s8.html` as instructed, and don't publish it. Publishing is a separate step for the team once the time zone (gate 3) is confirmed.
- B. Publish it as a private artifact now and use its URL in the channel message.
