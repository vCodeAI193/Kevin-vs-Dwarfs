const { test } = require("node:test");
const assert = require("node:assert/strict");
const { Player } = require("../src/player.js");

const GROUND_Y = 330;

function freshPlayer() {
  return new Player(GROUND_Y);
}

test("Player startet am Boden mit leerer Power-Leiste", () => {
  const p = freshPlayer();
  assert.equal(p.onGround, true);
  assert.equal(p.power, 0);
  assert.equal(p.y, GROUND_Y - p.height);
  assert.equal(p.whirlActive, false);
});

test("jump() gibt nur vom Boden aus Schub", () => {
  const p = freshPlayer();
  p.jump();
  assert.equal(p.onGround, false);
  assert.equal(p.vy, -p.jumpForce);

  // In der Luft kein zweiter Sprung
  p.vy = 5;
  p.jump();
  assert.equal(p.vy, 5);
});

test("update() wendet Schwerkraft an und landet am Boden", () => {
  const p = freshPlayer();
  p.jump();
  // Genug Frames simulieren, bis Kevin wieder landet
  for (let i = 0; i < 200 && !p.onGround; i++) p.update(1 / 60);
  assert.equal(p.onGround, true);
  assert.equal(p.vy, 0);
  assert.equal(p.y, GROUND_Y - p.height);
});

test("addKillPower() erhöht und deckelt bei powerMax", () => {
  const p = freshPlayer();
  p.addKillPower();
  assert.equal(p.power, p.powerPerKill);
  for (let i = 0; i < 20; i++) p.addKillPower();
  assert.equal(p.power, p.powerMax);
  assert.equal(p.powerFull, true);
});

test("triggerWhirlwind() nur bei voller Leiste, verbraucht Power", () => {
  const p = freshPlayer();
  assert.equal(p.triggerWhirlwind(), false); // Leiste leer

  while (!p.powerFull) p.addKillPower();
  assert.equal(p.triggerWhirlwind(), true);
  assert.equal(p.power, 0);
  assert.equal(p.whirlActive, true);
});

test("Wirbelsturm-Animation läuft nach whirlVisualTime ab", () => {
  const p = freshPlayer();
  while (!p.powerFull) p.addKillPower();
  p.triggerWhirlwind();
  // Mehr als whirlVisualTime simulieren
  const steps = Math.ceil(p.whirlVisualTime / (1 / 60)) + 5;
  for (let i = 0; i < steps; i++) p.update(1 / 60);
  assert.equal(p.whirlActive, false);
});

test("reset() setzt Power und Position zurück", () => {
  const p = freshPlayer();
  p.jump();
  p.addKillPower();
  p.reset();
  assert.equal(p.power, 0);
  assert.equal(p.onGround, true);
  assert.equal(p.vy, 0);
});
