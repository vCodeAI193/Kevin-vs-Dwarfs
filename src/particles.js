/**
 * Schlichtes Partikelsystem für Effekte bei Stomp, Münz-Einsammeln und Wirbelsturm.
 * Reine Mathematik + ein bisschen Zeichnen – der Update-Teil ist unit-getestet.
 */
class Particle {
  constructor(x, y, vx, vy, life, color, size) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.life = life;
    this.maxLife = life;
    this.color = color;
    this.size = size;
  }

  get dead() {
    return this.life <= 0;
  }

  update(dt) {
    this.vy += 600 * dt; // Schwerkraft
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.life -= dt;
  }
}

class ParticleSystem {
  constructor(rng = Math.random) {
    this.rng = rng;
    this.particles = [];
  }

  reset() {
    this.particles = [];
  }

  /** Stößt `count` Partikel von (x, y) aus, in zufällige Richtungen. */
  emit(x, y, count, { color = "#fff", speed = 180, life = 0.5, size = 4 } = {}) {
    for (let i = 0; i < count; i++) {
      const angle = this.rng() * Math.PI * 2;
      const v = speed * (0.4 + this.rng() * 0.6);
      this.particles.push(
        new Particle(x, y, Math.cos(angle) * v, Math.sin(angle) * v, life, color, size)
      );
    }
  }

  update(dt) {
    for (const p of this.particles) p.update(dt);
    this.particles = this.particles.filter((p) => !p.dead);
  }

  draw(ctx) {
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      ctx.restore();
    }
  }
}

if (typeof window !== "undefined") {
  window.Particle = Particle;
  window.ParticleSystem = ParticleSystem;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = { Particle, ParticleSystem };
}
