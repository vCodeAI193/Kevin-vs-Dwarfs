---
title: "Eine Aktion, viele Auslöser — ein Spiel touch-tauglich machen"
date: 2026-06-16
tags: [javascript, gamedev, mobile, ux, testing]
project: Kevin gegen die Zwerge
---

# Eine Aktion, viele Auslöser — ein Spiel touch-tauglich machen

Ein Browser-Spiel, das man per Link teilt, wird die meisten Leute auf dem **Handy**
öffnen. „Kevin gegen die Zwerge" war lange voll spielbar — aber nur mit Tastatur.
Per Tippen ging gerade mal Springen; Wirbelsturm, Pause und Ton waren auf dem
wichtigsten Gerät schlicht unerreichbar.

Dieser Beitrag zeigt, wie aus „Desktop-only" mit wenig Code ein Spiel wird, das
auf Maus **und** Touch funktioniert — ohne die Spiellogik zu verdoppeln und ohne
ein einziges neues Asset.

## Das Problem / die Ausgangslage

Die gesamte Eingabe hing am `keydown`-Handler. Touch gab es nur als einen einzigen
`pointerdown` auf dem Canvas, der hart „springen" bedeutete:

```js
canvas.addEventListener("pointerdown", () => {
  if (state === "playing") doJump();
  else startGame();
});
```

Der naheliegende — und falsche — Reflex: für jeden neuen Button die passende Logik
daneben kopieren. Dann lebt dieselbe Regel („im Game-Over-Bild startet Springen das
Spiel neu") an mehreren Stellen und driftet garantiert irgendwann auseinander.

## Die Lösung

### Eine Aktion, viele Auslöser

Die Spiellogik wandert in kleine, benannte Funktionen. Jede Eingabequelle ist nur
noch ein *Auslöser*, der dieselbe Funktion aufruft:

```js
function primaryAction() {            // „springen oder starten"
  sound.resume();
  if (state === "playing") doJump();
  else if (state !== "paused") startGame();
}
function whirlwindAction() { sound.resume(); if (state === "playing") doWhirlwind(); }

// Canvas-Tap und Bildschirm-Button teilen sich primaryAction:
canvas.addEventListener("pointerdown", primaryAction);

function bindButton(id, handler) {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener("pointerdown", (e) => { e.preventDefault(); handler(); });
}
bindButton("btn-jump", primaryAction);
bindButton("btn-whirl", whirlwindAction);
bindButton("btn-pause", togglePause);
bindButton("btn-sound", toggleSound);
```

Auch die Tastatur ruft jetzt genau diese Funktionen auf. Es gibt also pro Aktion
**eine** Quelle der Wahrheit — egal ob Taste, Tap oder Button.

### Touch-Buttons nur dort, wo sie gebraucht werden

Zwei große runde Flächen liegen über den unteren Ecken des Canvas. Damit sie den
Desktop nicht zumüllen, blendet CSS sie nur auf Geräten **ohne** präzisen Zeiger ein:

```css
.touch-btn { display: none; }
@media (hover: none), (pointer: coarse) {
  .touch-btn { display: flex; }
}
```

### Polish ohne Assets

Favicon und Vorschau-Infos fürs Teilen stecken direkt im HTML — das Favicon als
Inline-SVG per Data-URI, der Rest als Meta-Tags. Kein Datei-Download, kein Build:

```html
<link rel="icon" href="data:image/svg+xml,...%E2%9A%94%EF%B8%8F..." />
<meta property="og:title" content="Kevin gegen die Zwerge" />
```

### Die Verdrahtung absichern

Bei elf einzeln per `<script>` geladenen Dateien ist „neues Modul vergessen
einzubinden" ein klassischer Fehler — und Unit-Tests sehen ihn nie, weil sie die
Module direkt importieren. Ein kleiner **Smoke-Test** liest stattdessen die
`index.html`:

```js
test("jede src/*.js ist in index.html eingebunden", () => {
  const onDisk = fs.readdirSync("src").filter(f => f.endsWith(".js")).map(f => "src/" + f);
  const referenced = referencedScripts(); // aus den <script src="...">-Tags
  for (const f of onDisk) assert.ok(referenced.includes(f), `nicht eingebunden: ${f}`);
});
```

Er prüft beide Richtungen: jedes eingebundene Skript existiert, und jede vorhandene
Datei ist eingebunden — plus, dass `game.js` zuletzt lädt.

## Was wir daraus mitnehmen

- **Eingabequellen sind nur Auslöser.** Die Logik gehört in eine gemeinsame Funktion,
  nicht in jeden Handler kopiert.
- **Responsiv heißt auch: das Richtige ausblenden.** Touch-Buttons nur bei
  `pointer: coarse` — kein Ballast für Maus-Nutzer.
- **Polish geht oft ohne Assets.** Inline-SVG-Favicon und Meta-Tags reichen für ein
  ordentliches Teilen-Erlebnis.
- **Smoke-Tests decken die Lücke der Unit-Tests.** Was die `index.html` verdrahtet,
  prüft kein Modul-Import — also die HTML selbst testen.

---

*Dieser Artikel ist Teil des Entwicklertagebuchs zu „Kevin gegen die Zwerge", einem
quelloffenen 2D-Jump-&-Run für den Browser.*
