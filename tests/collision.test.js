const { test } = require("node:test");
const assert = require("node:assert/strict");
const { rectsOverlap, isStomp } = require("../src/collision.js");

test("rectsOverlap erkennt überlappende Rechtecke", () => {
  const a = { x: 0, y: 0, width: 10, height: 10 };
  const b = { x: 5, y: 5, width: 10, height: 10 };
  assert.equal(rectsOverlap(a, b), true);
});

test("rectsOverlap erkennt getrennte Rechtecke", () => {
  const a = { x: 0, y: 0, width: 10, height: 10 };
  const b = { x: 20, y: 0, width: 10, height: 10 };
  assert.equal(rectsOverlap(a, b), false);
});

test("rectsOverlap: sich nur berührende Kanten zählen nicht als Überlapp", () => {
  const a = { x: 0, y: 0, width: 10, height: 10 };
  const b = { x: 10, y: 0, width: 10, height: 10 };
  assert.equal(rectsOverlap(a, b), false);
});

test("isStomp: fallender Spieler über dem Zwerg-Kopf stompt", () => {
  const dwarf = { y: 100, height: 40 };
  // Spieler fällt (vy > 0) und war im Vorframe mit den Füßen über der oberen Hälfte
  const player = { y: 70, height: 20, vy: 12 }; // bottom=90, prevBottom=78 <= 100+20=120
  assert.equal(isStomp(player, dwarf), true);
});

test("isStomp: seitlicher Aufprall (kein Fallen) ist kein Stomp", () => {
  const dwarf = { y: 100, height: 40 };
  const player = { y: 100, height: 20, vy: 0 }; // vy <= 0
  assert.equal(isStomp(player, dwarf), false);
});

test("isStomp: aufsteigender Spieler stompt nicht", () => {
  const dwarf = { y: 100, height: 40 };
  const player = { y: 100, height: 20, vy: -10 };
  assert.equal(isStomp(player, dwarf), false);
});
