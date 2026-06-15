# Kevin gegen die Zwerge

Ein rasantes 2D-Jump-&-Run für den Browser. Kevin rennt endlos von links nach rechts,
besiegt Zwerge per Sprung auf den Kopf und entfesselt bei voller Power-Leiste den
**Wirbelsturm**, der alle umliegenden Zwerge für einige Sekunden umwirft.

➡️ **Spielkonzept & Designvision:** siehe [`VISION.md`](./VISION.md)

> **Status:** Frühe Konzeptphase. Aktuell existieren Vision und Roadmap — der Spielcode
> wird entlang der Meilensteine unten umgesetzt.

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
├── index.html          # Einstiegspunkt, Canvas
├── src/
│   ├── game.js         # Game-Loop, Zustände, Score
│   ├── player.js       # Kevin: Bewegung, Sprung, Wirbelsturm
│   └── enemies.js      # Zwerge: Spawn, Bewegung, Kollision
├── assets/             # Grafiken & Sounds (später)
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

## Steuerung

| Taste | Aktion |
|-------|--------|
| `→` / `D` | laufen / beschleunigen |
| `Leertaste` / `↑` / `W` | springen |
| `Shift` / `F` | **Wirbelsturm** (wenn Power-Leiste voll) |

## Lizenz

Siehe [`LICENSE`](./LICENSE).
