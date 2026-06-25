// SpawnManager im Browser global, in Node via require
const SpawnManager =
  typeof require !== "undefined" ? require("./spawn-manager.js").SpawnManager
  : typeof window !== "undefined" ? window.SpawnManager
  : null;

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
 * Wählt anhand der Schwierigkeit einen Zwerg-Typ. Je höher die Schwierigkeit, desto
 * eher tauchen schnelle und gepanzerte Zwerge auf. rng erlaubt deterministische Tests.
 */
function pickDwarfType(difficulty, rng = Math.random) {
  const r = rng();
  const fastChance = Math.min(0.35, 0.05 + difficulty * 0.04);
  const armoredChance = Math.min(0.25, difficulty * 0.03);
  if (r < armoredChance) return "armored";
  if (r < armoredChance + fastChance) return "fast";
  return "normal";
}

/**
 * Verwaltet das Spawnen und Aktualisieren aller Zwerge. Die Spawn-Rate steigt mit
 * der Zeit, damit es endlos schwerer wird.
 */
class EnemyManager extends SpawnManager {
  reset() {
    super.reset();
    this.cooldown = 1.2; // Sekunden bis zum nächsten Spawn
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
    this.items.push(new Dwarf(this.canvasWidth + 20, this.groundY, type));
  }

  keep(d) {
    return d.alive && d.x + d.width > -10;
  }
}

if (typeof window !== "undefined") {
  window.Dwarf = Dwarf;
  window.EnemyManager = EnemyManager;
  window.pickDwarfType = pickDwarfType;
  window.DWARF_TYPES = DWARF_TYPES;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = { Dwarf, EnemyManager, pickDwarfType, DWARF_TYPES };
}
