/**
 * Skins für Kevin. Jeder Skin verändert seine Farben und wird ab einem bestimmten
 * Highscore freigeschaltet. Der gewählte Skin wird (wie der Highscore) persistiert.
 */
const SKINS = [
  { id: "classic", name: "Klassisch", body: "#2e7d32", head: "#ffcc99", unlock: 0 },
  { id: "ice", name: "Frost", body: "#3aa0d0", head: "#dff1ff", unlock: 1000 },
  { id: "lava", name: "Magma", body: "#c0392b", head: "#ffd1a0", unlock: 3000 },
  { id: "gold", name: "Gold", body: "#e0a92a", head: "#fff0c0", unlock: 6000 },
  { id: "shadow", name: "Schatten", body: "#2c2a3a", head: "#8a86a0", unlock: 10000 },
];

const SKIN_KEY = "kvd_skin";

function getSkinById(id) {
  return SKINS.find((s) => s.id === id) || SKINS[0];
}

/** Alle Skins, die bei gegebenem Highscore freigeschaltet sind. */
function unlockedSkins(bestScore) {
  return SKINS.filter((s) => bestScore >= s.unlock);
}

function isSkinUnlocked(id, bestScore) {
  const s = getSkinById(id);
  return bestScore >= s.unlock;
}

/** Nächster freigeschalteter Skin nach dem aktuellen (für das Durchschalten). */
function nextUnlockedSkin(currentId, bestScore) {
  const unlocked = unlockedSkins(bestScore);
  if (unlocked.length === 0) return SKINS[0];
  const idx = unlocked.findIndex((s) => s.id === currentId);
  return unlocked[(idx + 1) % unlocked.length];
}

function loadSkinId(storage) {
  try {
    if (!storage) return SKINS[0].id;
    return storage.getItem(SKIN_KEY) || SKINS[0].id;
  } catch (e) {
    return SKINS[0].id;
  }
}

function saveSkinId(storage, id) {
  try {
    if (storage) storage.setItem(SKIN_KEY, id);
  } catch (e) {
    /* nicht spielkritisch */
  }
}

if (typeof window !== "undefined") {
  window.SKINS = SKINS;
  window.SKIN_KEY = SKIN_KEY;
  window.getSkinById = getSkinById;
  window.unlockedSkins = unlockedSkins;
  window.isSkinUnlocked = isSkinUnlocked;
  window.nextUnlockedSkin = nextUnlockedSkin;
  window.loadSkinId = loadSkinId;
  window.saveSkinId = saveSkinId;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    SKINS, SKIN_KEY, getSkinById, unlockedSkins, isSkinUnlocked,
    nextUnlockedSkin, loadSkinId, saveSkinId,
  };
}
