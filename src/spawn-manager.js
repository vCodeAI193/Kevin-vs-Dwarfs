/**
 * Gemeinsame Basis für alle Spawner (Zwerge, Münzen, Hindernisse, Power-Ups).
 * Kapselt das wiederkehrende Muster: Timer hochzählen → bei Ablauf etwas spawnen,
 * alle Objekte nach links bewegen und aus dem Bild gelaufene/erledigte entfernen.
 *
 * Subklassen liefern die Details über drei Hooks:
 *   - interval(difficulty): Sekunden bis zum nächsten Spawn (Standard: this.cooldown)
 *   - spawn(difficulty):    ein oder mehrere Objekte zu this.items hinzufügen
 *   - keep(item):           true, solange das Objekt behalten wird
 *
 * Die Objekte selbst brauchen nur update(dt, worldSpeed) und draw(ctx).
 */
class SpawnManager {
  constructor(canvasWidth, groundY, rng = Math.random) {
    this.canvasWidth = canvasWidth;
    this.groundY = groundY;
    this.rng = rng;
    this.cooldown = 1; // Standard-Abstand; Subklassen setzen ihren Wert in reset()
    this.reset();
  }

  reset() {
    this.items = [];
    this.timer = 0;
  }

  interval() {
    return this.cooldown;
  }

  // eslint-disable-next-line no-unused-vars
  spawn(difficulty) {
    /* von Subklasse überschrieben */
  }

  keep(item) {
    return item.x + item.width > -10;
  }

  update(dt, worldSpeed, difficulty) {
    this.timer += dt;
    if (this.timer >= this.interval(difficulty)) {
      this.timer = 0;
      this.spawn(difficulty);
    }
    for (const it of this.items) it.update(dt, worldSpeed);
    this.items = this.items.filter((it) => this.keep(it));
  }

  draw(ctx) {
    for (const it of this.items) it.draw(ctx);
  }
}

if (typeof window !== "undefined") window.SpawnManager = SpawnManager;
if (typeof module !== "undefined" && module.exports) module.exports = { SpawnManager };
