---
title: "Der grüne Test, der trotzdem log — kurzlebige Objekte richtig prüfen"
date: 2026-06-18
tags: [javascript, gamedev, testing, debugging]
project: Kevin gegen die Zwerge
---

# Der grüne Test, der trotzdem log — kurzlebige Objekte richtig prüfen

Der Zwergenkönig in „Kevin gegen die Zwerge" bekam ein Upgrade: **Phasen** (er wird
schneller, je mehr Schaden er nimmt) und **Wurfangriffe** — Hämmer, die flach über den
Boden fliegen und über die Kevin springen muss. Beim Absichern mit Tests passierte
etwas Lehrreiches: Ein Test schlug fehl und behauptete, der Boss würfe nicht — obwohl
er es tat. Die eigentliche Lektion dieses Beitrags hat nichts mit Bossen zu tun,
sondern mit dem Testen von **kurzlebigen Objekten**.

## Das Problem / die Ausgangslage

Der naheliegende Test sah so aus: Boss in Phase 2 versetzen, eine Weile simulieren,
dann nachsehen, ob Projektile da sind.

```js
test("ab Phase 2 wirft der Boss Hämmer", () => {
  const b = new Boss(800, 330, 6);
  b.entering = false; b.x = b.patrolMax;
  b.hp = 3; // Phase 2
  for (let i = 0; i < 60 * 4; i++) b.update(1 / 60, 0);
  assert.ok(b.projectiles.length > 0);   // ❌ schlägt fehl
});
```

Rot. Erster Reflex: „Der Wurf-Code ist kaputt." Doch ein schneller Direkt-Test
widerlegte das sofort:

```js
const b = new Boss(800, 330, 6);
b.entering = false; b.x = b.patrolMax; b.hp = 3;
b.updateThrows(2.5);
console.log(b.projectiles.length); // -> 1  (er wirft also doch!)
```

Der Boss warf einwandfrei. Das Problem war der **Zeitpunkt der Prüfung**. Projektile
sind kurzlebig: Sie fliegen mit ~400 px/s nach links und werden entfernt, sobald sie
das Bild verlassen. Über vier simulierte Sekunden warf der Boss mehrfach — aber jeder
Hammer war nach ~1,5 s wieder weg. Am Ende der Schleife war die Liste rein zufällig
leer. Der Test maß einen **Momentwert eines transienten Zustands** und schloss daraus
auf „passiert nie".

## Die Lösung

Statt eines Schnappschusses am Ende **beobachtet** der Test den gesamten Verlauf: Trat
das Ereignis *irgendwann* auf?

```js
test("ab Phase 2 wirft der Boss Hämmer", () => {
  const b = new Boss(800, 330, 6);
  b.entering = false; b.x = b.patrolMax;
  b.hp = 3; // Phase 2

  let everThrown = false;
  let leftMoving = true;
  for (let i = 0; i < 60 * 4; i++) {
    b.update(1 / 60, 0);
    if (b.projectiles.length > 0) {
      everThrown = true;
      if (b.projectiles[0].vx >= 0) leftMoving = false;
    }
  }
  assert.ok(everThrown, "Boss sollte in Phase 2 Hämmer werfen");
  assert.ok(leftMoving, "Hämmer fliegen nach links");
});
```

Das `everThrown`-Flag fängt das flüchtige Ereignis zuverlässig — egal, ob im Moment
der letzten Iteration gerade ein Projektil existiert oder nicht.

Zum Gegencheck blieb der Phase-1-Test bewusst als **Schnappschuss**: Dort soll *nie*
geworfen werden, und „am Ende ist die Liste leer" ist hier genau die richtige Aussage
(verstärkt dadurch, dass über die ganze Laufzeit nie etwas entstand).

## Was wir daraus mitnehmen

- **Kurzlebige Objekte über die Zeit prüfen.** Projektile, Partikel, Toasts, Treffer-
  Blitze — bei allem Transienten testet ein Momentaufnahme-Assert leicht das Falsche.
- **Frage „trat es je auf?", nicht „ist es jetzt da?".** Ein Flag über die Simulations-
  schleife ist robuster als ein einzelner Blick am Ende.
- **Verdächtige erst die Annahme, dann den Code.** Ein roter Test heißt oft, dass der
  Test etwas anderes misst, als man denkt — ein 3-Zeilen-Direkttest klärt das in
  Sekunden.
- **Negativ-Tests dürfen Schnappschüsse sein.** „Passiert nie" lässt sich am Endzustand
  prüfen; „passiert irgendwann" nicht.

Mit dem mehrphasigen Boss, seinen Wurfangriffen und einem Toast-System für Erfolge und
Boss-Phasen stehen jetzt **118 grüne Tests** — und diesmal sagen sie auch die Wahrheit.

---

*Dieser Artikel ist Teil des Entwicklertagebuchs zu „Kevin gegen die Zwerge", einem
quelloffenen 2D-Jump-&-Run für den Browser.*
