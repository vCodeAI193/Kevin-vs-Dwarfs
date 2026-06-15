/**
 * Kollisions-Hilfsfunktionen. Getrennt von game.js, damit sie ohne Browser/Canvas
 * mit Unit-Tests geprüft werden können.
 */

/** Achsen-ausgerichteter Rechteck-Überlapp (AABB). a, b: {x, y, width, height}. */
function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

/**
 * Erkennt, ob der Spieler den Zwerg von oben "stompt": Er muss fallen (vy > 0) und im
 * vorherigen Frame mit den Füßen noch über der oberen Hälfte des Zwergs gewesen sein.
 */
function isStomp(player, dwarf) {
  if (player.vy <= 0) return false;
  const prevBottom = player.y + player.height - player.vy;
  return prevBottom <= dwarf.y + dwarf.height * 0.5;
}

if (typeof window !== "undefined") {
  window.rectsOverlap = rectsOverlap;
  window.isStomp = isStomp;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = { rectsOverlap, isStomp };
}
