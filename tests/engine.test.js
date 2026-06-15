"use strict";
// Tests für die reine Spiellogik (engine.js) — Nodes eingebauter Test-Runner,
// keine Abhängigkeiten:  npm test   bzw.   node --test
const test = require("node:test");
const assert = require("node:assert/strict");
const E = require("../engine.js");

test("DIFFICULTY: drei Stufen, höhere Stufe = härter", () => {
  for (const name of ["leicht", "mittel", "schwer"]) {
    const d = E.DIFFICULTY[name];
    assert.ok(d, `Stufe ${name} existiert`);
    for (const k of ["spawn", "speed", "max", "ramp"]) {
      assert.equal(typeof d[k], "number", `${name}.${k} ist eine Zahl`);
    }
  }
  // Schwer hat mehr & schnellere Gegner und kürzeres Spawn-Intervall.
  assert.ok(E.DIFFICULTY.schwer.max > E.DIFFICULTY.leicht.max);
  assert.ok(E.DIFFICULTY.schwer.speed > E.DIFFICULTY.leicht.speed);
  assert.ok(E.DIFFICULTY.schwer.spawn < E.DIFFICULTY.leicht.spawn);
});

test("clamp: begrenzt nach unten/oben, lässt Werte im Bereich durch", () => {
  assert.equal(E.clamp(5, 0, 10), 5);
  assert.equal(E.clamp(-3, 0, 10), 0);
  assert.equal(E.clamp(99, 0, 10), 10);
});

test("rectsOverlap: Überlappung erkannt, Berührung an der Kante zählt nicht", () => {
  const a = { x: 0, y: 0, w: 10, h: 10 };
  assert.equal(E.rectsOverlap(a, { x: 5, y: 5, w: 10, h: 10 }), true);   // überlappt
  assert.equal(E.rectsOverlap(a, { x: 50, y: 0, w: 10, h: 10 }), false); // weit weg
  assert.equal(E.rectsOverlap(a, { x: 10, y: 0, w: 10, h: 10 }), false); // nur Kante berührt
});

test("isStomp: nur beim Fallen von oben auf den Zwerg", () => {
  const dwarf = { y: 100 };
  // fällt (vy>0) und Füße waren über der Zwerg-Oberkante -> Stomp
  assert.equal(E.isStomp({ vy: 200, prevBottom: 105 }, dwarf), true);
  // springt nach oben (vy<=0) -> kein Stomp
  assert.equal(E.isStomp({ vy: -50, prevBottom: 105 }, dwarf), false);
  // fällt, aber kam von zu weit unten (seitlicher Treffer) -> kein Stomp
  assert.equal(E.isStomp({ vy: 200, prevBottom: 130 }, dwarf), false);
  // eigene Toleranz
  assert.equal(E.isStomp({ vy: 1, prevBottom: 124 }, dwarf, 25), true);
});

test("withinSpin: Treffer im Radius, knapp außerhalb nicht", () => {
  const dwarf = { x: 100, y: 100, w: 40, h: 40 }; // Mittelpunkt (120,120)
  assert.equal(E.withinSpin(120, 120, dwarf, 130), true);  // direkt drauf
  assert.equal(E.withinSpin(0, 0, dwarf, 130), false);     // weit weg
  // Mittelpunkt genau auf dem Radius -> strikt "<" -> false
  assert.equal(E.withinSpin(120 - 50, 120, { x: 0, y: 100, w: 40, h: 40 }, 50), false);
});

test("scoreForKill: Wirbel gibt mehr Punkte als Stomp", () => {
  assert.equal(E.scoreForKill(true), 150);
  assert.equal(E.scoreForKill(false), 100);
});

test("nextRamp: schneller spawnen & laufen, mit Unter-/Obergrenze", () => {
  const r = E.nextRamp(1.0, 100, 0.8);
  assert.equal(r.spawn, 0.8);
  assert.equal(r.speed, 112);
  // Spawn nicht unter SPAWN_FLOOR
  assert.equal(E.nextRamp(0.5, 100, 0.8).spawn, E.SPAWN_FLOOR);
  // Speed nicht über SPEED_CAP
  assert.equal(E.nextRamp(1.0, E.SPEED_CAP - 1, 0.8).speed, E.SPEED_CAP);
});

test("clampDt: große Sprünge deckeln, kleine durchlassen", () => {
  assert.equal(E.clampDt(1), E.DT_CAP);
  assert.equal(E.clampDt(0.01), 0.01);
  assert.equal(E.clampDt(1, 0.5), 0.5);
});

test("spinStatus: bereit nur ohne Cooldown und ohne laufenden Wirbel", () => {
  assert.deepEqual(E.spinStatus(0, 0, 2.4), { ready: true, pct: 100 });
  // halbe Abklingzeit -> nicht bereit, ~50 %
  const half = E.spinStatus(1.2, 0, 2.4);
  assert.equal(half.ready, false);
  assert.equal(half.pct, 50);
  // läuft gerade (spinTimer>0) -> nicht bereit
  assert.equal(E.spinStatus(0, 0.3, 2.4).ready, false);
});

test("computePlatforms: deterministisch und in gültigen Grenzen", () => {
  const groundY = 624;
  const a = E.computePlatforms(0, 1280, groundY);
  const b = E.computePlatforms(0, 1280, groundY);
  assert.deepEqual(a, b, "gleiche Eingabe -> gleiche Plattformen");
  assert.ok(Array.isArray(a));
  for (const pl of a) {
    assert.ok(pl.x >= 620, "Startbereich frei (Segment >= 1)");
    assert.equal(pl.h, 22);
    assert.ok(pl.w >= 130 && pl.w <= 250, "Breite im erwarteten Bereich");
    assert.ok(pl.y >= groundY - 220 && pl.y <= groundY - 110, "Höhe erreichbar");
  }
});
