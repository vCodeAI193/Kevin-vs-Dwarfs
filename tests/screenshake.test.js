const { test } = require("node:test");
const assert = require("node:assert/strict");
const { ScreenShake } = require("../src/screenshake.js");
const { CONFIG } = require("../src/config.js");

test("frischer Shake hat kein Trauma und keinen Versatz", () => {
  const s = new ScreenShake();
  assert.equal(s.trauma, 0);
  assert.deepEqual(s.getOffset(), { x: 0, y: 0 });
});

test("add() erhöht Trauma, gedeckelt bei 1", () => {
  const s = new ScreenShake();
  s.add(0.3);
  assert.ok(Math.abs(s.trauma - 0.3) < 1e-9);
  s.add(5);
  assert.equal(s.trauma, 1);
});

test("update() klingt das Trauma ab und erreicht 0", () => {
  const s = new ScreenShake();
  s.add(1);
  for (let i = 0; i < 200 && s.trauma > 0; i++) s.update(1 / 60);
  assert.equal(s.trauma, 0);
  assert.deepEqual(s.getOffset(), { x: 0, y: 0 });
});

test("Versatz bleibt innerhalb maxOffset", () => {
  const s = new ScreenShake();
  s.add(1);
  let maxSeen = 0;
  for (let i = 0; i < 60; i++) {
    s.update(1 / 600); // wenig abklingen lassen
    const o = s.getOffset();
    maxSeen = Math.max(maxSeen, Math.abs(o.x), Math.abs(o.y));
  }
  assert.ok(maxSeen <= CONFIG.shake.maxOffset + 1e-9);
});

test("reset() setzt das Trauma zurück", () => {
  const s = new ScreenShake();
  s.add(1);
  s.reset();
  assert.equal(s.trauma, 0);
});
