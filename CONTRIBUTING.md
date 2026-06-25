# Mitarbeit — Kevin gegen die Zwerge

Kurzanleitung für alle, die am Spiel mitentwickeln. Den Architektur-Überblick gibt
[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).

## Lokal ausführen

Kein Build, keine Installation nötig:

```bash
# Variante A: index.html direkt im Browser öffnen
# Variante B: einfacher Static-Server (gut auch fürs Handy im selben Netz)
python3 -m http.server 8000   # http://localhost:8000
```

## Tests

```bash
npm test        # oder: node --test
node --check src/*.js   # schnelle Syntaxprüfung
```

- Tests laufen mit dem **eingebauten Node-Runner** – ohne Abhängigkeiten.
- Bei jedem Push/PR läuft CI (`.github/workflows/tests.yml`).
- Ein **Smoke-Test** (`tests/smoke.test.js`) prüft, dass `index.html` alle
  `src/`-Skripte einbindet und `game.js` zuletzt lädt.

## Projekt-Konventionen

1. **Logik vom Rendering trennen.** Was *entscheidet* (Treffer, Score, Freischaltung)
   gehört in pure, DOM-freie Module; was *zeichnet*, lebt im `renderer.js` und liest
   nur einen read-only Snapshot.
2. **Pure Module sind testbar – also testen.** Neue Spiellogik kommt mit Unit-Tests
   (siehe `tests/`). Faustregel: keine neue Regel ohne Test.
3. **Abhängigkeiten injizieren.** Zufall (`rng`) und Speicher (`storage`) werden als
   Parameter hereingereicht (siehe `daily.js`, `stats.js`) – so bleibt alles
   deterministisch testbar.
4. **Konstanten in `config.js`.** Balancing-Werte nicht als Literale verstreuen.
5. **Dualer Export + Resolution.** Jede Datei registriert sich für Browser (`window`)
   und Node (`module.exports`); Abhängigkeiten werden über das in
   [ARCHITECTURE.md](./docs/ARCHITECTURE.md#brownode) beschriebene Muster aufgelöst.
6. **Skript-Reihenfolge.** Neue `src/`-Datei in `index.html` **vor** `game.js` und
   nach ihren Abhängigkeiten einbinden (`config.js` zuerst). Der Smoke-Test erzwingt
   die vollständige Einbindung.

## Doku mitpflegen (wichtig!)

Nach **jedem größeren Entwicklungs- oder Lern-Schritt**:

- ein Eintrag im Logbuch [LESSONS_LEARNED.md](./LESSONS_LEARNED.md),
- ein ausformulierter Artikel unter [blog/](./blog/) (Gerüst via
  `scripts/new-article.sh "slug" "Titel"`),
- bei neuen/aktualisierten Features: [docs/FEATURES.md](./docs/FEATURES.md) und
  [CHANGELOG.md](./CHANGELOG.md) aktualisieren,
- relevante Stellen in [README.md](./README.md) anpassen.

## Commits & Branches

- Aussagekräftige Commit-Messages (was + warum).
- Entwicklung auf einem Feature-Branch; erst committen/pushen, wenn gewünscht.
- Optional: `scripts/setup-hooks.sh` aktiviert einen Reminder-Hook, der nach
  Änderungen an `src/` ans Artikelschreiben erinnert.
