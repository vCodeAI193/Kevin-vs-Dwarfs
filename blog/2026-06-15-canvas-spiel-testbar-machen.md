---
title: "Ein Canvas-Spiel ohne Abhängigkeiten testbar machen"
date: 2026-06-15
tags: [javascript, gamedev, testing, html5-canvas, nodejs]
project: Kevin gegen die Zwerge
---

# Ein Canvas-Spiel ohne Abhängigkeiten testbar machen

Über das Schreiben von Spielen mit HTML5 Canvas gibt es unzählige Tutorials. Über
das *Testen* solcher Spiele erstaunlich wenig — und fast nichts zu der Frage, wie
man das **ohne ein einziges npm-Paket** hinbekommt. Dieser Artikel schließt die
Lücke anhand eines echten kleinen Projekts: dem 2D-Endlos-Jump-&-Run
**„Kevin gegen die Zwerge"**.

Die Kernaussage vorweg: Nicht das Spiel ist schwer zu testen, sondern der Code, der
*Zeichnen* und *Entscheiden* vermischt. Trennt man beides, bekommt man Tests fast
geschenkt — und braucht dafür weder Jest noch eine Headless-Browser-Umgebung.

## Der typische erste Wurf

Ein Canvas-Prototyp sieht am Anfang fast immer so aus: eine Datei, ein großer
`requestAnimationFrame`-Loop, und mittendrin alles vermischt — Eingabe, Physik,
Kollision und Zeichnen:

```js
(function () {
  const ctx = canvas.getContext("2d");

  function handleCollisions() {
    for (const d of enemies.dwarves) {
      // Treffer-Erkennung ...
      const stomping = player.vy > 0 && /* ... Geometrie ... */;
      if (stomping) { d.alive = false; player.addKillPower(); }
      else { gameOver(); }
    }
  }

  function loop(now) {
    update(dt);
    render(ctx);   // zeichnet auf den Canvas
    requestAnimationFrame(loop);
  }
})();
```

Das läuft im Browser einwandfrei. Aber sobald man einen Test schreiben will, stößt
man auf zwei Wände.

### Wand 1: Die Logik ist eingesperrt

Die ganze Datei steckt in einer sofort ausgeführten Funktion (IIFE,
`(function(){ ... })()`). Das ist gut gegen globale Namens-Kollisionen — aber es
bedeutet auch: `handleCollisions` ist von außen **nicht erreichbar**. Es gibt
nichts zu importieren, also nichts zu testen.

### Wand 2: Alles hängt am Browser

Selbst wenn man drankäme — der Code ruft `canvas.getContext("2d")` auf und zeichnet.
Unter Node, wo Tests am liebsten laufen, gibt es kein `document`, kein `canvas`,
keinen `2d`-Context. Ein Test würde sofort mit „`canvas is not defined`" sterben.

## Der Denkfehler — und die Lösung

Der eigentliche Fehler ist konzeptionell: **Entscheiden und Zeichnen wurden
vermischt.** Ob zwei Rechtecke sich überlappen oder ob Kevin einen Zwerg von oben
trifft, ist reine Mathematik. Damit hat der Canvas nichts zu tun.

Die Lösung besteht aus zwei kleinen Schritten.

### Schritt 1: Reine Logik herauslösen

Die geometrische Entscheidung wandert in ein eigenes Modul `collision.js`, das
nichts über den Browser weiß:

```js
// src/collision.js

// Achsen-ausgerichteter Rechteck-Überlapp (AABB)
function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

// Stompt der Spieler den Zwerg von oben?
function isStomp(player, dwarf) {
  if (player.vy <= 0) return false;                 // muss fallen
  const prevBottom = player.y + player.height - player.vy;
  return prevBottom <= dwarf.y + dwarf.height * 0.5; // war über der oberen Hälfte
}
```

Diese Funktionen bekommen schlichte Objekte mit `x, y, width, height` (und für den
Stomp zusätzlich `vy`). Kein `ctx`, kein `window`, keine Seiteneffekte. Genau das
macht sie testbar.

### Schritt 2: Im Browser *und* in Node ladbar machen

Damit dieselbe Datei sowohl per `<script>`-Tag im Browser als auch via `require`
in Node funktioniert, gibt es einen doppelten Export — jeweils geschützt, damit es
in der anderen Umgebung nicht knallt:

```js
// am Ende von collision.js
if (typeof window !== "undefined") {
  window.rectsOverlap = rectsOverlap;
  window.isStomp = isStomp;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = { rectsOverlap, isStomp };
}
```

Dasselbe Muster funktioniert auch für Klassen wie `Player` oder `Dwarf`. So bleibt
der „kein Build-Tool"-Charakter des Projekts erhalten: Die `index.html` lädt die
Skripte weiterhin als simple `<script>`-Tags, und Node sieht trotzdem saubere
Module.

## Testen mit Bordmitteln — ganz ohne npm install

Seit Node 18 bringt die Laufzeit einen **eingebauten Test-Runner** mit. Keine
Abhängigkeit, kein Setup. Eine Testdatei sieht so aus:

```js
// tests/collision.test.js
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { rectsOverlap, isStomp } = require("../src/collision.js");

test("getrennte Rechtecke überlappen nicht", () => {
  const a = { x: 0, y: 0, width: 10, height: 10 };
  const b = { x: 20, y: 0, width: 10, height: 10 };
  assert.equal(rectsOverlap(a, b), false);
});

test("fallender Spieler über dem Zwerg-Kopf stompt", () => {
  const dwarf = { y: 100, height: 40 };
  const player = { y: 70, height: 20, vy: 12 };
  assert.equal(isStomp(player, dwarf), true);
});

test("seitlicher Aufprall ist kein Stomp", () => {
  const dwarf = { y: 100, height: 40 };
  const player = { y: 100, height: 20, vy: 0 };
  assert.equal(isStomp(player, dwarf), false);
});
```

Ausgeführt wird das mit einem einzigen Befehl:

```bash
node --test      # oder: npm test
```

In „Kevin gegen die Zwerge" deckt das inzwischen 22 Tests ab — Sprung und
Schwerkraft, das Füllen und Auslösen des Spezialangriffs (des *Wirbelsturms*), das
Spawnen und Aufräumen der Zwerge sowie eben die Kollisions-Geometrie. Alles ohne
eine einzige externe Bibliothek.

## Was bleibt untestbar — und ist das schlimm?

Der `requestAnimationFrame`-Loop und die `render()`-Funktion bleiben browser- und
canvas-gebunden. Die *kann* man mit einer Headless-Umgebung testen, aber der Aufwand
lohnt selten: Diese Schicht entscheidet nichts, sie stellt nur dar. Bugs dort sieht
man sofort mit den Augen. Die kniffligen Bugs — „warum stirbt Kevin, obwohl er von
oben kommt?" — stecken in der Logik. Und genau die ist jetzt abgedeckt.

## Faustregeln zum Mitnehmen

- **Entscheiden ≠ Zeichnen.** Was ein Ergebnis berechnet (Treffer? Stomp? betäubt?),
  gehört in pure Funktionen ohne Canvas und ohne Seiteneffekte.
- **Pure Funktionen sind Test-Magnete.** Eingabe rein, Ergebnis raus — der ideale
  Unit-Test schreibt sich fast von selbst.
- **Doppel-Export statt Build-Tool.** `window` *und* `module.exports` lassen
  dieselbe Datei im Browser und in Node leben.
- **`node --test` reicht oft.** Für Logik-Tests braucht es kein Test-Framework und
  kein `npm install`.

Das größere Muster dahinter ist uralt und trotzdem leicht zu vergessen: Trenne das,
was *entscheidet*, von dem, was *darstellt*. Bei einem Canvas-Spiel ist der Gewinn
nur besonders sichtbar — weil die Trennlinie genau dort verläuft, wo der Test-Runner
sonst an die Wand fährt.

---

*Dieser Artikel ist Teil des Entwicklertagebuchs zu „Kevin gegen die Zwerge", einem
quelloffenen 2D-Jump-&-Run für den Browser.*
