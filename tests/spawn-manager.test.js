const { test } = require("node:test");
const assert = require("node:assert/strict");
const { SpawnManager } = require("../src/spawn-manager.js");

// Minimal-Objekt, das die von SpawnManager erwartete Schnittstelle erfüllt
class FakeItem {
  constructor(x) {
    this.x = x;
    this.width = 10;
    this.alive = true;
  }
  update(dt, worldSpeed) {
    this.x -= worldSpeed;
  }
  draw() {}
}

// Test-Subklasse: spawnt ein FakeItem am rechten Rand, behält lebende im Bild
class FakeManager extends SpawnManager {
  reset() {
    super.reset();
    this.cooldown = 1.0;
  }
  spawn() {
    this.items.push(new FakeItem(this.canvasWidth + 10));
  }
  keep(it) {
    return it.alive && it.x + it.width > -10;
  }
}

test("spawnt nach Ablauf des Intervalls und setzt den Timer zurück", () => {
  const m = new FakeManager(800, 330);
  m.update(0.5, 0, 0);
  assert.equal(m.items.length, 0); // noch nicht
  m.update(0.6, 0, 0); // jetzt > cooldown
  assert.equal(m.items.length, 1);
  assert.ok(m.items[0].x >= 800);
});

test("bewegt Objekte mit der Weltgeschwindigkeit", () => {
  const m = new FakeManager(800, 330);
  m.update(1.0, 0, 0); // spawnt eins
  const x0 = m.items[0].x;
  m.update(0.01, 5, 0);
  assert.equal(m.items[0].x, x0 - 5);
});

test("entfernt Objekte, die keep() nicht mehr erfüllen", () => {
  const m = new FakeManager(800, 330);
  m.items.push(new FakeItem(-50)); // schon aus dem Bild
  m.update(0.01, 0, 0);
  assert.equal(m.items.find((it) => it.x === -50), undefined);
});

test("interval() ist standardmäßig der cooldown", () => {
  const m = new FakeManager(800, 330);
  assert.equal(m.interval(0), 1.0);
});

test("reset() leert die Objektliste", () => {
  const m = new FakeManager(800, 330);
  m.update(1.0, 0, 0);
  m.reset();
  assert.equal(m.items.length, 0);
});
