/**
 * Tutorial-System: Geführte Praktikums-Sequenz, die Kevin durch Basis-Mechaniken führt.
 * Checkpoints: jump → coyote → doublejump → whirlwind.
 * Separate vom Zen-Modus: aktive Anleitung statt Freitraining.
 */
class Tutorial {
  constructor() {
    this.active = false;
    this.checkpoints = CONFIG.tutorial.checkpoints.map(c => ({ ...c, done: false }));
    this.currentIndex = 0;
    this.startTime = 0;
  }

  start() {
    this.active = true;
    this.startTime = Date.now();
    this.currentIndex = 0;
    this.checkpoints = this.checkpoints.map(c => ({ ...c, done: false }));
  }

  stop() {
    this.active = false;
  }

  getCurrent() {
    return this.checkpoints[this.currentIndex] || null;
  }

  // Markiert aktuellen Checkpoint als erledigt und geht zum nächsten
  advance() {
    if (!this.active || this.currentIndex >= this.checkpoints.length) return;
    this.checkpoints[this.currentIndex].done = true;
    this.currentIndex++;
  }

  // Überprüft, ob alle Checkpoints erledigt sind
  isComplete() {
    return this.currentIndex >= this.checkpoints.length;
  }

  reset() {
    this.active = false;
    this.currentIndex = 0;
    this.checkpoints = this.checkpoints.map(c => ({ ...c, done: false }));
  }

  getProgress() {
    return {
      current: this.currentIndex,
      total: this.checkpoints.length,
      percentage: Math.floor((this.currentIndex / this.checkpoints.length) * 100),
    };
  }
}

if (typeof window !== "undefined") window.Tutorial = Tutorial;
if (typeof module !== "undefined" && module.exports) module.exports = { Tutorial };
