const { test } = require("node:test");
const assert = require("node:assert/strict");
const { Dwarf, EnemyManager } = require("../src/enemies.js");

const GROUND_Y = 330;
const CANVAS_W = 800;

test("Dwarf steht auf dem Boden und ist anfangs nicht betäubt", () => {
  const d = new Dwarf(500, GROUND_Y);
  assert.equal(d.y, GROUND_Y - d.height);
  assert.equal(d.alive, true);
  assert.equal(d.stunned, false);
});

test("Dwarf.update() bewegt sich mit der Weltgeschwindigkeit nach links", () => {
  const d = new Dwarf(500, GROUND_Y);
  d.update(1 / 60, 5);
  assert.equal(d.x, 495);
});

test("stun() betäubt und läuft über die Zeit ab", () => {
  const d = new Dwarf(500, GROUND_Y);
  d.stun(3);
  assert.equal(d.stunned, true);
  // 3 Sekunden in 60er-Schritten vergehen lassen
  for (let i = 0; i < 60 * 3 + 2; i++) d.update(1 / 60, 0);
  assert.equal(d.stunned, false);
});

test("stun() nimmt die längere verbleibende Dauer (kein Verkürzen)", () => {
  const d = new Dwarf(500, GROUND_Y);
  d.stun(3);
  d.stun(1); // kürzer -> ignoriert
  assert.ok(d.stunTimer > 1);
});

test("EnemyManager spawnt nach Ablauf des Intervalls einen Zwerg", () => {
  const m = new EnemyManager(CANVAS_W, GROUND_Y);
  assert.equal(m.dwarves.length, 0);
  m.update(2.0, 4, 0); // > Standard-Intervall (1.2s)
  assert.equal(m.dwarves.length, 1);
  // Spawn am rechten Rand
  assert.ok(m.dwarves[0].x >= CANVAS_W);
});

test("höhere Schwierigkeit verkürzt das Spawn-Intervall", () => {
  const easy = new EnemyManager(CANVAS_W, GROUND_Y);
  easy.update(0.6, 4, 0); // bei difficulty 0 ist Intervall 1.2 -> kein Spawn
  assert.equal(easy.dwarves.length, 0);

  const hard = new EnemyManager(CANVAS_W, GROUND_Y);
  hard.update(0.6, 4, 100); // hohe Schwierigkeit -> Intervall am Minimum (0.55)
  assert.equal(hard.dwarves.length, 1);
});

test("EnemyManager entfernt Zwerge, die links aus dem Bild laufen", () => {
  const m = new EnemyManager(CANVAS_W, GROUND_Y);
  m.dwarves.push(new Dwarf(-50, GROUND_Y));
  m.update(0.01, 0, 0); // kleines dt -> kein neuer Spawn
  assert.equal(m.dwarves.length, 0);
});

test("EnemyManager entfernt besiegte (tote) Zwerge", () => {
  const m = new EnemyManager(CANVAS_W, GROUND_Y);
  const d = new Dwarf(400, GROUND_Y);
  d.alive = false;
  m.dwarves.push(d);
  m.update(0.01, 4, 0);
  assert.equal(m.dwarves.length, 0);
});

test("reset() leert alle Zwerge", () => {
  const m = new EnemyManager(CANVAS_W, GROUND_Y);
  m.update(2.0, 4, 0);
  m.reset();
  assert.equal(m.dwarves.length, 0);
});
