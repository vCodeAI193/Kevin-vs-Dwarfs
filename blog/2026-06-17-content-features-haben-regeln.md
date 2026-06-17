---
title: "Auch Content hat Regeln — Combos, Biome und Skins testbar bauen"
date: 2026-06-17
tags: [javascript, gamedev, testing, game-design, architecture]
project: Kevin gegen die Zwerge
---

# Auch Content hat Regeln — Combos, Biome und Skins testbar bauen

Irgendwann ist ein Spiel „fertig" — es läuft, es ist fair, es hat einen Boss. Was
dann kommt, ist **Wiederspielwert**: Mechaniken, die zum „nur noch ein Versuch"
verleiten. Für „Kevin gegen die Zwerge" waren das drei Dinge auf einmal: ein
**Combo-System**, wechselnde **Biome** und freischaltbare **Skins**.

Auf den ersten Blick wirken zwei davon wie reiner „Content" — Biome sind ja nur
Farben, Skins nur andere Farben. Die Pointe dieses Beitrags: Auch solche
Content-Features haben eine **Regel** im Kern. Und Regeln gehören in pure Funktionen,
nicht in den Render-Loop — sonst sind sie nicht testbar und die zentrale Spieldatei
wuchert.

## Das Problem / die Ausgangslage

Die drei Features klingen unabhängig, hängen aber alle an einem einzigen Wert:

- **Combo** und **Biom** richten sich nach **Distanz/Score**,
- **Skins** schalten sich nach dem **Highscore** frei.

Der bequeme Weg wäre, das alles direkt in den großen `game.js`-Loop zu schreiben:
ein `if (distance > 2000) sky = "#2c2a3a"` hier, ein `if (best > 3000) ...` dort. Das
funktioniert — bis die Datei unübersichtlich ist und niemand mehr ohne das Spiel zu
starten beantworten kann: „Welches Biom kommt bei 4000? Welcher Skin ist ab 3000
Punkten frei?"

## Die Lösung

Jede Regel bekommt ihr eigenes kleines, reines Modul. `game.js` *ruft nur auf* und
zeichnet.

### Biome: eine Funktion statt verstreuter if-Ketten

```js
// src/biomes.js
const BIOME_LENGTH = 2000;
const BIOMES = [
  { name: "Wiese", sky: "#87b7e8", /* ... */ },
  { name: "Höhle", sky: "#2c2a3a", /* ... */ },
  { name: "Lava",  sky: "#3a1410", /* ... */ },
  { name: "Eis",   sky: "#cfe8ff", /* ... */ },
];

function getBiome(distance) {
  const idx = Math.floor(Math.max(0, distance) / BIOME_LENGTH) % BIOMES.length;
  return BIOMES[idx];
}
```

Eine Funktion, ein Rückgabewert, kein Zustand. Der Test ist trivial — und prüft genau
die Grenzfälle, an denen man sich sonst verzählt:

```js
assert.equal(getBiomeIndex(BIOME_LENGTH - 1), 0); // kurz davor
assert.equal(getBiomeIndex(BIOME_LENGTH), 1);      // genau an der Grenze
assert.equal(getBiomeIndex(-500), 0);              // Unsinn -> erstes Biom
```

### Skins: Freischaltung ist eine reine Abfrage

```js
// src/skins.js
function unlockedSkins(bestScore) {
  return SKINS.filter((s) => bestScore >= s.unlock);
}
function nextUnlockedSkin(currentId, bestScore) {
  const unlocked = unlockedSkins(bestScore);
  const idx = unlocked.findIndex((s) => s.id === currentId);
  return unlocked[(idx + 1) % unlocked.length];
}
```

Welcher Skin ab wann verfügbar ist, ist damit eine Daten- und keine Code-Frage — und
das Durchschalten kreist sauber nur durch das Freigeschaltete:

```js
// bei Highscore 0 ist nur der Gratis-Skin frei -> bleibt dort
assert.equal(nextUnlockedSkin(SKINS[0].id, 0).id, SKINS[0].id);
// mit genug Score geht es zum nächsten
assert.equal(nextUnlockedSkin(SKINS[0].id, 100000).id, SKINS[1].id);
```

### Combo: der einzige mit echtem Zustand

Das Combo-System hat als einziges einen Timer — und bleibt trotzdem ein winziges,
isoliertes Objekt mit einer klaren Regel: schnell genug nachlegen, sonst Reset.

```js
// src/combo.js
add() { this.count++; this.timer = this.window; return this.multiplier; }
get multiplier() { return this.count <= 1 ? 1 : Math.min(this.count, 8); }
update(dt) { if (this.timer > 0 && (this.timer -= dt) <= 0) this.reset(); }
```

```js
c.add(); c.add();          // 2 schnelle Kills
assert.equal(c.multiplier, 2);
c.update(3.0);             // Fenster verstrichen
assert.equal(c.multiplier, 1);
```

Im Spiel verbindet `game.js` die Teile: Bei jedem Kill `combo.add()` und der Bonus
fließt in den Score; `getBiome(distance)` bestimmt die Hintergrundfarben; der
Skin-Button schaltet via `nextUnlockedSkin` durch. Drei Zeilen Integration statt drei
verstreuter Regelwerke.

## Was wir daraus mitnehmen

- **„Content" hat fast immer eine Regel.** Wann wechselt das Biom, wann ist ein Skin
  frei — das ist Logik, kein Dekor.
- **Regeln gehören in pure Funktionen.** `getBiome(distance)` und
  `unlockedSkins(best)` sind ohne laufendes Spiel testbar — Balance wird nachjustierbar.
- **Der Loop ruft nur auf.** Neue Features lassen `game.js` kaum wachsen, wenn ihre
  Regeln woanders wohnen.
- **Grenzfälle zuerst testen.** Genau an „eins davor / genau an der Grenze" verzählt
  man sich — ein Dreizeiler-Test fängt es für immer.

Nach diesem Schritt sind es **86 grüne Tests** — und das Spiel hat spürbar mehr Sog,
ohne dass die zentrale Datei aus den Nähten platzt.

---

*Dieser Artikel ist Teil des Entwicklertagebuchs zu „Kevin gegen die Zwerge", einem
quelloffenen 2D-Jump-&-Run für den Browser.*
