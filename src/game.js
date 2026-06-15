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

  // Spielzustand: "ready" | "playing" | "gameover"
  let state = "ready";
  let score = 0;
  let kills = 0;
  let distance = 0;
  let worldSpeed = 4;
  let elapsed = 0; // Sekunden seit Spielstart (für Schwierigkeit)
  let bgOffset = 0;

  // ---- Eingabe ----
  const keys = {};
  window.addEventListener("keydown", (e) => {
    const jumpKeys = ["Space", "ArrowUp", "KeyW"];
    const whirlKeys = ["ShiftLeft", "ShiftRight", "KeyF"];

    if (jumpKeys.includes(e.code) || whirlKeys.includes(e.code)) e.preventDefault();

    if (state === "ready" && (jumpKeys.includes(e.code) || e.code === "Enter")) {
      startGame();
      return;
    }
    if (state === "gameover" && (e.code === "Enter" || jumpKeys.includes(e.code))) {
      startGame();
      return;
    }

    if (state === "playing") {
      if (jumpKeys.includes(e.code)) player.jump();
      if (whirlKeys.includes(e.code)) doWhirlwind();
    }
    keys[e.code] = true;
  });
  window.addEventListener("keyup", (e) => {
    keys[e.code] = false;
  });

  // Touch / Klick: springt bzw. startet
  canvas.addEventListener("pointerdown", () => {
    if (state === "playing") player.jump();
    else startGame();
  });

  function startGame() {
    state = "playing";
    score = 0;
    kills = 0;
    distance = 0;
    worldSpeed = 4;
    elapsed = 0;
    player.reset();
    enemies.reset();
  }

  function doWhirlwind() {
    if (!player.triggerWhirlwind()) return;
    // Alle Zwerge im Umkreis umwerfen
    const px = player.x + player.width / 2;
    for (const d of enemies.dwarves) {
      const dx = d.x + d.width / 2 - px;
      if (Math.abs(dx) <= player.whirlRadius) {
        d.stun(player.whirlStunTime);
      }
    }
  }

  // ---- Kollisionen (Hilfsfunktionen siehe collision.js) ----
  function handleCollisions() {
    for (const d of enemies.dwarves) {
      if (!d.alive || !rectsOverlap(player, d)) continue;

      const stomping = isStomp(player, d);

      if (d.stunned) {
        // Betäubte Zwerge sind ungefährlich – können aber "eingesammelt" werden
        if (stomping || player.whirlActive) {
          d.alive = false;
          kills++;
          player.addKillPower();
        }
        continue;
      }

      if (player.whirlActive) {
        // Während des Wirbels wird alles Berührte umgeworfen
        d.stun(player.whirlStunTime);
        continue;
      }

      if (stomping) {
        d.alive = false;
        kills++;
        player.addKillPower();
        player.vy = -player.jumpForce * 0.6; // kleiner Abpraller
        player.onGround = false;
      } else {
        gameOver();
        return;
      }
    }
  }

  function gameOver() {
    state = "gameover";
  }

  // ---- Update ----
  function update(dt) {
    if (state !== "playing") return;

    elapsed += dt;
    const difficulty = elapsed / 12; // wächst langsam an
    worldSpeed = 4 + difficulty * 1.4;

    bgOffset = (bgOffset + worldSpeed * 0.4) % W;
    distance += worldSpeed * dt * 10;

    player.update(dt);
    enemies.update(dt, worldSpeed, difficulty);
    handleCollisions();

    score = Math.floor(distance) + kills * 50;
  }

  // ---- Zeichnen ----
  function drawBackground() {
    // Himmel
    ctx.fillStyle = "#87b7e8";
    ctx.fillRect(0, 0, W, H);

    // Parallax-Hügel
    ctx.fillStyle = "#6fae6f";
    for (let i = -1; i < 4; i++) {
      const x = i * 280 - bgOffset * 0.5;
      ctx.beginPath();
      ctx.arc(x + 140, GROUND_Y, 150, Math.PI, 0);
      ctx.fill();
    }

    // Boden
    ctx.fillStyle = "#5a3a1a";
    ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
    ctx.fillStyle = "#3f7d3f";
    ctx.fillRect(0, GROUND_Y, W, 10);
  }

  function drawHUD() {
    ctx.fillStyle = "#1b1033";
    ctx.font = "bold 20px system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Score: " + score, 16, 30);
    ctx.font = "14px system-ui, sans-serif";
    ctx.fillText("Zwerge: " + kills, 16, 50);

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
    ctx.fillText(player.powerFull ? "WIRBELSTURM BEREIT!" : "Wirbelsturm", barX + barW / 2, barY + 30);
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
    enemies.draw(ctx);
    player.draw(ctx);

    if (state === "playing") {
      drawHUD();
    } else if (state === "ready") {
      drawHUD();
      drawCenterText("Kevin gegen die Zwerge", "Leertaste / Klick zum Starten");
    } else if (state === "gameover") {
      drawHUD();
      drawCenterText("Game Over – Score: " + score, "Leertaste / Klick für neuen Versuch");
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
