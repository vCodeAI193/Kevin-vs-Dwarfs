const { test } = require("node:test");
const assert = require("node:assert/strict");
const { Boss } = require("../src/boss.js");

const GROUND_Y = 330;
const CANVAS_W = 800;

test("Boss startet voller HP und am rechten Rand", () => {
  const b = new Boss(CANVAS_W, GROUND_Y, 3);
  assert.equal(b.hp, 3);
  assert.equal(b.alive, true);
  assert.ok(b.x >= CANVAS_W);
  assert.equal(b.entering, true);
});

test("Boss läuft herein und beginnt dann zu patrouillieren", () => {
  const b = new Boss(CANVAS_W, GROUND_Y, 3);
  for (let i = 0; i < 500 && b.entering; i++) b.update(1 / 60, 6);
  assert.equal(b.entering, false);
  assert.equal(b.x, b.patrolMax);
});

test("Boss patrouilliert durch Kevins x-Position (~130)", () => {
  const b = new Boss(CANVAS_W, GROUND_Y, 3);
  // Hereinlaufen abschließen
  for (let i = 0; i < 1000 && b.entering; i++) b.update(1 / 60, 6);
  // Eine Weile patrouillieren und das minimale x beobachten
  let minX = b.x;
  for (let i = 0; i < 60 * 6; i++) {
    b.update(1 / 60, 6);
    minX = Math.min(minX, b.x);
  }
  assert.ok(minX <= 130, "Boss sollte bis zu Kevins Position vordringen");
});

test("hit() reduziert HP und macht kurz unverwundbar", () => {
  const b = new Boss(CANVAS_W, GROUND_Y, 3);
  assert.equal(b.vulnerable, true);
  assert.equal(b.hit(), true);
  assert.equal(b.hp, 2);
  assert.equal(b.vulnerable, false);
  // Zweiter Treffer sofort danach zählt nicht
  assert.equal(b.hit(), false);
  assert.equal(b.hp, 2);
});

test("nach Ablauf der Unverwundbarkeit ist der Boss wieder verwundbar", () => {
  const b = new Boss(CANVAS_W, GROUND_Y, 3);
  b.hit();
  for (let i = 0; i < 70; i++) b.update(1 / 60, 0); // > 1s
  assert.equal(b.vulnerable, true);
});

test("genug Treffer besiegen den Boss", () => {
  const b = new Boss(CANVAS_W, GROUND_Y, 2);
  b.hit();
  assert.equal(b.alive, true);
  for (let i = 0; i < 70; i++) b.update(1 / 60, 0);
  b.hit();
  assert.equal(b.hp, 0);
  assert.equal(b.alive, false);
});

test("Phase steigt mit sinkenden Lebenspunkten", () => {
  const b = new Boss(CANVAS_W, GROUND_Y, 6);
  assert.equal(b.phase, 1); // 6/6
  b.hp = 3; // 0.5
  assert.equal(b.phase, 2);
  b.hp = 1; // 0.16
  assert.equal(b.phase, 3);
});

test("Patrouille-Tempo steigt mit der Phase", () => {
  const b = new Boss(CANVAS_W, GROUND_Y, 6);
  const speed1 = b.currentPatrolSpeed;
  b.hp = 1;
  assert.ok(b.currentPatrolSpeed > speed1);
});

test("in Phase 1 wirft der Boss keine Hämmer", () => {
  const b = new Boss(CANVAS_W, GROUND_Y, 6);
  b.entering = false;
  b.x = b.patrolMax;
  for (let i = 0; i < 60 * 5; i++) b.update(1 / 60, 0);
  assert.equal(b.projectiles.length, 0);
});

test("ab Phase 2 wirft der Boss Hämmer", () => {
  const b = new Boss(CANVAS_W, GROUND_Y, 6);
  b.entering = false;
  b.x = b.patrolMax;
  b.hp = 3; // Phase 2
  // Projektile sind kurzlebig (fliegen aus dem Bild) -> beobachten, ob je eines existiert
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
