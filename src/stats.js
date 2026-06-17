/**
 * Dauerhafte Spielstatistiken über alle Läufe hinweg (in localStorage gespeichert).
 * Reine Funktionen + ein injizierbares Storage-Objekt machen alles testbar.
 */
const STATS_KEY = "kvd_stats";

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

function loadStats(storage) {
  try {
    if (!storage) return emptyStats();
    const raw = storage.getItem(STATS_KEY);
    if (!raw) return emptyStats();
    const parsed = JSON.parse(raw);
    return { ...emptyStats(), ...parsed }; // fehlende Felder ergänzen
  } catch (e) {
    return emptyStats();
  }
}

function saveStats(storage, stats) {
  try {
    if (storage) storage.setItem(STATS_KEY, JSON.stringify(stats));
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
  window.emptyStats = emptyStats;
  window.loadStats = loadStats;
  window.saveStats = saveStats;
  window.mergeRun = mergeRun;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = { STATS_KEY, emptyStats, loadStats, saveStats, mergeRun };
}
