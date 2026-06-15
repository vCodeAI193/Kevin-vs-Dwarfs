# Kevin gegen die Zwerge — Spielvision

## Pitch

> **Kevin gegen die Zwerge** ist ein rasantes 2D-Jump-&-Run für den Browser:
> Kevin rennt unaufhaltsam durch eine Welt voller Zwerge, hüpft ihnen auf den Kopf
> und entfesselt — wenn genug Wut aufgestaut ist — den verheerenden **Wirbelsturm**.
> Es endet erst, wenn Kevin fällt. Wie weit kommst du?

Ein Endlos-Runner mit "nur-noch-ein-Versuch"-Sog: leicht zu lernen, schwer zu meistern,
und mit einem Spezialangriff, der den richtigen Moment belohnt.

## Spielgefühl

- **Schnell & flüssig** — Kevin bewegt sich von links nach rechts, das Tempo zieht an.
- **Witzig & cartoonhaft** — bunte 2D-Optik, übertriebene Animationen, schwungvolle Effekte.
- **Belohnend** — jeder besiegte Zwerg bringt Kevin näher an den Wirbelsturm; gutes Timing
  fühlt sich mächtig an.

## Die Hauptfigur: Kevin

Kevin ist der unerschrockene Held des Spiels — flink, sprungstark und mit einem
ordentlichen Temperament. Je mehr Zwerge er besiegt, desto wütender (und stärker)
wird er, bis er sich in einen wirbelnden Sturm verwandelt.

## Kern-Gameplay-Loop

1. **Laufen** — Kevin bewegt sich nach rechts, die Welt scrollt endlos durch.
2. **Springen** — über Lücken, Hindernisse und auf Gegner.
3. **Zwerge besiegen (Stomp)** — springt Kevin einem Zwerg von oben auf den Kopf,
   ist der Zwerg weg. Das ist die Hauptangriffsform.
4. **Überleben** — ein seitlicher Zusammenstoß mit einem Zwerg oder ein Sturz in eine
   Lücke beendet den Lauf (**Game Over**).
5. **Punkten** — der Score wächst mit der zurückgelegten Distanz und den besiegten Zwergen.

Das Spiel hat **kein Ende** — es läuft immer weiter und wird stetig schwerer, bis Kevin verliert.

## Der Wirbelsturm (Spezial-Mechanik)

Kevins besonderer, starker Angriff:

- Eine **Power-Leiste** füllt sich mit jedem besiegten Zwerg.
- Ist die Leiste voll, kann der Spieler den **Wirbelsturm** auslösen.
- Beim Wirbelsturm dreht sich Kevin wie ein Tornado und **wirft alle Zwerge im Umkreis
  für einige Sekunden um** — sie sind betäubt und können in dieser Zeit gefahrlos
  passiert oder besiegt werden.
- **Risiko vs. Belohnung:** Spart man den Wirbelsturm für eine große Zwerg-Gruppe auf
  (mehr Wirkung), oder nutzt man ihn sofort, um eine brenzlige Situation zu überleben?

Der Wirbelsturm ist das Herzstück des "Stärker-werden"-Gefühls: Wer offensiv spielt
und viele Zwerge besiegt, wird mit Macht belohnt.

## Progression & Schwierigkeit

- Mit zunehmender Distanz steigen **Laufgeschwindigkeit** und **Zwerg-Dichte**.
- Später (Ausbaustufe): unterschiedliche Zwerg-Typen, schwierigere Sprungpassagen.
- **Score** = Distanz + besiegte Zwerge. Ziel: den eigenen Rekord schlagen.

## Look & Feel

- 2D-Seitenansicht (Side-Scroller) im Cartoon-Stil.
- Parallax-Hintergründe für Tiefe (z.B. Berge, Wald, Höhlen).
- Klare, lesbare Silhouetten für Kevin und die Zwerge, damit Gefahr sofort erkennbar ist.
- Deutliche visuelle Effekte für Stomp und besonders für den Wirbelsturm.

## Steuerung (Web-Browser)

**Tastatur:**
- `→` / `D` — laufen / beschleunigen
- `Leertaste` / `↑` / `W` — springen
- `Shift` / `F` — **Wirbelsturm** auslösen (wenn Leiste voll)

**Mobile (optional, spätere Ausbaustufe):** Touch-Buttons für Sprung und Wirbelsturm.

## Umfang des ersten Spiels (MVP)

**Enthalten:**
- Endloses Laufen nach rechts mit Springen.
- Eine Zwerg-Sorte, besiegbar per Stomp.
- Power-Leiste + Wirbelsturm.
- Score-Anzeige, Game-Over-Screen, Neustart.

**Bewusst noch NICHT enthalten (spätere Ausbaustufen):**
- Story / Level-Welten
- Bosskämpfe
- Mehrere Zwerg-Typen & Power-Ups
- Online-Bestenliste

## Zukunftsideen

- Verschiedene Zwerg-Typen (z.B. werfende, springende, gepanzerte Zwerge).
- Power-Ups (Doppelsprung, Schild, Magnet für Sammelobjekte).
- Bosskämpfe als Meilensteine im endlosen Lauf.
- Lokale & Online-Bestenliste, tägliche Herausforderungen.
- Sammelbare Münzen/Edelsteine und freischaltbare Skins für Kevin.

---

Technische Umsetzung & Prototyp-Roadmap: siehe [`README.md`](./README.md).
