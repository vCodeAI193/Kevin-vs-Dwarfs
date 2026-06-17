const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  SKINS,
  getSkinById,
  unlockedSkins,
  isSkinUnlocked,
  nextUnlockedSkin,
  loadSkinId,
  saveSkinId,
} = require("../src/skins.js");

function mockStorage(initial = {}) {
  const map = { ...initial };
  return {
    getItem: (k) => (k in map ? map[k] : null),
    setItem: (k, v) => {
      map[k] = String(v);
    },
  };
}

test("der erste Skin ist gratis (unlock 0)", () => {
  assert.equal(SKINS[0].unlock, 0);
  assert.equal(isSkinUnlocked(SKINS[0].id, 0), true);
});

test("getSkinById fällt bei Unbekanntem auf den ersten Skin zurück", () => {
  assert.equal(getSkinById("gibtsnicht"), SKINS[0]);
});

test("unlockedSkins wächst mit dem Highscore", () => {
  const none = unlockedSkins(0).length;
  const more = unlockedSkins(100000).length;
  assert.equal(none, 1); // nur der Gratis-Skin
  assert.equal(more, SKINS.length); // alle
});

test("nextUnlockedSkin schaltet nur durch Freigeschaltetes und kreist", () => {
  // Bei Highscore 0 ist nur der erste Skin frei -> bleibt beim ersten
  const next0 = nextUnlockedSkin(SKINS[0].id, 0);
  assert.equal(next0.id, SKINS[0].id);

  // Mit genug Score sind mehrere frei -> es geht zum nächsten
  const big = 100000;
  const next = nextUnlockedSkin(SKINS[0].id, big);
  assert.equal(next.id, SKINS[1].id);
});

test("loadSkinId/saveSkinId persistieren über das Storage", () => {
  const s = mockStorage();
  assert.equal(loadSkinId(s), SKINS[0].id); // Default
  saveSkinId(s, "lava");
  assert.equal(loadSkinId(s), "lava");
});

test("loadSkinId ist robust ohne Storage", () => {
  assert.equal(loadSkinId(null), SKINS[0].id);
});
