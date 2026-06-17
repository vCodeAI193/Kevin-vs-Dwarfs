/**
 * Game-Loop, Zustände, Kollisionen, Score und UI für "Kevin gegen die Zwerge".
 * Endlos-Runner: Kevin steht fest, die Welt scrollt nach links und wird schneller.
 */
(function () {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const W = canvas.width;
  const H = canvas.height;
  const GROUND_Y = 330;

  const player = new Player(GROUND_Y);
  const enemies = new EnemyManager(W, GROUND_Y);
  const coins = new CoinManager(W, GROUND_Y);
  const obstacles = new ObstacleManager(W, GROUND_Y);
  const powerups = new PowerUpManager(W, GROUND_Y);
  const particles = new ParticleSystem();
  const combo = new Combo();
  const sound = new SoundFX();
  const storage = typeof localStorage !== "undefined" ? localStorage : null;

  const BOSS_INTERVAL = 1500; // Distanz zwischen Bosskämpfen
  let boss = null;
  let nextBossDistance = BOSS_INTERVAL;

  // Spielzustand: "ready" | "playing" | "paused" | "gameover"
  let state = "ready";
  let score = 0;
  let kills = 0;
  let coinsCollected = 0;
  let bossBonus = 0;
  let comboBonus = 0;
  let distance = 0;
  let worldSpeed = 4;
  let elapsed = 0; // Sekunden seit Spielstart (für Schwierigkeit)
  let bgOffset = 0;
  let highscore = loadHighscore(storage);

  // Skin laden und auf Kevin anwenden
  let currentSkinId = loadSkinId(storage);
  player.setSkin(getSkinById(currentSkinId));

  // ---- Eingabe ----
  const jumpKeys = ["Space", "ArrowUp", "KeyW"];
  const whirlKeys = ["ShiftLeft", "ShiftRight", "KeyF"];

  window.addEventListener("keydown", (e) => {
    sound.resume(); // AudioContext braucht eine Nutzer-Geste

    if (jumpKeys.includes(e.code) || whirlKeys.includes(e.code)) e.preventDefault();

    if (e.code === "KeyM") {
      toggleSound();
      return;
    }
    if (e.code === "KeyP" || e.code === "Escape") {
      togglePause();
      return;
    }

    if ((state === "ready" || state === "gameover") &&
        (jumpKeys.includes(e.code) || e.code === "Enter")) {
      startGame();
      return;
    }

    if (state === "playing") {
      if (jumpKeys.includes(e.code)) doJump();
      if (whirlKeys.includes(e.code)) doWhirlwind();
    }
  });

  // Geteilte Aktionen – von Tastatur, Canvas-Tap und Bildschirm-Buttons genutzt
  function primaryAction() {
    sound.resume();
    if (state === "playing") doJump();
    else if (state !== "paused") startGame();
  }

  function whirlwindAction() {
    sound.resume();
    if (state === "playing") doWhirlwind();
  }

  function toggleSound() {
    sound.setEnabled(sound.muted); // muted umschalten
    const btn = document.getElementById("btn-sound");
    if (btn) btn.textContent = sound.muted ? "🔇 Ton" : "🔊 Ton";
  }

  // Schaltet zum nächsten freigeschalteten Skin (nach Highscore) und merkt ihn
  function cycleSkin() {
    const next = nextUnlockedSkin(currentSkinId, highscore);
    currentSkinId = next.id;
    player.setSkin(next);
    saveSkinId(storage, currentSkinId);
    const btn = document.getElementById("btn-skin");
    if (btn) btn.textContent = "🎨 " + next.name;
  }

  canvas.addEventListener("pointerdown", primaryAction);

  // Bildschirm-Buttons (Touch & Maus). pointerdown für direkte Reaktion auf Touch.
  function bindButton(id, handler) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      handler();
    });
  }
  bindButton("btn-jump", primaryAction);
  bindButton("btn-whirl", whirlwindAction);
  bindButton("btn-pause", togglePause);
  bindButton("btn-sound", toggleSound);
  bindButton("btn-skin", cycleSkin);
  // Skin-Button-Label initialisieren
  {
    const btn = document.getElementById("btn-skin");
    if (btn) btn.textContent = "🎨 " + getSkinById(currentSkinId).name;
  }

  function startGame() {
    state = "playing";
    score = 0;
    kills = 0;
    coinsCollected = 0;
    bossBonus = 0;
    comboBonus = 0;
    distance = 0;
    worldSpeed = 4;
    elapsed = 0;
    player.reset();
    enemies.reset();
    coins.reset();
    obstacles.reset();
    powerups.reset();
    combo.reset();
    particles.reset();
    boss = null;
    nextBossDistance = BOSS_INTERVAL;
  }

  function togglePause() {
    if (state === "playing") state = "paused";
    else if (state === "paused") state = "playing";
  }

  function doJump() {
    const wasGround = player.onGround;
    player.jump();
    if (wasGround) sound.jump();
  }

  function doWhirlwind() {
    if (!player.triggerWhirlwind()) return;
    sound.whirlwind();
    const px = player.x + player.width / 2;
    const py = player.y + player.height / 2;
    particles.emit(px, py, 26, { color: "#9be7ff", speed: 320, life: 0.6, size: 5 });
    // Alle Zwerge im Umkreis umwerfen
    for (const d of enemies.dwarves) {
      if (Math.abs(d.x + d.width / 2 - px) <= player.whirlRadius) {
        d.stun(player.whirlStunTime);
      }
    }
  }

  // ---- Kollisionen (Hilfsfunktionen siehe collision.js) ----

  /**
   * Versucht, einen sonst tödlichen Treffer zu überleben: via aktiver i-Frames oder
   * durch Verbrauch des Schilds (der dann kurze Unverwundbarkeit gewährt).
   * Gibt true zurück, wenn Kevin überlebt.
   */
  function survivesFatalHit() {
    if (player.invulnerable) return true;
    if (player.consumeShield()) {
      player.grantInvulnerability(1.0);
      particles.emit(player.x + player.width / 2, player.y + player.height / 2, 18, {
        color: "#4ad0ff", speed: 240, life: 0.5, size: 4,
      });
      sound.stomp();
      return true;
    }
    return false;
  }

  function defeatDwarf(d) {
    d.alive = false;
    kills++;
    player.addKillPower();
    registerComboKill(d.x + d.width / 2, d.y);
    particles.emit(d.x + d.width / 2, d.y + d.height / 2, 12, {
      color: "#d8a", speed: 200, life: 0.45, size: 4,
    });
    sound.stomp();
  }

  // Erhöht die Combo und schreibt den Multiplikator-Bonus gut (Basis 50 pro Kill)
  function registerComboKill(x, y) {
    const mult = combo.add();
    if (mult > 1) {
      comboBonus += 50 * (mult - 1);
      particles.emit(x, y, 6, { color: "#ffd84d", speed: 160, life: 0.4, size: 3 });
    }
  }

  function handleDwarfCollisions() {
    for (const d of enemies.dwarves) {
      if (!d.alive || !rectsOverlap(player, d)) continue;
      const stomping = isStomp(player, d);

      if (d.stunned) {
        // Betäubte Zwerge sind ungefährlich – können eingesammelt werden
        if (stomping || player.whirlActive) defeatDwarf(d);
        continue;
      }

      if (player.whirlActive) {
        d.stun(player.whirlStunTime);
        continue;
      }

      if (stomping) {
        if (d.armored) {
          // Gepanzert: Stomp prallt ab, kein Kill
          player.vy = -player.jumpForce * 0.5;
          player.onGround = false;
          sound.stomp();
        } else {
          defeatDwarf(d);
          player.vy = -player.jumpForce * 0.6; // kleiner Abpraller
          player.onGround = false;
        }
      } else {
        if (survivesFatalHit()) {
          d.stun(player.whirlStunTime);
          continue;
        }
        gameOver();
        return;
      }
    }
  }

  function handleObstacleCollisions() {
    for (const o of obstacles.obstacles) {
      if (rectsOverlap(player, o)) {
        if (survivesFatalHit()) {
          o.x = -9999; // abgefangenes Hindernis entfernen
          continue;
        }
        gameOver();
        return;
      }
    }
  }

  function handlePowerUpCollisions() {
    for (const p of powerups.items) {
      if (!p.collected && rectsOverlap(player, p)) {
        p.collected = true;
        player.activatePowerUp(p.type);
        particles.emit(p.x + p.width / 2, p.y + p.height / 2, 14, {
          color: p.color, speed: 200, life: 0.5, size: 4,
        });
        sound.coin();
      }
    }
  }

  // Magnet: zieht Münzen in Reichweite zu Kevin
  function applyMagnet(dt) {
    if (!player.hasMagnet) return;
    const px = player.x + player.width / 2;
    const py = player.y + player.height / 2;
    for (const c of coins.coins) {
      const dx = px - (c.x + c.width / 2);
      const dy = py - (c.y + c.height / 2);
      const dist = Math.hypot(dx, dy);
      if (dist < player.magnetRadius && dist > 1) {
        const pull = 320 * dt;
        c.x += (dx / dist) * pull;
        c.y += (dy / dist) * pull;
      }
    }
  }

  // ---- Boss ----
  function spawnBoss() {
    const hp = 3 + Math.floor(nextBossDistance / BOSS_INTERVAL); // wird mit der Zeit zäher
    boss = new Boss(W, GROUND_Y, hp);
    enemies.dwarves = []; // Arena freiräumen
    obstacles.obstacles = [];
  }

  function defeatBoss() {
    particles.emit(boss.x + boss.width / 2, boss.y + boss.height / 2, 40, {
      color: "#ffd84d", speed: 360, life: 0.8, size: 6,
    });
    sound.whirlwind();
    bossBonus += 500; // fließt über die Score-Formel in den Gesamtwert
    boss = null;
    nextBossDistance += BOSS_INTERVAL;
  }

  function handleBossCollision() {
    if (!boss || !boss.alive) return;
    if (!rectsOverlap(player, boss)) return;

    if (isStomp(player, boss) || player.whirlActive) {
      if (boss.hit()) {
        player.addKillPower();
        registerComboKill(player.x + player.width / 2, player.y);
        particles.emit(player.x + player.width / 2, player.y + player.height, 10, {
          color: "#d8a", speed: 180, life: 0.4, size: 4,
        });
        sound.stomp();
      }
      player.vy = -player.jumpForce * 0.7;
      player.onGround = false;
      if (!boss.alive) defeatBoss();
    } else {
      if (survivesFatalHit()) return;
      gameOver();
    }
  }

  function handleCoinCollisions() {
    for (const c of coins.coins) {
      if (!c.collected && rectsOverlap(player, c)) {
        c.collected = true;
        coinsCollected++;
        player.addPower(COIN_POWER);
        particles.emit(c.x + c.width / 2, c.y + c.height / 2, 8, {
          color: "#ffd84d", speed: 150, life: 0.4, size: 3,
        });
        sound.coin();
      }
    }
  }

  function gameOver() {
    if (state !== "playing") return;
    state = "gameover";
    sound.gameover();
    highscore = saveHighscore(storage, score);
  }

  // ---- Update ----
  function update(dt) {
    if (state !== "playing") {
      particles.update(dt); // Effekte laufen auch im Game-Over-Bild aus
      return;
    }

    elapsed += dt;
    const difficulty = elapsed / 12; // wächst langsam an
    worldSpeed = 4 + difficulty * 1.4;

    bgOffset = (bgOffset + worldSpeed * 0.4) % W;
    distance += worldSpeed * dt * 10;

    // Boss-Phase starten, wenn die nächste Distanz-Schwelle erreicht ist
    if (!boss && distance >= nextBossDistance) spawnBoss();

    player.update(dt);
    coins.update(dt, worldSpeed);
    powerups.update(dt, worldSpeed);
    particles.update(dt);
    applyMagnet(dt);
    combo.update(dt);

    if (boss) {
      boss.update(dt, worldSpeed);
      handleBossCollision();
    } else {
      // Normale Gegner & Hindernisse nur außerhalb der Boss-Phase
      enemies.update(dt, worldSpeed, difficulty);
      obstacles.update(dt, worldSpeed, difficulty);
      handleDwarfCollisions();
      if (state === "playing") handleObstacleCollisions();
    }

    handleCoinCollisions();
    handlePowerUpCollisions();

    score =
      Math.floor(distance) +
      kills * 50 +
      coinsCollected * COIN_VALUE +
      bossBonus +
      comboBonus;
  }

  // ---- Zeichnen ----
  function drawBackground() {
    const biome = getBiome(distance);

    // Himmel
    ctx.fillStyle = biome.sky;
    ctx.fillRect(0, 0, W, H);

    // hintere Parallax-Schicht (langsamer, dunkler)
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = biome.hill;
    for (let i = -1; i < 4; i++) {
      const x = i * 320 - (bgOffset * 0.25) % 320;
      ctx.beginPath();
      ctx.arc(x + 160, GROUND_Y, 200, Math.PI, 0);
      ctx.fill();
    }
    ctx.restore();

    // vordere Parallax-Hügel
    ctx.fillStyle = biome.hill;
    for (let i = -1; i < 4; i++) {
      const x = i * 280 - bgOffset * 0.5;
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

  function drawHUD() {
    ctx.fillStyle = "#1b1033";
    ctx.textAlign = "left";
    ctx.font = "bold 20px system-ui, sans-serif";
    ctx.fillText("Score: " + score, 16, 28);
    ctx.font = "14px system-ui, sans-serif";
    ctx.fillText("Best: " + highscore, 16, 48);
    ctx.fillText("Zwerge: " + kills + "   Münzen: " + coinsCollected, 16, 66);
    ctx.fillText("Biom: " + getBiome(distance).name, 16, 84);

    // Combo-Anzeige (nur ab 2x)
    if (combo.active) {
      ctx.save();
      ctx.textAlign = "center";
      ctx.fillStyle = "#ff9b3d";
      ctx.font = "bold 26px system-ui, sans-serif";
      ctx.fillText("COMBO x" + combo.multiplier, W / 2, 92);
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
    if (boss) {
      ctx.fillStyle = "#6a3d8f";
      ctx.font = "bold 18px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("⚔️ Zwergenkönig!", W / 2, 28);
    }
  }

  function drawCenterText(title, subtitle) {
    ctx.fillStyle = "rgba(27,16,51,0.55)";
    ctx.fillRect(0, 0, W, H);
    ctx.textAlign = "center";
    ctx.fillStyle = "#fff";
    ctx.font = "bold 36px system-ui, sans-serif";
    ctx.fillText(title, W / 2, H / 2 - 10);
    ctx.font = "18px system-ui, sans-serif";
    ctx.fillText(subtitle, W / 2, H / 2 + 26);
  }

  function render() {
    drawBackground();
    obstacles.draw(ctx);
    coins.draw(ctx);
    powerups.draw(ctx);
    enemies.draw(ctx);
    if (boss) boss.draw(ctx);
    player.draw(ctx);
    particles.draw(ctx);

    drawHUD();
    if (state === "ready") {
      drawCenterText("Kevin gegen die Zwerge", "Leertaste / Klick zum Starten");
    } else if (state === "paused") {
      drawCenterText("Pause", "P oder Esc zum Weiterspielen");
    } else if (state === "gameover") {
      const sub =
        score >= highscore && score > 0
          ? "Neuer Rekord! Leertaste für neuen Versuch"
          : "Leertaste / Klick für neuen Versuch";
      drawCenterText("Game Over – Score: " + score, sub);
    }
  }

  // ---- Loop ----
  let last = performance.now();
  function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000); // dt in Sekunden, gedeckelt
    last = now;
    update(dt);
    render();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
