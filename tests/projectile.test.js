const { test } = require("node:test");
const assert = require("node:assert/strict");
const { Projectile } = require("../src/projectile.js");

test("Projektil fliegt nach links", () => {
  const p = new Projectile(500, 300, -300);
  p.update(0.1);
  assert.ok(p.x < 500);
});

test("Projektil verschwindet links aus dem Bild", () => {
  const p = new Projectile(0, 300, -300);
  assert.equal(p.alive, true);
  for (let i = 0; i < 10; i++) p.update(0.1);
  assert.equal(p.alive, false);
});

test("Projektil dreht sich (spin steigt)", () => {
  const p = new Projectile(500, 300, -200);
  p.update(0.1);
  assert.ok(p.spin > 0);
});
