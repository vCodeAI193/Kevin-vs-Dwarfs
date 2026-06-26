---
title: "Eine Naht, zwei Features — Hit-Stop und Zen-Modus mit minimalem Eingriff"
date: 2026-06-21
tags: [javascript, gamedev, architecture, game-feel]
project: Kevin gegen die Zwerge
---

# Eine Naht, zwei Features — Hit-Stop und Zen-Modus mit minimalem Eingriff

Zwei neue Features für „Kevin gegen die Zwerge", beide tief im Spielablauf: **Hit-Stop**
(kurzes Einfrieren bei wuchtigen Treffern) und ein **Zen-Modus** (üben ohne Game Over).
Beide klingen nach Eingriffen, die sich quer durch den Code ziehen. Tatsächlich kostete
jedes nur **eine Stelle** — weil der Code dort schon saubere Nähte hatte.

## Hit-Stop: ein Timer an der Spitze der Schleife

Hit-Stop friert für ~40–70 ms die ganze Welt ein, wenn etwas Wichtiges passiert. Der
Reflex wäre, in jeder Kollision „jetzt einfrieren" zu verteilen. Stattdessen ist es ein
winziger Timer …

```js
// src/hitstop.js
class HitStop {
  trigger(seconds) { this.timer = Math.max(this.timer, seconds); }
  update(dt) { if (this.timer > 0) this.timer = Math.max(0, this.timer - dt); return this.active; }
  get active() { return this.timer > 0; }
}
```

… und in der Update-Schleife steht genau **eine** Bedingung, ganz oben:

```js
function update(dt) {
  if (state !== "playing") { /* … */ return; }

  if (hitstop.active) {       // ← die ganze Naht
    hitstop.update(dt);
    return;                   // Frame überspringen = Welt eingefroren
  }
  // … normaler Update …
}
```

Auslösen tut das nur, wer Wucht erzeugt: `hitstop.trigger(CONFIG.hitstop.stomp)` beim
Stomp, `…boss` beim Boss-Treffer. Keine andere Stelle muss wissen, dass es Hit-Stop
überhaupt gibt.

## Zen-Modus: den bestehenden Funnel nutzen

Im Zen-Modus soll Kevin **nicht sterben**. Gefahren gibt es viele — Zwerge von der
Seite, Hindernisse, der Boss, Boss-Projektile. Sie alle einzeln „abschalten" wäre
mühsam und fehleranfällig.

Der Clou: Diese vier Wege laufen längst durch **eine** Funktion zusammen.
`survivesFatalHit()` entscheidet überall, ob ein sonst tödlicher Treffer überlebt wird
(via i-Frames oder Schild). Also genügt dort ein Satz:

```js
function survivesFatalHit() {
  if (player.invulnerable) return true;
  if (zenMode) { player.grantInvulnerability(0.6); return true; } // ← Zen
  if (player.consumeShield()) { /* … */ return true; }
  return false;
}
```

Ein `if` — und Zwerge, Hindernisse, Boss und Projektile sind automatisch harmlos, weil
jeder ihrer tödlichen Pfade durch diesen Funnel geht. Die kurzen i-Frames verhindern,
dass dasselbe Hindernis jeden Frame neu auslöst.

Damit Übung die Statistik nicht verfälscht, zählt Zen nicht: Erfolge werden im Lauf
übersprungen (`if (zenMode) return;` in der Live-Prüfung), und mangels Game Over werden
Highscore/Statistiken ohnehin nie geschrieben. Ein eigener Indikator im HUD und ein
sauberer Ausstieg (`Z`/`Esc` beendet die Übung) runden es ab.

## Was wir daraus mitnehmen

- **Effekte mit „Zeit anhalten" gehören an die Spitze der Schleife** — eine Bedingung,
  nicht verteilte Sonderfälle.
- **Ein Funnel macht neues Verhalten billig.** Weil alle tödlichen Treffer durch
  `survivesFatalHit()` gehen, kostete Unsterblichkeit eine Zeile statt vieler.
- **Übungsmodi dürfen die Progression nicht verfälschen** — Erfolge/Highscore im Zen
  bewusst aussparen.
- **Saubere Nähte zahlen Zinsen.** Was man früher zentralisiert hat (Fatal-Hit-Funnel,
  read-only Snapshot), macht jedes spätere Feature kleiner.

Dazu kamen drei neue Erfolge (reine Daten in `achievements.js`). Stand danach:
**149 grüne Tests**.

---

*Dieser Artikel ist Teil des Entwicklertagebuchs zu „Kevin gegen die Zwerge", einem
quelloffenen 2D-Jump-&-Run für den Browser.*
