const { test } = require("node:test");
const assert = require("node:assert/strict");
const { computeScore, KILL_POINTS } = require("../src/score.js");
const { CONFIG } = require("../src/config.js");

test("leerer Lauf ergibt 0", () => {
  assert.equal(computeScore({}), 0);
});

test("Distanz wird abgerundet", () => {
  assert.equal(computeScore({ distance: 123.9 }), 123);
});

test("Kills zählen mit KILL_POINTS", () => {
  assert.equal(computeScore({ kills: 3 }), 3 * KILL_POINTS);
});

test("Münzen zählen mit dem Münzwert aus CONFIG", () => {
  assert.equal(computeScore({ coins: 4 }), 4 * CONFIG.coin.value);
});

test("alle Bestandteile summieren sich", () => {
  const s = { distance: 1000, kills: 2, coins: 3, bossBonus: 500, comboBonus: 150 };
  const expected =
    1000 + 2 * KILL_POINTS + 3 * CONFIG.coin.value + 500 + 150;
  assert.equal(computeScore(s), expected);
});
