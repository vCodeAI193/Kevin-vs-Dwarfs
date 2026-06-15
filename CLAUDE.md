# CLAUDE.md — Kevin vs. Zwerge

Leitfaden für KI-Assistenten an diesem Repo.

## Projekt
2D-Jump'n'Run im Browser. Kevin läuft seitlich, springt auf Zwerge (Stomp) oder
nutzt den Wirbelangriff (Spin). Schwierigkeitsgrad steuert Gegnerzahl & Tempo.
Mobil per Touch spielbar.

## Aufbau
- **`index.html`** — Darstellung & Steuerung: HTML (Overlays/HUD/Touch), CSS und die
  Canvas-/Render-/Input-Schicht (eine IIFE). **Keine Build-Tools, keine Dependencies.**
- **`engine.js`** — reine, seiteneffektfreie Spiellogik (Kollision, Stomp/Wirbel,
  Scoring, Schwierigkeits-Ramp, Plattform-Generierung). UMD-Wrapper: im Browser
  `window.KevinEngine`, in Node `require`. **Single Source of Truth** — Spiel und Tests
  nutzen dieselben Funktionen, keine Duplikate.
- **`tests/engine.test.js`** — Unit-Tests via Node-Test-Runner (`node:test`, 0 Deps).
- `package.json` — nur ein Test-Skript (`npm test` → `node --test`), keine Dependencies.
- `README.md` — Spieler- & Steuerungs-Doku · `KONZEPT.md` — Spielkonzept · `FEATURES.md` — Roadmap.

## Architektur
- **Reine Logik → `engine.js`** (testbar, ohne DOM/Canvas): `isStomp`, `withinSpin`,
  `rectsOverlap`, `clamp`, `scoreForKill`, `nextRamp`, `clampDt`, `spinStatus`,
  `computePlatforms`, `seededRand`, Konstante `DIFFICULTY`. Neue Spielregel-Logik hier
  ergänzen **und** in `tests/engine.test.js` abdecken — nicht inline in `index.html`.
- **`index.html`** holt diese per `const { … } = window.KevinEngine;` und kümmert sich
  nur um Zustand, Rendering, Eingabe und DOM.
- **Design-Auflösung** fix `1280×720` (`W`/`H`), per CSS skaliert. Spiel-Logik rechnet
  immer in Design-Koordinaten — nie in Bildschirm-Pixeln.
- **Game-Loop:** `requestAnimationFrame` + delta-time, `dt` auf `1/30` gedeckelt.
- **States:** `menu | playing | gameover` (Variable `state`).
- **Kern-Funktionen:** `update(dt)` (Physik/Kollision/Spawning), `render()` (zeichnen),
  `startGame()`, `endGame()`, `killDwarf()`, `spawnDwarf()`.
- **Input:** Keyboard (`KEYMAP`) + Touch-Buttons → gemeinsames `input`-Objekt.
  Einmal-Aktionen (Sprung/Wirbel) laufen über `*Edge`-Flags, die nach Verarbeitung
  zurückgesetzt werden.
- **Tuning-Konstanten** stehen gesammelt oben: `GRAVITY`, `JUMP_V`, `SPIN_*`,
  `DIFFICULTY` (pro Stufe `spawn`/`speed`/`max`/`ramp`).

## Konventionen
- UI-Texte & Kommentare auf **Deutsch**.
- Sprites werden prozedural mit Canvas-Primitiven gezeichnet (keine Asset-Dateien) —
  neue Figuren als `drawX()`-Funktion ergänzen.
- Einseitige Plattformen: Kollision nur beim Fallen von oben (`vy >= 0` +
  `prevBottom`-Check) — nicht ändern, sonst bleibt der Spieler hängen.
- Touch-Controls sind HTML-Overlays (kein Canvas-Hit-Testing) → unabhängig von der
  Canvas-Skalierung.

## Vor dem Commit prüfen
- **Tests:** `npm test` (bzw. `node --test`) — müssen grün sein.
- JS-Syntax: `node --check engine.js`; für `index.html` Script extrahieren und prüfen.
- Manuell im Browser testen: `python3 -m http.server` → Stomp, Wirbel, Treffer/Leben,
  Schwierigkeitswechsel, Touch (DevTools-Geräteemulation).

## Git
- Entwicklung auf dem zugewiesenen Feature-Branch, Conventional Commits
  (`feat:`/`fix:`/`docs:`). Kein Force-Push. PR nur auf ausdrückliche Anfrage.
