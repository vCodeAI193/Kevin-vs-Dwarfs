/**
 * Der Zwergenkönig – ein Mini-Boss, der in festen Distanz-Abständen auftaucht.
 * Er hält mehrere Treffer aus und muss von oben gestompt (oder vom Wirbelsturm
 * getroffen) werden. Seitlicher Kontakt ist tödlich (außer mit Schild).
 *
 * Ablauf: Boss läuft von rechts herein und patrouilliert dann horizontal hin und
 * her – auch durch Kevins feste Position. Steht Kevin am Boden, wenn der Boss
 * heranrückt, muss er springen; im Fallen landet er auf dem Kopf = Treffer.
 * Nach jedem Treffer ist der Boss kurz unverwundbar (blinkt).
 */
class Boss {
  constructor(canvasWidth, groundY, maxHp = 3) {
    this.width = 78;
    this.height = 88;
    this.groundY = groundY;
    this.baseY = groundY - this.height;
    this.x = canvasWidth + 40;
    // Patrouille-Bereich – deckt Kevins x (~130) mit ab
    this.patrolMin = 40;
    this.patrolMax = canvasWidth - 320;
    this.patrolSpeed = 170; // px/s
    this.dir = -1;
    this.y = this.baseY;
    this.maxHp = maxHp;
    this.hp = maxHp;
    this.alive = true;
    this.entering = true;
    this.hitCooldown = 0; // > 0 -> gerade unverwundbar
  }

  get vulnerable() {
    return this.hitCooldown <= 0;
  }

  /** Fügt einen Treffer zu, sofern gerade verwundbar. Gibt true bei Treffer. */
  hit() {
    if (this.hitCooldown > 0) return false;
    this.hp--;
    this.hitCooldown = 1.0;
    if (this.hp <= 0) this.alive = false;
    return true;
  }

  update(dt, worldSpeed) {
    if (this.entering) {
      this.x -= worldSpeed * 1.1;
      if (this.x <= this.patrolMax) {
        this.x = this.patrolMax;
        this.entering = false;
        this.dir = -1;
      }
    } else {
      // horizontal patrouillieren und an den Rändern umkehren
      this.x += this.dir * this.patrolSpeed * dt;
      if (this.x <= this.patrolMin) {
        this.x = this.patrolMin;
        this.dir = 1;
      } else if (this.x >= this.patrolMax) {
        this.x = this.patrolMax;
        this.dir = -1;
      }
    }
    if (this.hitCooldown > 0) this.hitCooldown -= dt;
  }

  draw(ctx) {
    ctx.save();
    // Blinken während Unverwundbarkeit
    if (this.hitCooldown > 0 && Math.floor(this.hitCooldown * 12) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }
    // Körper
    ctx.fillStyle = "#6a3d8f";
    ctx.fillRect(this.x, this.y, this.width, this.height);
    // Bart
    ctx.fillStyle = "#f0f0f0";
    ctx.fillRect(this.x + 8, this.y + this.height * 0.45, this.width - 16, this.height * 0.45);
    // Krone
    ctx.fillStyle = "#ffd84d";
    ctx.beginPath();
    ctx.moveTo(this.x + 6, this.y);
    ctx.lineTo(this.x + 6, this.y - 18);
    ctx.lineTo(this.x + this.width * 0.3, this.y - 4);
    ctx.lineTo(this.x + this.width * 0.5, this.y - 22);
    ctx.lineTo(this.x + this.width * 0.7, this.y - 4);
    ctx.lineTo(this.x + this.width - 6, this.y - 18);
    ctx.lineTo(this.x + this.width - 6, this.y);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Lebensbalken
    const bw = this.width;
    const bx = this.x;
    const by = this.y - 30;
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(bx, by, bw, 8);
    ctx.fillStyle = "#e74c3c";
    ctx.fillRect(bx, by, (bw * Math.max(0, this.hp)) / this.maxHp, 8);
    ctx.strokeStyle = "#1b1033";
    ctx.strokeRect(bx, by, bw, 8);
  }
}

if (typeof window !== "undefined") window.Boss = Boss;
if (typeof module !== "undefined" && module.exports) module.exports = { Boss };
