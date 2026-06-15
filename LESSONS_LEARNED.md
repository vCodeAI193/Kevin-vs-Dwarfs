# Lessons Learned — Kevin gegen die Zwerge

> Ein wachsendes Logbuch über die Entwicklung des Spiels: Was schiefging, welche
> Entscheidungen sich bewährt haben und was wir daraus mitnehmen. Geschrieben so,
> dass sich einzelne Einträge ohne viel Umbau als **Blogbeitrag** verwenden lassen.
>
> Neue Erkenntnisse einfach unten als neuen Eintrag anhängen — Format siehe Vorlage.

---

## So benutzt du dieses Logbuch

Jeder Eintrag folgt demselben Muster, damit er für sich allein lesbar ist:

```markdown
### YYYY-MM-DD — Kurzer, sprechender Titel

**Situation:** Worum ging es gerade?
**Problem / Fehler:** Was lief schief oder war unklar?
**Lösung:** Was haben wir konkret getan?
**Lektion:** Die eine Erkenntnis zum Mitnehmen.
```

---

## Einträge

### 2026-06-15 — Erst die Vision, dann der Code

**Situation:** Das Projekt startete als komplett leeres Repository (nur eine
`LICENSE`). Die Idee zum Spiel existierte nur als gesprochene Beschreibung.

**Problem / Fehler:** Es war verlockend, sofort loszuprogrammieren. Aber Begriffe
wie „der starke Spezialangriff" hatten noch keinen Namen, und es war unklar, für
welche Plattform überhaupt gebaut werden soll.

**Lösung:** Bevor eine einzige Zeile Spielcode entstand, wurden eine `VISION.md`
(Spielgefühl, Kern-Loop, Mechaniken) und eine Roadmap im `README.md` (Meilensteine
M0–M4) geschrieben. Offene Fragen — Plattform (Web/HTML5), Name des Spezialangriffs
(**Wirbelsturm**) — wurden vorab geklärt.

**Lektion:** Ein paar Minuten Vision und gezielte Rückfragen sparen Stunden an
Umbau. Ein benanntes Konzept (`Wirbelsturm` statt „der starke Angriff") macht
Code und Gespräche sofort eindeutig.

---

### 2026-06-15 — Testbarkeit nicht nachträglich, sondern eingeplant

**Situation:** Der erste Prototyp lief im Browser: Spieler-Physik, Zwerge und die
gesamte Kollisions-Logik steckten zusammen in `game.js`.

**Problem / Fehler:** Als Unit-Tests dazukommen sollten, ging das zunächst nicht.
Zwei konkrete Hürden:
1. Die Klassen (`Player`, `Dwarf`, `EnemyManager`) waren nur an `window` gehängt —
   in Node (außerhalb des Browsers) nicht ladbar.
2. Die Kern-Logik wie die Stomp-Erkennung lag in einer `(function(){ ... })()`-
   Kapselung (IIFE) **innerhalb** von `game.js` und war von außen unerreichbar.

**Lösung:**
- Den Klassen einen doppelten Export gegeben:
  `if (typeof module !== "undefined") module.exports = { ... }` zusätzlich zu
  `window`. So laufen sie im Browser **und** unter Node.
- Die reine Logik (`rectsOverlap`, `isStomp`) in eine eigene `src/collision.js`
  extrahiert — frei von Canvas/DOM und damit direkt testbar.
- Ergebnis: 22 Unit-Tests mit dem **eingebauten** Node-Test-Runner, ganz ohne
  zusätzliche Abhängigkeiten.

**Lektion:** Logik, die etwas „entscheidet" (Treffer? Stomp? betäubt?), gehört
getrennt von Code, der nur „zeichnet". Wer Spiellogik von Anfang an von der
Darstellung trennt, bekommt Tests fast geschenkt — statt später refaktorieren zu
müssen.

---

### 2026-06-15 — Bewusst ohne Build-Tool und ohne Abhängigkeiten

**Situation:** Für einen Web-Prototyp gibt es unzählige Setups (Bundler,
Frameworks, Test-Bibliotheken).

**Problem / Fehler:** Jede Abhängigkeit ist Einrichtungsaufwand, eine potenzielle
Fehlerquelle und eine Hürde für „mach einfach mal auf und spiel".

**Lösung:** HTML5 Canvas + reines JavaScript, eingebunden über einfache
`<script>`-Tags in fester Reihenfolge. Tests über `node --test` (seit Node 18 an
Bord). Die `index.html` lässt sich sogar per Doppelklick öffnen.

**Lektion:** Für einen Prototyp ist „läuft sofort, null Setup" oft mehr wert als
„technisch elegant". Komplexität kann man später nachrüsten, wenn sie sich lohnt —
und der Wechsel auf eine Engine bleibt jederzeit möglich.

---

### 2026-06-15 — Kleine Design-Entscheidungen früh festhalten

**Situation:** Beim Bauen tauchten Detailfragen auf, die in der Vision noch offen
waren — etwa: Läuft Kevin automatisch, oder steuert man ihn?

**Problem / Fehler:** Solche Mikro-Entscheidungen verschwinden leicht im Code und
sind später schwer nachzuvollziehen („Warum scrollt eigentlich die Welt statt
Kevin?").

**Lösung:** Kevin bleibt an einer festen Bildschirmposition, die **Welt scrollt**
nach links. Das vereinfacht Kamera und Kollisionen erheblich. Solche Punkte werden
in Vision/README als „offene Punkte" markiert, damit sie bewusst getroffen und
dokumentiert sind.

**Lektion:** Auch kleine Architektur-Entscheidungen kurz festhalten. Das „Warum"
ist später oft wertvoller als das „Was".

---

## Wiederkehrende Erkenntnisse (Kurzfassung für den Blog)

- **Vision vor Code.** Erst benennen, dann bauen.
- **Entscheiden ≠ Zeichnen.** Spiellogik von der Darstellung trennen — das macht
  Tests einfach.
- **So wenig Setup wie möglich.** Bei Prototypen schlägt „läuft sofort" oft
  „technisch perfekt".
- **Das Warum dokumentieren.** Entscheidungen altern besser als ihr Code.
