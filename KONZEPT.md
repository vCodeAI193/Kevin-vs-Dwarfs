# Spielkonzept & Aufbau — Kevin vs. Zwerge 🧔⚔️🧙‍♂️

Game-Design-Dokument. Beschreibt **Spielidee, Mechaniken und Aufbau** des Spiels.
Spieler-Doku → [`README.md`](README.md) · Code-/Engine-Details für Entwickler →
[`CLAUDE.md`](CLAUDE.md) · geplante Erweiterungen → [`FEATURES.md`](FEATURES.md).

## Inhalt
- [Spielidee & Vision](#spielidee--vision)
- [Spielziel](#spielziel)
- [Figuren](#figuren)
- [Spielmechaniken](#spielmechaniken)
- [Steuerung](#steuerung)
- [Schwierigkeitsgrade](#schwierigkeitsgrade)
- [Spielfluss & States](#spielfluss--states)
- [Punkte & Highscore](#punkte--highscore)
- [Architektur-Überblick](#architektur-überblick)
- [Design-Entscheidungen](#design-entscheidungen)

---

## Spielidee & Vision
**Kevin vs. Zwerge** ist ein 2D-Jump'n'Run für den Browser. Der Held **Kevin** rennt
seitlich durch eine endlose Welt und wehrt sich gegen heranlaufende **Zwerge** — indem
er von oben auf sie springt oder sie mit einem **Wirbelangriff** wegfegt.

Es ist ein **Endlos-Survival**: Es gibt kein festes Ende, das Spiel wird mit der Zeit
immer schneller und voller. Ziel ist ein möglichst hoher Punktestand. Kurze Runden,
sofort losspielbar, **ohne Installation** — einfach im Browser, auf Desktop **und** mobil.

> 💡 Leitgedanke: „Pick up & play" — in unter 5 Sekunden im Spiel, ein klares Risiko-/
> Belohnungs-System (Stomp ist präzise, der Wirbel ist mächtig, aber hat eine Abklingzeit).

## Spielziel
- So **lange wie möglich überleben** (Kevin hat 3 Leben ❤️).
- So **viele Punkte wie möglich** sammeln (Gegner besiegen + Vorankommen).
- Den eigenen **Highscore** überbieten (wird lokal gespeichert).

## Figuren
| Figur | Rolle | Verhalten |
|-------|-------|-----------|
| **Kevin** | Spielfigur | Läuft links/rechts, springt, führt den Wirbelangriff aus. Grünes Shirt, Lauf-Animation, blickt in Laufrichtung. |
| **Zwerge** | Gegner | Kleine Wichte mit roter Zipfelmütze und weißem Bart. Laufen permanent auf Kevin zu. Werden per Stomp platt gestampft oder vom Wirbel weggeschleudert. |

Alle Figuren werden **prozedural mit Canvas-Formen** gezeichnet (keine Bild-Dateien).

## Spielmechaniken
- **Laufen** — Kevin bewegt sich mit konstantem Tempo nach links/rechts; die Kamera folgt.
- **Springen** — einfacher Sprung vom Boden oder von einer Plattform.
- **Stomp (draufspringen)** — fällt Kevin von **oben** auf einen Zwerg (Fallbewegung +
  Füße über Zwergkopf), wird der Zwerg platt gestampft und Kevin **prallt ab**. `+100` Punkte.
- **Wirbelangriff (Spin)** — wirbelt **alle Zwerge im Umkreis** weg (Radius ~130 px) und
  schleudert sie rotierend aus dem Bild. `+150` Punkte je Zwerg. Danach kurze
  **Abklingzeit** (~2,4 s), die im HUD als Ladebalken angezeigt wird.
- **Treffer & Leben** — berührt ein Zwerg Kevin **von der Seite**, verliert er ein ❤️
  (von 3). Danach kurze **Unverwundbarkeit** (Kevin blinkt) + Rückstoß. Bei 0 Leben →
  Game Over.
- **Plattformen** — vereinzelte Schwebe-Plattformen sorgen für Höhenvariation; sie sind
  **einseitig** (nur von oben landbar, von unten durchsprungbar).

## Steuerung
| Aktion | Tastatur | Touch |
|--------|----------|-------|
| Laufen | `←` `→` / `A` `D` | ◀ ▶ (unten links) |
| Springen | `↑` / `W` / `Leertaste` | ⤒ (unten rechts) |
| Wirbelangriff | `X` / `Umschalt` | 🌀 (unten rechts) |

Touch-Tasten erscheinen automatisch auf Touch-Geräten; die Tastatur funktioniert parallel.
Im Hochformat erscheint ein Hinweis, das Gerät quer zu drehen.

## Schwierigkeitsgrade
Im Startmenü wählbar. Höhere Stufe = **mehr und schnellere Zwerge** (Konstante
`DIFFICULTY` in `index.html`):

| Stufe | Spawn-Intervall | Gegner-Tempo | Max. gleichzeitig |
|-------|-----------------|--------------|-------------------|
| **Leicht** | 2,0 s | 70 px/s | 6 |
| **Mittel** | 1,3 s | 100 px/s | 10 |
| **Schwer** | 0,85 s | 140 px/s | 16 |

Zusätzlich steigt die **Stufe automatisch alle ~12 Sekunden**: Spawn-Intervall sinkt,
Gegner-Tempo steigt (gedeckelt). So wird jede Runde mit der Zeit fordernder.

## Spielfluss & States
Das Spiel kennt drei Zustände (Variable `state`):

```
menu  ──[Schwierigkeit wählen]──▶  playing  ──[0 Leben]──▶  gameover
  ▲                                                            │
  └──────────────────[„Menü"]◀── │ ──[„Nochmal"]──────────────┘
```

- **menu** — Titel, Schwierigkeitsauswahl, Highscore, Steuerungshilfe.
- **playing** — die eigentliche Spielschleife (Physik, Kollision, Spawning, Rendering).
- **gameover** — Endpunktzahl + Highscore, „Nochmal" oder zurück ins „Menü".

## Punkte & Highscore
- **Stomp** `+100` · **Wirbel** `+150` · zusätzlicher Bonus fürs **Vorankommen** nach rechts.
- Der **Highscore** wird im Browser über `localStorage` (`kevin_highscore`) gespeichert
  und im Menü sowie im Game-Over-Screen angezeigt.

## Architektur-Überblick
Kurzfassung (vollständige Code-Konventionen in [`CLAUDE.md`](CLAUDE.md)):

- **Eine Datei:** `index.html` enthält HTML (Overlays/HUD/Touch), CSS und die
  JavaScript-Engine. **Keine Build-Tools, keine Abhängigkeiten.**
- **Design-Auflösung** fix `1280×720`; per CSS auf die Bildschirmgröße skaliert. Die
  Spiel-Logik rechnet immer in Design-Koordinaten.
- **Game-Loop:** `requestAnimationFrame` mit **delta-time** (`dt` auf `1/30`
  gedeckelt, damit Tab-Wechsel keine Riesensprünge erzeugen).
- **Kern-Funktionen:** `update(dt)` (Physik/Kollision/Spawning), `render()` (Zeichnen),
  `startGame()`, `endGame()`, `spawnDwarf()`, `killDwarf()`.
- **Eingabe:** Tastatur (`KEYMAP`) + Touch-Buttons schreiben in ein gemeinsames
  `input`-Objekt; Einmal-Aktionen laufen über `*Edge`-Flags.
- **HUD & Menüs** sind **HTML-Overlays** (kein Text/Buttons im Canvas) — gerendert wird
  nur die Spielwelt (Hintergrund, Plattformen, Kevin, Zwerge, Partikel).

## Design-Entscheidungen
- **Single-File / keine Dependencies** — maximal einfaches Teilen & Starten (Datei
  öffnen genügt), kein Build-Schritt, kein Versionskonflikt.
- **Touch-Steuerung als HTML-Overlay** statt Canvas-Hit-Testing — die Buttons sind so
  **unabhängig von der Canvas-Skalierung** und brauchen keine Koordinaten-Umrechnung.
- **Einseitige Plattformen** — Kollision nur beim Fallen von oben; verhindert, dass der
  Spieler beim Hochspringen an der Unterkante hängen bleibt.
- **Prozedurale Sprites & Welt** — keine Asset-Dateien, alles mit Canvas-Primitiven;
  hält das Repo schlank und das Spiel sofort lauffähig.
- **Endlos-Design mit Auto-Ramp** — sorgt für kurze, wiederspielbare Runden mit
  natürlicher Spannungskurve statt eines festen Levelendes.
