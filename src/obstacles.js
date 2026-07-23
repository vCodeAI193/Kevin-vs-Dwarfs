// SpawnManager & CONFIG im Browser global, in Node via require
const SpawnManager =
  typeof require !== "undefined" ? require("./spawn-manager.js").SpawnManager
  : typeof window !== "undefined" ? window.SpawnManager
  : null;
const CONFIG =
  typeof require !== "undefined" ? require("./config.js").CONFIG
  : typeof window !== "undefined" ? window.CONFIG
  : {};

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

class ObstacleManager extends SpawnManager {
  reset() {
    super.reset();
    this.cooldown = CONFIG.spawn.obstacleCooldown; // Grund-Abstand zwischen Felsen
  }

  // öffentlicher Name: obstacles (zeigt auf die geteilte items-Liste)
  get obstacles() {
    return this.items;
  }
  set obstacles(v) {
    this.items = v;
  }

  interval(difficulty) {
    return Math.max(1.2, this.cooldown - difficulty * 0.1);
  }

  spawn() {
    this.items.push(new Obstacle(this.canvasWidth + 20, this.groundY));
  }
}

if (typeof window !== "undefined") {
  window.Obstacle = Obstacle;
  window.ObstacleManager = ObstacleManager;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = { Obstacle, ObstacleManager };
}
