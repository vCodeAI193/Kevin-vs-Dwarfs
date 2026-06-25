// SpawnManager im Browser global, in Node via require
const SpawnManager =
  typeof require !== "undefined" ? require("./spawn-manager.js").SpawnManager
  : typeof window !== "undefined" ? window.SpawnManager
  : null;

/**
 * Einsammelbare Power-Ups, die zeitlich begrenzte Fähigkeiten verleihen:
 * - doublejump: ein zweiter Sprung in der Luft
 * - shield:     schützt vor einem sonst tödlichen Treffer
 * - magnet:     zieht Münzen in der Nähe an
 *
 * Sie spawnen selten und schweben auf Sprunghöhe.
 */
const POWERUP_TYPES = {
  doublejump: { color: "#7cf", symbol: "⇈" },
  shield: { color: "#4ad0ff", symbol: "⛨" },
  magnet: { color: "#ff6fae", symbol: "U" },
};

class PowerUp {
  constructor(x, y, type) {
    this.width = 26;
    this.height = 26;
    this.x = x;
    this.y = y;
    this.type = type;
    this.color = (POWERUP_TYPES[type] || POWERUP_TYPES.shield).color;
    this.symbol = (POWERUP_TYPES[type] || POWERUP_TYPES.shield).symbol;
    this.collected = false;
    this.bob = 0;
    this.baseY = y;
  }

  update(dt, worldSpeed) {
    this.x -= worldSpeed;
    this.bob += dt * 4;
    this.y = this.baseY + Math.sin(this.bob) * 6;
  }

  draw(ctx) {
    ctx.save();
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(cx, cy, this.width / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1b1033";
    ctx.font = "bold 16px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.symbol, cx, cy + 1);
    ctx.restore();
  }
}

/** Wählt zufällig einen Power-Up-Typ. rng erlaubt deterministische Tests. */
function pickPowerUpType(rng = Math.random) {
  const types = Object.keys(POWERUP_TYPES);
  return types[Math.floor(rng() * types.length) % types.length];
}

class PowerUpManager extends SpawnManager {
  reset() {
    super.reset();
    this.cooldown = 11; // Power-Ups sind selten
  }

  spawn() {
    const type = pickPowerUpType(this.rng);
    this.items.push(new PowerUp(this.canvasWidth + 20, this.groundY - 110, type));
  }

  keep(p) {
    return !p.collected && p.x + p.width > -10;
  }
}

if (typeof window !== "undefined") {
  window.PowerUp = PowerUp;
  window.PowerUpManager = PowerUpManager;
  window.pickPowerUpType = pickPowerUpType;
  window.POWERUP_TYPES = POWERUP_TYPES;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = { PowerUp, PowerUpManager, pickPowerUpType, POWERUP_TYPES };
}
