# Feature-Ideen — 100 mögliche Erweiterungen

Ein **Ideen-/Backlog-Katalog** für „Kevin gegen die Zwerge", abgeleitet aus der
[Produktvision](../VISION.md). Das ist bewusst **nicht** die Anforderungsliste der
heutigen Software (siehe [REQUIREMENTS.md](./REQUIREMENTS.md)) und nicht die Liste der
umgesetzten Features (siehe [FEATURES.md](./FEATURES.md)) — sondern eine kuratierte
Sammlung von **100 Dingen, die man umsetzen könnte**.

### Legende

- **Aufwand:** `S` klein · `M` mittel · `L` groß (grobe Schätzung).
- **Leitplanke:** `⚠` = würde die Vision-Leitplanke *„null Abhängigkeiten / kein
  Backend / kein Build"* berühren (braucht Server, Service-Worker oder Build-Schritt).
  `—` = pur im Browser umsetzbar, passt zum aktuellen Stack.
- Wo sinnvoll, ist der Bezug zu bestehenden Mustern genannt (z. B. `DWARF_TYPES`,
  `CONFIG`, seedbarer `mulberry32`, Achievements-als-Daten).
- **Bereits umgesetzt** (✅, siehe [FEATURES.md](./FEATURES.md)): FI-003, FI-005,
  FI-030, FI-043, FI-058, FI-073, FI-074.

---

## 1 · Kern-Gameplay & Steuerung

| ID | Idee | Aufwand | Leitplanke |
|----|------|:------:|:------:|
| FI-001 | **Wandsprung**: an Hindernissen kurz abdrücken | M | — |
| FI-002 | **Ducken/Slide** unter niedrige Gefahren | M | — |
| FI-003 | ✅ **Variable Sprunghöhe** je nach Tastendruckdauer | S | — |
| FI-004 | **Dash** (kurzer Vorwärts-Spurt) mit Cooldown | M | — |
| FI-005 | ✅ **Coyote-Time & Sprung-Puffer** für faireres Timing | S | — |
| FI-006 | **Boden-Stampfer**: schnelles Fallen als Angriff | S | — |
| FI-007 | **Parry/Konter** kurz vor Aufprall (perfektes Timing) | M | — |
| FI-008 | **Doppel-Stomp-Combo** (zwei Gegner in einem Sprung) belohnt | S | — |
| FI-009 | **Lauftempo steuern** (vor-/zurücklehnen für Tempo) | M | — |
| FI-010 | **Tastenbelegung frei konfigurierbar** (Rebind) | M | — |

## 2 · Gegner & Bosse

| ID | Idee | Aufwand | Leitplanke |
|----|------|:------:|:------:|
| FI-011 | **Werfender Zwerg** (Wurfäxte aus Distanz) — neuer `DWARF_TYPES`-Eintrag | M | — |
| FI-012 | **Springender Zwerg**, dessen Sprünge man timen muss | M | — |
| FI-013 | **Fliegender Zwerg** auf Sprunghöhe | M | — |
| FI-014 | **Schild-Zwerg**, nur per Wirbelsturm/von hinten besiegbar | M | — |
| FI-015 | **Buddel-Zwerg**, taucht plötzlich aus dem Boden auf | M | — |
| FI-016 | **Gegner-Formationen/Wellen** mit kleinen Mustern | M | — |
| FI-017 | **Zweiter Boss „Steingolem"** mit Bodenschockwelle | L | — |
| FI-018 | **Boss-Rush**: mehrere Bosse nacheinander | L | — |
| FI-019 | **Elite-Varianten** normaler Zwerge (mehr HP, Glühen) | S | — |
| FI-020 | **Bestiarium** mit freischaltbaren Gegner-Einträgen | M | — |

## 3 · Power-Ups & Items

| ID | Idee | Aufwand | Leitplanke |
|----|------|:------:|:------:|
| FI-021 | **Zeitlupe** (Bullet-Time) kurzzeitig | M | — |
| FI-022 | **Sprungfeder/Rakete** für extra Höhe | S | — |
| FI-023 | **Münz-Verdoppler** (zeitlich begrenzt) | S | — |
| FI-024 | **Unverwundbarkeits-Stern** | S | — |
| FI-025 | **Sofort-Wirbelsturm-Aufladung** als Pickup | S | — |
| FI-026 | **Enterhaken** zum Überbrücken von Lücken | L | — |
| FI-027 | **Begleiter/Pet**, das Münzen einsammelt | M | — |
| FI-028 | **Mystery-Box** (Risiko: guter oder schlechter Effekt) | M | — |
| FI-029 | **Stapelbare Effekte** mit klarer Status-Anzeige | S | — |

## 4 · Welt, Biome & Hindernisse

| ID | Idee | Aufwand | Leitplanke |
|----|------|:------:|:------:|
| FI-030 | ✅ **Biom „Wüste"** mit Treibsand — neuer `BIOMES`-Eintrag | M | — |
| FI-031 | **Biom „Himmel/Wolken"** mit Wind-Schub | M | — |
| FI-032 | **Bewegliche Plattformen** | M | — |
| FI-033 | **Echte Abgründe/Lücken** (Sturz = Game Over) | M | — |
| FI-034 | **Tag-/Nacht-Wechsel** mit Sichtänderung | M | — |
| FI-035 | **Wetter** (Regen/Schnee) beeinflusst Reibung/Optik | M | — |
| FI-036 | **Zerstörbare Hindernisse** (per Wirbelsturm) | S | — |
| FI-037 | **Sprungfedern & Katapulte** im Level | S | — |
| FI-038 | **Umwelt-Gefahren** (Lavablasen, Stalaktiten) | M | — |

## 5 · Progression, Missionen & Meta

| ID | Idee | Aufwand | Leitplanke |
|----|------|:------:|:------:|
| FI-039 | **Tägliche/Wöchentliche Missionen** — Achievements-als-Daten-Muster | M | — |
| FI-040 | **XP- & Level-System** mit Freischaltungen | M | — |
| FI-041 | **Münz-Shop** für permanente Upgrades | M | — |
| FI-042 | **Prestige / New Game+** nach Meilensteinen | M | — |
| FI-043 | ✅ **Mehr Erfolge**, inkl. versteckter | S | — |
| FI-044 | **Meilenstein-Banner** bei Distanz-Schwellen | S | — |
| FI-045 | **Rekord-Splits** (beste Distanz je Biom) | S | — |
| FI-046 | **Sammelkarten/Stickeralbum** aus Läufen | M | — |
| FI-047 | **Statistik-Diagramme** (Verlauf über die Zeit) | M | — |

## 6 · Charaktere, Skins & Anpassung

| ID | Idee | Aufwand | Leitplanke |
|----|------|:------:|:------:|
| FI-048 | **Spielbare Zweitfigur** mit eigener Fähigkeit | L | — |
| FI-049 | **Skin-Shop** mit Münz-Freischaltung — `SKINS` erweitern | M | — |
| FI-050 | **Hüte/Accessoires** als separate Layer | M | — |
| FI-051 | **Anpassbare Spur-/Partikel-Trails** | S | — |
| FI-052 | **Eigene Farbpalette** für Kevin | S | — |
| FI-053 | **Seltene/animierte Skins** (Glanz-Effekt) | S | — |
| FI-054 | **Saisonale Skins** (zeitlich begrenzt) | S | — |
| FI-055 | **Skin-Vorschau** im Menü (drehbar) | S | — |

## 7 · Spielmodi

| ID | Idee | Aufwand | Leitplanke |
|----|------|:------:|:------:|
| FI-056 | **Time-Attack**: feste Strecke auf Zeit — nutzt `mulberry32` | M | — |
| FI-057 | **Hardcore/Permadeath** (1 Leben, kein Schild) | S | — |
| FI-058 | ✅ **Zen-Modus** ohne Game Over (üben) | S | — |
| FI-059 | **Wöchentliche Challenge** mit fixem Seed | S | — |
| FI-060 | **Mutatoren/Modifier** (z. B. doppeltes Tempo) | M | — |
| FI-061 | **Boss-Trainingsmodus** (Boss auf Abruf) | M | — |
| FI-062 | **Story-Kapitel** mit klaren Zielen | L | — |
| FI-063 | **„Ein-Tasten"-Modus** (alles auf eine Taste) | S | — |
| FI-064 | **Parcours-Aufgaben** mit Sternen-Wertung | M | — |

## 8 · Social & Online

| ID | Idee | Aufwand | Leitplanke |
|----|------|:------:|:------:|
| FI-065 | **Globale Online-Bestenliste** | L | ⚠ |
| FI-066 | **Tages-Bestenliste online** (gleicher Seed) | M | ⚠ |
| FI-067 | **Ghost-Replay des eigenen Rekords** (lokal) | M | — |
| FI-068 | **Ghost-Race** gegen Freundes-Replay | L | ⚠ |
| FI-069 | **Teilen-Button** (Score-Karte als Bild) | M | — |
| FI-070 | **Deep-Link mit Seed** zum Herausfordern | S | — |
| FI-071 | **Freundescode & Vergleich** | M | ⚠ |
| FI-072 | **Asynchrones Versus** (rundenbasiert über Seeds) | L | ⚠ |

## 9 · Spielgefühl / Juice / Audio-Visuell

| ID | Idee | Aufwand | Leitplanke |
|----|------|:------:|:------:|
| FI-073 | ✅ **Screen-Shake** bei Stomp/Boss-Treffer | S | — |
| FI-074 | ✅ **Hit-Stop** (kurzes Einfrieren bei Treffern) | S | — |
| FI-075 | **Dynamische Musik**, wächst mit Tempo/Combo | M | — |
| FI-076 | **Mehr SFX-Variation** (synthetisch) — `audio.js` | S | — |
| FI-077 | **Combo-Sound-Eskalation** (Tonleiter hoch) | S | — |
| FI-078 | **Zusätzliche Parallax-Ebenen** — `renderer`/`biomes` | S | — |
| FI-079 | **Vignette/Flash** bei Schild-Bruch | S | — |
| FI-080 | **Wirbelsturm-Cinematic** (Zeitlupe + Zoom) | M | — |
| FI-081 | **Animierte Deko-Kreaturen** im Hintergrund | S | — |

## 10 · UX, Barrierefreiheit & Lokalisierung

| ID | Idee | Aufwand | Leitplanke |
|----|------|:------:|:------:|
| FI-082 | **Lokalisierung (i18n)** über Sprach-JSON | M | — |
| FI-083 | **Farbenblind-Modi / hoher Kontrast** | M | — |
| FI-084 | **„Reduzierte Effekte"-Schalter** (Foto-Sensitivität) | S | — |
| FI-085 | **Skalierbare UI / größere Schrift** | S | — |
| FI-086 | **Einstellungsmenü** mit Lautstärke-Slidern | M | — |
| FI-087 | **Tutorial-Overlay** beim ersten Start | M | — |
| FI-088 | **Pausen-Menü** mit Steuerungs-Referenz | S | — |
| FI-089 | **Gamepad-Unterstützung** (Gamepad API) | M | — |

## 11 · Plattform, Technik & PWA

| ID | Idee | Aufwand | Leitplanke |
|----|------|:------:|:------:|
| FI-090 | **Installierbare PWA** (Manifest + Service Worker) | M | ⚠ |
| FI-091 | **Offline-Spielbarkeit** per Cache | M | ⚠ |
| FI-092 | **Querformat-Hinweis** & sicheres Mobile-Layout | S | — |
| FI-093 | **Haptik** (Vibration API) auf Mobile | S | — |
| FI-094 | **Debug-FPS-/Performance-Anzeige** | S | — |
| FI-095 | **Optionaler Release-Build** (Bundle/Minify) | M | ⚠ |

## 12 · Dev-Tooling, Community & Content

| ID | Idee | Aufwand | Leitplanke |
|----|------|:------:|:------:|
| FI-096 | **Level-/Seed-Editor** zum Bauen & Teilen | L | ⚠ |
| FI-097 | **Replay-Aufzeichnung** (Eingabe-Log + Seed) | M | — |
| FI-098 | **Debug-Overlay** (Hitboxen, Spawn-Timer) | S | — |
| FI-099 | **Visuelle Regressionstests** fürs Rendering (Screenshots) | M | ⚠ |
| FI-100 | **Mod-/Plugin-Hooks** für Community-Erweiterungen | L | — |

---

> Priorisierung: Die mit `—` markierten Ideen passen direkt zum aktuellen Stack
> (Vanilla JS, kein Backend) und sind die naheliegendsten nächsten Schritte. `⚠`-Ideen
> sind Teil des Vision-Nordsterns, würden aber bewusst die „null Abhängigkeiten"-
> Leitplanke erweitern — also nur additiv und optional umsetzen.
