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

### 2026-06-15 — Ein Feature-Schub und warum Zufall Tests bricht

**Situation:** Auf einen Schlag kamen viele Features dazu: Münzen + Highscore,
Zwerg-Typen (normal/schnell/gepanzert), Hindernisse, Sound, Partikel und Pause.
Jedes davon ist ein eigenes kleines Modul (`collectibles.js`, `obstacles.js`,
`particles.js`, `audio.js`, `storage.js`).

**Problem / Fehler:** Beim ersten Testlauf scheiterte genau ein Test —
`pickDwarfType` lieferte bei „Schwierigkeit 0" ein `"fast"` statt des erwarteten
`"normal"`. Ursache war nicht der Code, sondern der **Test**: Die Spawn-Funktion
nutzt `Math.random`, und es gibt bewusst schon am Anfang eine kleine 5%-Chance auf
schnelle Zwerge. Die Test-Annahme „am Anfang immer normal" war schlicht falsch.

**Lösung:** Zwei Dinge, die sich bewährt haben:
1. **Zufall injizierbar machen.** Alle Spawner und das Partikelsystem nehmen einen
   `rng`-Parameter (Standard: `Math.random`). Im Spiel bleibt es zufällig, im Test
   übergibt man `() => 0.0` und bekommt deterministisches Verhalten.
2. **Externe Abhängigkeiten als Parameter.** Die Highscore-Funktionen bekommen das
   `storage`-Objekt übergeben statt direkt auf `localStorage` zuzugreifen — so lässt
   sich mit einem winzigen Mock testen, ganz ohne Browser.

**Lektion:** Nicht-Determinismus (Zufall, Uhrzeit, Speicher, Netz) gehört an den
Rand gedrängt und **per Parameter injiziert**. Dann ist Logik mit Zufall genauso
einfach zu testen wie reine Mathematik. Und: Ein roter Test heißt nicht automatisch
„Code kaputt" — manchmal ist die Annahme im Test das Problem.

---

### 2026-06-15 — Soundeffekte ohne eine einzige Audiodatei

**Situation:** Das Spiel sollte Sound bekommen — aber Audiodateien hätten das
„null Abhängigkeiten, eine `index.html`"-Prinzip aufgeweicht.

**Problem / Fehler:** Audiodateien müssten beschafft, lizenziert, geladen und
ausgeliefert werden. Außerdem laufen Tests unter Node, wo es keinen `AudioContext`
gibt — ein direkter Zugriff würde dort sofort krachen.

**Lösung:** Die Effekte werden **synthetisch** mit der Web Audio API erzeugt
(Oszillatoren + kurze Hüllkurven). Kein einziges Asset. Der `SoundFX` prüft, ob ein
`AudioContext` verfügbar ist, und ist andernfalls (z. B. unter Node) ein lautloser
No-Op — so stören die Soundroutinen die Tests nicht.

**Lektion:** Effekte müssen nicht immer aus Dateien kommen. Für ein kleines Spiel
sind synthetische Sounds gratis, sofort da und halten das Projekt schlank. Und:
Browser-only-APIs immer hinter eine Verfügbarkeitsprüfung legen, damit derselbe Code
auch headless überlebt.

---

### 2026-06-16 — Der Boss, der Kevin nie erreichte

**Situation:** Power-Ups (Doppelsprung, Schild, Magnet) und ein Bosskampf kamen
dazu. Der Boss sollte von rechts hereinlaufen, stehen bleiben und sich von Kevin
anspringen lassen.

**Problem / Fehler:** Schon beim Code-Review – nicht erst im Test – fiel auf: Kevin
steht **fest** bei x≈130, und die Welt scrollt an ihm vorbei. Der Boss aber sollte
bei x≈570 „stehen bleiben". Zwei Objekte, die sich nie am selben Ort befinden,
können nicht kollidieren – der Bosskampf wäre komplett unspielbar gewesen, ohne dass
ein einziger Test fehlgeschlagen wäre (die Unit-Tests prüften nur HP und Timer, nicht
die Geometrie zweier bewegter Objekte).

**Lösung:** Der Boss bleibt nicht stehen, sondern **patrouilliert horizontal** durch
Kevins Position. Steht Kevin am Boden, wenn der Boss heranrückt, muss er springen –
und im Fallen landet er auf dem Kopf (Stomp = Treffer). Damit das nicht wieder still
durchrutscht, prüft jetzt ein Test gezielt, dass der Boss bis `x <= 130` vordringt.

**Lektion:** Beim festen Helden mit scrollender Welt muss man ständig die Frage
stellen „treffen sich diese beiden x-Koordinaten überhaupt jemals?". Und: Unit-Tests
für Einzelobjekte fangen **Beziehungs-Bugs** zwischen Objekten nicht – dafür braucht
es entweder einen Integrationstest oder, wie hier, ein wachsames Code-Review und
einen gezielten Test auf die räumliche Beziehung.

---

### 2026-06-16 — Vom Desktop-Spiel zum Handy-Spiel: eine Eingabequelle, drei Wege

**Situation:** Das Spiel war voll spielbar — aber nur mit Tastatur. Auf dem Handy
ließ sich per Tippen nur springen; Wirbelsturm, Pause und Ton waren unerreichbar.
Damit war ein Browser-Spiel, das man per Link teilt, auf dem wichtigsten Gerät kaputt.

**Problem / Fehler:** Der naheliegende Reflex wäre, die Touch-Logik einfach neben die
Tastatur-Logik zu kopieren. Dann gäbe es zwei Stellen mit denselben Spielregeln
(„im Game-Over-Bild startet Springen neu"), die mit der Zeit auseinanderdriften.

**Lösung:** Eine **Aktion, viele Auslöser**. Die eigentliche Logik liegt in kleinen
Funktionen (`primaryAction`, `whirlwindAction`, `togglePause`, `toggleSound`), und
Tastatur, Canvas-Tap und die neuen Bildschirm-Buttons rufen alle dieselben Funktionen
auf. Die Touch-Buttons (springen/Wirbelsturm) blendet CSS nur auf Geräten ohne Maus
ein – via `@media (pointer: coarse)`. Favicon und Open-Graph-Daten stecken als Inline-
SVG bzw. Meta-Tags direkt im HTML, also weiterhin **ohne ein einziges Asset**.

Zusätzlich kam ein **Smoke-Test** dazu: Er liest `index.html`, prüft, dass jede
eingebundene `src/*.js` existiert – und umgekehrt, dass jede Datei auch eingebunden
ist. Genau der „ich hab das neue Skript vergessen einzubinden"-Fehler wird so
unmöglich.

**Lektion:** Eingabe-Quellen (Taste, Maus, Touch, Button) sind nur *Auslöser* – die
Spiellogik gehört in eine gemeinsame Funktion, nicht in jeden Handler kopiert. Und:
Ein winziger Smoke-Test über die `index.html` sichert die Verdrahtung ab, die die
Unit-Tests per Definition nicht sehen.

---

### 2026-06-17 — Tiefe statt Breite: drei Features, die sich Daten teilen

**Situation:** Das Spiel war funktional fertig. Jetzt ging es um Wiederspielwert:
Combo-System, Biome und freischaltbare Skins.

**Problem / Fehler:** Diese drei Features klingen unabhängig – tatsächlich hängen
sie aber am selben Wert: Combo und Biom an der **Distanz/Score**, die Skins am
**Highscore**. Die Versuchung ist, jede neue Mechanik direkt im großen `game.js`-Loop
zu verdrahten. Dann wächst die zentrale Datei weiter, und die Logik („ab welcher
Distanz welches Biom?", „ab welchem Score welcher Skin?") ist nicht mehr isoliert
testbar.

**Lösung:** Konsequent dem etablierten Muster gefolgt – pro Feature ein kleines,
reines Modul: `combo.js` (Zähler + Multiplikator + Zeitfenster), `biomes.js` (eine
pure Funktion `getBiome(distance)`) und `skins.js` (`unlockedSkins(bestScore)`,
`nextUnlockedSkin(...)`). `game.js` ruft nur auf und zeichnet. Jede Frage – „welches
Biom bei 4000?", „welcher Skin ab 3000 Punkten?" – ist damit ein Einzeiler-Test, ganz
ohne Spiel zu starten. 18 neue Tests, alle grün.

**Lektion:** Auch reine „Content"-Features (Biome, Skins) haben eine **Regel** im
Kern – und Regeln gehören in pure Funktionen, nicht in den Render-Loop. Das hält die
zentrale Datei stabil und macht jede Balance-Entscheidung testbar und nachjustierbar.

---

### 2026-06-17 — Erfolge ohne Wenn-dann-Wirrwarr: Daten statt Code

**Situation:** Für mehr Langzeit-Motivation kamen dauerhafte Statistiken und Erfolge
(Achievements) dazu: „100 Zwerge besiegt", „Combo 8×", „5 Bosse" usw.

**Problem / Fehler:** Achievements verleiten zu Code wie „immer wenn ein Zwerg stirbt,
prüfe, ob es der 100. war, und schalte dann …". Das streut die Erfolgs-Bedingungen
quer durch den Spielcode, ist schwer testbar und vergisst leicht Fälle (was, wenn man
über mehrere Läufe hinweg 100 erreicht?).

**Lösung:** Strikte Trennung. Eine reine Statistik-Schicht (`stats.js`) verrechnet am
Ende jedes Laufs **ein** Ergebnisobjekt in die Gesamtwerte (`mergeRun`). Die Erfolge
(`achievements.js`) sind nur **Daten mit einer Bedingung** über diesen Statistiken:
`{ id, name, desc, test: (s) => s.totalKills >= 100 }`. Eine Funktion
`newlyUnlocked(prev, stats)` liefert genau die neu erfüllten Erfolge. Der Spielcode
ruft das an einer einzigen Stelle (Game Over) auf – keine verstreuten Checks.

**Lektion:** Erfolge sind kein Ablauf, sondern eine **Abfrage über dem Zustand**. Wer
sie als Daten + Prädikat über einer sauberen Statistik-Schicht modelliert, kann jede
Bedingung als Einzeiler testen und neue Erfolge hinzufügen, ohne den Spielcode
anzufassen. „Verrechnen am Ende des Laufs" schlägt „mitzählen an zehn Stellen".

---

### 2026-06-18 — Die Tages-Challenge, die fast gratis war

**Situation:** Eine tägliche Challenge sollte her: Alle bekommen am selben Tag
denselben Parcours und können ihre Tages-Bestmarke vergleichen.

**Problem / Fehler:** Das klingt nach einer großen Sache – eigentlich braucht es nur
zwei Zutaten: einen **deterministischen** Zufallsgenerator (gleicher Seed → gleiche
Folge) und einen Weg, ihn überall dort einzusetzen, wo bisher `Math.random` lief. Die
Falle: Hätten die Spawner `Math.random` fest verdrahtet, müsste man jetzt jeden
einzelnen anfassen.

**Lösung:** Genau hier zahlte sich eine frühere Entscheidung aus – alle Spawner
nehmen ihren Zufall schon als Parameter entgegen (siehe Eintrag „Zufall injizieren").
Es genügte ein **RNG-Proxy** in `game.js`: Die Manager bekommen `() => activeRng()`,
und beim Start eines Laufs zeigt `activeRng` entweder auf `Math.random` oder – im
Tages-Modus – auf `mulberry32(todaySeed())`. Kein Manager musste geändert werden. Der
PRNG (`mulberry32`, ~6 Zeilen) und der Tages-Seed (`JJJJMMTT` aus dem UTC-Datum) sind
beide pur und damit direkt testbar: „gleicher Seed → gleiche Folge", „Werte in [0,1)".

**Lektion:** Gute frühe Entscheidungen verzinsen sich. Weil Zufall von Anfang an
injizierbar war, wurde aus einem vermeintlich großen Feature ein kleiner Proxy plus
ein winziges, vollständig getestetes Modul. Wer Abhängigkeiten injiziert, kann später
ganze Subsysteme (hier: die Zufallsquelle) austauschen, ohne den Kern anzufassen.

---

### 2026-06-18 — Der grüne Test, der trotzdem log: kurzlebige Objekte richtig prüfen

**Situation:** Der Boss bekam Phasen und Wurfangriffe (Hämmer). Ein Test sollte
sicherstellen, dass er ab Phase 2 wirft.

**Problem / Fehler:** Der Test lief den Boss vier Sekunden lang und prüfte am Ende
`b.projectiles.length > 0` – und schlug fehl. Der erste Reflex: „Der Boss wirft nicht."
Falsch. Ein kurzer Direkt-Test zeigte: `updateThrows()` erzeugt sehr wohl Projektile.
Sie sind nur **kurzlebig** – sie fliegen aus dem Bild und werden wieder entfernt.
Zum Zeitpunkt der Prüfung am Ende war die Liste längst wieder leer. Der Test maß einen
Momentwert eines transienten Zustands.

**Lösung:** Statt am Ende einen Schnappschuss zu nehmen, **beobachtet** der Test jetzt
über die ganze Laufzeit: „Gab es *jemals* ein Projektil, und flog es nach links?" Ein
`everThrown`-Flag über die Schleife fängt das transiente Ereignis zuverlässig.

**Lektion:** Bei kurzlebigen Objekten (Projektile, Partikel, Toasts) prüft ein
Momentaufnahme-Assert das Falsche. Teste das **Ereignis über die Zeit** („trat es
auf?"), nicht den Zustand zu einem willkürlichen Zeitpunkt. Und: Wenn ein Test
fehlschlägt, erst die Annahme mit einem 3-Zeilen-Direkttest prüfen, bevor man den
Produktivcode verdächtigt.

---

### 2026-06-19 — Aufräumen ohne Angst: ein 800-Zeilen-File entflechten

**Situation:** Das Spiel war fertig und mit 118 Tests abgesichert, aber gewachsen:
`game.js` hatte 792 Zeilen und mischte Eingabe, Regeln, Boss, Scoring, Loop **und**
das gesamte Rendering. Vier Spawner-Klassen wiederholten dasselbe Muster, und
Magic Numbers lagen verstreut.

**Problem / Fehler:** Ein großer Umbau eines funktionierenden Spiels ist riskant –
besonders, weil `game.js` (DOM/Canvas) kaum durch Unit-Tests gedeckt ist. Ein
unvorsichtiges Refactoring hätte still etwas kaputt machen können.

**Lösung:** In **risikogestaffelten Stufen**, nach jeder Stufe getestet & committet:
1. Gemeinsame `SpawnManager`-Basisklasse (test-gedeckt, risikoarm).
2. Konstanten in `config.js` zentralisiert.
3. `game.js` entflochten: reine `score.js`-Logik (neue Tests) und – der Knackpunkt –
   das gesamte Rendering in `renderer.js`. Schlüssel-Einsicht: **Rendering liest den
   Zustand nur, es schreibt ihn nie.** Also bekommt der Renderer pro Frame einen
   read-only Snapshot – kein geteilter veränderbarer Zustand, keine versteckten
   Globals. `game.js` schrumpfte von 792 auf 580 Zeilen.

Da der Renderer nicht unit-testbar ist, sicherte ihn ein **headless Smoke-Harness** ab:
echte Skripte in Browser-Reihenfolge per indirektem `eval` (damit kein `require`
sichtbar ist), DOM/Canvas gestubbt, 2500 Frames inkl. Boss & aller Screens – fehlerfrei.

**Lektion:** Refactoring ist eine Frage der Reihenfolge und der Trennlinien. Erst die
test-gedeckten, risikoarmen Teile; das Riskante zuletzt und entlang einer sauberen
Naht (hier: „liest" vs. „schreibt"). Wo Unit-Tests nicht reichen, schließt ein kleiner
Integrations-/Smoke-Harness die Lücke – günstiger als die Angst, etwas anzufassen.

---

### 2026-06-20 — Spielgefühl ist Logik: Coyote-Time, Puffer & Shake testbar bauen

**Situation:** Aus dem 100-Ideen-Katalog kam ein „Game-Feel"-Batch: Coyote-Time,
Sprung-Puffer, variable Sprunghöhe und Screen-Shake — plus ein neues Biom.

**Problem / Fehler:** „Spielgefühl" klingt nach etwas, das man nur *erfühlen* und nicht
testen kann. Tatsächlich sind es aber präzise Regeln über der Zeit: „noch X ms nach der
Kante springbar", „gepufferter Sprung greift bei der Landung", „Aufstieg beim Loslassen
kappen", „Trauma klingt mit Rate Y ab". Die Gefahr war außerdem, die bestehenden,
schon getesteten Sprung-Tests zu brechen.

**Lösung:** Die neuen Regeln in `player.js` so eingebaut, dass das alte Verhalten exakt
erhalten bleibt (Coyote-Timer wird beim Springen genullt, damit ein direkt
nachfolgender Sprung in der Luft nicht „gratis" feuert) — die vorhandenen Tests blieben
unverändert grün. Den Screen-Shake als eigenes, **deterministisches** Modul
(`screenshake.js`) mit Trauma-Modell und sinus-basiertem Versatz (kein `Math.random`) →
direkt unit-testbar (Trauma deckeln, abklingen, Versatz ≤ Maximum). Den Shake im
Renderer nur auf die **Spielobjekte** gelegt, nicht auf Hintergrund/HUD — so gibt es
keine Randlücken und das HUD bleibt ruhig lesbar.

**Lektion:** „Juice" ist kein Bauchgefühl, sondern testbare Logik. Wer die Regel hinter
dem Effekt benennt (Zeitfenster, Abklingrate, Kappung), kann sie als pure Funktion
prüfen — und Effekte deterministisch statt zufällig bauen, damit sie reproduzierbar
sind. Und: Beim Erweitern getesteter Logik zuerst überlegen, welche Altannahme der neue
Pfad verletzen könnte (hier der „zweite Gratis-Sprung").

---

## Wiederkehrende Erkenntnisse (Kurzfassung für den Blog)

- **Vision vor Code.** Erst benennen, dann bauen.
- **Entscheiden ≠ Zeichnen.** Spiellogik von der Darstellung trennen — das macht
  Tests einfach.
- **So wenig Setup wie möglich.** Bei Prototypen schlägt „läuft sofort" oft
  „technisch perfekt".
- **Das Warum dokumentieren.** Entscheidungen altern besser als ihr Code.
- **Zufall injizieren.** Wer `rng` und Speicher als Parameter übergibt, kann auch
  zufallsbehaftete Logik deterministisch testen.
- **Browser-APIs absichern.** Hinter eine Verfügbarkeitsprüfung legen, dann läuft
  derselbe Code im Browser und headless in den Tests.
- **Beziehungs-Bugs brauchen eigene Tests.** Grüne Unit-Tests pro Objekt heißen
  nicht, dass zwei Objekte je zueinanderfinden – Geometrie zwischen ihnen extra prüfen.
- **Eine Aktion, viele Auslöser.** Taste, Tap und Button rufen dieselbe Funktion –
  Logik nie pro Eingabequelle kopieren.
- **Verdrahtung smoke-testen.** Ein Test über die `index.html` fängt vergessene
  `<script>`-Tags, die Unit-Tests nie bemerken.
- **Injektion verzinst sich.** Wer früh Abhängigkeiten (Zufall, Speicher) als
  Parameter reinreicht, kann später ganze Subsysteme über einen Proxy austauschen –
  die Tages-Challenge war dadurch fast geschenkt.
- **Kurzlebiges über die Zeit testen.** Bei Projektilen/Partikeln das *Ereignis*
  („trat es je auf?") prüfen, nicht den Zustand zu einem willkürlichen Zeitpunkt.
- **Refactoring in Stufen, entlang sauberer Nähte.** Erst test-gedeckt & risikoarm,
  Riskantes zuletzt; Rendering vom Zustand trennen über einen read-only Snapshot.
- **Smoke-Harness schließt die Test-Lücke.** Was Unit-Tests nicht erreichen (Canvas),
  fängt ein headless Lauf der echten Skripte über viele Frames.
- **„Juice" ist testbare Logik.** Coyote-Time, Sprung-Puffer, Trauma-Shake sind Regeln
  über der Zeit — als pure, deterministische Module bauen (kein `Math.random`).
