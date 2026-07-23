const { test } = require("node:test");
const assert = require("node:assert/strict");
const { loadHighscore, saveHighscore } = require("../src/storage.js");

// Einfacher In-Memory-Mock für localStorage
function mockStorage(initial = {}) {
  const map = { ...initial };
  return {
    getItem: (k) => (k in map ? map[k] : null),
    setItem: (k, v) => {
      map[k] = String(v);
    },
  };
}

test("loadHighscore liefert 0 ohne gespeicherten Wert", () => {
  assert.equal(loadHighscore(mockStorage()), 0);
});

test("loadHighscore liefert 0 bei fehlendem Storage", () => {
  assert.equal(loadHighscore(null), 0);
});

test("saveHighscore speichert einen neuen Rekord", () => {
  const s = mockStorage();
  assert.equal(saveHighscore(s, 100), 100);
  assert.equal(loadHighscore(s), 100);
});

test("saveHighscore behält den höheren Wert", () => {
  const s = mockStorage();
  saveHighscore(s, 200);
  const best = saveHighscore(s, 50); // niedriger -> ignoriert
  assert.equal(best, 200);
  assert.equal(loadHighscore(s), 200);
});

test("saveHighscore stürzt bei kaputtem Storage nicht ab", () => {
  const broken = {
    getItem: () => {
      throw new Error("nope");
    },
    setItem: () => {
      throw new Error("nope");
    },
  };
  // Soll nicht werfen und den Score zurückgeben
  assert.equal(saveHighscore(broken, 42), 42);
});
