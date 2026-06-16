# Kevin gegen die Zwerge

Ein rasantes 2D-Jump-&-Run für den Browser. Kevin rennt endlos von links nach rechts,
besiegt Zwerge per Sprung auf den Kopf und entfesselt bei voller Power-Leiste den
**Wirbelsturm**, der alle umliegenden Zwerge für einige Sekunden umwirft.

➡️ **Spielkonzept & Designvision:** siehe [`VISION.md`](./VISION.md)
➡️ **Lessons Learned (Entwicklungs-Logbuch / Blog-Material):** siehe [`LESSONS_LEARNED.md`](./LESSONS_LEARNED.md)
➡️ **Blog (ausformulierte Artikel zur Entwicklung):** siehe [`blog/`](./blog/)

> **Status:** Spielbarer Prototyp. Die Meilensteine M0–M4 sind umgesetzt und um
> mehrere Features erweitert.

## Features

- 🏃 Endlos-Lauf nach rechts mit Springen, ansteigender Schwierigkeit
- 🦶 Zwerge per **Stomp** besiegen; seitlicher Kontakt = Game Over
- 🌀 **Wirbelsturm** als Spezialangriff (Power-Leiste füllt sich pro Kill/Münze)
- 🧝 **Zwerg-Typen:** normal, schnell und gepanzert (nur per Wirbelsturm besiegbar)
- 🪨 **Hindernisse** (Felsen) zum Drüberspringen
- 🪙 **Münzen** sammeln für Punkte und etwas Extra-Power
- ⚡ **Power-Ups:** Doppelsprung, Schild (fängt einen tödlichen Treffer ab) und Magnet
- 👹 **Bosskampf:** der Zwergenkönig taucht in Distanz-Abständen auf, hält mehrere
  Treffer aus und bringt einen Score-Bonus
- 🏆 **Highscore** dauerhaft gespeichert (localStorage)
- 🔊 **Sound** (synthetisch über Web Audio, ohne Dateien) & ✨ Partikel-Effekte
- ⏸️ **Pause** (P/Esc) und Ton an/aus (M)

## Tech-Stack

- **HTML5 Canvas + Vanilla JavaScript** — läuft sofort im Browser, ohne Build-Schritt.
- **Game-Loop** über `requestAnimationFrame`.
- Bewusst leichtgewichtig: einfach teilbar (eine `index.html`), niedrige Einstiegshürde,
  spätere Migration auf ein Build-Tool oder eine Engine bleibt möglich.

## Roadmap zum ersten Prototyp

Jeder Meilenstein ist ein eigenständig spielbarer Schritt:

| Meilenstein | Ziel |
|-------------|------|
| **M0 – Gerüst** | `index.html` mit Canvas, Game-Loop läuft, „Kevin" (Rechteck) steht auf dem Boden. |
| **M1 – Bewegung & Sprung** | Schwerkraft, Springen per Leertaste, Welt scrollt nach links (Endlos-Lauf-Gefühl). |
| **M2 – Zwerge & Stomp** | Zwerge spawnen von rechts; Sprung auf den Kopf besiegt sie, seitlicher Kontakt = Game Over. |
| **M3 – Wirbelsturm** | Power-Leiste füllt sich pro Kill; ausgelöst werden alle Zwerge im Umkreis kurz umgeworfen. |
| **M4 – Score & Loop** | Distanz-/Score-Anzeige, Game-Over-Screen, Neustart, ansteigende Schwierigkeit. |

## Geplante Projektstruktur

```
Kevin-vs-Dwarfs/
├── index.html          # Einstiegspunkt, Canvas, lädt die Skripte
├── src/
│   ├── game.js         # Game-Loop, Zustände, Kollisionen, HUD
│   ├── player.js       # Kevin: Bewegung, Sprung, Wirbelsturm, Power
│   ├── enemies.js      # Zwerge: Typen, Spawn, Bewegung
│   ├── collectibles.js # Münzen: Spawn, Einsammeln
│   ├── obstacles.js    # Hindernisse (Felsen)
│   ├── powerups.js     # Power-Ups: Doppelsprung, Schild, Magnet
│   ├── boss.js         # Bosskampf (Zwergenkönig)
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

## Lokal ausführen (sobald Code vorhanden ist)

Die `index.html` direkt im Browser öffnen — oder, falls Module/Assets geladen werden,
einen einfachen statischen Server starten:

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
Patrouille), das Partikelsystem, die Highscore-Persistenz sowie die Stomp- und
Überlapp-Erkennung (`src/collision.js`). Aktuell **64 Tests**.

Bei jedem Push laufen die Tests automatisch über
[GitHub Actions](./.github/workflows/tests.yml).

## Steuerung

| Taste | Aktion |
|-------|--------|
| `Leertaste` / `↑` / `W` / Klick | springen |
| `Shift` / `F` | **Wirbelsturm** (wenn Power-Leiste voll) |
| `P` / `Esc` | Pause |
| `M` | Ton an/aus |

## Lizenz

Siehe [`LICENSE`](./LICENSE).
