# Anforderungen — Kevin gegen die Zwerge

Funktionale (FR) und nicht-funktionale (NFR) Anforderungen, abgeleitet aus
[VISION.md](../VISION.md) und dem real umgesetzten Code. Jede Anforderung nennt das
umsetzende Modul. Status: ✅ umgesetzt, 🎯 Ziel/geplant.

## Funktionale Anforderungen

| ID | Anforderung | Status | Modul(e) |
|----|-------------|:------:|----------|
| FR-1 | Kevin steht fest; die Welt scrollt endlos nach links und wird schneller. | ✅ | `game.js` |
| FR-2 | Springen per Taste/Touch, Schwerkraft, Landung. | ✅ | `player.js` |
| FR-3 | Zwerge per Sprung auf den Kopf besiegen (Stomp); seitlicher Kontakt = Game Over. | ✅ | `collision.js`, `game.js` |
| FR-4 | Wirbelsturm: bei voller Power-Leiste alle nahen Zwerge betäuben. | ✅ | `player.js`, `game.js` |
| FR-5 | Zwerg-Typen: `normal`, `fast`, `armored` (nur per Wirbelsturm besiegbar). | ✅ | `enemies.js` |
| FR-6 | Hindernisse (Felsen) zum Drüberspringen; Berührung = Game Over. | ✅ | `obstacles.js` |
| FR-7 | Münzen einsammeln (Punkte + etwas Power); Magnet zieht sie an. | ✅ | `collectibles.js` |
| FR-8 | Power-Ups: Doppelsprung, Schild (fängt einen tödlichen Treffer), Magnet. | ✅ | `powerups.js`, `player.js` |
| FR-9 | Mehrphasiger Boss: schneller bei wenig HP, ab Phase 2 Wurfangriffe. | ✅ | `boss.js`, `projectile.js` |
| FR-10 | Combo-System: schnelle Kills geben Score-Multiplikator (bis 8×). | ✅ | `combo.js` |
| FR-11 | Biome wechseln mit der Distanz (Wiese→Höhle→Lava→Eis, Schleife). | ✅ | `biomes.js` |
| FR-12 | Score aus Distanz, Kills, Münzen, Boss- und Combo-Bonus. | ✅ | `score.js` |
| FR-13 | Highscore dauerhaft gespeichert. | ✅ | `storage.js` |
| FR-14 | Lifetime-Statistiken über alle Läufe. | ✅ | `stats.js` |
| FR-15 | Erfolge nach Regeln über den Statistiken; Übersichts-Screen. | ✅ | `achievements.js` |
| FR-16 | Freischaltbare Skins für Kevin, Auswahl gespeichert. | ✅ | `skins.js` |
| FR-17 | Tägliche Challenge: fester Tages-Seed = gleicher Parcours, Tages-Bestmarke. | ✅ | `daily.js` |
| FR-18 | Pause sowie Ton an/aus. | ✅ | `game.js`, `audio.js` |
| FR-19 | Toast-Hinweise für neue Erfolge und Boss-Phasen. | ✅ | `toast.js` |
| FR-20 | Game-Over-Screen mit Lauf-Zusammenfassung und Neustart. | ✅ | `renderer.js`, `game.js` |
| FR-21 | Steuerung per Tastatur **und** Touch-Buttons (Mobile). | ✅ | `index.html`, `game.js` |
| FR-22 | Online-/Tages-Bestenliste (geräteübergreifend). | 🎯 | – |
| FR-23 | Story-/Kampagnen-Modus, Level-Editor & teilbare Seeds, Mehrspieler. | 🎯 | – |

## Nicht-funktionale Anforderungen

| ID | Anforderung | Status |
|----|-------------|:------:|
| NFR-1 | **Null Laufzeit-Abhängigkeiten** (kein Framework, kein Bundler). | ✅ |
| NFR-2 | Sofort im Browser lauffähig: `index.html` öffnen oder einfacher Static-Server. | ✅ |
| NFR-3 | Spielbar auf Desktop **und** Mobile (responsives Canvas, Touch-Buttons nur bei Touch). | ✅ |
| NFR-4 | Tages-Challenge **deterministisch** (seedbarer PRNG, injizierter Zufall). | ✅ |
| NFR-5 | Kern-Logik **DOM-frei und unit-getestet** (`node --test`); CI grün bei jedem Push. | ✅ |
| NFR-6 | Trennung von Logik und Darstellung (read-only Render-Snapshot). | ✅ |
| NFR-7 | Persistenz scheitert nie hart (privater Modus etc.) – stiller Fallback. | ✅ |
| NFR-8 | Lesbarer, fairer Schwierigkeitsanstieg („mein Fehler", nicht Willkür). | ✅ |
| NFR-9 | Dokumentation wird mitgepflegt (Logbuch + Blog je größerem Schritt). | ✅ |
| NFR-10 | Barrierefreiheit (Farbenblind-Modi, reduzierte Effekte) & Lokalisierung. | 🎯 |
| NFR-11 | Installierbar als PWA / offline spielbar. | 🎯 |

## Abgrenzung / Nicht-Ziele

- Keine schwere Spiel-Engine, kein Pflicht-Build-Setup.
- Kein Pay-to-win, keine Dark Patterns, keine Pflicht-Accounts für den Kernspaß.
- Online-Funktionen bleiben optional und additiv.
