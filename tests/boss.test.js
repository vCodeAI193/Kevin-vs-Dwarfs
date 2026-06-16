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
