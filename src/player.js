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

    this.reset();
  }

  reset() {
    this.y = this.groundY - this.height;
    this.vy = 0;
    this.onGround = true;
    this.power = 0;
    this.whirlTimer = 0; // > 0 -> Wirbelsturm-Animation läuft
    this.spin = 0; // Rotationswinkel für die Animation
  }

  get powerFull() {
    return this.power >= this.powerMax;
  }

  get whirlActive() {
    return this.whirlTimer > 0;
  }

  jump() {
    if (this.onGround) {
      this.vy = -this.jumpForce;
      this.onGround = false;
    }
  }

  addKillPower() {
    this.power = Math.min(this.powerMax, this.power + this.powerPerKill);
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
    }

    // Wirbelsturm-Animation herunterzählen
    if (this.whirlTimer > 0) {
      this.whirlTimer -= dt;
      this.spin += dt * 30;
    }
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

    ctx.save();
    ctx.translate(cx, cy);
    if (this.whirlActive) ctx.rotate(this.spin);

    // Körper
    ctx.fillStyle = "#2e7d32";
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    // Kopf
    ctx.fillStyle = "#ffcc99";
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
