const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");

// Alle in index.html referenzierten src/*.js einsammeln
function referencedScripts() {
  const re = /<script\s+src="(src\/[^"]+\.js)"><\/script>/g;
  const found = [];
  let m;
  while ((m = re.exec(html)) !== null) found.push(m[1]);
  return found;
}

test("alle in index.html eingebundenen Skripte existieren", () => {
  const scripts = referencedScripts();
  assert.ok(scripts.length > 0, "es sollten Skripte eingebunden sein");
  for (const s of scripts) {
    assert.ok(fs.existsSync(path.join(ROOT, s)), `fehlt: ${s}`);
  }
});

test("jede src/*.js ist in index.html eingebunden", () => {
  const onDisk = fs
    .readdirSync(path.join(ROOT, "src"))
    .filter((f) => f.endsWith(".js"))
    .map((f) => "src/" + f);
  const referenced = referencedScripts();
  for (const f of onDisk) {
    assert.ok(referenced.includes(f), `nicht in index.html eingebunden: ${f}`);
  }
});

test("game.js wird zuletzt geladen (nach seinen Abhängigkeiten)", () => {
  const scripts = referencedScripts();
  assert.equal(scripts[scripts.length - 1], "src/game.js");
});

test("die Bedien-Buttons sind im HTML vorhanden", () => {
  for (const id of ["btn-jump", "btn-whirl", "btn-pause", "btn-sound"]) {
    assert.ok(html.includes(`id="${id}"`), `Button fehlt: ${id}`);
  }
});
