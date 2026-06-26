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

  // Zentraler Zufall: im Normalmodus Math.random, in der Tages-Challenge ein
  // seeded PRNG. Der Proxy erlaubt es, die Quelle pro Lauf umzuschalten, ohne die
  // Manager neu zu erzeugen.
  let activeRng = Math.random;
  const rngProxy = () => activeRng();

  const player = new Player(GROUND_Y);
  const enemies = new EnemyManager(W, GROUND_Y, rngProxy);
  const coins = new CoinManager(W, GROUND_Y, rngProxy);
  const obstacles = new ObstacleManager(W, GROUND_Y, rngProxy);
  const powerups = new PowerUpManager(W, GROUND_Y, rngProxy);
  const particles = new ParticleSystem();
  const combo = new Combo();
  const toasts = new ToastManager();
  const sound = new SoundFX();
  const shake = new ScreenShake();
  const hitstop = new HitStop();
  const renderer = new Renderer(ctx, W, H, GROUND_Y);
  const storage = typeof localStorage !== "undefined" ? localStorage : null;

  const BOSS_INTERVAL = 1500; // Distanz zwischen Bosskämpfen
  let boss = null;
  let nextBossDistance = BOSS_INTERVAL;
  let lastBossPhase = 0; // zur Erkennung von Phasenwechseln

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

  // Dauerhafte Statistiken & Erfolge
  let stats = loadStats(storage);
  let unlockedAchievements = loadUnlocked(storage);
  let runMaxCombo = 0; // höchste Combo im aktuellen Lauf
  let bossesThisRun = 0;
  let lastRun = null; // Zusammenfassung des letzten Laufs (für Game-Over-Screen)
  let lastNewAchievements = []; // im letzten Lauf neu freigeschaltete Erfolge

  // Tägliche Challenge
  let dailyMode = false;
  let dailyBest = 0;

  // Zen-Modus (Übung ohne Game Over)
  let zenMode = false;

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
    if (e.code === "KeyA") {
      toggleAchievements();
      return;
    }
    if (e.code === "KeyT") {
      toggleDaily();
      return;
    }
    if (e.code === "KeyZ") {
      toggleZen();
      return;
    }
    if (e.code === "KeyP" || e.code === "Escape") {
      if (state === "achievements") state = "ready";
      else if (zenMode && state === "playing") state = "ready"; // Zen-Übung beenden
      else togglePause();
      return;
    }

    if (state === "achievements") {
      if (jumpKeys.includes(e.code) || e.code === "Enter") state = "ready";
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

  // Loslassen der Sprungtaste -> variable Sprunghöhe (Aufstieg kappen)
  window.addEventListener("keyup", (e) => {
    if (jumpKeys.includes(e.code) && state === "playing") player.cutJump();
  });

  // Geteilte Aktionen – von Tastatur, Canvas-Tap und Bildschirm-Buttons genutzt
  function primaryAction() {
    sound.resume();
    if (state === "achievements") {
      state = "ready"; // Übersicht schließen
      return;
    }
    if (state === "playing") doJump();
    else if (state === "ready" || state === "gameover") startGame();
  }

  // Tages-Challenge an/aus (nur außerhalb eines Laufs)
  function toggleDaily() {
    if (state === "playing" || state === "paused") return;
    dailyMode = !dailyMode;
    const btn = document.getElementById("btn-daily");
    if (btn) btn.textContent = dailyMode ? "📅 Täglich: An" : "📅 Täglich";
  }

  // Zen-Modus an/aus (Übung ohne Game Over); im Lauf beendet Z die Übung
  function toggleZen() {
    if (state === "playing") {
      if (zenMode) state = "ready"; // Übungslauf sauber beenden
      return;
    }
    if (state === "paused") return;
    zenMode = !zenMode;
    const btn = document.getElementById("btn-zen");
    if (btn) btn.textContent = zenMode ? "🧘 Zen: An" : "🧘 Zen";
  }

  // Erfolge-/Statistik-Übersicht öffnen/schließen
  function toggleAchievements() {
    if (state === "playing" || state === "paused") return;
    state = state === "achievements" ? "ready" : "achievements";
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
  bindButton("btn-daily", toggleDaily);
  bindButton("btn-zen", toggleZen);
  bindButton("btn-achievements", toggleAchievements);
  // Skin-Button-Label initialisieren
  {
    const btn = document.getElementById("btn-skin");
    if (btn) btn.textContent = "🎨 " + getSkinById(currentSkinId).name;
  }

  function startGame() {
    // Zufallsquelle wählen: Tages-Challenge nutzt einen festen Seed
    if (dailyMode) {
      const seed = todaySeed();
      activeRng = mulberry32(seed);
      dailyBest = loadDailyBest(storage, seed);
    } else {
      activeRng = Math.random;
    }

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
    toasts.reset();
    shake.reset();
    hitstop.reset();
    runMaxCombo = 0;
    bossesThisRun = 0;
    lastBossPhase = 0;
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
    shake.add(0.5);
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
    // Zen-Modus: kein Game Over – kurze i-Frames, damit es nicht jeden Frame auslöst
    if (zenMode) {
      player.grantInvulnerability(0.6);
      return true;
    }
    if (player.consumeShield()) {
      player.grantInvulnerability(1.0);
      shake.add(0.45);
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
    shake.add(0.25);
    hitstop.trigger(CONFIG.hitstop.stomp);
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
    const hp = 4 + Math.floor(nextBossDistance / BOSS_INTERVAL); // wird mit der Zeit zäher
    boss = new Boss(W, GROUND_Y, hp);
    lastBossPhase = 1;
    enemies.dwarves = []; // Arena freiräumen
    obstacles.obstacles = [];
    toasts.add("⚔️ Der Zwergenkönig erscheint!", 2.5, "#c39bff");
  }

  function defeatBoss() {
    particles.emit(boss.x + boss.width / 2, boss.y + boss.height / 2, 40, {
      color: "#ffd84d", speed: 360, life: 0.8, size: 6,
    });
    sound.whirlwind();
    toasts.add("Zwergenkönig besiegt! +500", 2.5, "#ffd84d");
    bossBonus += 500; // fließt über die Score-Formel in den Gesamtwert
    bossesThisRun++;
    boss = null;
    nextBossDistance += BOSS_INTERVAL;
  }

  // Boss-Projektile (Hämmer): Berührung ist tödlich (außer Schild/i-Frames)
  function handleBossProjectiles() {
    if (!boss) return;
    for (const p of boss.projectiles) {
      if (!p.alive) continue;
      if (rectsOverlap(player, p)) {
        p.alive = false;
        if (survivesFatalHit()) continue;
        gameOver();
        return;
      }
    }
  }

  function handleBossCollision() {
    if (!boss || !boss.alive) return;

    // Phasenwechsel ankündigen
    if (boss.phase > lastBossPhase) {
      lastBossPhase = boss.phase;
      toasts.add("Phase " + boss.phase + "! Der König wird wütend", 2, "#ff9b3d");
    }

    if (!rectsOverlap(player, boss)) return;

    if (isStomp(player, boss) || player.whirlActive) {
      if (boss.hit()) {
        player.addKillPower();
        registerComboKill(player.x + player.width / 2, player.y);
        shake.add(0.4);
        hitstop.trigger(CONFIG.hitstop.boss);
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
    shake.add(0.7);
    highscore = saveHighscore(storage, score);

    // Lauf zusammenfassen, Statistiken & Erfolge aktualisieren
    lastRun = {
      distance: Math.floor(distance),
      kills,
      coins: coinsCollected,
      bosses: bossesThisRun,
      maxCombo: runMaxCombo,
      score,
    };
    stats = mergeRun(stats, lastRun);
    saveStats(storage, stats);

    lastNewAchievements = newlyUnlocked(unlockedAchievements, stats);
    if (lastNewAchievements.length > 0) {
      unlockedAchievements = unlockedAchievements.concat(lastNewAchievements);
      saveUnlocked(storage, unlockedAchievements);
    }

    // Tages-Bestmarke aktualisieren
    if (dailyMode) dailyBest = saveDailyBest(storage, todaySeed(), score);
  }

  // ---- Update ----
  function update(dt) {
    if (state !== "playing") {
      particles.update(dt); // Effekte laufen auch im Game-Over-Bild aus
      shake.update(dt);
      return;
    }

    // Hit-Stop: Welt kurz einfrieren (Schläge bekommen mehr Wucht)
    if (hitstop.active) {
      hitstop.update(dt);
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
    toasts.update(dt);
    shake.update(dt);
    applyMagnet(dt);
    combo.update(dt);
    runMaxCombo = Math.max(runMaxCombo, combo.multiplier);

    if (boss) {
      boss.update(dt, worldSpeed);
      handleBossCollision();
      if (state === "playing") handleBossProjectiles();
    } else {
      // Normale Gegner & Hindernisse nur außerhalb der Boss-Phase
      enemies.update(dt, worldSpeed, difficulty);
      obstacles.update(dt, worldSpeed, difficulty);
      handleDwarfCollisions();
      if (state === "playing") handleObstacleCollisions();
    }

    handleCoinCollisions();
    handlePowerUpCollisions();
    checkLiveAchievements();

    score = computeScore({
      distance,
      kills,
      coins: coinsCollected,
      bossBonus,
      comboBonus,
    });
  }

  // Erfolge schon während des Laufs prüfen (gegen den aktuellen Fortschritt) und
  // als Toast einblenden. Der laufende Versuch wird noch nicht als "Lauf" gezählt.
  function liveStats() {
    return {
      runs: stats.runs,
      totalDistance: stats.totalDistance + Math.floor(distance),
      totalKills: stats.totalKills + kills,
      totalCoins: stats.totalCoins + coinsCollected,
      bossesDefeated: stats.bossesDefeated + bossesThisRun,
      bestCombo: Math.max(stats.bestCombo, runMaxCombo),
      bestDistance: Math.max(stats.bestDistance, Math.floor(distance)),
    };
  }

  function checkLiveAchievements() {
    if (zenMode) return; // Übungsmodus zählt nicht für Erfolge
    const fresh = newlyUnlocked(unlockedAchievements, liveStats());
    if (fresh.length === 0) return;
    for (const id of fresh) {
      const a = getAchievement(id);
      if (a) toasts.add("🏅 Erfolg: " + a.name, 3, "#ffd84d");
    }
    unlockedAchievements = unlockedAchievements.concat(fresh);
    saveUnlocked(storage, unlockedAchievements);
  }

  // ---- Zeichnen ----
  // Baut einen read-only Snapshot des Zustands und übergibt ihn dem Renderer.
  function render() {
    const shakeOffset = shake.getOffset();
    renderer.render({
      state,
      shakeX: shakeOffset.x,
      shakeY: shakeOffset.y,
      distance,
      bgOffset,
      score,
      highscore,
      kills,
      coinsCollected, // Anzahl eingesammelter Münzen (Zahl)
      dailyMode,
      zenMode,
      dailyBest: dailyMode && state === "ready" ? loadDailyBest(storage, todaySeed()) : dailyBest,
      combo,
      player,
      boss,
      stats,
      lastRun,
      lastNewAchievements,
      // Manager (zum Zeichnen)
      obstacles,
      coins,
      powerups,
      enemies,
      particles,
      toasts,
    });
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
