const { test } = require("node:test");
const assert = require("node:assert/strict");
const { Obstacle, ObstacleManager } = require("../src/obstacles.js");

const GROUND_Y = 330;
const CANVAS_W = 800;

test("Obstacle steht auf dem Boden", () => {
  const o = new Obstacle(500, GROUND_Y);
  assert.equal(o.y, GROUND_Y - o.height);
});

test("Obstacle bewegt sich mit der Weltgeschwindigkeit nach links", () => {
  const o = new Obstacle(500, GROUND_Y);
  o.update(1 / 60, 6);
  assert.equal(o.x, 494);
});

test("ObstacleManager spawnt nach Ablauf des Intervalls", () => {
  const m = new ObstacleManager(CANVAS_W, GROUND_Y);
  m.update(3.0, 4, 0); // > cooldown (2.6)
  assert.equal(m.obstacles.length, 1);
  assert.ok(m.obstacles[0].x >= CANVAS_W);
});

test("höhere Schwierigkeit verkürzt das Intervall (mit Minimum)", () => {
  const easy = new ObstacleManager(CANVAS_W, GROUND_Y);
  easy.update(1.3, 4, 0); // Intervall 2.6 -> kein Spawn
  assert.equal(easy.obstacles.length, 0);

  const hard = new ObstacleManager(CANVAS_W, GROUND_Y);
  hard.update(1.3, 4, 100); // Intervall am Minimum (1.2) -> Spawn
  assert.equal(hard.obstacles.length, 1);
});

test("ObstacleManager entfernt Hindernisse, die links aus dem Bild laufen", () => {
  const m = new ObstacleManager(CANVAS_W, GROUND_Y);
  m.obstacles.push(new Obstacle(-50, GROUND_Y));
  m.update(0.01, 0, 0);
  assert.equal(m.obstacles.length, 0);
});
