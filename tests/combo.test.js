const { test } = require("node:test");
const assert = require("node:assert/strict");
const { Combo, COMBO_MAX_MULTIPLIER } = require("../src/combo.js");

test("frische Combo hat Multiplikator 1 und ist inaktiv", () => {
  const c = new Combo();
  assert.equal(c.multiplier, 1);
  assert.equal(c.active, false);
});

test("ein einzelner Kill bleibt bei 1x", () => {
  const c = new Combo();
  assert.equal(c.add(), 1);
  assert.equal(c.active, false);
});

test("zwei schnelle Kills ergeben 2x und aktivieren die Combo", () => {
  const c = new Combo();
  c.add();
  assert.equal(c.add(), 2);
  assert.equal(c.active, true);
});

test("Multiplikator ist bei COMBO_MAX_MULTIPLIER gedeckelt", () => {
  const c = new Combo();
  for (let i = 0; i < 50; i++) c.add();
  assert.equal(c.multiplier, COMBO_MAX_MULTIPLIER);
});

test("Combo verfällt nach Ablauf des Zeitfensters", () => {
  const c = new Combo(2.5);
  c.add();
  c.add();
  assert.equal(c.active, true);
  c.update(3.0); // länger als das Fenster
  assert.equal(c.count, 0);
  assert.equal(c.multiplier, 1);
});

test("rechtzeitiger Kill hält die Combo am Leben", () => {
  const c = new Combo(2.5);
  c.add();
  c.add();
  c.update(2.0); // noch im Fenster
  assert.equal(c.add(), 3);
});

test("reset() setzt die Combo zurück", () => {
  const c = new Combo();
  c.add();
  c.add();
  c.reset();
  assert.equal(c.count, 0);
  assert.equal(c.active, false);
});
