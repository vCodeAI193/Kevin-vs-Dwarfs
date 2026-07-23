const { test } = require("node:test");
const assert = require("node:assert/strict");
const { Coin, CoinManager, COIN_VALUE } = require("../src/collectibles.js");

const GROUND_Y = 330;
const CANVAS_W = 800;

test("Coin bewegt sich mit der Weltgeschwindigkeit nach links", () => {
  const c = new Coin(500, 200);
  c.update(1 / 60, 5);
  assert.equal(c.x, 495);
});

test("COIN_VALUE ist positiv", () => {
  assert.ok(COIN_VALUE > 0);
});

test("CoinManager spawnt eine Münz-Reihe nach Ablauf des Cooldowns", () => {
  const m = new CoinManager(CANVAS_W, GROUND_Y, () => 0.1);
  assert.equal(m.coins.length, 0);
  m.update(2.0, 4); // > cooldown (1.8)
  assert.ok(m.coins.length >= 1);
  // alle starten am rechten Rand
  for (const c of m.coins) assert.ok(c.x >= CANVAS_W);
});

test("CoinManager entfernt eingesammelte Münzen", () => {
  const m = new CoinManager(CANVAS_W, GROUND_Y, () => 0.1);
  m.update(2.0, 4);
  m.coins[0].collected = true;
  const before = m.coins.length;
  m.update(0.01, 4);
  assert.equal(m.coins.length, before - 1);
});

test("CoinManager entfernt Münzen, die links aus dem Bild laufen", () => {
  const m = new CoinManager(CANVAS_W, GROUND_Y, () => 0.1);
  m.coins.push(new Coin(-50, 200));
  m.update(0.01, 0);
  assert.equal(m.coins.find((c) => c.x === -50), undefined);
});

test("hoch/tief gespawnte Reihen liegen über dem Boden", () => {
  const high = new CoinManager(CANVAS_W, GROUND_Y, () => 0.1); // < 0.5 -> hoch
  high.update(2.0, 4);
  for (const c of high.coins) assert.ok(c.y < GROUND_Y);
});
