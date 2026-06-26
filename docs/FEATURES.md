# Features — Kevin gegen die Zwerge

Kanonische Feature-Inventur (Quelle der Wahrheit). Das [README](../README.md) zeigt
nur Highlights und verlinkt hierher. Status: ✅ umgesetzt, 🎯 geplant.

## Kern-Gameplay

| Feature | Status | Modul |
|---------|:------:|-------|
| Endlos-Lauf, scrollende Welt, steigende Schwierigkeit | ✅ | `game.js` |
| Springen (Tastatur/Touch), Schwerkraft | ✅ | `player.js` |
| Coyote-Time & Sprung-Puffer (faireres Timing) | ✅ | `player.js` |
| Variable Sprunghöhe (Taste kürzer = niedriger) | ✅ | `player.js` |
| Stomp – Zwerge von oben besiegen | ✅ | `collision.js`, `game.js` |
| Wirbelsturm – aufladbarer Rundum-Spezialangriff | ✅ | `player.js` |

## Gegner & Gefahren

| Feature | Status | Modul |
|---------|:------:|-------|
| Zwerg-Typen: normal, schnell, gepanzert | ✅ | `enemies.js` |
| Hindernisse (Felsen) zum Drüberspringen | ✅ | `obstacles.js` |
| Mehrphasiger Boss „Zwergenkönig" (schneller bei wenig HP) | ✅ | `boss.js` |
| Boss-Wurfangriffe (Hämmer) ab Phase 2 | ✅ | `projectile.js` |

## Belohnung & Progression

| Feature | Status | Modul |
|---------|:------:|-------|
| Münzen sammeln (Punkte + Power) | ✅ | `collectibles.js` |
| Power-Ups: Doppelsprung, Schild, Magnet, Unverwundbarkeits-Stern | ✅ | `powerups.js`, `player.js` |
| Combo-System (Score-Multiplikator bis 8×) | ✅ | `combo.js` |
| Biome + Parallax (Wiese → Höhle → Lava → Eis → Wüste) | ✅ | `biomes.js` |
| Zen-Modus (Übung ohne Game Over) | ✅ | `game.js` |

## Meta-Progression (dauerhaft)

| Feature | Status | Modul |
|---------|:------:|-------|
| Highscore (localStorage) | ✅ | `storage.js` |
| Lifetime-Statistiken | ✅ | `stats.js` |
| Erfolge/Achievements (10 Stück) + Übersichts-Screen | ✅ | `achievements.js` |
| Freischaltbare Skins (Klassisch, Frost, Magma, Gold, Schatten) | ✅ | `skins.js` |
| Tägliche Challenge (fester Seed) + Tages-Bestmarke | ✅ | `daily.js` |

## Spielgefühl & Bedienung

| Feature | Status | Modul |
|---------|:------:|-------|
| Synthetischer Sound (Web Audio, ohne Dateien), Ton an/aus | ✅ | `audio.js` |
| Partikel-Effekte | ✅ | `particles.js` |
| Screen-Shake bei Stomp/Boss/Wirbelsturm (Trauma-Modell) | ✅ | `screenshake.js` |
| Hit-Stop (kurzes Einfrieren bei Stomp/Boss-Treffer) | ✅ | `hitstop.js` |
| Meilenstein-Banner alle 1000 Distanz | ✅ | `game.js`, `toast.js` |
| Pausen-Menü mit Steuerungs-Referenz | ✅ | `renderer.js` |
| Biom „Wüste" (zusätzlich zu Wiese/Höhle/Lava/Eis) | ✅ | `biomes.js` |
| Toast-Hinweise (Erfolge, Boss-Phasen) | ✅ | `toast.js` |
| Pause (P/Esc) | ✅ | `game.js` |
| Game-Over-Lauf-Zusammenfassung | ✅ | `renderer.js` |
| Tastatur- & Touch-Steuerung, responsives Canvas, Favicon/Meta | ✅ | `index.html`, `game.js` |

## Geplant (Nordstern)

> Eine breite Sammlung von **100 möglichen Erweiterungen** steht in
> [FEATURE_IDEAS.md](./FEATURE_IDEAS.md).

| Feature | Status |
|---------|:------:|
| Online-/Tages-Bestenliste | 🎯 |
| Story-/Kampagnen-Modus mit Welten & Bossen | 🎯 |
| Level-Editor & teilbare Seeds | 🎯 |
| Mehrspieler (Ghost-Races / Versus) | 🎯 |
| Installierbare PWA / Mobile-App | 🎯 |
| Charakter-/Skin-Shop, Barrierefreiheit & Lokalisierung | 🎯 |
