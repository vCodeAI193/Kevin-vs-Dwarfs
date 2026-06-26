---
title: "Der Stern, der schon da war — Features als Aufsatz auf bestehenden Zustand"
date: 2026-06-22
tags: [javascript, gamedev, architecture, reuse]
project: Kevin gegen die Zwerge
---

# Der Stern, der schon da war — Features als Aufsatz auf bestehenden Zustand

Dieser Batch für „Kevin gegen die Zwerge" brachte drei Dinge: einen
**Unverwundbarkeits-Stern** (Power-Up), **Meilenstein-Banner** alle 1000 Distanz und
ein **Pausen-Menü** mit Steuerungs-Referenz. Die interessante Erkenntnis betrifft den
Stern — und die Frage, die man sich vor jedem neuen Feature stellen sollte: *Existiert
der Zustand, den ich brauche, eigentlich schon?*

## „Unverwundbarkeit" gab es längst

Der erste Reflex bei einem Invincibility-Power-Up: in jeder Kollision eine Ausnahme
einbauen („wenn Stern aktiv, ignoriere Treffer"). Das wäre die gleiche Falle wie beim
Zen-Modus zuvor — verstreute Sonderfälle.

Aber das Spiel kannte „unverwundbar" schon: nach einem abgefangenen Schild-Treffer
bekommt Kevin kurze i-Frames über `player.invulnerable`. Und **alle** tödlichen Treffer
laufen durch eine einzige Funktion, die das prüft:

```js
function survivesFatalHit() {
  if (player.invulnerable) return true;   // ← gilt für alles
  if (zenMode) { /* … */ }
  if (player.consumeShield()) { /* … */ }
  return false;
}
```

Der Stern musste also nur **denselben Zustand** anschalten. Ein Timer im Player, und
der `invulnerable`-Getter berücksichtigt ihn:

```js
// src/player.js
get invulnerable() {
  return this.invulnTimer > 0 || this.starTimer > 0;
}

activatePowerUp(type) {
  // …
  else if (type === "star") this.starTimer = d;
}
```

Damit überlebt Kevin mit Stern automatisch Zwerge, Hindernisse, Boss **und**
Projektile — kein einziger Kollisions-Pfad musste angefasst werden. Der Rest des
Features ist Optik: eine goldene Aura in `player.draw()`, ein Eintrag in der HUD-Liste
der aktiven Power-Ups, ein neuer Typ in `POWERUP_TYPES`. Geschätzte 90 % „bestehenden
Zustand wiederverwenden", 10 % neu.

## Banner & Pausen-Menü: reine Ausgabe

Die anderen beiden Features sind bewusst dünn an Logik:

- **Meilenstein-Banner:** eine Zeile in der Update-Schleife, die bei jeder
  1000er-Schwelle einen Toast auslöst — das Toast-System gab es schon.
- **Pausen-Menü:** eine neue Zeichenmethode im Renderer, die eine Tasten-Tabelle malt.
  Reine Darstellung, kein Zustand.

## Was wir daraus mitnehmen

- **Frag zuerst nach dem Zustand.** „Unverwundbar" existierte — der Stern ist nur ein
  neuer Auslöser, keine neue Mechanik.
- **Konzepte als Zustand modellieren zahlt sich aus.** Wer „unverwundbar" und
  „tödlicher Treffer" einmal sauber zentralisiert, bekommt spätere Features als kleine
  Aufsätze statt als Parallel-Implementierungen.
- **Trenne Logik von Ausgabe.** Banner (ein Toast) und Pausen-Menü (eine
  Zeichenmethode) brauchen keinen neuen Zustand — und bleiben dadurch winzig.

Stand danach: **151 grüne Tests** und ein Power-Up, das sich anfühlt wie viel Arbeit,
aber fast keine war.

---

*Dieser Artikel ist Teil des Entwicklertagebuchs zu „Kevin gegen die Zwerge", einem
quelloffenen 2D-Jump-&-Run für den Browser.*
