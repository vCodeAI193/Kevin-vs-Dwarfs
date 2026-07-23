/**
 * Combo-System: Besiegt Kevin mehrere Gegner schnell hintereinander (innerhalb des
 * Zeitfensters), steigt der Combo-Zähler und damit ein Score-Multiplikator. Lässt
 * das Zeitfenster verstreichen, ohne dass etwas besiegt wird, fällt die Combo zurück.
 */
// CONFIG im Browser global, in Node via require
const CONFIG =
  typeof require !== "undefined" ? require("./config.js").CONFIG
  : typeof window !== "undefined" ? window.CONFIG
  : {};

const COMBO_WINDOW = CONFIG.combo.window; // Sekunden bis die Combo verfällt
const COMBO_MAX_MULTIPLIER = CONFIG.combo.maxMultiplier;

class Combo {
  constructor(window = COMBO_WINDOW) {
    this.window = window;
    this.reset();
  }

  reset() {
    this.count = 0;
    this.timer = 0;
  }

  /** Registriert einen Treffer und gibt den aktuellen Multiplikator zurück. */
  add() {
    this.count++;
    this.timer = this.window;
    return this.multiplier;
  }

  /** Multiplikator: 1x bei 0/1 Kills, danach steigend, gedeckelt. */
  get multiplier() {
    if (this.count <= 1) return 1;
    return Math.min(this.count, COMBO_MAX_MULTIPLIER);
  }

  get active() {
    return this.count >= 2;
  }

  update(dt) {
    if (this.timer > 0) {
      this.timer -= dt;
      if (this.timer <= 0) this.reset();
    }
  }
}

if (typeof window !== "undefined") {
  window.Combo = Combo;
  window.COMBO_WINDOW = COMBO_WINDOW;
  window.COMBO_MAX_MULTIPLIER = COMBO_MAX_MULTIPLIER;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = { Combo, COMBO_WINDOW, COMBO_MAX_MULTIPLIER };
}
