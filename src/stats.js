/**
 * Dauerhafte Spielstatistiken über alle Läufe hinweg (in localStorage gespeichert).
 * Reine Funktionen + ein injizierbares Storage-Objekt machen alles testbar.
 * Unterstützt Mode-Separation: casual (normal) vs hardcore (schwer, keine Power-Ups).
 */
const STATS_KEY = "kvd_stats";
const STATS_HARDCORE_KEY = "kvd_stats_hardcore";

function emptyStats() {
  return {
    runs: 0,
    totalDistance: 0,
    totalKills: 0,
    totalCoins: 0,
    bossesDefeated: 0,
    bestCombo: 0,
    bestDistance: 0,
  };
}

function validateStats(data) {
  if (!data || typeof data !== "object") return emptyStats();
  const valid = { ...emptyStats() };
  for (const key of Object.keys(valid)) {
    const val = data[key];
    if (typeof val === "number" && Number.isFinite(val) && val >= 0) {
      valid[key] = val;
    }
  }
  return valid;
}

function loadStats(storage, hardcore = false) {
  try {
    if (!storage) return emptyStats();
    const key = hardcore ? STATS_HARDCORE_KEY : STATS_KEY;
    const raw = storage.getItem(key);
    if (!raw) return emptyStats();
    const parsed = JSON.parse(raw);
    return validateStats(parsed); // validieren vor Rückgabe
  } catch (e) {
    return emptyStats();
  }
}

function saveStats(storage, stats, hardcore = false) {
  try {
    if (storage) {
      const key = hardcore ? STATS_HARDCORE_KEY : STATS_KEY;
      storage.setItem(key, JSON.stringify(stats));
    }
  } catch (e) {
    /* nicht spielkritisch */
  }
  return stats;
}

/**
 * Verrechnet das Ergebnis eines Laufs mit den Gesamtstatistiken und gibt die neuen
 * Werte zurück (ohne das Original zu verändern).
 * run = { distance, kills, coins, bosses, maxCombo }
 */
function mergeRun(stats, run) {
  return {
    runs: stats.runs + 1,
    totalDistance: stats.totalDistance + Math.floor(run.distance || 0),
    totalKills: stats.totalKills + (run.kills || 0),
    totalCoins: stats.totalCoins + (run.coins || 0),
    bossesDefeated: stats.bossesDefeated + (run.bosses || 0),
    bestCombo: Math.max(stats.bestCombo, run.maxCombo || 0),
    bestDistance: Math.max(stats.bestDistance, Math.floor(run.distance || 0)),
  };
}

if (typeof window !== "undefined") {
  window.STATS_KEY = STATS_KEY;
  window.STATS_HARDCORE_KEY = STATS_HARDCORE_KEY;
  window.emptyStats = emptyStats;
  window.validateStats = validateStats;
  window.loadStats = loadStats;
  window.saveStats = saveStats;
  window.mergeRun = mergeRun;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = { STATS_KEY, STATS_HARDCORE_KEY, emptyStats, validateStats, loadStats, saveStats, mergeRun };
}
