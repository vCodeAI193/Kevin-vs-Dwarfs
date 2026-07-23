---
title: "Erfolge sind Daten, kein Code — Achievements sauber modellieren"
date: 2026-06-17
tags: [javascript, gamedev, testing, architecture, game-design]
project: Kevin gegen die Zwerge
---

# Erfolge sind Daten, kein Code — Achievements sauber modellieren

Statistiken und Erfolge (Achievements) sind das Salz eines Endlos-Spiels: Sie geben
Gründe weiterzuspielen, auch wenn ein einzelner Lauf vorbei ist. Sie sind aber auch
eine klassische Falle: Kaum jemand plant sie, also wandern „immer wenn X passiert,
prüfe ob Y"-Checks quer durch den Spielcode — und werden unwartbar.

Dieser Beitrag zeigt am Endlos-Runner „Kevin gegen die Zwerge", wie man Erfolge als
**Daten mit einer Bedingung** über einer sauberen Statistik-Schicht modelliert. Das
Ergebnis: jede Regel ist ein Einzeiler-Test, und neue Erfolge brauchen **keine**
Änderung am Spielcode.

## Das Problem / die Ausgangslage

Der naheliegende — und schmerzhafte — Weg sieht so aus:

```js
// verstreut im Spielcode ... bitte nicht
function onDwarfDefeated() {
  killsTotal++;
  if (killsTotal === 100 && !hasAchievement("centurion")) unlock("centurion");
  if (combo === 8 && !hasAchievement("combo8")) unlock("combo8");
  // ... und an jeder weiteren Stelle dasselbe Spiel
}
```

Die Erfolgs-Bedingungen kleben an Ereignissen, sind über viele Funktionen verteilt
und schwer zu testen. Schlimmer: Manche Erfolge sind **lauf-übergreifend** („100
Zwerge insgesamt") — mit Event-Checks vergisst man solche Fälle leicht.

## Die Lösung

Zwei Schichten, beide rein und testbar.

### 1. Eine Statistik-Schicht, die am Ende des Laufs verrechnet

Statt an zehn Stellen mitzuzählen, fasst der Spielcode einen Lauf zu **einem**
Ergebnisobjekt zusammen und verrechnet es genau einmal:

```js
// src/stats.js
function mergeRun(stats, run) {
  return {
    runs: stats.runs + 1,
    totalKills: stats.totalKills + (run.kills || 0),
    totalCoins: stats.totalCoins + (run.coins || 0),
    bossesDefeated: stats.bossesDefeated + (run.bosses || 0),
    bestCombo: Math.max(stats.bestCombo, run.maxCombo || 0),
    bestDistance: Math.max(stats.bestDistance, Math.floor(run.distance || 0)),
    // ...
  };
}
```

`mergeRun` ist eine pure Funktion: Eingabe rein, neue Statistik raus, das Original
bleibt unverändert. Das macht sie trivial testbar — inklusive „verändert das Original
nicht".

### 2. Erfolge als Daten mit einem Prädikat

Ein Erfolg ist kein Ablauf, sondern eine **Frage an die Statistik**:

```js
// src/achievements.js
const ACHIEVEMENTS = [
  { id: "centurion",    name: "Zwergenschreck", desc: "Besiege 100 Zwerge",      test: (s) => s.totalKills >= 100 },
  { id: "combo_master", name: "Wirbelwind",     desc: "Erreiche eine Combo 8×",   test: (s) => s.bestCombo >= 8 },
  { id: "boss_slayer",  name: "Königsmörder",   desc: "Besiege 5 Bosse",          test: (s) => s.bossesDefeated >= 5 },
  // neue Erfolge = neue Zeile, kein Spielcode-Eingriff
];

function evaluateAchievements(stats) {
  return ACHIEVEMENTS.filter((a) => a.test(stats)).map((a) => a.id);
}

function newlyUnlocked(prevUnlocked, stats) {
  const now = evaluateAchievements(stats);
  return now.filter((id) => !prevUnlocked.includes(id));
}
```

Der gesamte Spielcode braucht jetzt **eine** Stelle — beim Game Over:

```js
stats = mergeRun(stats, lastRun);
saveStats(storage, stats);

const fresh = newlyUnlocked(unlockedAchievements, stats);
if (fresh.length) { /* anzeigen + persistieren */ }
```

### Testen wird zum Einzeiler

Weil beide Schichten pur sind, prüft man Regeln ohne laufendes Spiel:

```js
assert.deepEqual(evaluateAchievements(emptyStats()), []);          // nichts geschenkt
assert.ok(evaluateAchievements({ ...emptyStats(), totalKills: 100 }).includes("centurion"));

const fresh = newlyUnlocked([], { ...emptyStats(), totalKills: 1 });
assert.deepEqual(fresh, ["first_blood"]);
assert.deepEqual(newlyUnlocked(["first_blood"], { ...emptyStats(), totalKills: 1 }), []); // nicht doppelt
```

## Was wir daraus mitnehmen

- **Erfolge sind eine Abfrage über dem Zustand, kein Ereignis-Code.** Modelliere sie
  als Daten (`{ id, test }`), nicht als verstreute if-Blöcke.
- **Am Ende des Laufs verrechnen schlägt überall mitzählen.** Ein `mergeRun` statt
  zehn Inkrement-Stellen — auch lauf-übergreifende Erfolge stimmen dann automatisch.
- **Pure Schichten = triviale Tests.** Statistik und Erfolge sind ohne Browser und
  ohne Spielstart prüfbar.
- **Neue Inhalte ohne Risiko.** Ein weiterer Erfolg ist eine neue Zeile in einem
  Array — der Spielcode bleibt unangetastet.

Mit dieser Trennung wuchs die Test-Suite auf **100 grüne Tests**, und „Kevin gegen die
Zwerge" hat jetzt eine Meta-Progression, die man gefahrlos weiter ausbauen kann.

---

*Dieser Artikel ist Teil des Entwicklertagebuchs zu „Kevin gegen die Zwerge", einem
quelloffenen 2D-Jump-&-Run für den Browser.*
