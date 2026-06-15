/**
 * Hindernisse (Felsen) am Boden. Sie sind NICHT besiegbar – Kevin muss darüber
 * springen. Jede Berührung beendet den Lauf.
 */
class Obstacle {
  constructor(x, groundY) {
    this.width = 30;
    this.height = 32;
    this.x = x;
    this.groundY = groundY;
    this.y = groundY - this.height;
  }

  update(dt, worldSpeed) {
    this.x -= worldSpeed;
  }

  draw(ctx) {
    ctx.save();
    ctx.fillStyle = "#6b6b6b";
    ctx.beginPath();
    ctx.moveTo(this.x, this.y + this.height);
    ctx.lineTo(this.x + this.width * 0.2, this.y + this.height * 0.3);
    ctx.lineTo(this.x + this.width * 0.5, this.y);
    ctx.lineTo(this.x + this.width * 0.8, this.y + this.height * 0.4);
    ctx.lineTo(this.x + this.width, this.y + this.height);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

class ObstacleManager {
  constructor(canvasWidth, groundY, rng = Math.random) {
    this.canvasWidth = canvasWidth;
    this.groundY = groundY;
    this.rng = rng;
    this.reset();
  }

  reset() {
    this.obstacles = [];
    this.timer = 0;
    this.cooldown = 2.6; // Grund-Abstand zwischen Felsen
  }

  update(dt, worldSpeed, difficulty) {
    this.timer += dt;
    const interval = Math.max(1.2, this.cooldown - difficulty * 0.1);
    if (this.timer >= interval) {
      this.timer = 0;
      this.obstacles.push(new Obstacle(this.canvasWidth + 20, this.groundY));
    }
    for (const o of this.obstacles) o.update(dt, worldSpeed);
    this.obstacles = this.obstacles.filter((o) => o.x + o.width > -10);
  }

  draw(ctx) {
    for (const o of this.obstacles) o.draw(ctx);
  }
}

if (typeof window !== "undefined") {
  window.Obstacle = Obstacle;
  window.ObstacleManager = ObstacleManager;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = { Obstacle, ObstacleManager };
}
