# Changelog

Chronologie der Entwicklung von „Kevin gegen die Zwerge" — was wann dazukam.
Format angelehnt an [Keep a Changelog](https://keepachangelog.com/de/). Die Daten
spiegeln die Entwicklungsreihenfolge wider (frühester Eintrag zuletzt).

## Vision & Fundament
- **Vision & Prototyp-Roadmap** angelegt (`VISION.md`, `README.md`).
- **Spielbarer Prototyp (M0–M4):** Laufen, Springen, Stomp gegen Zwerge, Wirbelsturm,
  Score-Loop mit Game-Over und Neustart.
- **Unit-Tests** eingeführt (`node --test`); Kollisions-Logik in testbares Modul
  ausgelagert (`collision.js`).
- **Entwicklungs-Logbuch** (`LESSONS_LEARNED.md`) und **Blog** (`blog/`) gestartet,
  inkl. Artikel-Gerüst-Skript und Commit-Reminder-Hook (`scripts/`).

## Features
- **Münzen & Highscore**, **Zwerg-Typen** (normal/schnell/gepanzert), **Hindernisse**,
  **Sound** (Web Audio), **Partikel**, **Pause** — plus **CI** (GitHub Actions).
- **Power-Ups** (Doppelsprung, Schild, Magnet) und der erste **Bosskampf**.
- **Touch-Steuerung** & Bildschirm-Buttons, **Favicon/Meta**, responsives Canvas,
  **Smoke-Test** der `index.html`.
- **Combo-System**, **Biome + Parallax**, freischaltbare **Skins**.
- **Dauerhafte Statistiken**, **Erfolge/Achievements** und **Lauf-Zusammenfassung**.
- **Tägliche Challenge** (seeded RNG) und **Erfolge-/Statistik-Screen**.
- **Mehrphasiger Boss** mit Wurfangriffen (Hämmer) und **In-Game-Toast-System**.

## Dokumentation & Architektur
- **VISION.md** neu gefasst: heutiger Stand als realisierte Vision + großer Nordstern.
- **Clean-Code-Refactoring** (verhaltensgleich, Tests bleiben grün):
  - `SpawnManager`-Basisklasse entdoppelt die vier Spawner.
  - Konstanten in `config.js` zentralisiert (Single Source of Truth).
  - Reine `score.js`-Logik ausgelagert (+Tests).
  - Gesamtes Rendering in `renderer.js` getrennt (read-only Snapshot);
    `game.js` von 792 auf 580 Zeilen verschlankt.
- **Architektur- & Onboarding-Doku** ergänzt: `docs/ARCHITECTURE.md`,
  `docs/REQUIREMENTS.md`, `docs/FEATURES.md`, `CONTRIBUTING.md`, `CLAUDE.md` und
  dieses `CHANGELOG.md`.

---

Hinweis: Eine commit-genaue Historie liefert `git log`. Dieses Changelog fasst die
inhaltlichen Meilensteine zusammen.
