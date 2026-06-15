/**
 * Einsammelbare Münzen. Bringen Punkte und füllen die Wirbelsturm-Leiste ein wenig.
 * Spawnen in kleinen Reihen, mal am Boden, mal auf Sprunghöhe.
 */
const COIN_VALUE = 25;
const COIN_POWER = 5;

class Coin {
  constructor(x, y) {
    this.width = 18;
    this.height = 18;
    this.x = x;
    this.y = y;
    this.collected = false;
    this.spin = 0;
  }

  update(dt, worldSpeed) {
    this.x -= worldSpeed;
    this.spin += dt * 6;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    // "Drehung" durch horizontale Stauchung andeuten
    const sx = Math.abs(Math.cos(this.spin));
    ctx.scale(sx + 0.15, 1);
    ctx.fillStyle = "#ffd84d";
    ctx.beginPath();
    ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#e0a92a";
    ctx.beginPath();
    ctx.arc(0, 0, this.width / 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

class CoinManager {
  constructor(canvasWidth, groundY, rng = Math.random) {
    this.canvasWidth = canvasWidth;
    this.groundY = groundY;
    this.rng = rng;
    this.reset();
  }

  reset() {
    this.coins = [];
    this.timer = 0;
    this.cooldown = 1.8; // Sekunden zwischen Münz-Reihen
  }

  update(dt, worldSpeed) {
    this.timer += dt;
    if (this.timer >= this.cooldown) {
      this.timer = 0;
      this.spawnRow();
    }
    for (const c of this.coins) c.update(dt, worldSpeed);
    this.coins = this.coins.filter((c) => !c.collected && c.x + c.width > -10);
  }

  spawnRow() {
    const count = 3;
    const gap = 26;
    // Mal auf Bodenhöhe, mal auf Sprunghöhe
    const high = this.rng() < 0.5;
    const baseY = high ? this.groundY - 120 : this.groundY - 40;
    for (let i = 0; i < count; i++) {
      this.coins.push(new Coin(this.canvasWidth + 20 + i * gap, baseY));
    }
  }

  draw(ctx) {
    for (const c of this.coins) c.draw(ctx);
  }
}

if (typeof window !== "undefined") {
  window.Coin = Coin;
  window.CoinManager = CoinManager;
  window.COIN_VALUE = COIN_VALUE;
  window.COIN_POWER = COIN_POWER;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = { Coin, CoinManager, COIN_VALUE, COIN_POWER };
}
