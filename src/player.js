// CONFIG im Browser global, in Node via require
const CONFIG =
  typeof require !== "undefined" ? require("./config.js").CONFIG
  : typeof window !== "undefined" ? window.CONFIG
  : {};

/**
 * Kevin – der Held. Bleibt am festen Bildschirm-X stehen, während die Welt scrollt.
 * Kann springen (Schwerkraft) und – bei voller Power-Leiste – den Wirbelsturm auslösen.
 */
class Player {
  constructor(groundY) {
    this.width = 36;
    this.height = 48;
    this.x = 130;
    this.groundY = groundY;

    // Physik
    this.gravity = 0.8;
    this.jumpForce = 16;

    // Wirbelsturm
    this.powerMax = 100;
    this.powerPerKill = 25; // 4 Kills = volle Leiste
    this.whirlRadius = 230;
    this.whirlVisualTime = 0.6; // Sekunden Dreh-Animation
    this.whirlStunTime = 3.0; // Sekunden, die Zwerge umgeworfen bleiben

    // Power-Up-Dauern (Sekunden)
    this.powerUpDurations = {
      doublejump: CONFIG.powerUp.doublejump,
      shield: CONFIG.powerUp.shield,
      magnet: CONFIG.powerUp.magnet,
    };
    this.magnetRadius = CONFIG.powerUp.magnetRadius;

    // Skin-Farben (per setSkin überschreibbar)
    this.bodyColor = "#2e7d32";
    this.headColor = "#ffcc99";

    this.reset();
  }

  /** Setzt die Farben aus einem Skin-Objekt ({ body, head }). */
  setSkin(skin) {
    if (!skin) return;
    if (skin.body) this.bodyColor = skin.body;
    if (skin.head) this.headColor = skin.head;
  }

  reset() {
    this.y = this.groundY - this.height;
    this.vy = 0;
    this.onGround = true;
    this.power = 0;
    this.whirlTimer = 0; // > 0 -> Wirbelsturm-Animation läuft
    this.spin = 0; // Rotationswinkel für die Animation
    this.jumpsUsed = 0; // für Doppelsprung
    this.doubleJumpTimer = 0;
    this.shieldTimer = 0;
    this.magnetTimer = 0;
    this.invulnTimer = 0; // kurze i-Frames nach einem abgefangenen Treffer
  }

  get invulnerable() {
    return this.invulnTimer > 0;
  }

  grantInvulnerability(seconds) {
    this.invulnTimer = Math.max(this.invulnTimer, seconds);
  }

  get powerFull() {
    return this.power >= this.powerMax;
  }

  get whirlActive() {
    return this.whirlTimer > 0;
  }

  get hasDoubleJump() {
    return this.doubleJumpTimer > 0;
  }

  get hasShield() {
    return this.shieldTimer > 0;
  }

  get hasMagnet() {
    return this.magnetTimer > 0;
  }

  /** Aktiviert ein eingesammeltes Power-Up. Gibt true bei bekanntem Typ. */
  activatePowerUp(type) {
    const d = this.powerUpDurations[type];
    if (!d) return false;
    if (type === "doublejump") this.doubleJumpTimer = d;
    else if (type === "shield") this.shieldTimer = d;
    else if (type === "magnet") this.magnetTimer = d;
    return true;
  }

  /** Verbraucht den Schild (z. B. bei einem sonst tödlichen Treffer). */
  consumeShield() {
    if (this.shieldTimer <= 0) return false;
    this.shieldTimer = 0;
    return true;
  }

  jump() {
    if (this.onGround) {
      this.vy = -this.jumpForce;
      this.onGround = false;
      this.jumpsUsed = 1;
      return true;
    }
    // Doppelsprung in der Luft (nur mit aktivem Power-Up)
    if (this.hasDoubleJump && this.jumpsUsed < 2) {
      this.vy = -this.jumpForce;
      this.jumpsUsed = 2;
      return true;
    }
    return false;
  }

  /** Erhöht die Power-Leiste um einen Betrag (gedeckelt bei powerMax). */
  addPower(amount) {
    this.power = Math.min(this.powerMax, this.power + amount);
  }

  addKillPower() {
    this.addPower(this.powerPerKill);
  }

  /** Löst den Wirbelsturm aus, wenn die Leiste voll ist. Gibt true bei Erfolg. */
  triggerWhirlwind() {
    if (!this.powerFull) return false;
    this.power = 0;
    this.whirlTimer = this.whirlVisualTime;
    return true;
  }

  update(dt) {
    // Schwerkraft & Sprung
    this.vy += this.gravity;
    this.y += this.vy;

    if (this.y + this.height >= this.groundY) {
      this.y = this.groundY - this.height;
      this.vy = 0;
      this.onGround = true;
      this.jumpsUsed = 0; // beim Landen Sprünge zurücksetzen
    }

    // Wirbelsturm-Animation herunterzählen
    if (this.whirlTimer > 0) {
      this.whirlTimer -= dt;
      this.spin += dt * 30;
    }

    // Power-Up-Timer herunterzählen
    if (this.doubleJumpTimer > 0) this.doubleJumpTimer -= dt;
    if (this.shieldTimer > 0) this.shieldTimer -= dt;
    if (this.magnetTimer > 0) this.magnetTimer -= dt;
    if (this.invulnTimer > 0) this.invulnTimer -= dt;
  }

  draw(ctx) {
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;

    // Wirbelsturm-Effekt
    if (this.whirlActive) {
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = "#9be7ff";
      ctx.beginPath();
      ctx.arc(cx, cy, this.whirlRadius * (1 - this.whirlTimer / this.whirlVisualTime + 0.3), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Schild-Aura
    if (this.hasShield) {
      ctx.save();
      ctx.globalAlpha = 0.4 + 0.2 * Math.sin(performance.now() / 100);
      ctx.strokeStyle = "#4ad0ff";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, this.width, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    ctx.save();
    ctx.translate(cx, cy);
    if (this.whirlActive) ctx.rotate(this.spin);

    // Körper
    ctx.fillStyle = this.bodyColor;
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    // Kopf
    ctx.fillStyle = this.headColor;
    ctx.fillRect(-this.width / 2 + 6, -this.height / 2 - 14, this.width - 12, 16);
    // Augen (nur ohne Wirbel sinnvoll sichtbar)
    ctx.fillStyle = "#222";
    ctx.fillRect(-this.width / 2 + 10, -this.height / 2 - 9, 4, 4);
    ctx.fillRect(this.width / 2 - 14, -this.height / 2 - 9, 4, 4);

    ctx.restore();
  }
}

if (typeof window !== "undefined") window.Player = Player;
if (typeof module !== "undefined" && module.exports) module.exports = { Player };
