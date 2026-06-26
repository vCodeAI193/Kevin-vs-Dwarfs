/**
 * Renderer – kapselt das gesamte Zeichnen (Hintergrund, Spielobjekte, HUD, Screens).
 * Bekommt pro Frame einen **read-only State-Snapshot** und den Canvas-Kontext; er
 * verändert keinen Spielzustand. Dadurch ist die Darstellung sauber von der Logik
 * getrennt. (Browser-only; nutzt globale Hilfsfunktionen wie getBiome.)
 */
class Renderer {
  constructor(ctx, width, height, groundY) {
    this.ctx = ctx;
    this.W = width;
    this.H = height;
    this.GROUND_Y = groundY;
  }

  render(s) {
    // Hintergrund ohne Versatz (vermeidet Randlücken beim Shake)
    this.drawBackground(s);

    // Screen-Shake nur auf die Spielobjekte anwenden, nicht aufs HUD/Overlays
    this.ctx.save();
    this.ctx.translate(s.shakeX || 0, s.shakeY || 0);
    s.obstacles.draw(this.ctx);
    s.coins.draw(this.ctx);
    s.powerups.draw(this.ctx);
    s.enemies.draw(this.ctx);
    if (s.boss) s.boss.draw(this.ctx);
    s.player.draw(this.ctx);
    s.particles.draw(this.ctx);
    this.ctx.restore();

    this.drawHUD(s);
    s.toasts.draw(this.ctx, this.W);

    if (s.state === "ready") {
      this.drawReady(s);
    } else if (s.state === "paused") {
      this.drawCenterText("Pause", "P oder Esc zum Weiterspielen");
    } else if (s.state === "gameover") {
      this.drawGameOver(s);
    } else if (s.state === "achievements") {
      this.drawAchievementsScreen(s);
    }
  }

  drawBackground(s) {
    const ctx = this.ctx, W = this.W, H = this.H, GROUND_Y = this.GROUND_Y;
    const biome = getBiome(s.distance);

    ctx.fillStyle = biome.sky;
    ctx.fillRect(0, 0, W, H);

    // hintere Parallax-Schicht (langsamer, dunkler)
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = biome.hill;
    for (let i = -1; i < 4; i++) {
      const x = i * 320 - (s.bgOffset * 0.25) % 320;
      ctx.beginPath();
      ctx.arc(x + 160, GROUND_Y, 200, Math.PI, 0);
      ctx.fill();
    }
    ctx.restore();

    // vordere Parallax-Hügel
    ctx.fillStyle = biome.hill;
    for (let i = -1; i < 4; i++) {
      const x = i * 280 - s.bgOffset * 0.5;
      ctx.beginPath();
      ctx.arc(x + 140, GROUND_Y, 150, Math.PI, 0);
      ctx.fill();
    }

    // Boden
    ctx.fillStyle = biome.ground;
    ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
    ctx.fillStyle = biome.grass;
    ctx.fillRect(0, GROUND_Y, W, 10);
  }

  drawHUD(s) {
    const ctx = this.ctx, W = this.W;
    const player = s.player;

    ctx.fillStyle = "#1b1033";
    ctx.textAlign = "left";
    ctx.font = "bold 20px system-ui, sans-serif";
    ctx.fillText("Score: " + s.score, 16, 28);
    ctx.font = "14px system-ui, sans-serif";
    ctx.fillText("Best: " + s.highscore, 16, 48);
    ctx.fillText("Zwerge: " + s.kills + "   Münzen: " + s.coinsCollected, 16, 66);
    ctx.fillText("Biom: " + getBiome(s.distance).name, 16, 84);
    if (s.dailyMode) {
      ctx.fillStyle = "#ffd84d";
      ctx.fillText("📅 Tages-Challenge", 16, 102);
      ctx.fillStyle = "#1b1033";
    }
    if (s.zenMode) {
      ctx.fillStyle = "#7ad0a0";
      ctx.fillText("🧘 Zen-Modus (kein Game Over) — Z/Esc beendet", 16, s.dailyMode ? 120 : 102);
      ctx.fillStyle = "#1b1033";
    }

    // Combo-Anzeige (nur ab 2x)
    if (s.combo.active) {
      ctx.save();
      ctx.textAlign = "center";
      ctx.fillStyle = "#ff9b3d";
      ctx.font = "bold 26px system-ui, sans-serif";
      ctx.fillText("COMBO x" + s.combo.multiplier, W / 2, 92);
      ctx.restore();
    }

    // Power-Leiste
    const barW = 180;
    const barX = W - barW - 16;
    const barY = 20;
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillRect(barX, barY, barW, 16);
    ctx.fillStyle = player.powerFull ? "#ffd84d" : "#9be7ff";
    ctx.fillRect(barX, barY, (barW * player.power) / player.powerMax, 16);
    ctx.strokeStyle = "#1b1033";
    ctx.strokeRect(barX, barY, barW, 16);
    ctx.fillStyle = "#1b1033";
    ctx.font = "bold 12px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(player.powerFull ? "WIRBELSTURM BEREIT! (F)" : "Wirbelsturm", barX + barW / 2, barY + 30);

    // Aktive Power-Ups
    const active = [];
    if (player.hasDoubleJump) active.push(["Doppelsprung", player.doubleJumpTimer, "#7cf"]);
    if (player.hasShield) active.push(["Schild", player.shieldTimer, "#4ad0ff"]);
    if (player.hasMagnet) active.push(["Magnet", player.magnetTimer, "#ff6fae"]);
    ctx.textAlign = "right";
    ctx.font = "bold 13px system-ui, sans-serif";
    active.forEach(([label, t, color], i) => {
      ctx.fillStyle = color;
      ctx.fillText(label + " " + Math.ceil(t) + "s", W - 16, 58 + i * 18);
    });

    // Boss-Hinweis
    if (s.boss) {
      ctx.fillStyle = "#6a3d8f";
      ctx.font = "bold 18px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("⚔️ Zwergenkönig!", W / 2, 28);
    }
  }

  drawCenterText(title, subtitle) {
    const ctx = this.ctx, W = this.W, H = this.H;
    ctx.fillStyle = "rgba(27,16,51,0.55)";
    ctx.fillRect(0, 0, W, H);
    ctx.textAlign = "center";
    ctx.fillStyle = "#fff";
    ctx.font = "bold 36px system-ui, sans-serif";
    ctx.fillText(title, W / 2, H / 2 - 10);
    ctx.font = "18px system-ui, sans-serif";
    ctx.fillText(subtitle, W / 2, H / 2 + 26);
  }

  dimOverlay() {
    this.ctx.fillStyle = "rgba(27,16,51,0.6)";
    this.ctx.fillRect(0, 0, this.W, this.H);
  }

  drawReady(s) {
    const ctx = this.ctx, W = this.W, H = this.H;
    const subtitle = s.zenMode
      ? "Zen-Modus · Leertaste / Klick zum Starten"
      : s.dailyMode
      ? "Tages-Challenge · Leertaste / Klick zum Starten"
      : "Leertaste / Klick zum Starten";
    this.drawCenterText("Kevin gegen die Zwerge", subtitle);

    if (s.dailyMode) {
      ctx.textAlign = "center";
      ctx.fillStyle = "#ffd84d";
      ctx.font = "14px system-ui, sans-serif";
      ctx.fillText("📅 Heutiger Parcours – Tages-Best: " + s.dailyBest, W / 2, H / 2 + 52);
    }

    // Lifetime-Statistiken dezent am unteren Rand
    if (s.stats.runs > 0) {
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.font = "13px system-ui, sans-serif";
      ctx.fillText(
        `Läufe: ${s.stats.runs}  ·  Zwerge: ${s.stats.totalKills}  ·  ` +
          `Münzen: ${s.stats.totalCoins}  ·  Bosse: ${s.stats.bossesDefeated}`,
        W / 2, H - 24
      );
    }
  }

  drawGameOver(s) {
    const ctx = this.ctx, W = this.W, H = this.H;
    this.dimOverlay();
    ctx.textAlign = "center";
    ctx.fillStyle = "#fff";
    ctx.font = "bold 34px system-ui, sans-serif";
    const rekord = s.score >= s.highscore && s.score > 0;
    ctx.fillText(rekord ? "🏆 Neuer Rekord! " : "Game Over", W / 2, 70);

    ctx.font = "16px system-ui, sans-serif";
    const r = s.lastRun || { distance: 0, kills: 0, coins: 0, bosses: 0, maxCombo: 0 };
    const lines = [
      `Score: ${s.score}` + (rekord ? "" : `   (Best: ${s.highscore})`),
      `Distanz: ${r.distance}   Zwerge: ${r.kills}   Münzen: ${r.coins}`,
      `Bosse: ${r.bosses}   beste Combo: ${r.maxCombo}×`,
    ];
    lines.forEach((line, i) => ctx.fillText(line, W / 2, 110 + i * 24));

    let y = 110 + lines.length * 24 + 12;
    if (s.lastNewAchievements.length > 0) {
      ctx.fillStyle = "#ffd84d";
      ctx.font = "bold 16px system-ui, sans-serif";
      ctx.fillText("🎉 Neuer Erfolg!", W / 2, y);
      y += 22;
      ctx.font = "14px system-ui, sans-serif";
      for (const id of s.lastNewAchievements) {
        const a = getAchievement(id);
        if (a) {
          ctx.fillText(`${a.name} – ${a.desc}`, W / 2, y);
          y += 20;
        }
      }
    }

    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = "16px system-ui, sans-serif";
    ctx.fillText("Leertaste / Klick für neuen Versuch", W / 2, H - 22);
  }

  drawAchievementsScreen(s) {
    const ctx = this.ctx, W = this.W, H = this.H;
    this.dimOverlay();
    ctx.textAlign = "center";
    ctx.fillStyle = "#fff";
    ctx.font = "bold 28px system-ui, sans-serif";
    ctx.fillText("🏅 Erfolge & Statistiken", W / 2, 44);

    ctx.font = "14px system-ui, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.fillText(
      `Läufe: ${s.stats.runs}   Zwerge: ${s.stats.totalKills}   Münzen: ${s.stats.totalCoins}   ` +
        `Bosse: ${s.stats.bossesDefeated}   beste Combo: ${s.stats.bestCombo}×   Rekord-Distanz: ${s.stats.bestDistance}`,
      W / 2, 70
    );

    const unlocked = evaluateAchievements(s.stats);
    ctx.textAlign = "left";
    let y = 100;
    for (const a of ACHIEVEMENTS) {
      const done = unlocked.includes(a.id);
      ctx.fillStyle = done ? "#ffd84d" : "rgba(255,255,255,0.45)";
      ctx.font = "bold 15px system-ui, sans-serif";
      ctx.fillText((done ? "✓ " : "🔒 ") + a.name, 70, y);
      ctx.fillStyle = done ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.4)";
      ctx.font = "13px system-ui, sans-serif";
      ctx.fillText(a.desc, 250, y);
      y += 26;
    }

    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = "15px system-ui, sans-serif";
    ctx.fillText("A / Klick zum Schließen", W / 2, H - 18);
  }
}

if (typeof window !== "undefined") window.Renderer = Renderer;
if (typeof module !== "undefined" && module.exports) module.exports = { Renderer };
