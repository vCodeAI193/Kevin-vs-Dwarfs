/**
 * Hit-Stop: friert die Spielwelt für sehr kurze Zeit ein, wenn ein wuchtiger Treffer
 * passiert (Stomp, Boss-Treffer). Das gibt Schlägen mehr „Gewicht". Reiner Timer,
 * daher direkt unit-testbar.
 */
class HitStop {
  constructor() {
    this.timer = 0;
  }

  reset() {
    this.timer = 0;
  }

  get active() {
    return this.timer > 0;
  }

  /** Friert die Welt für `seconds` Sekunden ein (längere Anforderung gewinnt). */
  trigger(seconds) {
    this.timer = Math.max(this.timer, seconds);
  }

  /** Zählt den Timer herunter. Gibt true zurück, solange noch eingefroren wird. */
  update(dt) {
    if (this.timer > 0) {
      this.timer -= dt;
      if (this.timer < 0) this.timer = 0;
    }
    return this.active;
  }
}

if (typeof window !== "undefined") window.HitStop = HitStop;
if (typeof module !== "undefined" && module.exports) module.exports = { HitStop };
