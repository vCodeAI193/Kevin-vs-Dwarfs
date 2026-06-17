const { test } = require("node:test");
const assert = require("node:assert/strict");
const { BIOMES, BIOME_LENGTH, getBiome, getBiomeIndex } = require("../src/biomes.js");

test("Start (Distanz 0) liefert das erste Biom", () => {
  assert.equal(getBiomeIndex(0), 0);
  assert.equal(getBiome(0), BIOMES[0]);
});

test("Biom wechselt an der Längen-Grenze", () => {
  assert.equal(getBiomeIndex(BIOME_LENGTH - 1), 0);
  assert.equal(getBiomeIndex(BIOME_LENGTH), 1);
});

test("Biome wiederholen sich in einer Schleife", () => {
  const oneLoop = BIOME_LENGTH * BIOMES.length;
  assert.equal(getBiomeIndex(oneLoop), 0);
  assert.equal(getBiomeIndex(oneLoop + BIOME_LENGTH), 1);
});

test("negative/ungültige Distanz fällt auf das erste Biom zurück", () => {
  assert.equal(getBiomeIndex(-500), 0);
});

test("jedes Biom hat alle Farb-Felder", () => {
  for (const b of BIOMES) {
    for (const key of ["name", "sky", "hill", "ground", "grass"]) {
      assert.ok(b[key], `Biom ${b.name} fehlt Feld ${key}`);
    }
  }
});
