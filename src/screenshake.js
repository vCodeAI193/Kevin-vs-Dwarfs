/**
 * Screen-Shake über ein "Trauma"-Modell: Ereignisse erhöhen das Trauma (0..1), das
 * mit der Zeit abklingt. Der Versatz wächst quadratisch mit dem Trauma (fühlt sich
 * natürlicher an) und ist deterministisch (sinus-basiert, kein Zufall) – damit gut
 * testbar und reproduzierbar.
 */
const CONFIG =
  typeof require !== "undefined" ? require("./config.js").CONFIG
  : typeof window !== "undefined" ? window.CONFIG
  : {};

class ScreenShake {
  constructor() {
    const cfg = CONFIG.shake || {};
    this.maxOffset = cfg.maxOffset || 12;
    this.decay = cfg.decay || 1.8;
    this.reset();
  }

  reset() {
    this.trauma = 0;
    this.t = 0;
  }

  /** Fügt Trauma hinzu (gedeckelt bei 1). */
  add(amount) {
    this.trauma = Math.min(1, this.trauma + amount);
  }

  update(dt) {
    this.t += dt;
    if (this.trauma > 0) this.trauma = Math.max(0, this.trauma - this.decay * dt);
  }

  /** Aktueller Versatz {x, y}; 0 bei Trauma 0, maximal maxOffset bei Trauma 1. */
  getOffset() {
    if (this.trauma <= 0) return { x: 0, y: 0 };
    const power = this.trauma * this.trauma; // quadratisch
    const mag = this.maxOffset * power;
    return {
      x: mag * Math.sin(this.t * 53),
      y: mag * Math.sin(this.t * 67 + 1.7),
    };
  }
}

if (typeof window !== "undefined") window.ScreenShake = ScreenShake;
if (typeof module !== "undefined" && module.exports) module.exports = { ScreenShake };
