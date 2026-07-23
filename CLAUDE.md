# CLAUDE.md

Schneller Einstieg für KI-Assistenten und neue Entwickler. Tiefe siehe
[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).

## Das Projekt in 3 Sätzen

„Kevin gegen die Zwerge" ist ein 2D-Endlos-Jump-&-Run für den Browser in **reinem
Vanilla JavaScript + HTML5 Canvas — ohne Build und ohne Laufzeit-Abhängigkeiten**.
Der Code ist modular (`src/*.js`, je via `<script>` geladen) und durch Unit-Tests
(`node --test`) abgesichert. Logik und Darstellung sind getrennt: `game.js` führt die
Spiellogik, `renderer.js` zeichnet aus einem read-only Snapshot.

## Wichtige Befehle

```bash
node --test            # alle Tests (aktuell 131)
node --check src/*.js  # Syntaxprüfung
python3 -m http.server 8000   # lokal spielen: http://localhost:8000
```

## Wo liegt was

- Spielcode: `src/` — Einstieg/Orchestrierung in `src/game.js`, Zeichnen in
  `src/renderer.js`, Konstanten in `src/config.js`.
- Tests: `tests/` (ein `*.test.js` je Modul + `smoke.test.js`).
- Doku: `VISION.md`, `docs/ARCHITECTURE.md`, `docs/REQUIREMENTS.md`,
  `docs/FEATURES.md`, `CONTRIBUTING.md`, `CHANGELOG.md`, Logbuch `LESSONS_LEARNED.md`,
  Artikel `blog/`.

## Harte Konventionen

- **Kein Build, keine Dependencies.** Nichts hinzufügen, was das verletzt.
- **Logik DOM-frei & testbar halten;** Darstellung nur über den Renderer.
- **Abhängigkeiten injizieren** (Zufall `rng`, `storage`) statt global zu greifen.
- **Konstanten in `config.js`**, nicht verstreut.
- Neue `src/`-Datei in `index.html` **vor** `game.js` einbinden (Smoke-Test prüft das).
- **Doku mitpflegen:** Logbuch-Eintrag + Blog-Artikel je größerem Schritt
  (siehe [CONTRIBUTING.md](./CONTRIBUTING.md)).

## Stolperfallen

- **Browser/Node-Resolution:** Module laufen in beiden Welten. Abhängigkeiten über das
  `typeof require !== "undefined" ? require(...) : window....`-Muster auflösen.
- **Render-Snapshot ist read-only:** im Renderer **niemals** Spielzustand verändern.
- **Spawner erben von `SpawnManager`:** neue Spawner nicht von Hand bauen — Hooks
  (`interval`/`spawn`/`keep`) überschreiben.
- **Kurzlebige Objekte** (Projektile/Partikel/Toasts) im Test über die Zeit prüfen
  („trat es je auf?"), nicht per Momentaufnahme.
