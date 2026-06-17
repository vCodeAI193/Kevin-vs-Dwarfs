/**
 * Erfolge (Achievements). Jeder Erfolg hat eine reine Bedingung über den
 * Gesamtstatistiken (siehe stats.js). Die freigeschaltete Liste wird persistiert.
 */
const ACHIEVEMENTS = [
  { id: "first_blood", name: "Erster Zwerg", desc: "Besiege deinen ersten Zwerg", test: (s) => s.totalKills >= 1 },
  { id: "centurion", name: "Zwergenschreck", desc: "Besiege 100 Zwerge insgesamt", test: (s) => s.totalKills >= 100 },
  { id: "combo_master", name: "Wirbelwind", desc: "Erreiche eine Combo von 8×", test: (s) => s.bestCombo >= 8 },
  { id: "boss_slayer", name: "Königsmörder", desc: "Besiege 5 Bosse", test: (s) => s.bossesDefeated >= 5 },
  { id: "marathon", name: "Marathon", desc: "Schaffe 5000 Distanz in einem Lauf", test: (s) => s.bestDistance >= 5000 },
  { id: "treasure", name: "Schatzjäger", desc: "Sammle 500 Münzen insgesamt", test: (s) => s.totalCoins >= 500 },
  { id: "veteran", name: "Veteran", desc: "Spiele 50 Läufe", test: (s) => s.runs >= 50 },
];

/** IDs aller Erfolge, deren Bedingung mit den Statistiken erfüllt ist. */
function evaluateAchievements(stats) {
  return ACHIEVEMENTS.filter((a) => a.test(stats)).map((a) => a.id);
}

/** Erfolge, die mit diesen Statistiken NEU erfüllt sind (noch nicht in prevUnlocked). */
function newlyUnlocked(prevUnlocked, stats) {
  const now = evaluateAchievements(stats);
  const prev = prevUnlocked || [];
  return now.filter((id) => !prev.includes(id));
}

function getAchievement(id) {
  return ACHIEVEMENTS.find((a) => a.id === id) || null;
}

const ACHIEVEMENTS_KEY = "kvd_achievements";

function loadUnlocked(storage) {
  try {
    if (!storage) return [];
    const raw = storage.getItem(ACHIEVEMENTS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch (e) {
    return [];
  }
}

function saveUnlocked(storage, ids) {
  try {
    if (storage) storage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(ids));
  } catch (e) {
    /* nicht spielkritisch */
  }
  return ids;
}

if (typeof window !== "undefined") {
  window.ACHIEVEMENTS = ACHIEVEMENTS;
  window.ACHIEVEMENTS_KEY = ACHIEVEMENTS_KEY;
  window.evaluateAchievements = evaluateAchievements;
  window.newlyUnlocked = newlyUnlocked;
  window.getAchievement = getAchievement;
  window.loadUnlocked = loadUnlocked;
  window.saveUnlocked = saveUnlocked;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    ACHIEVEMENTS, ACHIEVEMENTS_KEY, evaluateAchievements, newlyUnlocked,
    getAchievement, loadUnlocked, saveUnlocked,
  };
}
