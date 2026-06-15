# Kevin vs. Zwerge 🧔⚔️🧙‍♂️

Ein 2D-Jump'n'Run für den Browser. **Kevin** rennt von links nach rechts, springt auf
kleine **Zwerge** drauf oder fegt sie mit seinem **Wirbelangriff** beiseite. Je höher
der gewählte Schwierigkeitsgrad, desto mehr und schnellere Gegner — und mit der Zeit
wird es zusätzlich immer schneller.

**Kein Build, keine Abhängigkeiten** — funktioniert auf Desktop **und** mobil
(Touch-Steuerung). Das Spiel besteht aus `index.html` (Darstellung & Steuerung) und
`engine.js` (reine Spiellogik); zum Spielen einfach `index.html` öffnen.

> 📖 Mehr: Spielkonzept & Aufbau → [`KONZEPT.md`](KONZEPT.md) ·
> geplante Features & Roadmap → [`FEATURES.md`](FEATURES.md)

## Spielen

Einfach `index.html` im Browser öffnen — Doppelklick reicht. Optional über einen
lokalen Server (z. B. für sauberes Mobile-Testing):

```bash
python3 -m http.server 8000
# dann http://localhost:8000 öffnen
```

## Steuerung

| Aktion | Tastatur | Touch |
|--------|----------|-------|
| Laufen | `←` `→` / `A` `D` | ◀ ▶ unten links |
| Springen | `↑` / `W` / `Leertaste` | ⤒ unten rechts |
| Wirbelangriff | `X` / `Umschalt` | 🌀 unten rechts |

## Spielmechanik

- **Stomp:** Von oben auf einen Zwerg springen → platt. Kevin prallt danach ab.
- **Wirbelangriff:** Wirbelt alle Zwerge im Umkreis weg. Hat eine kurze Abklingzeit
  (Anzeige im HUD), danach wieder einsatzbereit.
- **Seitlicher Treffer:** Berührt ein Zwerg Kevin von der Seite, kostet das ein ❤️
  (3 Leben). Bei 0 Leben → Game Over.
- **Schwierigkeit:** *Leicht · Mittel · Schwer* steuert Gegnerzahl, Tempo und
  Spawn-Rate. Zusätzlich steigt die Stufe alle ~12 Sekunden automatisch.
- **Punkte:** Stomp `+100`, Wirbel `+150`, plus Bonus fürs Vorankommen. Highscore
  wird lokal im Browser gespeichert (`localStorage`).

## Technik

- HTML5 `<canvas>`, Vanilla JavaScript, feste Design-Auflösung 1280×720, per CSS
  auf die Bildschirmgröße skaliert.
- Spielschleife mit `requestAnimationFrame` und delta-time (gegen Tab-Wechsel-Sprünge
  begrenzt).
- Touch-Buttons als HTML-Overlay (Pointer-Events, Multitouch-fähig), nur auf
  Touch-Geräten sichtbar (`@media (pointer: coarse)`).
- Prozedurale Schwebe-Plattformen (deterministisch pro Segment), Parallax-Hintergrund.
- Reine Spiellogik (Kollision, Stomp/Wirbel, Scoring, Schwierigkeits-Ramp) liegt in
  `engine.js` — dieselbe Quelle nutzen das Spiel **und** die Tests.

## Tests

Die reine Spiellogik (`engine.js`) ist mit Nodes eingebautem Test-Runner abgedeckt —
**ohne zusätzliche Abhängigkeiten**:

```bash
npm test        # oder:  node --test
```
