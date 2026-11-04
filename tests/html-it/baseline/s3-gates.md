# S3 – Fragen vor dem Bau (Release-Train-Erklärseite)

Die Nutzerin hat "Write it in German. Just do it, no questions needed." gesagt. Die Sprache ist damit entschieden. Die Fragen unten würde ich trotzdem stellen, weil die Quelle an diesen Stellen offen oder widersprüchlich ist. Da ich nicht fragen kann, nehme ich jeweils die Empfehlung an.

## 1. Fachbegriffe: übersetzen oder Englisch lassen?
- A) Git-/Release-Begriffe auf Englisch lassen (Branch, Cut, Hotfix, Merge-back, Sign-off), Fließtext auf Deutsch
- B) Alles eindeutschen (Zweig, Abspaltung, Zusammenführung …)
- **Empfehlung: A.** So sprechen Entwicklerteams im Alltag, und neue Kolleginnen finden die Begriffe in Git und in Tickets wieder.

## 2. Release-Namen vs. 4-Wochen-Takt
Die Quelle sagt "alle 4 Wochen" und nennt den Release "R26.11" (sieht nach Jahr.Monat aus). Ein 4-Wochen-Takt ergibt 13 Cuts pro Jahr, also passt Jahr.Monat nicht dauerhaft (z. B. wäre der nächste Cut am 30.11.2026 noch im November).
- A) Takt als Fakt darstellen, nächsten Cut als Datum (30.11.2026) nennen, den Namen des nächsten Releases offen lassen und als Klärungspunkt markieren
- B) Annehmen, dass monatlich geschnitten wird, und "R26.12" als nächsten Release nennen
- C) Namensschema nicht erwähnen
- **Empfehlung: A.** Nichts erfinden, aber die Lücke sichtbar machen.

## 3. Zusammenhang Release-Name (R26.11) und Versionsnummer (8.4.0.1)
Die Quelle nennt beides, aber nicht, welche Versionsnummer zu R26.11 gehört.
- A) Beide Schemata erklären, das Beispiel 8.4.0.1 als Beispiel kennzeichnen, keine Zuordnung behaupten
- B) Eine Zuordnung annehmen (z. B. R26.11 = 8.4.0.0)
- **Empfehlung: A.**

## 4. Release-Manager: Namen und Rotationsplan aufnehmen?
Die Quelle sagt nur "rotiert monatlich", keine Namen.
- A) Nur die Regel nennen, Platzhalter-Hinweis "aktuelle Besetzung: siehe Team-Kalender/Wiki" ohne erfundene Namen
- B) Beispielnamen eintragen
- **Empfehlung: A.** Erfundene Personen auf einer Team-Seite führen in die Irre.

## 5. Format und Verteilung
- A) Eine eigenständige HTML-Datei (eine Datei, Inline-CSS/SVG, Hell-/Dunkelmodus), die das Team teilen kann
- B) Zusätzlich als privates claude.ai-Artifact veröffentlichen und den Link liefern
- **Empfehlung: A** für diese Aufgabe (Ablage unter `tests/html-it/baseline/s3.html` ist vorgegeben). Veröffentlichen biete ich in einer Zeile an, statt es ungefragt zu tun, da die Datei im Repo-Ablauf gebraucht wird.

## 6. Tiefe
- A) Kompakte Erklärseite: Diagramm, Ablauf in Schritten, Versionsschema, Rollen, offene Punkte
- B) Ausführliches Handbuch mit Git-Befehlen
- **Empfehlung: A.** Die Quelle enthält keine Befehle oder Tooling-Details; Befehle würde ich nicht erfinden.

## Angenommene Antworten
1A, 2A, 3A, 4A, 5A, 6A. Sprache: Deutsch.
