const { test } = require("node:test");
const assert = require("node:assert/strict");
const { Player } = require("../src/player.js");

const GROUND_Y = 330;

function freshPlayer() {
  return new Player(GROUND_Y);
}

test("Player startet am Boden mit leerer Power-Leiste", () => {
  const p = freshPlayer();
  assert.equal(p.onGround, true);
  assert.equal(p.power, 0);
  assert.equal(p.y, GROUND_Y - p.height);
  assert.equal(p.whirlActive, false);
});

test("jump() gibt nur vom Boden aus Schub", () => {
  const p = freshPlayer();
  p.jump();
  assert.equal(p.onGround, false);
  assert.equal(p.vy, -p.jumpForce);

  // In der Luft kein zweiter Sprung
  p.vy = 5;
  p.jump();
  assert.equal(p.vy, 5);
});

test("update() wendet Schwerkraft an und landet am Boden", () => {
  const p = freshPlayer();
  p.jump();
  // Genug Frames simulieren, bis Kevin wieder landet
  for (let i = 0; i < 200 && !p.onGround; i++) p.update(1 / 60);
  assert.equal(p.onGround, true);
  assert.equal(p.vy, 0);
  assert.equal(p.y, GROUND_Y - p.height);
});

test("addKillPower() erhöht und deckelt bei powerMax", () => {
  const p = freshPlayer();
  p.addKillPower();
  assert.equal(p.power, p.powerPerKill);
  for (let i = 0; i < 20; i++) p.addKillPower();
  assert.equal(p.power, p.powerMax);
  assert.equal(p.powerFull, true);
});

test("triggerWhirlwind() nur bei voller Leiste, verbraucht Power", () => {
  const p = freshPlayer();
  assert.equal(p.triggerWhirlwind(), false); // Leiste leer

  while (!p.powerFull) p.addKillPower();
  assert.equal(p.triggerWhirlwind(), true);
  assert.equal(p.power, 0);
  assert.equal(p.whirlActive, true);
});

test("Wirbelsturm-Animation läuft nach whirlVisualTime ab", () => {
  const p = freshPlayer();
  while (!p.powerFull) p.addKillPower();
  p.triggerWhirlwind();
  // Mehr als whirlVisualTime simulieren
  const steps = Math.ceil(p.whirlVisualTime / (1 / 60)) + 5;
  for (let i = 0; i < steps; i++) p.update(1 / 60);
  assert.equal(p.whirlActive, false);
});

test("reset() setzt Power und Position zurück", () => {
  const p = freshPlayer();
  p.jump();
  p.addKillPower();
  p.reset();
  assert.equal(p.power, 0);
  assert.equal(p.onGround, true);
  assert.equal(p.vy, 0);
});

test("ohne Power-Up gibt es keinen zweiten Sprung in der Luft", () => {
  const p = freshPlayer();
  assert.equal(p.jump(), true); // vom Boden
  assert.equal(p.jump(), false); // in der Luft, kein Doppelsprung
});

test("Doppelsprung-Power-Up erlaubt genau einen zweiten Sprung", () => {
  const p = freshPlayer();
  p.activatePowerUp("doublejump");
  assert.equal(p.jump(), true); // 1. Sprung
  assert.equal(p.jump(), true); // 2. Sprung (Doppelsprung)
  assert.equal(p.jump(), false); // kein dritter
});

test("activatePowerUp setzt die jeweiligen Flags und läuft ab", () => {
  const p = freshPlayer();
  p.activatePowerUp("shield");
  p.activatePowerUp("magnet");
  assert.equal(p.hasShield, true);
  assert.equal(p.hasMagnet, true);
  // unbekannter Typ wird abgelehnt
  assert.equal(p.activatePowerUp("quatsch"), false);
  // Timer laufen ab
  for (let i = 0; i < 60 * 10; i++) p.update(1 / 60);
  assert.equal(p.hasShield, false);
  assert.equal(p.hasMagnet, false);
});

test("consumeShield verbraucht den Schild genau einmal", () => {
  const p = freshPlayer();
  assert.equal(p.consumeShield(), false); // kein Schild
  p.activatePowerUp("shield");
  assert.equal(p.consumeShield(), true);
  assert.equal(p.hasShield, false);
  assert.equal(p.consumeShield(), false);
});

test("grantInvulnerability schützt für die angegebene Zeit", () => {
  const p = freshPlayer();
  p.grantInvulnerability(1.0);
  assert.equal(p.invulnerable, true);
  for (let i = 0; i < 70; i++) p.update(1 / 60);
  assert.equal(p.invulnerable, false);
});

test("Coyote-Time: kurz nach dem Verlassen der Kante ist ein Sprung noch möglich", () => {
  const p = freshPlayer();
  // einen Frame am Boden updaten -> coyoteTimer wird aufgefüllt
  p.update(1 / 60);
  assert.ok(p.coyoteTimer > 0);
  // künstlich von der Kante "fallen": nicht am Boden, aber coyote noch aktiv
  p.onGround = false;
  assert.equal(p.jump(), true); // dank Coyote-Time
});

test("Coyote-Time läuft ab: ohne Boden und ohne Fenster kein Sprung", () => {
  const p = freshPlayer();
  p.onGround = false;
  p.coyoteTimer = 0;
  assert.equal(p.jump(), false);
});

test("Sprung-Puffer: ein zu früher Sprung wird bei der Landung ausgeführt", () => {
  const p = freshPlayer();
  // in der Luft, kurz vor der Landung
  p.onGround = false;
  p.coyoteTimer = 0;
  p.y = p.groundY - p.height - 2; // knapp über dem Boden
  p.vy = 5;
  assert.equal(p.jump(), false); // jetzt nicht möglich -> gepuffert
  assert.ok(p.jumpBufferTimer > 0);
  p.update(1 / 60); // landet -> gepufferter Sprung greift
  assert.ok(p.vy < 0, "sollte direkt wieder abspringen");
  assert.equal(p.onGround, false);
});

test("variable Sprunghöhe: cutJump kappt den Aufstieg", () => {
  const p = freshPlayer();
  p.jump(); // vy = -jumpForce
  const before = p.vy;
  p.cutJump();
  assert.ok(p.vy > before); // näher an 0 (weniger negativ)
  assert.ok(p.vy < 0);
});

test("cutJump beim Fallen hat keinen Effekt", () => {
  const p = freshPlayer();
  p.vy = 5;
  p.cutJump();
  assert.equal(p.vy, 5);
});
