const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  mulberry32,
  dailySeedFromDate,
  loadDailyBest,
  saveDailyBest,
} = require("../src/daily.js");

function mockStorage(initial = {}) {
  const map = { ...initial };
  return {
    getItem: (k) => (k in map ? map[k] : null),
    setItem: (k, v) => {
      map[k] = String(v);
    },
  };
}

test("mulberry32 ist deterministisch: gleicher Seed -> gleiche Folge", () => {
  const a = mulberry32(12345);
  const b = mulberry32(12345);
  for (let i = 0; i < 20; i++) assert.equal(a(), b());
});

test("unterschiedliche Seeds liefern unterschiedliche Folgen", () => {
  const a = mulberry32(1);
  const b = mulberry32(2);
  let differs = false;
  for (let i = 0; i < 10; i++) if (a() !== b()) differs = true;
  assert.ok(differs);
});

test("mulberry32 liefert Werte in [0, 1)", () => {
  const r = mulberry32(99);
  for (let i = 0; i < 1000; i++) {
    const v = r();
    assert.ok(v >= 0 && v < 1);
  }
});

test("dailySeedFromDate kodiert JJJJMMTT (UTC)", () => {
  const d = new Date(Date.UTC(2026, 5, 17)); // Monat 5 = Juni
  assert.equal(dailySeedFromDate(d), 20260617);
});

test("derselbe Tag ergibt denselben Seed", () => {
  const a = new Date(Date.UTC(2026, 0, 1, 3, 0, 0));
  const b = new Date(Date.UTC(2026, 0, 1, 22, 30, 0));
  assert.equal(dailySeedFromDate(a), dailySeedFromDate(b));
});

test("Tages-Bestmarke: speichern nur bei Verbesserung", () => {
  const store = mockStorage();
  const seed = 20260617;
  assert.equal(loadDailyBest(store, seed), 0);
  assert.equal(saveDailyBest(store, seed, 500), 500);
  assert.equal(saveDailyBest(store, seed, 300), 500); // schlechter -> bleibt
  assert.equal(loadDailyBest(store, seed), 500);
});

test("Tages-Bestmarken verschiedener Seeds sind getrennt", () => {
  const store = mockStorage();
  saveDailyBest(store, 20260617, 700);
  assert.equal(loadDailyBest(store, 20260618), 0);
});
