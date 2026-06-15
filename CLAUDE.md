# CLAUDE.md — Kevin vs. Zwerge

Leitfaden für KI-Assistenten an diesem Repo.

## Projekt
2D-Jump'n'Run im Browser. Kevin läuft seitlich, springt auf Zwerge (Stomp) oder
nutzt den Wirbelangriff (Spin). Schwierigkeitsgrad steuert Gegnerzahl & Tempo.
Mobil per Touch spielbar.

## Aufbau
- **`index.html`** — das gesamte Spiel: HTML (Overlays/HUD/Touch), CSS und das
  JavaScript (Canvas-Engine) in einer Datei. **Keine Build-Tools, keine Dependencies.**
- `README.md` — Spieler- & Steuerungs-Doku.

## Architektur (innerhalb der `<script>`-IIFE in `index.html`)
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
- JS-Syntax: Script extrahieren und `node --check` laufen lassen.
- Manuell im Browser testen: `python3 -m http.server` → Stomp, Wirbel, Treffer/Leben,
  Schwierigkeitswechsel, Touch (DevTools-Geräteemulation).

## Git
- Entwicklung auf dem zugewiesenen Feature-Branch, Conventional Commits
  (`feat:`/`fix:`/`docs:`). Kein Force-Push. PR nur auf ausdrückliche Anfrage.
