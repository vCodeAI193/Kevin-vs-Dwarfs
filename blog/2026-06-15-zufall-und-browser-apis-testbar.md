---
title: "Zufall, Sound und localStorage testbar machen — ohne Browser"
date: 2026-06-15
tags: [javascript, gamedev, testing, web-audio, dependency-injection]
project: Kevin gegen die Zwerge
---

# Zufall, Sound und localStorage testbar machen — ohne Browser

Ein Spiel lebt von Dingen, die sich schlecht testen lassen: **Zufall** (wo spawnt
der nächste Gegner?), **Sound** und **gespeicherte Highscores**. Genau diese drei
gelten als „untestbar, weil sie ja vom Browser/Glück abhängen". Stimmt aber nicht.
Mit einem einzigen Prinzip — *Abhängigkeiten injizieren* — werden alle drei zu
ganz normalen Unit-Tests. Und das ganz ohne Test-Framework, nur mit `node --test`.

Dieser Beitrag zeigt das an einem frischen Feature-Schub für den Endlos-Runner
**„Kevin gegen die Zwerge"**: Münzen, ein Highscore, verschiedene Zwerg-Typen,
Hindernisse, Partikel und Soundeffekte kamen auf einmal dazu.

## Das Problem / die Ausgangslage

Direkt beim ersten Testlauf nach dem Feature-Schub leuchtete ein Test rot:

```
not ok - pickDwarfType: bei difficulty 0 immer normal
  'fast' !== 'normal'
```

Die Funktion wählt den Zwerg-Typ und nutzt dafür `Math.random()`. Schon ganz am
Anfang gibt es bewusst eine kleine Chance auf schnelle Zwerge — der Test hatte nur
die falsche Annahme. Aber wie testet man eine Funktion sinnvoll, deren Ergebnis von
`Math.random()` abhängt? Und wie testet man Sound (`AudioContext`) oder den
Highscore (`localStorage`), wenn es beides unter Node gar nicht gibt?

## Die Lösung

Das gemeinsame Muster heißt **Dependency Injection**: Alles, was nicht-deterministisch
oder umgebungsabhängig ist, wird nicht *im* Code beschafft, sondern *hineingereicht*.

### 1. Zufall als Parameter

Statt `Math.random()` fest zu verdrahten, nimmt die Funktion eine `rng`-Funktion an —
mit `Math.random` als Standard. Im Spiel bleibt alles zufällig, im Test wird der
Zufall zur Konstante:

```js
// src/enemies.js
function pickDwarfType(difficulty, rng = Math.random) {
  const r = rng();
  const fastChance = Math.min(0.35, 0.05 + difficulty * 0.04);
  const armoredChance = Math.min(0.25, difficulty * 0.03);
  if (r < armoredChance) return "armored";
  if (r < armoredChance + fastChance) return "fast";
  return "normal";
}
```

```js
// tests/enemies.test.js — deterministisch dank festem rng
assert.equal(pickDwarfType(10, () => 0.0), "armored");
assert.equal(pickDwarfType(0, () => 0.99), "normal");
```

Dasselbe gilt für die Spawner und das Partikelsystem — alle bekommen ihr `rng`
hereingereicht und sind dadurch im Test vollständig vorhersagbar.

### 2. Speicher als Parameter

Die Highscore-Funktionen greifen nicht direkt auf `localStorage` zu, sondern
bekommen ein `storage`-Objekt übergeben:

```js
// src/storage.js
function saveHighscore(storage, score) {
  const best = loadHighscore(storage);
  if (score <= best) return best;
  try { if (storage) storage.setItem("kvd_highscore", String(score)); }
  catch (e) { /* privater Modus o. Ä. – egal */ }
  return score;
}
```

Im Test reicht ein winziger Mock — kein Browser, kein jsdom:

```js
function mockStorage(initial = {}) {
  const map = { ...initial };
  return {
    getItem: (k) => (k in map ? map[k] : null),
    setItem: (k, v) => { map[k] = String(v); },
  };
}

saveHighscore(mockStorage(), 100); // -> 100, persistiert im Mock
```

### 3. Browser-only-APIs absichern

Sound entsteht synthetisch über die Web Audio API — kein einziges Audio-Asset. Damit
derselbe Code aber auch headless (in den Tests) überlebt, prüft `SoundFX` zuerst, ob
ein `AudioContext` überhaupt existiert, und wird sonst zum lautlosen No-Op:

```js
this.available =
  typeof window !== "undefined" &&
  !!(window.AudioContext || window.webkitAudioContext);
// _ensure() gibt null zurück, wenn nichts verfügbar ist -> alle Sounds tun nichts
```

So muss der Game-Code beim Abspielen nicht ständig „läuft das gerade im Browser?"
fragen — er ruft einfach `sound.jump()`, und unter Node passiert eben nichts.

## Was wir daraus mitnehmen

- **Nicht-Determinismus an den Rand drängen.** Zufall, Zeit, Speicher und Netz als
  Parameter hereinreichen — dann ist Logik mit Zufall so testbar wie reine Mathematik.
- **Ein fester `rng` macht Tests deterministisch.** `() => 0.0` statt `Math.random`
  im Test, fertig.
- **Mocks schlagen schwere Test-Umgebungen.** Ein 5-Zeilen-`storage`-Mock spart eine
  komplette Browser-Simulation.
- **Browser-APIs hinter eine Verfügbarkeitsprüfung legen.** Derselbe Code läuft im
  Browser und in der CI — ohne `if (browser)` an jeder Aufrufstelle.
- **Ein roter Test ≠ kaputter Code.** Manchmal ist die Annahme im Test das Problem.

Nach dem Umbau sind aus dem ursprünglichen Prototyp **48 grüne Tests** geworden — und
kein einziges npm-Paket war dafür nötig.

---

*Dieser Artikel ist Teil des Entwicklertagebuchs zu „Kevin gegen die Zwerge", einem
quelloffenen 2D-Jump-&-Run für den Browser.*
