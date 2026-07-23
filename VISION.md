# Kevin gegen die Zwerge — Produktvision

## Pitch

> **Kevin gegen die Zwerge** ist ein rasantes 2D-Endlos-Jump-&-Run für den Browser:
> Kevin rennt unaufhaltsam durch eine Welt voller Zwerge, hüpft ihnen auf den Kopf,
> sammelt Münzen, weicht Hämmern des Zwergenkönigs aus und entfesselt — wenn genug
> Wut aufgestaut ist — den verheerenden **Wirbelsturm**. Es endet erst, wenn Kevin
> fällt. Wie weit kommst du?

Ein Endlos-Runner mit „nur-noch-ein-Versuch"-Sog: in Sekunden gestartet, leicht zu
lernen, schwer zu meistern — mit genug Tiefe, um immer wieder zurückzukehren.

## Produktziel (Nordstern in einem Satz)

> Das **beste sofort spielbare, abhängigkeitsfreie Jump-&-Run im Browser** zu sein —
> in Sekunden geladen, auf jedem Gerät spielbar, mit dem Sog eines Arcade-Klassikers
> und genug Progression, um täglich zurückzukehren.

Alles, was wir bauen, dient diesem Ziel: maximaler Spaß bei minimaler Hürde.

## Spielgefühl & Designprinzipien

- **Sofort spielbar** — eine `index.html` öffnen, Leertaste, los. Kein Download, kein
  Konto, kein Setup.
- **Schnell & fair** — das Tempo zieht an, aber jede Gefahr ist lesbar und vermeidbar;
  ein Tod fühlt sich nach „mein Fehler" an, nicht nach Willkür.
- **Saftig (juicy)** — Sound, Partikel, Bildschirm-Hinweise und Effekte geben jedem
  Treffer Gewicht.
- **Risiko & Belohnung** — Wirbelsturm aufsparen oder retten? Combo halten oder auf
  Nummer sicher gehen? Gutes Spiel wird belohnt.
- **Tiefe statt Breite** — wenige Tasten, aber viele Meister-Momente.

## Die Hauptfigur: Kevin

Kevin ist der unerschrockene Held — flink, sprungstark und mit ordentlichem
Temperament. Je mehr Zwerge er besiegt, desto wütender und stärker wird er, bis er
sich in einen wirbelnden Sturm verwandelt.

## Kern-Gameplay-Loop

1. **Laufen** — Kevin steht fest, die Welt scrollt endlos an ihm vorbei.
2. **Springen** — über Hindernisse, Lücken und auf Gegner (`player.js`).
3. **Stompen** — von oben auf einen Zwerg springen besiegt ihn; seitlicher Kontakt
   beendet den Lauf (`collision.js`, `enemies.js`).
4. **Wirbelsturm** — bei voller Power-Leiste alle nahen Zwerge umwerfen (`player.js`).
5. **Überleben & Punkten** — der Score wächst mit Distanz, Kills, Münzen, Combos und
   besiegten Bossen; das Spiel wird endlos schwerer, bis Kevin fällt.

## Was das Spiel heute kann (realisierte Vision)

Aus der ursprünglichen MVP-Idee ist ein vollwertiges Arcade-Spiel geworden. Was die
erste Vision noch als „Zukunftsidee" führte, ist heute Realität:

**Kampf & Gegner**
- Stomp als Hauptangriff, **Wirbelsturm** als aufladbarer Spezialangriff.
- **Zwerg-Typen:** normal, schnell und gepanzert (nur per Wirbelsturm besiegbar) — `enemies.js`.

**Gefahren**
- **Hindernisse** (Felsen) zum Drüberspringen — `obstacles.js`.
- **Wurfgeschosse** des Bosses (Hämmer) — `projectile.js`.

**Bosskampf**
- **Mehrphasiger Zwergenkönig:** wird mit sinkenden Lebenspunkten schneller und wirft
  ab Phase 2 Hämmer; bringt einen Score-Bonus — `boss.js`.

**Progression im Lauf**
- **Combo-System** mit Score-Multiplikator für schnelle Kill-Ketten — `combo.js`.
- **Biome & Parallax**, die mit der Distanz wechseln (Wiese → Höhle → Lava → Eis) — `biomes.js`.
- Stetig steigende Geschwindigkeit und Gegnerdichte.

**Sammeln & Power-Ups**
- **Münzen** für Punkte und Extra-Power, mit **Magnet**-Anziehung — `collectibles.js`.
- **Power-Ups:** Doppelsprung, Schild (fängt einen tödlichen Treffer ab) und Magnet — `powerups.js`.

**Meta-Progression (dauerhaft gespeichert)**
- **Highscore** — `storage.js`.
- **Lifetime-Statistiken** über alle Läufe — `stats.js`.
- **Erfolge/Achievements** mit Live-Freischaltung und Übersichts-Screen — `achievements.js`.
- **Skins für Kevin**, per Highscore freischaltbar — `skins.js`.
- **Tägliche Challenge** mit festem Seed (gleicher Parcours für alle) und Tages-Bestmarke — `daily.js`.

**Spielgefühl**
- Synthetischer **Sound** ohne Audiodateien (`audio.js`), **Partikel** (`particles.js`),
  **Toast-Hinweise** für Erfolge und Boss-Phasen (`toast.js`).

**Plattform & Bedienung**
- **Tastatur und Touch**: Bildschirm-Buttons (springen, Wirbelsturm, Pause, Ton,
  Skin, Tages-Challenge, Erfolge), responsives Canvas, Inline-SVG-Favicon — `index.html`, `game.js`.

## Technische Leitplanken („wie es gebaut sein soll")

Diese Prinzipien sind Teil der Vision — sie halten das Projekt schlank und wartbar:

- **Vanilla JS + HTML5 Canvas, null Laufzeit-Abhängigkeiten.** Läuft sofort, überall.
- **Logik getrennt von Darstellung.** Entscheidungen leben in puren Funktionen/Modulen,
  nicht im Render-Loop — das macht alles testbar.
- **Dependency-Injection.** Zufall (`rng`) und Speicher werden hineingereicht; dadurch
  ist selbst zufalls-/browserabhängige Logik deterministisch testbar (und die
  Tages-Challenge war fast geschenkt).
- **Tests als Pflicht.** Aktuell **118 Unit-Tests** über `node --test`, plus ein
  Smoke-Test der `index.html` — ausgeführt in CI (GitHub Actions) bei jedem Push.
- **Lebendige Dokumentation.** Ein Entwickler-Logbuch (`LESSONS_LEARNED.md`) und
  ausformulierte Artikel (`blog/`) begleiten jede größere Entscheidung.

## Nordstern — große Langzeitziele

Wohin die Reise gehen kann, wenn das Fundament trägt:

- **Online-Bestenlisten** — globale und Tages-Ranglisten; sich mit Freunden am selben
  Tages-Parcours messen.
- **Story- / Kampagnen-Modus** — handgebaute Welten mit eigenen Bossen und einem Ziel,
  ergänzend zum Endlos-Modus.
- **Level-Editor & teilbare Seeds** — eigene Strecken bauen und per Link/Seed teilen.
- **Mehrspieler** — Ghost-Races gegen die Geister anderer Läufe; später Echtzeit-Versus.
- **Installierbare App (PWA) & Mobile** — offline spielbar, vom Homescreen startbar.
- **Charakter- & Skin-Shop** — mehr Helden und Looks, freispielbar über Erfolge/Münzen
  (niemals Pay-to-win).
- **Barrierefreiheit & Lokalisierung** — Farbenblind-Modi, reduzierte Effekte,
  mehrsprachige Oberfläche.

## Leitprinzipien & Nicht-Ziele

- **Bleibt sofort spielbar.** Kein schweres Engine-/Build-Setup wird zur Pflicht.
- **Kein Pay-to-win, keine Dark Patterns.** Fortschritt kommt aus Können, nicht aus
  der Brieftasche.
- **Keine Pflicht-Accounts** für den Kernspaß; Online-Funktionen bleiben optional.
- **Qualität ist nicht verhandelbar.** Neue Features kommen mit Tests; grünes CI bleibt
  Voraussetzung.

## Erfolgskriterien

Woran wir merken, dass die Vision aufgeht:

- **Sog:** Spieler starten unmittelbar einen neuen Versuch nach dem Game Over.
- **Hürde:** vom Link zum ersten Sprung in unter ein paar Sekunden, auf jedem Gerät.
- **Wiederkehr:** die Tages-Challenge und Erfolge bringen Spieler regelmäßig zurück.
- **Vertrauen in den Code:** Tests sind grün, neue Features brechen nichts.
- **Faire Kurve:** Niederlagen fühlen sich verdient an, Fortschritt spürbar.

---

Technik, Steuerung und Tests: siehe [`README.md`](./README.md).
Entwicklungs-Logbuch und Artikel: siehe [`LESSONS_LEARNED.md`](./LESSONS_LEARNED.md) und [`blog/`](./blog/).
