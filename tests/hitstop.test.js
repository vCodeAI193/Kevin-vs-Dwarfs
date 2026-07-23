const { test } = require("node:test");
const assert = require("node:assert/strict");
const { HitStop } = require("../src/hitstop.js");

test("frischer HitStop ist inaktiv", () => {
  const h = new HitStop();
  assert.equal(h.active, false);
});

test("trigger aktiviert den HitStop", () => {
  const h = new HitStop();
  h.trigger(0.05);
  assert.equal(h.active, true);
});

test("trigger nimmt die längere Dauer (kein Verkürzen)", () => {
  const h = new HitStop();
  h.trigger(0.05);
  h.trigger(0.02); // kürzer -> ignoriert
  assert.ok(h.timer >= 0.05 - 1e-9);
});

test("update zählt herunter und endet sauber bei 0", () => {
  const h = new HitStop();
  h.trigger(0.05);
  // mehrere Frames vergehen lassen
  for (let i = 0; i < 5; i++) h.update(1 / 60);
  assert.equal(h.active, false);
  assert.equal(h.timer, 0);
});

test("update gibt zurück, ob noch eingefroren wird", () => {
  const h = new HitStop();
  h.trigger(0.05);
  assert.equal(h.update(0.01), true); // noch aktiv
  assert.equal(h.update(1), false); // jetzt vorbei
});

test("reset beendet den HitStop", () => {
  const h = new HitStop();
  h.trigger(0.1);
  h.reset();
  assert.equal(h.active, false);
});
