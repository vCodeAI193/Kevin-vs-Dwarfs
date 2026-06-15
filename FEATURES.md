# Features — Kevin vs. Zwerge

Überblick über den **aktuellen Stand** und die **geplanten Features** (Roadmap).
Spielkonzept → [`KONZEPT.md`](KONZEPT.md) · Spieler-Doku → [`README.md`](README.md).

Prioritäten in der Roadmap: 🔴 hoch · 🟡 mittel · 🟢 nice-to-have.

---

## Teil A — Vorhandene Features ✅

- [x] **Seitenscroller** mit Kamera, die Kevin folgt
- [x] **Laufen** (links/rechts) und **Springen**
- [x] **Stomp** — von oben auf Zwerge springen (platt stampfen + Rückprall)
- [x] **Wirbelangriff (Spin)** mit Wirkradius und **Abklingzeit-Anzeige** im HUD
- [x] **3 Leben** ❤️ mit kurzer **Unverwundbarkeit** + Rückstoß nach Treffer
- [x] **3 Schwierigkeitsgrade** (Leicht/Mittel/Schwer) + automatischer Stufen-Anstieg
- [x] **Gegner-Spawning** mit Obergrenze je Schwierigkeit; Zwerge laufen auf Kevin zu
- [x] **Touch-Steuerung** (Buttons) **und Tastatur** parallel
- [x] **Responsive Skalierung** + Hochkant-Hinweis (Gerät drehen)
- [x] **Punkte & Highscore** (lokal via `localStorage`)
- [x] **Prozedurale Schwebe-Plattformen** (einseitig, deterministisch je Segment)
- [x] **Parallax-Hintergrund** (Wolken, Hügel, Sonne) + Partikel-Effekte
- [x] **Menü- / Game-Over-Screens** mit Neustart
- [x] **Unit-Tests** der reinen Spiellogik (`engine.js`, via `node:test`, 0 Dependencies)

---

## Teil B — Roadmap (geplante Features)

### 🎮 Gameplay
- 🔴 **Power-ups** — einsammelbare Boni, z. B. temporärer Dauer-Wirbel, Tempo-Boost,
  Schutzschild oder Extra-Leben
- 🔴 **Combo-/Multiplikator-System** — schnelle Kills hintereinander geben Bonuspunkte
- 🟡 **Neue Gegnertypen** — z. B. springende, schnelle oder werfende Zwerge mit
  eigenem Verhalten (eigene `drawX()`-Funktion je Typ)
- 🟡 **Boss-Zwerg** — taucht ab einer bestimmten Stufe/Punktzahl auf, mehr Trefferpunkte
- 🟢 **Level / Abschnitte mit Ziel** — optionaler Modus mit festem Ende statt Endlos
- 🟢 **Sammelbare Münzen / Items** in der Welt (Grundlage für Progression-Shop)

### 🔊 Audio & Visuell
- 🔴 **Soundeffekte** — Sprung, Stomp, Wirbel, Treffer, Game Over
- 🟡 **Hintergrundmusik** mit **Mute-Toggle**
- 🟡 **Besseres Trefferfeedback** — Screen-Shake, Treffer-Blitz, deutlichere Partikel
- 🟢 **Themes / Biome** — Tag-/Nacht-Wechsel oder verschiedene Umgebungen je Stufe

### 🏆 Progression
- 🔴 **Lokale Bestenliste** je Schwierigkeitsgrad (Top-Scores statt nur einem Highscore)
- 🟡 **Freischaltbare Skins** für Kevin (z. B. nach Punktzahl)
- 🟡 **Achievements** — z. B. „10 Zwerge mit einem Wirbel", „1000 Punkte ohne Treffer"
- 🟢 **Münz-Shop** — gesammelte Münzen gegen Skins/Power-ups eintauschen

### 🛠️ Technik & Release
- 🔴 **Pause-Funktion** (Taste + Touch-Button)
- 🔴 **GitHub-Pages-Deployment** — Spiel direkt online spielbar machen
- 🟡 **Einstellungen** — Lautstärke, ggf. Tastenbelegung, Steuerungsgröße
- 🟡 **PWA / Offline** — installierbar und ohne Internet spielbar (Service Worker + Manifest)
- 🟢 **Code-Aufteilung** — JS/CSS in separate Dateien auslagern, falls das Spiel wächst
  (aktuell bewusst Single-File; siehe [`KONZEPT.md`](KONZEPT.md#design-entscheidungen))

---

> Hinweis: Die Roadmap ist ein Vorschlag und kann jederzeit umpriorisiert werden.
> Neue Mechaniken sollten den Konventionen in [`CLAUDE.md`](CLAUDE.md) folgen
> (prozedurale Sprites, einseitige Plattformen, Edge-Flags für Einmal-Aktionen).
