const { test } = require("node:test");
const assert = require("node:assert/strict");
const { CONFIG } = require("../src/config.js");
const { COIN_VALUE, COIN_POWER } = require("../src/collectibles.js");
const { COMBO_WINDOW, COMBO_MAX_MULTIPLIER } = require("../src/combo.js");
const { BIOME_LENGTH } = require("../src/biomes.js");

test("CONFIG enthält die erwarteten Bereiche", () => {
  for (const key of ["GROUND_Y", "world", "boss", "spawn", "powerUp", "combo", "coin", "biomeLength"]) {
    assert.ok(key in CONFIG, `CONFIG fehlt: ${key}`);
  }
});

test("Module lesen ihre Konstanten aus CONFIG (eine Quelle der Wahrheit)", () => {
  assert.equal(COIN_VALUE, CONFIG.coin.value);
  assert.equal(COIN_POWER, CONFIG.coin.power);
  assert.equal(COMBO_WINDOW, CONFIG.combo.window);
  assert.equal(COMBO_MAX_MULTIPLIER, CONFIG.combo.maxMultiplier);
  assert.equal(BIOME_LENGTH, CONFIG.biomeLength);
});

test("Spawn-Cooldowns sind positiv", () => {
  for (const k of Object.keys(CONFIG.spawn)) {
    assert.ok(CONFIG.spawn[k] > 0, `${k} sollte > 0 sein`);
  }
});
