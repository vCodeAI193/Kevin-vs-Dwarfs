const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  PowerUp,
  PowerUpManager,
  pickPowerUpType,
  POWERUP_TYPES,
} = require("../src/powerups.js");

const GROUND_Y = 330;
const CANVAS_W = 800;

test("PowerUp bewegt sich nach links", () => {
  const p = new PowerUp(500, 200, "shield");
  const x0 = p.x;
  p.update(1 / 60, 5);
  assert.ok(p.x < x0);
});

test("unbekannter Typ fällt nicht auf undefined zurück", () => {
  const p = new PowerUp(0, 0, "quatsch");
  assert.ok(p.color);
  assert.ok(p.symbol);
});

test("pickPowerUpType liefert immer einen gültigen Typ", () => {
  const keys = Object.keys(POWERUP_TYPES);
  assert.ok(keys.includes(pickPowerUpType(() => 0)));
  assert.ok(keys.includes(pickPowerUpType(() => 0.99)));
});

test("PowerUpManager spawnt nach dem Cooldown ein Item", () => {
  const m = new PowerUpManager(CANVAS_W, GROUND_Y, () => 0.1);
  assert.equal(m.items.length, 0);
  m.update(12, 4); // > cooldown (11)
  assert.equal(m.items.length, 1);
  assert.ok(m.items[0].x >= CANVAS_W);
});

test("PowerUpManager entfernt eingesammelte Items", () => {
  const m = new PowerUpManager(CANVAS_W, GROUND_Y, () => 0.1);
  m.update(12, 4);
  m.items[0].collected = true;
  m.update(0.01, 4);
  assert.equal(m.items.length, 0);
});
