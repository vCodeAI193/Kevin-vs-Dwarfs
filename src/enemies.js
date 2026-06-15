/**
 * Ein Zwerg. Spawnt am rechten Rand und wandert nach links (mit der Weltgeschwindigkeit).
 * Wird er gestompt, ist er weg. Wirft der Wirbelsturm ihn um, ist er für einige
 * Sekunden betäubt und ungefährlich.
 */
class Dwarf {
  constructor(x, groundY) {
    this.width = 34;
    this.height = 40;
    this.x = x;
    this.groundY = groundY;
    this.y = groundY - this.height;
    this.alive = true;
    this.stunTimer = 0; // > 0 -> umgeworfen / betäubt
  }

  get stunned() {
    return this.stunTimer > 0;
  }

  stun(seconds) {
    this.stunTimer = Math.max(this.stunTimer, seconds);
  }

  update(dt, worldSpeed) {
    this.x -= worldSpeed;
    if (this.stunTimer > 0) this.stunTimer -= dt;
  }

  draw(ctx) {
    ctx.save();
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    ctx.translate(cx, cy);
    if (this.stunned) ctx.rotate(Math.PI / 2); // umgekippt liegen lassen

    // Körper
    ctx.fillStyle = this.stunned ? "#9a6b4a" : "#8d4f2a";
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    // Bart
    ctx.fillStyle = "#e8e8e8";
    ctx.fillRect(-this.width / 2 + 4, 0, this.width - 8, this.height / 2 - 2);
    // Mütze
    ctx.fillStyle = "#c0392b";
    ctx.beginPath();
    ctx.moveTo(-this.width / 2, -this.height / 2);
    ctx.lineTo(this.width / 2, -this.height / 2);
    ctx.lineTo(0, -this.height / 2 - 16);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}

/**
 * Verwaltet das Spawnen und Aktualisieren aller Zwerge. Die Spawn-Rate steigt mit
 * der Zeit, damit es endlos schwerer wird.
 */
class EnemyManager {
  constructor(canvasWidth, groundY) {
    this.canvasWidth = canvasWidth;
    this.groundY = groundY;
    this.reset();
  }

  reset() {
    this.dwarves = [];
    this.spawnCooldown = 1.2; // Sekunden bis zum nächsten Spawn
    this.timer = 0;
  }

  update(dt, worldSpeed, difficulty) {
    // Spawn-Logik – mit steigender Schwierigkeit kürzere Abstände
    this.timer += dt;
    const interval = Math.max(0.55, this.spawnCooldown - difficulty * 0.08);
    if (this.timer >= interval) {
      this.timer = 0;
      this.dwarves.push(new Dwarf(this.canvasWidth + 20, this.groundY));
    }

    // Bewegen & aufräumen
    for (const d of this.dwarves) d.update(dt, worldSpeed);
    this.dwarves = this.dwarves.filter((d) => d.alive && d.x + d.width > -10);
  }

  draw(ctx) {
    for (const d of this.dwarves) d.draw(ctx);
  }
}

if (typeof window !== "undefined") {
  window.Dwarf = Dwarf;
  window.EnemyManager = EnemyManager;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = { Dwarf, EnemyManager };
}
