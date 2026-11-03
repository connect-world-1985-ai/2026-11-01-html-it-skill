# s3: Fragen vor dem Bauen (Gates)

Der Nutzer hat gesagt: "Write it in German. Just do it, no questions needed." Laut Skill (Hard rule 4) entfällt damit das Fragen; die vier Entscheidungen werden stattdessen oben in der Antwort genannt. Die Fragen, die sonst gestellt würden, stehen hier mit Empfehlung; angenommen wurden jeweils die empfohlenen Optionen, die Sprache ist Deutsch.

## Gate 1: Plan-Karte

```
Plan: Der Release Train
Reader: neue Teammitglieder im Softwareteam   Job: verstehen (und danach im Alltag richtig handeln)
Form: Wissens-Erklärseite (traits: learning, structure, order)
Outline: 1. Das Wichtigste in einem Satz  2. Branch-Modell (SVG-Diagramm)  3. Ein Zyklus Schritt für Schritt
         4. Versionsnummern  5. Rollen  6. Beispiel: ein Hotfix  7. Offene Punkte (zu bestätigen)
         8. Selbsttest  9. Referenzen  10. Glossar
Interactivity: Glossar- und Referenz-Popover, aufklappbarer Selbsttest; sonst nur Lesen
References: 1 gefunden (R26.11), 1 aufgelöst, 0 unaufgelöst
```

1. Form?
   A. Wissens-Erklärseite mit Branch-Diagramm, Schrittfolge und Beispiel (Recommended: neue Kolleginnen und Kollegen sollen ein Modell verstehen, nicht eine Entscheidung treffen)
   B. Kurze Checkliste "Was tue ich bei einem Hotfix?"
   C. Präsentations-Deck für ein Onboarding-Meeting

2. Theme?
   A. Ivory (Recommended: Erklärtext, der von oben nach unten gelesen wird)
   B. Graphite
   C. Console

3. Sprache?
   A. English
   B. Deutsch (vom Nutzer vorgegeben, daher gewählt)
   C. 中文
   (Die Skill-Empfehlung wäre English; der Nutzer hat ausdrücklich Deutsch verlangt.)

4. Tiefe?
   A. Brief
   B. Standard (Recommended: der Quelltext ist kurz; Standard erklärt jeden Begriff, ohne Inhalte zu erfinden)
   C. Full

## Bedingte Gates

- Leser unklar: nein, der Auftrag nennt "new team members". Kein Gate.
- Unaufgelöste Referenzen: keine. `R26.11` ist aus dem Text selbst erklärt (Release-Branch, Cut am 2026-11-02). Kein Gate.
- Größe > ~20 MB: nein (nur Text und SVG). Kein Gate.
- Bild-Tool vorhanden: nein. Kein Gate; das Diagramm wird als SVG gezeichnet.

## Keine Gates, aber im Dokument als "zu bestätigen" markiert

- Wer aktuell Release-Manager ist und wann die Rotation wechselt (nur "rotiert monatlich" bekannt).
- Was das QA-Sign-off konkret prüft und wer es gibt.
- Ob ein Hotfix zuerst in den Release-Branch übernommen wird (Quelle sagt nur: Hotfix-Branch vom Release-Branch, Merge-back nach master nach jedem Hotfix).
- Datum des nächsten Cuts (2026-11-30 ist nur aus "alle 4 Wochen" errechnet).
- Bedeutung des Namensschemas R26.11 und welche Versionsnummer zu R26.11 gehört.
