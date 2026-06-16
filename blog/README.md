# Blog — Entwicklertagebuch zu „Kevin gegen die Zwerge"

Hier entstehen **vollständige, veröffentlichungsreife Artikel** rund um die
Entwicklung des Spiels. Während [`LESSONS_LEARNED.md`](../LESSONS_LEARNED.md) das
knappe Logbuch ist, sind das hier ausformulierte Beiträge — direkt als Blogpost
verwendbar.

## Konvention

- Nach jedem größeren Entwicklungs- oder Lern-Schritt entsteht **ein neuer Artikel**.
- Dateiname: `YYYY-MM-DD-kurzer-slug.md`
- Jeder Artikel ist eigenständig lesbar (Einleitung, Problem, Lösung, Fazit) und
  hat einen kurzen Front-Matter-Block mit Titel, Datum und Tags.

## Schnellstart (Automatik)

Neues Artikel-Gerüst aus der Vorlage [`_TEMPLATE.md`](./_TEMPLATE.md) anlegen — das
Skript füllt Datum/Titel und trägt den Artikel automatisch in die Tabelle unten ein:

```bash
scripts/new-article.sh "mein-slug" "Mein Titel"
```

Optionaler Git-Hook, der nach Commits an `src/` ans Artikelschreiben erinnert
(einmalig pro Klon aktivieren):

```bash
scripts/setup-hooks.sh
```

## Artikel

| Datum | Titel |
|-------|-------|
| 2026-06-15 | [Ein Canvas-Spiel ohne Abhängigkeiten testbar machen](./2026-06-15-canvas-spiel-testbar-machen.md) |
| 2026-06-15 | [Zufall, Sound und localStorage testbar machen — ohne Browser](./2026-06-15-zufall-und-browser-apis-testbar.md) |
| 2026-06-16 | [Der Boss, der den Helden nie traf — ein Koordinaten-Denkfehler](./2026-06-16-der-boss-der-den-helden-nie-traf.md) |
