# Architektur — Kevin gegen die Zwerge

Diese Datei erklärt, **wie der Code aufgebaut ist und warum** — damit sich ein neuer
Mensch (Entwickler/Architekt) oder eine KI schnell und sicher einarbeiten kann.

> Verwandte Dokumente: [VISION.md](../VISION.md) (Ziel & Produktvision) ·
> [REQUIREMENTS.md](./REQUIREMENTS.md) (Anforderungen) ·
> [FEATURES.md](./FEATURES.md) (Feature-Inventur) ·
> [../CONTRIBUTING.md](../CONTRIBUTING.md) (Mitarbeit)

## Überblick

- **Plattform:** Web-Browser, reines **Vanilla JavaScript + HTML5 Canvas**.
- **Kein Build, keine Laufzeit-Abhängigkeiten.** `index.html` lädt die Module als
  einfache `<script>`-Tags in fester Reihenfolge; es gibt keinen Bundler.
- **Tests:** Node-eigener Runner (`node --test`), ebenfalls ohne Abhängigkeiten.
- Jede Datei ist sowohl im Browser (Globals via `window`) als auch in Node
  (`module.exports`) nutzbar — siehe [Browser/Node-Resolution](#brownode).

## Laufzeit-Datenfluss

```
index.html
   │  lädt src/*.js in Reihenfolge (config zuerst, game.js zuletzt)
   ▼
game.js  (IIFE)
   ├─ erzeugt Zustand + Manager (player, enemies, coins, … , renderer)
   ├─ registriert Eingabe (keydown / pointerdown / Buttons → Aktionen)
   └─ startet requestAnimationFrame-Loop
        │
        ▼  jeder Frame:
      loop(now)
        ├─ update(dt)                      ← SPIELLOGIK (schreibt Zustand)
        │    ├─ Welt: distance, worldSpeed, difficulty
        │    ├─ Spawner: enemies/coins/obstacles/powerups.update(...)
        │    ├─ Boss: spawnen / update / Projektile
        │    ├─ Kollisionen: handleDwarf/Obstacle/Coin/PowerUp/BossCollision
        │    ├─ combo / toasts / particles
        │    ├─ checkLiveAchievements()
        │    └─ score = computeScore({...})
        │
        └─ render()                        ← DARSTELLUNG (liest Zustand)
             └─ baut READ-ONLY Snapshot  →  renderer.render(snapshot)
```

**Wichtigstes Prinzip:** `update()` *schreibt* den Zustand, `render()` *liest* ihn nur.
Deshalb bekommt der Renderer pro Frame einen **read-only Snapshot** und kann nichts
kaputt machen. Diese Naht macht das große `game.js` beherrschbar und testbar.

## Modul-Landkarte

### Kern (Orchestrierung & Rahmen)

| Modul | Verantwortung | Hängt ab von |
|-------|---------------|--------------|
| `game.js` | Zustand, Eingabe, Update-Loop, Kollisionen, Boss-Steuerung | praktisch allem |
| `renderer.js` | Gesamtes Zeichnen (Hintergrund, HUD, Screens) aus dem Snapshot | `biomes`, `achievements` (Globals) |
| `config.js` | Zentrale Konstanten (`CONFIG`) fürs Balancing | – |
| `score.js` | Reine Score-Berechnung `computeScore()` | `config` |
| `collision.js` | `rectsOverlap()`, `isStomp()` (reine Geometrie) | – |

### Entitäten (haben `update(dt, worldSpeed)` + `draw(ctx)`)

| Modul | Verantwortung |
|-------|---------------|
| `player.js` | Kevin: Bewegung, Sprung/Doppelsprung, Wirbelsturm, Power-Up-Timer, Skin |
| `enemies.js` | Zwerge + Typen (`normal`/`fast`/`armored`), `EnemyManager` |
| `boss.js` | Mehrphasiger Zwergenkönig (Patrouille, Phasen, Wurfangriffe) |
| `projectile.js` | Wurfgeschosse (Hämmer) des Bosses |
| `collectibles.js` | Münzen + `CoinManager` |
| `obstacles.js` | Felsen + `ObstacleManager` |
| `powerups.js` | Power-Ups (`doublejump`/`shield`/`magnet`) + `PowerUpManager` |

### Systeme (Mechaniken & Effekte)

| Modul | Verantwortung |
|-------|---------------|
| `spawn-manager.js` | **Basisklasse** `SpawnManager`: Timer → Spawn → Bewegen → Filtern → Zeichnen |
| `combo.js` | Combo-Zähler + Score-Multiplikator (Zeitfenster) |
| `particles.js` | Partikel-Effekte |
| `toast.js` | Kurze Bildschirm-Hinweise (Erfolge, Boss-Phasen) |
| `audio.js` | Synthetische Soundeffekte (Web Audio, ohne Dateien) |

### Progression & Meta (Persistenz, reine Logik)

| Modul | Verantwortung |
|-------|---------------|
| `biomes.js` | `getBiome(distance)` – Umgebungsfarben nach Distanz |
| `skins.js` | Freischaltbare Skins (`SKINS`), Auswahl-Logik |
| `stats.js` | Dauerhafte Lifetime-Statistiken (`mergeRun`) |
| `achievements.js` | Erfolge als Daten + Prädikat (`evaluateAchievements`) |
| `daily.js` | Seeded-PRNG (`mulberry32`), Tages-Seed, Tages-Bestmarke |
| `storage.js` | Highscore-Persistenz über `localStorage` |

## Schlüssel-Muster

### SpawnManager-Basisklasse
Vier Spawner teilen sich dasselbe Muster. `spawn-manager.js` kapselt es; Subklassen
liefern nur die Unterschiede über drei Hooks: `interval(difficulty)`, `spawn(difficulty)`,
`keep(item)`. Die öffentlichen Namen (`enemies.dwarves`, `coins.coins`, …) bleiben über
Getter/Setter erhalten.

### CONFIG als Single Source of Truth
Alle Balancing-Werte (Spawn-Cooldowns, Power-Up-Dauern, Combo-Fenster, Münzwerte,
Welt-Tempo, Boss) leben in `config.js`. Module lesen daraus — kein verstreutes Literal.

### Dependency-Injection (Zufall & Speicher)
- **Zufall:** `game.js` hält `let activeRng` und reicht den Managern `rngProxy = () =>
  activeRng()`. Im Normalmodus `Math.random`, in der Tages-Challenge `mulberry32(seed)`.
  Dadurch ist die Welt deterministisch reproduzierbar **und** testbar.
- **Speicher:** Die Persistenz-Funktionen (`storage.js`, `stats.js`, `achievements.js`,
  `daily.js`) nehmen ein `storage`-Objekt entgegen → in Tests ein Mock, kein Browser nötig.

### Logik vs. Darstellung
`render()` baut einen Snapshot, `renderer.js` zeichnet nur. Der Renderer hält keinen
Zustand und schreibt keinen.

<a id="brownode"></a>
### Browser/Node-Resolution & dualer Export
Jedes Modul endet mit:
```js
if (typeof window !== "undefined") window.X = X;          // Browser-Global
if (typeof module !== "undefined" && module.exports) module.exports = { X }; // Node
```
Module, die auf andere zugreifen, lösen die Abhängigkeit so auf (funktioniert im
Browser **und** in Node):
```js
const Dep =
  typeof require !== "undefined" ? require("./dep.js").Dep
  : typeof window !== "undefined" ? window.Dep
  : null;
```

## Zustandsmodell (State Machine)

In `game.js` steuert `state` den Ablauf:

```
ready ──Start──▶ playing ──Tod──▶ gameover ──Start──▶ playing
  │  ▲              │  ▲                          │
  │  └──schließen── │  └── P/Esc ── paused ───────┘
  └──A──▶ achievements ──A/Klick──▶ ready
```

- `ready` – Startbild · `playing` – Spiel läuft · `paused` – Pause
- `gameover` – Lauf-Zusammenfassung · `achievements` – Erfolge/Statistik-Übersicht

## „Wie füge ich X hinzu?"

**Neuer Zwerg-Typ** — in `src/enemies.js` einen Eintrag zu `DWARF_TYPES` hinzufügen
(Farbe, Tempo, Panzerung), ggf. die Wahrscheinlichkeit in `pickDwarfType()` ergänzen.

**Neues Power-Up** — Eintrag in `POWERUP_TYPES` (`src/powerups.js`), Dauer in
`CONFIG.powerUp` (`src/config.js`), Effekt + Timer/Getter in `src/player.js`, Anwendung
in `game.js` (`handlePowerUpCollisions` / Update).

**Neuer Erfolg** — eine Zeile in `ACHIEVEMENTS` (`src/achievements.js`):
`{ id, name, desc, test: (s) => <Bedingung über stats> }`. Kein Spielcode-Eingriff nötig.

**Neues Biom** — Eintrag in `BIOMES` (`src/biomes.js`) mit `sky/hill/ground/grass`.

**Neuer Skin** — Eintrag in `SKINS` (`src/skins.js`) mit Farben und `unlock`-Score.

**Goldene Regel bei neuen Modulen:** Reine Logik DOM-frei halten (→ Unit-Test),
Darstellung nur über den Renderer, neue Datei in `index.html` **vor** `game.js` laden
(der Smoke-Test `tests/smoke.test.js` erzwingt das), und einen Logbuch-/Blog-Eintrag
ergänzen (siehe [CONTRIBUTING.md](../CONTRIBUTING.md)).
