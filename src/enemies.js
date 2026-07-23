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
 * Zwerg-Typen. Jeder Typ hat eigene Maße, Tempo, Optik und ggf. eine Panzerung.
 * - normal:  Standard-Zwerg, per Stomp besiegbar.
 * - fast:    kleiner und schneller (bewegt sich schneller als die Welt).
 * - armored: gepanzert – ein Stomp prallt nur ab, besiegbar nur per Wirbelsturm.
 */
const DWARF_TYPES = {
  normal: { color: "#8d4f2a", cap: "#c0392b", speed: 1.0, armored: false, width: 34, height: 40 },
  fast: { color: "#2a6e8d", cap: "#27ae60", speed: 1.75, armored: false, width: 30, height: 34 },
  armored: { color: "#5d6470", cap: "#9aa3ad", speed: 0.9, armored: true, width: 36, height: 44 },
};

/**
 * Ein Zwerg. Spawnt am rechten Rand und wandert nach links (mit der Weltgeschwindigkeit
 * mal dem typabhängigen Tempo-Faktor). Wird er gestompt, ist er weg (außer gepanzert).
 * Wirft der Wirbelsturm ihn um, ist er für einige Sekunden betäubt und ungefährlich.
 */
class Dwarf {
  constructor(x, groundY, type = "normal") {
    const cfg = DWARF_TYPES[type] || DWARF_TYPES.normal;
    this.type = type;
    this.speedFactor = cfg.speed;
    this.armored = cfg.armored;
    this.color = cfg.color;
    this.capColor = cfg.cap;
    this.width = cfg.width;
    this.height = cfg.height;
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
    this.x -= worldSpeed * this.speedFactor;
    if (this.stunTimer > 0) this.stunTimer -= dt;
  }

  draw(ctx) {
    ctx.save();
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    ctx.translate(cx, cy);
    if (this.stunned) ctx.rotate(Math.PI / 2); // umgekippt liegen lassen

    // Körper
    ctx.fillStyle = this.stunned ? "#9a6b4a" : this.color;
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    // Bart
    ctx.fillStyle = "#e8e8e8";
    ctx.fillRect(-this.width / 2 + 4, 0, this.width - 8, this.height / 2 - 2);

    if (this.armored) {
      // Helm als Halbkreis
      ctx.fillStyle = this.capColor;
      ctx.beginPath();
      ctx.arc(0, -this.height / 2, this.width / 2, Math.PI, 0);
      ctx.fill();
    } else {
      // Spitze Mütze
      ctx.fillStyle = this.capColor;
      ctx.beginPath();
      ctx.moveTo(-this.width / 2, -this.height / 2);
      ctx.lineTo(this.width / 2, -this.height / 2);
      ctx.lineTo(0, -this.height / 2 - 16);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }
}

/**
 * Werfer-Zwerg: Wirft Felsbrocken nach Kevin, um ihn zu treffen.
 * Die Felsen fliegen in einer Parabel über das Spielfeld.
 */
class ThrowingDwarf extends Dwarf {
  constructor(x, groundY) {
    super(x, groundY, "normal");
    this.type = "throwing";
    this.color = "#7a3d2a"; // dunkelbraun
    this.capColor = "#b53e1a"; // rostrot
    this.throwTimer = 0;
    this.nextThrow = CONFIG.throwingDwarf.throwInterval * (0.7 + Math.random() * 0.3); // variabel
  }

  update(dt, worldSpeed) {
    super.update(dt, worldSpeed);
    this.throwTimer += dt;
  }

  shouldThrow() {
    const ready = this.throwTimer >= this.nextThrow;
    if (ready) {
      this.throwTimer = 0;
      this.nextThrow = CONFIG.throwingDwarf.throwInterval * (0.7 + Math.random() * 0.3);
    }
    return ready && !this.stunned;
  }

  createProjectile(playerY) {
    const startX = this.x + this.width / 2;
    const startY = this.y;
    const targetX = -200; // in den Westen (zu Kevin)
    const gravity = 600; // px/s²
    const arcHeight = CONFIG.throwingDwarf.throwArcHeight;

    // Parabel-Berechnung: Zeit bis zum Ziel unter Berücksichtigung der Bogenhöhe
    const horizontalDist = Math.abs(targetX - startX);
    const flightTime = horizontalDist / Math.abs(CONFIG.throwingDwarf.projectileSpeed);
    const vx = CONFIG.throwingDwarf.projectileSpeed;
    const vy = -(2 * arcHeight / flightTime + gravity * flightTime / 2);

    return new ThrowableRock(startX, startY, vx, vy);
  }

  draw(ctx) {
    ctx.save();
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    ctx.translate(cx, cy);
    if (this.stunned) ctx.rotate(Math.PI / 2);

    // Körper
    ctx.fillStyle = this.stunned ? "#9a6b4a" : this.color;
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    // Bart
    ctx.fillStyle = "#e8e8e8";
    ctx.fillRect(-this.width / 2 + 4, 0, this.width - 8, this.height / 2 - 2);

    // Helm statt Mütze (unterscheidbar vom Normal-Zwerg)
    ctx.fillStyle = this.capColor;
    ctx.beginPath();
    ctx.arc(0, -this.height / 2, this.width / 2, Math.PI, 0);
    ctx.fill();

    ctx.restore();
  }
}

/**
 * Wurfgeschoss des Werfers (Felsbrocken) – fliegt in einer Parabel.
 * Berührung ist tödlich (außer Schild/i-Frames).
 */
class ThrowableRock {
  constructor(x, y, vx, vy) {
    this.width = 18;
    this.height = 18;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.alive = true;
    this.gravity = 600; // px/s²
  }

  update(dt) {
    this.x += this.vx * dt;
    this.vy += this.gravity * dt;
    this.y += this.vy * dt;
    if (this.x + this.width < -40 || this.y > 400) this.alive = false;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.fillStyle = "#8b4513";
    ctx.beginPath();
    ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

/**
 * Wählt anhand der Schwierigkeit einen Zwerg-Typ. Je höher die Schwierigkeit, desto
 * eher tauchen schnelle, gepanzerte und werfende Zwerge auf. rng erlaubt deterministische Tests.
 */
function pickDwarfType(difficulty, rng = Math.random) {
  const r = rng();
  const armoredChance = Math.min(0.25, difficulty * 0.03);
  const throwingChance = Math.min(0.2, difficulty * 0.02); // bis 20% Werfer
  const fastChance = Math.min(0.35, 0.05 + difficulty * 0.04);
  if (r < armoredChance) return "armored";
  if (r < armoredChance + throwingChance) return "throwing";
  if (r < armoredChance + throwingChance + fastChance) return "fast";
  return "normal";
}

/**
 * Verwaltet das Spawnen und Aktualisieren aller Zwerge. Die Spawn-Rate steigt mit
 * der Zeit, damit es endlos schwerer wird. Verwaltet auch Werfer-Projektile.
 */
class EnemyManager extends SpawnManager {
  constructor(canvasWidth, groundY, rng) {
    super(canvasWidth, groundY, rng);
    this.projectiles = [];
  }

  reset() {
    super.reset();
    this.projectiles = [];
    this.cooldown = CONFIG.spawn.enemyCooldown; // Sekunden bis zum nächsten Spawn
  }

  // öffentlicher Name: dwarves (zeigt auf die geteilte items-Liste)
  get dwarves() {
    return this.items;
  }
  set dwarves(v) {
    this.items = v;
  }

  // mit steigender Schwierigkeit kürzere Abstände
  interval(difficulty) {
    return Math.max(0.55, this.cooldown - difficulty * 0.08);
  }

  spawn(difficulty) {
    const type = pickDwarfType(difficulty, this.rng);
    const dwarf = type === "throwing"
      ? new ThrowingDwarf(this.canvasWidth + 20, this.groundY)
      : new Dwarf(this.canvasWidth + 20, this.groundY, type);
    this.items.push(dwarf);
  }

  keep(d) {
    return d.alive && d.x + d.width > -10;
  }

  // Aktualisiert Werfer und ihre Projektile
  updateThrowingDwarves(playerY) {
    for (const d of this.dwarves) {
      if (d.type === "throwing" && d.shouldThrow()) {
        this.projectiles.push(d.createProjectile(playerY));
      }
    }
    // Projektile aufräumen
    this.projectiles = this.projectiles.filter(p => p.alive);
  }
}

if (typeof window !== "undefined") {
  window.Dwarf = Dwarf;
  window.ThrowingDwarf = ThrowingDwarf;
  window.ThrowableRock = ThrowableRock;
  window.EnemyManager = EnemyManager;
  window.pickDwarfType = pickDwarfType;
  window.DWARF_TYPES = DWARF_TYPES;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = { Dwarf, ThrowingDwarf, ThrowableRock, EnemyManager, pickDwarfType, DWARF_TYPES };
}
