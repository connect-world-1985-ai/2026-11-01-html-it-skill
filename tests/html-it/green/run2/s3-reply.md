Die deutsche Seite zum Release Train ist fertig. Sie öffnet offline und hat die Seitenprüfung ohne Fehler und ohne Warnungen bestanden.

Sie wollten keine Rückfragen, deshalb habe ich diese vier Punkte selbst entschieden:
- **Form:** Erklärseite für neue Teammitglieder: zuerst das Ergebnis, dann ein Diagramm der Branches, die Schritte eines Zyklus, ein Beispiel mit einem Hotfix, ein Glossar und ein kurzer Selbsttest.
- **Theme:** Ivory, weil die Seite zum Durchlesen gedacht ist.
- **Sprache:** Deutsch, wie gewünscht.
- **Tiefe:** Standard.

Die Fragen, die ich sonst gestellt hätte, stehen mit meinen Empfehlungen in `/tmp/claude-0/-home-user-2026-11-01-html-output-research/1f3b733c-8091-54cd-a758-95a05b900ada/scratchpad/ws-green2/tests/html-it/green/s3-gates.md`.

**Datei:** `/tmp/claude-0/-home-user-2026-11-01-html-output-research/1f3b733c-8091-54cd-a758-95a05b900ada/scratchpad/ws-green2/tests/html-it/green/s3.html`

**Aufbau:** Die Seite wird von oben nach unten gelesen. Das Diagramm ist als SVG direkt in die Datei gezeichnet. Fährt man mit der Maus über einen Fachbegriff oder über den Verweis auf R26.11, erscheint eine kurze Erklärung. Außerdem gibt es ein Inhaltsverzeichnis, einen Umschalter für helles und dunkles Farbschema und aufklappbare Fragen im Selbsttest. Beim Drucken erscheint alles, auch die zugeklappten Antworten.

**Text für Teams oder den Chat (zum Kopieren):**
> Für alle Neuen: So funktioniert unser Release Train (HTML-Datei im Anhang, öffnet offline).
> Alle 4 Wochen wird aus master ein Release-Branch abgezweigt, zuletzt R26.11 am 2026-11-02. Vorher muss QA freigeben.
> Hotfixes zweigen vom Release-Branch ab, und nach jedem Hotfix wird die Korrektur zurück nach master gemergt.
> Versionen folgen dem Schema major.minor.patch.hotfix, z. B. 8.4.0.1. Die Rolle des Release-Managers wechselt monatlich.

**Was die Quelle offenlässt (in der Seite als „zu bestätigen“ markiert, nichts davon erfunden):**
- Wer gerade Release-Manager ist und wann die Rolle wechselt.
- Was beim QA-Sign-off geprüft wird und wer freigibt.
- Ob ein Hotfix vor dem Merge-back erst in den Release-Branch kommt. Im Diagramm ist das gestrichelt als Annahme eingezeichnet.
- Der nächste Cut am 30. November 2026 ist nur aus „alle 4 Wochen“ errechnet.
- Wie der Name R26.11 gebildet wird und welche Versionsnummer dazu gehört.

**Weiteres:**
- **Verweise:** Es gibt nur einen, R26.11. Er ist aus dem Text erklärt, offene Verweise gibt es keine.
- **Bibliotheken und Schriften:** keine. Die Seite nutzt Systemschriften.
- **Zahlen im Beispiel:** Die Versionsnummern 8.4.0.0 bis 8.4.0.2 sind als Beispiel gekennzeichnet.
- **Veröffentlichung:** Die Seite liegt nur als Datei vor und wurde nirgends hochgeladen.

Wenn Sie etwas ändern möchten, mache ich gern eine Runde Anpassungen, zum Beispiel sobald die offenen Punkte geklärt sind.
