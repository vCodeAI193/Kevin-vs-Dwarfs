---
title: "Eine tägliche Challenge fast geschenkt — dank injiziertem Zufall"
date: 2026-06-18
tags: [javascript, gamedev, prng, testing, architecture]
project: Kevin gegen die Zwerge
---

# Eine tägliche Challenge fast geschenkt — dank injiziertem Zufall

„Tägliche Challenge" klingt nach einem dicken Feature: Alle bekommen am selben Tag
denselben Parcours, jeder versucht seine beste Punktzahl, man vergleicht sich. In
„Kevin gegen die Zwerge" war es am Ende ein **RNG-Proxy** und ein ~30-Zeilen-Modul –
weil eine frühere Architektur-Entscheidung die ganze Arbeit schon erledigt hatte.

Die Kernidee: Eine deterministische Welt entsteht, sobald man den **Zufall**
kontrolliert. Und das geht nur, wenn der Zufall nicht überall fest verdrahtet ist,
sondern injiziert wird.

## Das Problem / die Ausgangslage

Ein endloser Runner ist purer Zufall: Welcher Zwerg-Typ kommt, wo liegen Münzen,
wann ein Hindernis. Damit zwei Menschen denselben Parcours spielen, müssen sie
**dieselbe Zufallsfolge** bekommen. `Math.random()` kann das nicht — es ist nicht
seedbar und nicht reproduzierbar.

Die naheliegende Sorge: Jeder Spawner ruft doch `Math.random()` auf — müsste man die
jetzt alle umbauen? Das wäre fehleranfällig und würde überall ins Gameplay greifen.

## Die Lösung

### Ein deterministischer PRNG

Zuerst ein kleiner, seedbarer Generator — `mulberry32` ist winzig und für Spiele mehr
als gut genug:

```js
// src/daily.js
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
```

Der Tages-Seed ist einfach das UTC-Datum als Zahl — überall auf der Welt am selben
Kalendertag identisch:

```js
function dailySeedFromDate(date) {
  return date.getUTCFullYear() * 10000 + (date.getUTCMonth() + 1) * 100 + date.getUTCDate();
}
```

### Der Trick: ein RNG-Proxy statt Umbau

Hier zahlte sich eine frühere Entscheidung aus. Alle Spawner nehmen ihren Zufall
bereits **als Parameter** entgegen (`new EnemyManager(W, GROUND_Y, rng)`). Statt jeden
Manager neu zu erzeugen oder umzubauen, genügt ein Proxy, der auf eine umschaltbare
Quelle zeigt:

```js
// src/game.js
let activeRng = Math.random;
const rngProxy = () => activeRng();

const enemies   = new EnemyManager(W, GROUND_Y, rngProxy);
const coins     = new CoinManager(W, GROUND_Y, rngProxy);
const obstacles = new ObstacleManager(W, GROUND_Y, rngProxy);
const powerups  = new PowerUpManager(W, GROUND_Y, rngProxy);
```

Beim Start eines Laufs wird nur die *Quelle* getauscht — kein Manager merkt etwas
davon:

```js
function startGame() {
  if (dailyMode) {
    const seed = todaySeed();
    activeRng = mulberry32(seed);        // deterministisch
    dailyBest = loadDailyBest(storage, seed);
  } else {
    activeRng = Math.random;             // normaler Modus
  }
  // ... Reset & los
}
```

Das war's. Im Tages-Modus erzeugen alle Spawner exakt dieselbe Abfolge von Gegnern,
Münzen und Hindernissen — für jeden, der an diesem Tag spielt.

### Alles Pure ist sofort testbar

PRNG und Seed sind reine Funktionen, also Einzeiler-Tests:

```js
const a = mulberry32(12345), b = mulberry32(12345);
for (let i = 0; i < 20; i++) assert.equal(a(), b());          // gleicher Seed -> gleiche Folge

assert.equal(dailySeedFromDate(new Date(Date.UTC(2026, 5, 17))), 20260617);
```

Dazu eine getrennte Tages-Bestmarke pro Seed (`kvd_daily_<seed>`), damit gestern und
heute sich nicht ins Gehege kommen — ebenfalls mit einem Mock-Storage geprüft.

## Was wir daraus mitnehmen

- **Determinismus = kontrollierter Zufall.** Sobald der Zufall seedbar und injiziert
  ist, sind reproduzierbare Welten (Daily, Replays, Tests) fast geschenkt.
- **Ein Proxy schlägt einen Umbau.** Eine umschaltbare Quelle hinter `() => activeRng()`
  tauscht das halbe Spiel-Subsystem, ohne eine einzige Manager-Zeile zu ändern.
- **Frühe Injektion verzinst sich.** Die Entscheidung, `rng` von Anfang an
  durchzureichen, machte dieses Feature winzig.
- **`mulberry32` reicht.** Für Spiele braucht es keinen kryptografischen RNG — klein,
  schnell, deterministisch genügt.

Mit diesem Schritt stehen **107 grüne Tests** — und „Kevin gegen die Zwerge" hat einen
Grund, jeden Tag noch einmal reinzuschauen.

---

*Dieser Artikel ist Teil des Entwicklertagebuchs zu „Kevin gegen die Zwerge", einem
quelloffenen 2D-Jump-&-Run für den Browser.*
