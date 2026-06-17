const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  ACHIEVEMENTS,
  evaluateAchievements,
  newlyUnlocked,
  getAchievement,
  loadUnlocked,
  saveUnlocked,
} = require("../src/achievements.js");
const { emptyStats } = require("../src/stats.js");

function mockStorage(initial = {}) {
  const map = { ...initial };
  return {
    getItem: (k) => (k in map ? map[k] : null),
    setItem: (k, v) => {
      map[k] = String(v);
    },
  };
}

test("frische Statistiken schalten keinen Erfolg frei", () => {
  assert.deepEqual(evaluateAchievements(emptyStats()), []);
});

test("ein Kill schaltet 'Erster Zwerg' frei", () => {
  const s = { ...emptyStats(), totalKills: 1 };
  assert.ok(evaluateAchievements(s).includes("first_blood"));
});

test("100 Kills schalten zusätzlich 'Zwergenschreck' frei", () => {
  const s = { ...emptyStats(), totalKills: 100 };
  const ids = evaluateAchievements(s);
  assert.ok(ids.includes("first_blood"));
  assert.ok(ids.includes("centurion"));
});

test("Combo 8 schaltet 'Wirbelwind' frei", () => {
  const s = { ...emptyStats(), bestCombo: 8 };
  assert.ok(evaluateAchievements(s).includes("combo_master"));
});

test("newlyUnlocked liefert nur das, was noch nicht bekannt war", () => {
  const s = { ...emptyStats(), totalKills: 1 };
  const fresh = newlyUnlocked([], s);
  assert.deepEqual(fresh, ["first_blood"]);
  const again = newlyUnlocked(["first_blood"], s);
  assert.deepEqual(again, []);
});

test("getAchievement liefert Definition bzw. null", () => {
  assert.equal(getAchievement("first_blood").name, "Erster Zwerg");
  assert.equal(getAchievement("gibtsnicht"), null);
});

test("loadUnlocked/saveUnlocked Roundtrip", () => {
  const store = mockStorage();
  assert.deepEqual(loadUnlocked(store), []);
  saveUnlocked(store, ["first_blood", "treasure"]);
  assert.deepEqual(loadUnlocked(store), ["first_blood", "treasure"]);
});

test("jeder Erfolg hat id, name, desc und test()", () => {
  for (const a of ACHIEVEMENTS) {
    assert.ok(a.id && a.name && a.desc);
    assert.equal(typeof a.test, "function");
  }
});
