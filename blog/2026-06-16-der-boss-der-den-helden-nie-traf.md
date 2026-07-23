---
title: "Der Boss, der den Helden nie traf — ein Koordinaten-Denkfehler"
date: 2026-06-16
tags: [gamedev, javascript, debugging, game-design, testing]
project: Kevin gegen die Zwerge
---

# Der Boss, der den Helden nie traf — ein Koordinaten-Denkfehler

Manche Bugs zeigen sich nicht als Absturz und nicht als roter Test, sondern als ein
Feature, das einfach **nichts tut**. Genau so ein Fall trat beim Bosskampf für den
Endlos-Runner „Kevin gegen die Zwerge" auf — und er ist ein schönes Lehrstück über
Koordinatensysteme in Side-Scrollern und über die Grenzen von Unit-Tests.

Die Kurzfassung: In einem Spiel mit **festem Helden und scrollender Welt** können
sich zwei Objekte nur treffen, wenn ihre x-Koordinaten irgendwann zusammenfallen.
Ein Boss, der woanders „stehen bleibt", ist unbesiegbar — und zwar lautlos.

## Das Problem / die Ausgangslage

Kevin bewegt sich horizontal **nicht**. Er steht bei x ≈ 130, und die Welt scrollt an
ihm vorbei: Gegner spawnen rechts und wandern nach links auf ihn zu. Dieses Modell
hält Kamera und Physik herrlich einfach.

Der erste Entwurf des Bosses ignorierte genau dieses Modell. Er sollte „beeindruckend
hereinkommen und dann Stellung beziehen":

```js
// erster (kaputter) Entwurf
this.x = canvasWidth + 40;     // startet rechts außerhalb
this.targetX = canvasWidth - 230; // bleibt bei x ≈ 570 stehen
// update(): nach links bis targetX, dann nur noch auf-und-ab wippen
```

Das Ergebnis: Der Boss thront bei x ≈ 570, Kevin steht bei x ≈ 130. Dazwischen liegen
**über 400 Pixel, die sich nie schließen.** Keine Kollision, kein Stomp, kein Schaden
— in beide Richtungen. Der „Kampf" war ein Standbild.

Das Tückische: Die Unit-Tests waren grün. Sie prüften die Lebenspunkte, den
Unverwundbarkeits-Timer nach einem Treffer, das Sterben bei 0 HP. Alles korrekt — nur
eben für einen Boss, den der Spieler nie berührt. **Ein Objekt für sich kann perfekt
funktionieren und trotzdem nutzlos sein, wenn die Beziehung zu einem anderen Objekt
nicht stimmt.**

## Die Lösung

Statt stehen zu bleiben, **patrouilliert** der Boss jetzt horizontal — und sein
Bereich deckt Kevins feste Position mit ab:

```js
// src/boss.js – der Boss zieht durch Kevins x hindurch
this.patrolMin = 40;
this.patrolMax = canvasWidth - 320; // ~480
this.patrolSpeed = 170;             // px/s
this.dir = -1;

update(dt, worldSpeed) {
  if (this.entering) {
    this.x -= worldSpeed * 1.1;
    if (this.x <= this.patrolMax) { this.x = this.patrolMax; this.entering = false; }
  } else {
    this.x += this.dir * this.patrolSpeed * dt;
    if (this.x <= this.patrolMin) { this.x = this.patrolMin; this.dir = 1; }
    else if (this.x >= this.patrolMax) { this.x = this.patrolMax; this.dir = -1; }
  }
  if (this.hitCooldown > 0) this.hitCooldown -= dt;
}
```

Jetzt entsteht echtes Gameplay: Wenn der Boss heranrückt und Kevin am Boden steht,
muss Kevin **springen**. Kommt er im Fallen auf dem Kopf des Bosses auf, zählt das als
Treffer (Stomp); seitlicher Kontakt ist tödlich. Drei Treffer — und der Zwergenkönig
ist besiegt.

Und damit dieser Fehler nie wieder still durchrutscht, prüft ein Test jetzt **genau
die räumliche Beziehung**, die vorher fehlte:

```js
test("Boss patrouilliert durch Kevins x-Position (~130)", () => {
  const b = new Boss(800, 330, 3);
  for (let i = 0; i < 1000 && b.entering; i++) b.update(1 / 60, 6);
  let minX = b.x;
  for (let i = 0; i < 60 * 6; i++) { b.update(1 / 60, 6); minX = Math.min(minX, b.x); }
  assert.ok(minX <= 130, "Boss sollte bis zu Kevins Position vordringen");
});
```

## Was wir daraus mitnehmen

- **Das Bewegungsmodell bestimmt alles.** Bei festem Helden + scrollender Welt lautet
  die Dauerfrage: „Fallen diese x-Koordinaten jemals zusammen?" Wenn nein, gibt es
  keine Interaktion.
- **Grüne Unit-Tests ≠ funktionierendes Feature.** Tests pro Objekt sichern das
  Objekt ab, nicht die Beziehung zwischen zweien.
- **Beziehungen gehören getestet.** Ein gezielter Test auf „treffen sie sich
  räumlich?" fängt genau die Klasse von Bugs, die Einzeltests übersehen.
- **Code-Review schlägt manchmal den Test.** Diesen Fehler hat kein roter Lauf
  aufgedeckt, sondern das laute Mitdenken beim Lesen des eigenen Codes.

---

*Dieser Artikel ist Teil des Entwicklertagebuchs zu „Kevin gegen die Zwerge", einem
quelloffenen 2D-Jump-&-Run für den Browser.*
