const { test } = require("node:test");
const assert = require("node:assert/strict");
const { Particle, ParticleSystem } = require("../src/particles.js");

test("Particle bewegt sich und altert", () => {
  const p = new Particle(0, 0, 100, 0, 0.5, "#fff", 4);
  p.update(0.1);
  assert.ok(p.x > 0); // nach rechts bewegt
  assert.ok(p.life < 0.5); // Lebenszeit gesunken
});

test("Particle ist tot, wenn die Lebenszeit aufgebraucht ist", () => {
  const p = new Particle(0, 0, 0, 0, 0.05, "#fff", 4);
  assert.equal(p.dead, false);
  p.update(0.1);
  assert.equal(p.dead, true);
});

test("emit() fügt die gewünschte Anzahl Partikel hinzu", () => {
  const sys = new ParticleSystem(() => 0.5);
  sys.emit(10, 10, 15);
  assert.equal(sys.particles.length, 15);
});

test("update() entfernt tote Partikel", () => {
  const sys = new ParticleSystem(() => 0.5);
  sys.emit(0, 0, 5, { life: 0.05 });
  sys.update(0.1); // alle überschreiten ihre Lebenszeit
  assert.equal(sys.particles.length, 0);
});

test("reset() leert alle Partikel", () => {
  const sys = new ParticleSystem(() => 0.5);
  sys.emit(0, 0, 10);
  sys.reset();
  assert.equal(sys.particles.length, 0);
});
