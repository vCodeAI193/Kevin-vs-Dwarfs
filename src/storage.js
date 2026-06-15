/**
 * Highscore-Persistenz. Nimmt ein Storage-Objekt (z. B. window.localStorage) entgegen,
 * damit es in Tests mit einem einfachen Mock geprüft werden kann. Fällt bei Fehlern
 * (z. B. privater Modus) lautlos auf neutrale Werte zurück.
 */
const HIGHSCORE_KEY = "kvd_highscore";

function loadHighscore(storage) {
  try {
    if (!storage) return 0;
    const raw = storage.getItem(HIGHSCORE_KEY);
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch (e) {
    return 0;
  }
}

/**
 * Speichert score, falls er den bisherigen Highscore übertrifft.
 * Gibt den aktuellen (ggf. neuen) Highscore zurück.
 */
function saveHighscore(storage, score) {
  const best = loadHighscore(storage);
  if (score <= best) return best;
  try {
    if (storage) storage.setItem(HIGHSCORE_KEY, String(score));
  } catch (e) {
    /* ignorieren – Highscore ist nicht spielkritisch */
  }
  return score;
}

if (typeof window !== "undefined") {
  window.loadHighscore = loadHighscore;
  window.saveHighscore = saveHighscore;
  window.HIGHSCORE_KEY = HIGHSCORE_KEY;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = { loadHighscore, saveHighscore, HIGHSCORE_KEY };
}
