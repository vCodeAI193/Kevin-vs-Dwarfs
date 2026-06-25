/**
 * Biome bestimmen die Farben von Himmel, Hügeln und Boden. Sie wechseln mit der
 * zurückgelegten Distanz und wiederholen sich danach in einer Schleife – so fühlt
 * sich der endlose Lauf abwechslungsreich an.
 */
// CONFIG im Browser global, in Node via require
const CONFIG =
  typeof require !== "undefined" ? require("./config.js").CONFIG
  : typeof window !== "undefined" ? window.CONFIG
  : {};

const BIOME_LENGTH = CONFIG.biomeLength; // Distanz pro Biom

const BIOMES = [
  { name: "Wiese", sky: "#87b7e8", hill: "#6fae6f", ground: "#5a3a1a", grass: "#3f7d3f" },
  { name: "Höhle", sky: "#2c2a3a", hill: "#3b3550", ground: "#241c14", grass: "#4a3a2a" },
  { name: "Lava", sky: "#3a1410", hill: "#7a2418", ground: "#2a0f0a", grass: "#c0392b" },
  { name: "Eis", sky: "#cfe8ff", hill: "#a9cfe6", ground: "#4a5a6a", grass: "#dff1ff" },
];

/** Liefert das Biom für eine Distanz (mit Schleife über alle Biome). */
function getBiome(distance) {
  const idx = Math.floor(Math.max(0, distance) / BIOME_LENGTH) % BIOMES.length;
  return BIOMES[idx];
}

/** Index des aktuellen Bioms (für Vergleiche/Übergänge). */
function getBiomeIndex(distance) {
  return Math.floor(Math.max(0, distance) / BIOME_LENGTH) % BIOMES.length;
}

if (typeof window !== "undefined") {
  window.BIOMES = BIOMES;
  window.BIOME_LENGTH = BIOME_LENGTH;
  window.getBiome = getBiome;
  window.getBiomeIndex = getBiomeIndex;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = { BIOMES, BIOME_LENGTH, getBiome, getBiomeIndex };
}
