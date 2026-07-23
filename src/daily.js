/**
 * Tägliche Challenge: ein deterministischer Zufallsgenerator (mulberry32) plus ein
 * Tages-Seed. Damit erzeugt das Spiel für alle am selben Tag denselben Parcours.
 * Außerdem: Speicherung der Tages-Bestmarke pro Seed.
 */

/** Deterministischer PRNG. Gleicher Seed -> gleiche Zahlenfolge in [0, 1). */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Seed aus einem Datum (UTC) als Ganzzahl JJJJMMTT. */
function dailySeedFromDate(date) {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate();
  return y * 10000 + m * 100 + d;
}

function todaySeed() {
  return dailySeedFromDate(new Date());
}

function dailyKey(seed) {
  return "kvd_daily_" + seed;
}

function loadDailyBest(storage, seed) {
  try {
    if (!storage) return 0;
    const n = Number(storage.getItem(dailyKey(seed)));
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch (e) {
    return 0;
  }
}

/** Speichert score als neue Tages-Bestmarke, falls höher. Gibt die Bestmarke zurück. */
function saveDailyBest(storage, seed, score) {
  const best = loadDailyBest(storage, seed);
  if (score <= best) return best;
  try {
    if (storage) storage.setItem(dailyKey(seed), String(score));
  } catch (e) {
    /* nicht spielkritisch */
  }
  return score;
}

if (typeof window !== "undefined") {
  window.mulberry32 = mulberry32;
  window.dailySeedFromDate = dailySeedFromDate;
  window.todaySeed = todaySeed;
  window.loadDailyBest = loadDailyBest;
  window.saveDailyBest = saveDailyBest;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    mulberry32, dailySeedFromDate, todaySeed, loadDailyBest, saveDailyBest,
  };
}
