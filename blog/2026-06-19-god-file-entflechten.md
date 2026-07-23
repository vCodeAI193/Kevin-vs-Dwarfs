---
title: "Aufräumen ohne Angst: ein 800-Zeilen-God-File entflechten"
date: 2026-06-19
tags: [javascript, gamedev, refactoring, clean-code, testing]
project: Kevin gegen die Zwerge
---

# Aufräumen ohne Angst: ein 800-Zeilen-God-File entflechten

„Kevin gegen die Zwerge" war fertig, lief und hatte 118 grüne Tests. Aber der Code war
gewachsen: `game.js` zählte **792 Zeilen** und vermischte Eingabe, Spielregeln,
Boss-Steuerung, Scoring, den Update-Loop **und** das gesamte Rendering. Dazu vier
Spawner-Klassen, die dasselbe Muster wiederholten, und Magic Numbers über viele
Dateien verstreut.

Die Herausforderung: So etwas aufzuräumen ist riskant, gerade weil der größte Brocken
(`game.js` mit DOM/Canvas) **kaum durch Unit-Tests gedeckt** ist. Dieser Beitrag zeigt,
wie man so ein Refactoring **ohne Angst** macht — über die richtige Reihenfolge und
saubere Trennlinien.

## Das Problem / die Ausgangslage

Drei Gerüche auf einmal:

1. **God-File:** `game.js` machte alles.
2. **Duplikation:** `EnemyManager`, `CoinManager`, `ObstacleManager`, `PowerUpManager`
   hatten praktisch denselben Code (Timer hochzählen → spawnen → nach links bewegen →
   aus dem Bild gelaufene entfernen → zeichnen).
3. **Verstreute Magic Numbers:** `GROUND_Y`, Spawn-Intervalle, Power-Up-Dauern, …

## Die Lösung: risikogestaffelte Stufen

Der Trick ist, **nicht alles auf einmal** anzufassen, sondern in Stufen — von
risikoarm (test-gedeckt) zu riskant — und nach jeder Stufe zu testen und zu committen.

### Stufe 1 — Spawner entdoppeln (risikoarm)

Eine Basisklasse hebt das gemeinsame Muster heraus; Subklassen liefern nur noch die
Unterschiede über drei Hooks:

```js
class SpawnManager {
  update(dt, worldSpeed, difficulty) {
    this.timer += dt;
    if (this.timer >= this.interval(difficulty)) { this.timer = 0; this.spawn(difficulty); }
    for (const it of this.items) it.update(dt, worldSpeed);
    this.items = this.items.filter((it) => this.keep(it));
  }
  interval() { return this.cooldown; }   // override optional
  spawn() {}                              // override
  keep(it) { return it.x + it.width > -10; } // override optional
}
```

Risikoarm, weil die vier Spawner durch bestehende Tests abgesichert sind — die mussten
grün bleiben (taten sie). Öffentliche Namen wie `enemies.dwarves` blieben über
Getter/Setter erhalten.

### Stufe 2 — Konstanten zentralisieren

Ein `CONFIG`-Objekt wird zur **einen Quelle der Wahrheit** fürs Balancing; die Module
lesen daraus statt eigener Literale. Bereits benannte Konstanten bleiben als
Re-Export bestehen, damit kein Verbraucher und kein Test bricht.

### Stufe 3 — das God-File entflechten (der Knackpunkt)

Hier liegt das Risiko. Die entscheidende Einsicht, die es entschärft:

> **Rendering liest den Zustand nur — es schreibt ihn nie.**

Das ist eine perfekte Trennlinie. Der gesamte Zeichen-Code wandert in einen
`Renderer`, der pro Frame einen **read-only Snapshot** bekommt — kein geteilter
veränderbarer Zustand, keine versteckten Globals:

```js
// game.js – baut den Snapshot, ändert nichts am Renderer
function render() {
  renderer.render({
    state, distance, score, highscore, kills, coinsCollected, combo, player, boss,
    stats, lastRun, /* … */ obstacles, coins, powerups, enemies, particles, toasts,
  });
}
```

Dazu eine reine `score.js` (Score-Formel, voll testbar). Ergebnis: `game.js` schrumpft
von **792 auf 580 Zeilen**, und „was entscheidet" ist sauber von „was zeichnet"
getrennt.

## Die Test-Lücke schließen

Der Renderer lässt sich nicht als Unit testen (Canvas). Statt darauf zu vertrauen,
sichert ihn ein **headless Smoke-Harness** ab: Er lädt die echten Skripte in
Browser-Reihenfolge per *indirektem* `eval` (so ist `require` nicht sichtbar → es greift
der Browser-Zweig der Module), stubbt DOM und Canvas und lässt das Spiel starten und
**2500 Frames** laufen — inklusive Boss, Tages-Challenge und allen Screens. Läuft das
ohne Ausnahme durch, ist die Verdrahtung von Snapshot und Renderer bewiesen.

```text
OK: Ready/Erfolge/Daily/Playing gerendert, 2500+ Frames ohne Fehler
```

## Was wir daraus mitnehmen

- **Reihenfolge schlägt Mut.** Erst die test-gedeckten, risikoarmen Teile; das
  Riskante zuletzt.
- **Such die Naht.** „Liest vs. schreibt" ist eine ideale Grenze: Rendering bekommt
  einen read-only Snapshot und kann nichts kaputt machen.
- **Eine Quelle der Wahrheit.** Eine Basisklasse gegen Duplikation, eine `config.js`
  fürs Balancing.
- **Wo Unit-Tests nicht hinkommen, hilft ein Smoke-Harness.** Ein headless Lauf der
  echten Skripte über viele Frames ist billiger als die Angst, etwas anzufassen.

Nach dem Aufräumen: **131 grüne Tests**, ein 580-Zeilen-`game.js` und eine Struktur,
in der das nächste Feature seinen offensichtlichen Platz hat.

---

*Dieser Artikel ist Teil des Entwicklertagebuchs zu „Kevin gegen die Zwerge", einem
quelloffenen 2D-Jump-&-Run für den Browser.*
