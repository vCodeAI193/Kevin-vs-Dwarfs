/**
 * Soundeffekte über die Web Audio API – komplett synthetisch, also ohne Audiodateien.
 * Funktioniert nur im Browser; ohne AudioContext (z. B. unter Node) sind alle Methoden
 * lautlose No-Ops. Lässt sich per setEnabled(false) stummschalten.
 */
class SoundFX {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.available =
      typeof window !== "undefined" && !!(window.AudioContext || window.webkitAudioContext);
  }

  setEnabled(on) {
    this.muted = !on;
  }

  // Manche Browser starten den AudioContext erst nach einer Nutzer-Geste.
  resume() {
    const ac = this._ensure();
    if (ac && ac.state === "suspended") ac.resume();
  }

  _ensure() {
    if (!this.available || this.muted) return null;
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AC();
    }
    return this.ctx;
  }

  _tone(freq, dur, type = "square", gain = 0.06, freqTo = null) {
    const ac = this._ensure();
    if (!ac) return;
    const t = ac.currentTime;
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (freqTo) osc.frequency.exponentialRampToValueAtTime(freqTo, t + dur);
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g);
    g.connect(ac.destination);
    osc.start(t);
    osc.stop(t + dur);
  }

  jump() {
    this._tone(420, 0.14, "square", 0.05, 720);
  }
  stomp() {
    this._tone(220, 0.14, "sawtooth", 0.06, 90);
  }
  coin() {
    this._tone(880, 0.06, "triangle", 0.05);
    this._tone(1320, 0.09, "triangle", 0.05);
  }
  whirlwind() {
    this._tone(200, 0.5, "sawtooth", 0.05, 1200);
  }
  gameover() {
    this._tone(400, 0.5, "square", 0.06, 80);
  }
}

if (typeof window !== "undefined") window.SoundFX = SoundFX;
if (typeof module !== "undefined" && module.exports) module.exports = { SoundFX };
