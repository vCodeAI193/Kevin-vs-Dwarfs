# Kevin gegen die Zwerge

Ein rasantes 2D-Jump-&-Run für den Browser. Kevin rennt endlos von links nach rechts,
besiegt Zwerge per Sprung auf den Kopf und entfesselt bei voller Power-Leiste den
**Wirbelsturm**, der alle umliegenden Zwerge für einige Sekunden umwirft.

> **Status:** Spielbarer Prototyp. Die Meilensteine M0–M4 sind umgesetzt und um
> mehrere Features erweitert.

## Dokumentation

| Datei | Inhalt |
|-------|--------|
| [`VISION.md`](./VISION.md) | Produktvision, Ziel & Nordstern |
| [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) | Aufbau, Datenfluss, Muster, „Wie füge ich X hinzu" |
| [`docs/REQUIREMENTS.md`](./docs/REQUIREMENTS.md) | Funktionale & nicht-funktionale Anforderungen |
| [`docs/FEATURES.md`](./docs/FEATURES.md) | Vollständige Feature-Inventur (Quelle der Wahrheit) |
| [`CONTRIBUTING.md`](./CONTRIBUTING.md) | Mitarbeit: lokal starten, Tests, Konventionen |
| [`CHANGELOG.md`](./CHANGELOG.md) | Chronologie „was wurde getan" |
| [`CLAUDE.md`](./CLAUDE.md) | Schneller Einstieg für KI/neue Entwickler |
| [`LESSONS_LEARNED.md`](./LESSONS_LEARNED.md) · [`blog/`](./blog/) | Entwicklungs-Logbuch & Artikel |

## Features

> Vollständige, gepflegte Liste mit Status: **[`docs/FEATURES.md`](./docs/FEATURES.md)**.
> Hier nur die Highlights:

- 🏃 Endlos-Lauf nach rechts mit Springen, ansteigender Schwierigkeit
- 🦶 Zwerge per **Stomp** besiegen; seitlicher Kontakt = Game Over
- 🌀 **Wirbelsturm** als Spezialangriff (Power-Leiste füllt sich pro Kill/Münze)
- 🧝 **Zwerg-Typen:** normal, schnell und gepanzert (nur per Wirbelsturm besiegbar)
- 🪨 **Hindernisse** (Felsen) zum Drüberspringen
- 🪙 **Münzen** sammeln für Punkte und etwas Extra-Power
- ⚡ **Power-Ups:** Doppelsprung, Schild (fängt einen tödlichen Treffer ab) und Magnet
- 👹 **Mehrphasiger Bosskampf:** der Zwergenkönig wird mit sinkenden Lebenspunkten
  schneller und wirft ab Phase 2 Hämmer, über die Kevin springen muss; bringt Score-Bonus
- 🔔 **Toast-Hinweise:** kurze Einblendungen für Boss-Phasen und frisch freigeschaltete Erfolge
- 🔥 **Combo-System:** schnelle Kills hintereinander geben einen Score-Multiplikator (bis 8×)
- 🌄 **Biome:** Umgebung & Parallax wechseln mit der Distanz (Wiese → Höhle → Lava → Eis)
- 🎨 **Skins für Kevin:** per Highscore freischaltbar und auswählbar (gespeichert)
- 📊 **Statistiken & Erfolge:** dauerhafte Lifetime-Stats und freischaltbare Achievements
- 🏅 **Erfolge-Screen:** Übersicht aller Erfolge (frei/gesperrt) und Lifetime-Stats
- 📅 **Tägliche Challenge:** fester Tages-Seed → identischer Parcours für alle, mit Tages-Bestmarke
- 🧾 **Lauf-Zusammenfassung** im Game-Over-Screen (Distanz, Kills, Münzen, Bosse, beste Combo)
- 🏆 **Highscore** dauerhaft gespeichert (localStorage)
- 🔊 **Sound** (synthetisch über Web Audio, ohne Dateien) & ✨ Partikel-Effekte
- ⏸️ **Pause** (P/Esc) und Ton an/aus (M)

## Tech-Stack

- **HTML5 Canvas + Vanilla JavaScript** — läuft sofort im Browser, ohne Build-Schritt.
- **Game-Loop** über `requestAnimationFrame`.
- Bewusst leichtgewichtig: einfach teilbar (eine `index.html`), niedrige Einstiegshürde,
  spätere Migration auf ein Build-Tool oder eine Engine bleibt möglich.

## Entwicklungs-Roadmap (umgesetzt)

Der ursprüngliche Prototyp entstand in spielbaren Meilensteinen — alle sind erledigt:

| Meilenstein | Ziel | Status |
|-------------|------|:------:|
| **M0 – Gerüst** | `index.html` mit Canvas, laufender Game-Loop, „Kevin" auf dem Boden. | ✅ |
| **M1 – Bewegung & Sprung** | Schwerkraft, Springen, Welt scrollt nach links. | ✅ |
| **M2 – Zwerge & Stomp** | Zwerge spawnen von rechts; Stomp besiegt sie, seitlicher Kontakt = Game Over. | ✅ |
| **M3 – Wirbelsturm** | Power-Leiste füllt sich pro Kill; wirft Zwerge im Umkreis um. | ✅ |
| **M4 – Score & Loop** | Score-Anzeige, Game-Over-Screen, Neustart, steigende Schwierigkeit. | ✅ |

Seitdem dazugekommen: Münzen, Highscore, Zwerg-Typen, Hindernisse, Power-Ups,
Bosskampf, Sound/Partikel, Pause sowie Touch-Steuerung (siehe **Features**).

## Projektstruktur

```
Kevin-vs-Dwarfs/
├── index.html          # Einstiegspunkt, Canvas, lädt die Skripte
├── src/
│   ├── config.js       # zentrale Spiel-Konstanten (Balancing)
│   ├── game.js         # schlanker Orchestrator: Zustand, Eingabe, Update-Loop
│   ├── renderer.js     # gesamtes Zeichnen (HUD/Screens) aus read-only Snapshot
│   ├── score.js        # reine Score-Berechnung (testbar)
│   ├── player.js       # Kevin: Bewegung, Sprung, Wirbelsturm, Power
│   ├── spawn-manager.js# Basisklasse für alle Spawner (Timer/Spawn/Move/Filter)
│   ├── enemies.js      # Zwerge: Typen, Spawn, Bewegung
│   ├── collectibles.js # Münzen: Spawn, Einsammeln
│   ├── obstacles.js    # Hindernisse (Felsen)
│   ├── powerups.js     # Power-Ups: Doppelsprung, Schild, Magnet
│   ├── boss.js         # mehrphasiger Bosskampf (Zwergenkönig)
│   ├── projectile.js   # Boss-Wurfgeschosse (Hämmer)
│   ├── toast.js        # kurze Bildschirm-Hinweise (Toasts)
│   ├── combo.js        # Combo-System (Score-Multiplikator)
│   ├── biomes.js       # Biome & Hintergrundfarben nach Distanz
│   ├── skins.js        # freischaltbare Kevin-Skins
│   ├── stats.js        # dauerhafte Lifetime-Statistiken
│   ├── achievements.js # Erfolge & Freischalt-Regeln
│   ├── daily.js        # Seeded-PRNG + Tages-Challenge & Tages-Bestmarke
│   ├── collision.js    # reine Kollisions-Logik (testbar)
│   ├── particles.js    # Partikel-Effekte
│   ├── audio.js        # synthetische Soundeffekte (Web Audio)
│   └── storage.js      # Highscore-Persistenz (localStorage)
├── tests/              # Unit-Tests (node --test)
├── blog/               # ausformulierte Entwickler-Artikel
├── VISION.md
├── README.md
└── LICENSE
```

### Architektur-Prinzipien

- **Logik getrennt von Darstellung:** `game.js` (Zustand/Regeln) baut pro Frame einen
  read-only Snapshot, den `renderer.js` zeichnet — der Renderer ändert nie Zustand.
- **Ein Spawn-Muster, eine Stelle:** alle Spawner erben von `spawn-manager.js`.
- **Eine Quelle der Wahrheit fürs Balancing:** Konstanten leben in `config.js`.
- **Reine, testbare Kerne:** `score.js`, `collision.js`, `combo.js`, `stats.js`,
  `achievements.js`, `daily.js` sind frei von DOM/Canvas und vollständig unit-getestet.

## Lokal ausführen

Die `index.html` direkt im Browser öffnen — oder einen einfachen statischen Server
starten (z. B. zum Testen auf dem Handy im selben Netzwerk):

```bash
# Python 3
python3 -m http.server 8000
# danach im Browser: http://localhost:8000
```

## Tests

Die Spiel-Logik (Spieler, Zwerge, Kollisionen) ist in eigenen Modulen gekapselt und
wird mit dem **eingebauten Test-Runner von Node** geprüft — **ohne zusätzliche
Abhängigkeiten**:

```bash
npm test      # oder: node --test
```

Getestet werden u. a. Sprung/Schwerkraft, Doppelsprung, Power-Ups und Schild/i-Frames,
das Füllen und Auslösen des Wirbelsturms, die Zwerg-Typen, das Spawnen/Entfernen von
Zwergen, Münzen, Hindernissen und Power-Ups, die Boss-Mechanik (HP, Unverwundbarkeit,
Patrouille, Phasen, Wurfangriffe), das Combo-System, die Biom-Auswahl, die
Skin-Freischaltung, die Lifetime-Statistiken und die Erfolgs-Regeln, das Toast-System,
den deterministischen Tages-Seed (`src/daily.js`), das Partikelsystem, die
Highscore-Persistenz sowie die Stomp- und Überlapp-Erkennung (`src/collision.js`).
Ein Smoke-Test prüft zudem, dass `index.html` alle `src/`-Skripte korrekt einbindet.
Aktuell **131 Tests** (inkl. reiner Module wie `spawn-manager`, `config`, `score`).

Bei jedem Push laufen die Tests automatisch über
[GitHub Actions](./.github/workflows/tests.yml).

## Steuerung

| Taste | Aktion |
|-------|--------|
| `Leertaste` / `↑` / `W` / Klick | springen (bzw. Spiel starten/neu starten) |
| `Shift` / `F` | **Wirbelsturm** (wenn Power-Leiste voll) |
| `P` / `Esc` | Pause |
| `M` | Ton an/aus |
| `A` | Erfolge & Statistiken |
| `T` | Tages-Challenge an/aus |

**Touch (Handy/Tablet):** Am Spielfeld erscheinen unten zwei runde Tasten — links
**springen**, rechts **Wirbelsturm**. Pause, Ton, **Skin-Wechsel**, **Tages-Challenge**
und **Erfolge** liegen als Buttons unter dem Spielfeld. Die Touch-Tasten werden nur
auf Geräten ohne Maus eingeblendet.

## Lizenz

Siehe [`LICENSE`](./LICENSE).
