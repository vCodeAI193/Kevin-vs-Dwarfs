/**
 * Reine Score-Logik – ohne Spielzustand oder Canvas, daher direkt unit-testbar.
 * Der Gesamt-Score setzt sich aus Distanz, Kills, Münzen, Boss- und Combo-Bonus
 * zusammen.
 */
const KILL_POINTS = 50;

// CONFIG im Browser global, in Node via require (für den Münzwert)
const CONFIG =
  typeof require !== "undefined" ? require("./config.js").CONFIG
  : typeof window !== "undefined" ? window.CONFIG
  : {};

/**
 * Berechnet den Gesamt-Score eines Laufs.
 * @param {{distance:number, kills:number, coins:number, bossBonus:number, comboBonus:number}} s
 */
function computeScore(s) {
  const coinValue = (CONFIG.coin && CONFIG.coin.value) || 0;
  return (
    Math.floor(s.distance || 0) +
    (s.kills || 0) * KILL_POINTS +
    (s.coins || 0) * coinValue +
    (s.bossBonus || 0) +
    (s.comboBonus || 0)
  );
}

if (typeof window !== "undefined") {
  window.computeScore = computeScore;
  window.KILL_POINTS = KILL_POINTS;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = { computeScore, KILL_POINTS };
}
