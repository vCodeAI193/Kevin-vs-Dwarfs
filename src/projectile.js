/**
 * Wurfgeschoss des Bosses (ein Hammer), das flach über den Boden nach links fliegt.
 * Kevin muss darüberspringen – eine Berührung ist (ohne Schild) tödlich.
 */
class Projectile {
  constructor(x, y, vx) {
    this.width = 22;
    this.height = 22;
    this.x = x;
    this.y = y;
    this.vx = vx; // negativ = nach links
    this.alive = true;
    this.spin = 0;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.spin += dt * 12;
    if (this.x + this.width < -40) this.alive = false;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.rotate(this.spin);
    // Hammerkopf
    ctx.fillStyle = "#888";
    ctx.fillRect(-this.width / 2, -this.height / 4, this.width, this.height / 2);
    // Stiel
    ctx.fillStyle = "#7a4a1a";
    ctx.fillRect(-2, -this.height / 2, 4, this.height);
    ctx.restore();
  }
}

if (typeof window !== "undefined") window.Projectile = Projectile;
if (typeof module !== "undefined" && module.exports) module.exports = { Projectile };
