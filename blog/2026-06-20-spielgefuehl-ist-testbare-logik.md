---
title: "Spielgefühl ist testbare Logik — Coyote-Time, Sprung-Puffer & Screen-Shake"
date: 2026-06-20
tags: [javascript, gamedev, game-feel, testing]
project: Kevin gegen die Zwerge
---

# Spielgefühl ist testbare Logik — Coyote-Time, Sprung-Puffer & Screen-Shake

„Game Feel" — dieser schwer greifbare Unterschied zwischen einem Spiel, das sich gut
anfühlt, und einem, das sich hakelig anfühlt. Es klingt nach Bauchgefühl, nach etwas,
das man nur *spüren* und nicht *testen* kann. Dieser Beitrag zeigt am Endlos-Runner
„Kevin gegen die Zwerge" das Gegenteil: Die meisten Game-Feel-Bausteine sind **präzise
Regeln über der Zeit** — und damit so testbar wie jede andere Logik.

Umgesetzt wurden vier Dinge: **Coyote-Time**, **Sprung-Puffer**, **variable
Sprunghöhe** und **Screen-Shake**.

## Coyote-Time & Sprung-Puffer

Zwei klassische Fairness-Helfer:

- **Coyote-Time:** Wer einen Sekundenbruchteil *nach* dem Verlassen der Kante die
  Sprungtaste drückt, darf trotzdem noch springen. Das verzeiht minimal zu spätes
  Timing.
- **Sprung-Puffer:** Wer einen Sekundenbruchteil *vor* der Landung drückt, dessen
  Sprung wird gemerkt und bei der Landung sofort ausgeführt.

Beides sind simple Timer:

```js
// src/player.js
jump() {
  if (this.onGround || this.coyoteTimer > 0) { this._groundJump(); return true; }
  if (this.hasDoubleJump && this.jumpsUsed < 2) { /* Doppelsprung */ return true; }
  this.jumpBufferTimer = this.jumpBufferTime;  // zu früh -> puffern
  return false;
}

update(dt) {
  // ... Landung erkannt:
  if (this.jumpBufferTimer > 0) { this._groundJump(); this.jumpBufferTimer = 0; }
  // Coyote: am Boden auffüllen, in der Luft herunterzählen
  if (this.onGround) this.coyoteTimer = this.coyoteTime;
  else if (this.coyoteTimer > 0) this.coyoteTimer -= dt;
  if (this.jumpBufferTimer > 0) this.jumpBufferTimer -= dt;
}
```

Der subtile Punkt: `_groundJump()` **nullt den Coyote-Timer**. Sonst könnte direkt nach
einem Bodensprung ein zweiter „Gratis-Sprung" in der Luft feuern — und genau das hätte
einen bestehenden, schon grünen Test gebrochen. Beim Erweitern getesteter Logik lohnt
sich immer die Frage: *Welche Altannahme verletzt mein neuer Pfad?*

Der Test bestätigt das Zeitfenster direkt:

```js
const p = new Player(330);
p.update(1/60);        // am Boden -> coyoteTimer gefüllt
p.onGround = false;    // gerade von der Kante gefallen
assert.equal(p.jump(), true);   // dank Coyote-Time noch springbar
```

## Variable Sprunghöhe

Taste kurz antippen = kleiner Hüpfer, gedrückt halten = voller Sprung. Beim Loslassen
wird der Aufstieg gekappt:

```js
cutJump() { if (this.vy < 0) this.vy *= this.jumpCutMultiplier; }
```

Ausgelöst wird das vom `keyup` der Sprungtaste. Test: nach `jump()` ist `vy` negativ;
nach `cutJump()` näher an 0 — beim Fallen (`vy > 0`) passiert nichts.

## Screen-Shake ohne Zufall

Für „Wucht" bei Stomp, Boss-Treffer und Wirbelsturm sorgt ein **Trauma-Modell**:
Ereignisse erhöhen ein Trauma (0..1), das mit fester Rate abklingt; der Versatz wächst
quadratisch mit dem Trauma. Entscheidend für die Testbarkeit: Der Versatz ist
**deterministisch** (sinus-basiert über die Zeit), kein `Math.random`:

```js
// src/screenshake.js
getOffset() {
  if (this.trauma <= 0) return { x: 0, y: 0 };
  const mag = this.maxOffset * this.trauma * this.trauma;
  return { x: mag * Math.sin(this.t * 53), y: mag * Math.sin(this.t * 67 + 1.7) };
}
```

Damit lässt sich prüfen: Trauma deckelt bei 1, klingt auf 0 ab, und der Versatz bleibt
≤ `maxOffset`. Im Renderer liegt der Shake bewusst **nur auf den Spielobjekten** —
nicht auf Hintergrund und HUD. So entstehen keine Randlücken im Himmel, und das HUD
bleibt ruhig lesbar:

```js
this.drawBackground(s);              // ohne Versatz
ctx.save(); ctx.translate(s.shakeX, s.shakeY);
// ... Gegner, Münzen, Boss, Kevin, Partikel ...
ctx.restore();
this.drawHUD(s);                     // wieder stabil
```

## Was wir daraus mitnehmen

- **Game Feel = Regeln über der Zeit.** Coyote-Fenster, Puffer-Fenster, Abklingrate —
  alles benennbar, alles als pure Funktion testbar.
- **Effekte deterministisch bauen.** Sinus statt Zufall macht Shake reproduzierbar und
  prüfbar.
- **Beim Erweitern getesteter Logik die Altannahmen schützen.** Der genullte
  Coyote-Timer verhindert den „zweiten Gratis-Sprung".
- **Trennlinien beachten.** Shake auf die Welt, nicht aufs HUD — Lesbarkeit bleibt.

Nach diesem Batch: **142 grüne Tests**, ein deutlich saftigeres Spielgefühl — und ein
neues Wüsten-Biom obendrauf.

---

*Dieser Artikel ist Teil des Entwicklertagebuchs zu „Kevin gegen die Zwerge", einem
quelloffenen 2D-Jump-&-Run für den Browser.*
