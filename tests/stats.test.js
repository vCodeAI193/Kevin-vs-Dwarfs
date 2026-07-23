const { test } = require("node:test");
const assert = require("node:assert/strict");
const { emptyStats, loadStats, saveStats, mergeRun } = require("../src/stats.js");

function mockStorage(initial = {}) {
  const map = { ...initial };
  return {
    getItem: (k) => (k in map ? map[k] : null),
    setItem: (k, v) => {
      map[k] = String(v);
    },
  };
}

test("emptyStats hat alle Felder auf 0", () => {
  const s = emptyStats();
  for (const k of ["runs", "totalDistance", "totalKills", "totalCoins", "bossesDefeated", "bestCombo", "bestDistance"]) {
    assert.equal(s[k], 0);
  }
});

test("loadStats liefert leere Statistiken ohne Storage", () => {
  assert.deepEqual(loadStats(null), emptyStats());
});

test("mergeRun summiert und bildet Maxima", () => {
  let s = emptyStats();
  s = mergeRun(s, { distance: 1200.7, kills: 5, coins: 10, bosses: 1, maxCombo: 3 });
  assert.equal(s.runs, 1);
  assert.equal(s.totalDistance, 1200); // abgerundet
  assert.equal(s.totalKills, 5);
  assert.equal(s.bossesDefeated, 1);
  assert.equal(s.bestCombo, 3);
  assert.equal(s.bestDistance, 1200);

  s = mergeRun(s, { distance: 800, kills: 2, coins: 4, bosses: 0, maxCombo: 6 });
  assert.equal(s.runs, 2);
  assert.equal(s.totalKills, 7);
  assert.equal(s.bestCombo, 6); // Maximum
  assert.equal(s.bestDistance, 1200); // bleibt das höhere
});

test("mergeRun verändert das Original nicht", () => {
  const s = emptyStats();
  mergeRun(s, { distance: 500, kills: 1 });
  assert.equal(s.runs, 0);
});

test("save + load macht einen Roundtrip", () => {
  const store = mockStorage();
  let s = mergeRun(emptyStats(), { distance: 300, kills: 4, coins: 2, bosses: 0, maxCombo: 2 });
  saveStats(store, s);
  const loaded = loadStats(store);
  assert.deepEqual(loaded, s);
});

test("loadStats ergänzt fehlende Felder aus alten Daten", () => {
  const store = mockStorage({ kvd_stats: JSON.stringify({ runs: 3, totalKills: 9 }) });
  const s = loadStats(store);
  assert.equal(s.runs, 3);
  assert.equal(s.totalKills, 9);
  assert.equal(s.bestDistance, 0); // ergänzt
});
