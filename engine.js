/*
 * engine.js — reine, seiteneffektfreie Spiellogik von „Kevin vs. Zwerge".
 *
 * Single Source of Truth: wird von index.html (Browser) UND von den Tests
 * (Node, tests/engine.test.js) genutzt — so gibt es keine doppelte Logik.
 *
 * UMD-Wrapper: im Browser als globales `window.KevinEngine`, in Node via
 * `require("./engine.js")`. Keine Abhängigkeiten, keine DOM-/Canvas-Zugriffe.
 */
(function (root, factory) {
  "use strict";
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;   // Node
  else root.KevinEngine = api;                                              // Browser
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // --- Schwierigkeitsgrade: höhere Stufe = mehr & schnellere Zwerge ---
  const DIFFICULTY = {
    leicht: { spawn: 2.0, speed: 70, max: 6, ramp: 0.85 },
    mittel: { spawn: 1.3, speed: 100, max: 10, ramp: 0.78 },
    schwer: { spawn: 0.85, speed: 140, max: 16, ramp: 0.70 },
  };

  // Ramp-Grenzen (vom Auto-Stufenanstieg genutzt).
  const SPAWN_FLOOR = 0.45;   // kürzestes Spawn-Intervall (s)
  const SPEED_STEP = 12;      // Tempo-Zuwachs je Stufe (px/s)
  const SPEED_CAP = 260;      // maximales Gegner-Tempo (px/s)
  const DT_CAP = 1 / 30;      // delta-time-Deckel (s)

  // Pseudo-Zufall, deterministisch aus einer Zahl (für reproduzierbare Welt).
  function seededRand(n) {
    const x = Math.sin(n * 127.1) * 43758.5453;
    return x - Math.floor(x);
  }

  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

  // Achsen-ausgerichtete Rechteck-Überlappung (AABB). a,b = {x,y,w,h}.
  function rectsOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  // Stomp: fällt der Spieler von oben auf den Zwerg? `player` braucht vy +
  // prevBottom (= y+h des Vor-Frames), `dwarf` braucht y.
  function isStomp(player, dwarf, tol) {
    if (tol === undefined) tol = 16;
    return player.vy > 0 && player.prevBottom <= dwarf.y + tol;
  }

  // Liegt der Zwerg-Mittelpunkt im Wirbel-Radius um (cx, cy)?
  function withinSpin(cx, cy, dwarf, radius) {
    const dx = (dwarf.x + dwarf.w / 2) - cx;
    const dy = (dwarf.y + dwarf.h / 2) - cy;
    return dx * dx + dy * dy < radius * radius;
  }

  // Punkte je erledigtem Zwerg: Wirbel gibt mehr als Stomp.
  function scoreForKill(bySpin) { return bySpin ? 150 : 100; }

  // Nächste Schwierigkeitsstufe: Spawn schneller (mit Untergrenze), Gegner
  // schneller (mit Obergrenze).
  function nextRamp(spawn, speed, ramp) {
    return {
      spawn: Math.max(SPAWN_FLOOR, spawn * ramp),
      speed: Math.min(SPEED_CAP, speed + SPEED_STEP),
    };
  }

  // delta-time gegen Riesensprünge (Tab-Wechsel) deckeln.
  function clampDt(dt, cap) {
    if (cap === undefined) cap = DT_CAP;
    return dt > cap ? cap : dt;
  }

  // Status der Wirbel-Abklingzeit für die HUD-Anzeige.
  function spinStatus(spinCd, spinTimer, cooldown) {
    const ready = spinCd <= 0 && spinTimer <= 0;
    const pct = ready ? 100 : Math.round((1 - spinCd / cooldown) * 100);
    return { ready, pct };
  }

  // Deterministische Schwebe-Plattformen pro 620px-Segment im Sichtbereich.
  function computePlatforms(cameraX, viewW, groundY) {
    const list = [];
    const startSeg = Math.floor((cameraX - 200) / 620);
    const endSeg = Math.ceil((cameraX + viewW + 200) / 620);
    for (let s = startSeg; s <= endSeg; s++) {
      if (s < 1) continue;                  // Startbereich frei lassen
      if (seededRand(s) > 0.55) continue;   // nicht in jedem Segment
      const px = s * 620 + seededRand(s + 0.3) * 260;
      const pw = 130 + seededRand(s + 0.7) * 120;
      const py = groundY - (110 + seededRand(s + 0.9) * 110);
      list.push({ x: px, y: py, w: pw, h: 22 });
    }
    return list;
  }

  return {
    DIFFICULTY, SPAWN_FLOOR, SPEED_STEP, SPEED_CAP, DT_CAP,
    seededRand, clamp, rectsOverlap, isStomp, withinSpin,
    scoreForKill, nextRamp, clampDt, spinStatus, computePlatforms,
  };
});
