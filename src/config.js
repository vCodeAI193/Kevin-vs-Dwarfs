/**
 * Zentrale Spiel-Konstanten ("Magic Numbers") an einem Ort – erleichtert das
 * Balancing und macht die Werte auffindbar. Module lesen aus CONFIG, statt eigene
 * Literale zu halten. (Kern-Physik des Spielers bleibt bewusst in player.js, weil
 * sie dort eng zusammengehört.)
 */
const CONFIG = {
  GROUND_Y: 330,

  // Welt-Tempo: Startgeschwindigkeit, Anstieg und wie schnell die Schwierigkeit wächst
  world: { startSpeed: 4, speedRamp: 1.4, difficultyDivisor: 12 },

  // Boss: Distanz zwischen Kämpfen und Basis-Lebenspunkte
  boss: { interval: 1500, baseHp: 4 },

  // Spawn-Abstände (Sekunden) der vier Spawner
  spawn: {
    enemyCooldown: 1.2,
    obstacleCooldown: 2.6,
    coinCooldown: 1.8,
    powerupCooldown: 11,
  },

  // Spielgefühl/Fairness beim Springen
  player: {
    coyoteTime: 0.1, // Sekunden, in denen man nach dem Verlassen der Kante noch springen darf
    jumpBufferTime: 0.12, // Sekunden, in denen ein zu früher Sprung gepuffert wird
    jumpCutMultiplier: 0.45, // beim Loslassen wird die Aufwärts-Geschwindigkeit gekappt
  },

  // Screen-Shake: maximaler Versatz (px) und Abklingrate (Trauma/Sekunde)
  shake: { maxOffset: 12, decay: 1.8 },

  // Hit-Stop: Einfrier-Dauer (Sekunden) je Trefferart
  hitstop: { stomp: 0.04, boss: 0.07 },

  // Power-Up-Dauern (Sekunden) und Magnet-Reichweite
  powerUp: { doublejump: 9, shield: 7, magnet: 8, magnetRadius: 220 },

  // Combo: Zeitfenster (Sekunden) und maximaler Multiplikator
  combo: { window: 2.5, maxMultiplier: 8 },

  // Münzen: Punktwert und Power-Gewinn
  coin: { value: 25, power: 5 },

  // Distanz pro Biom (danach Schleife)
  biomeLength: 2000,
};

if (typeof window !== "undefined") window.CONFIG = CONFIG;
if (typeof module !== "undefined" && module.exports) module.exports = { CONFIG };
