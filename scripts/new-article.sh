#!/usr/bin/env bash
#
# Legt aus der Vorlage einen neuen Blog-Artikel an und trägt ihn in den Index ein.
#
# Verwendung:
#   scripts/new-article.sh "kurzer-slug" "Der Titel des Artikels"
#
# Beispiel:
#   scripts/new-article.sh "wirbelsturm-balancing" "Den Wirbelsturm ausbalancieren"

set -euo pipefail

if [ "$#" -lt 2 ]; then
  echo "Verwendung: $0 <slug> <titel>" >&2
  echo 'Beispiel:   '"$0"' "wirbelsturm-balancing" "Den Wirbelsturm ausbalancieren"' >&2
  exit 1
fi

SLUG="$1"
TITLE="$2"
DATE="$(date +%Y-%m-%d)"

# Projektwurzel relativ zu diesem Skript bestimmen
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BLOG_DIR="$ROOT/blog"
TEMPLATE="$BLOG_DIR/_TEMPLATE.md"
TARGET="$BLOG_DIR/$DATE-$SLUG.md"
INDEX="$BLOG_DIR/README.md"

if [ ! -f "$TEMPLATE" ]; then
  echo "Vorlage nicht gefunden: $TEMPLATE" >&2
  exit 1
fi
if [ -e "$TARGET" ]; then
  echo "Artikel existiert bereits: $TARGET" >&2
  exit 1
fi

# Vorlage kopieren und Platzhalter ersetzen
sed -e "s|TITEL HIER|$TITLE|g" \
    -e "s|JJJJ-MM-TT|$DATE|g" \
    "$TEMPLATE" > "$TARGET"

# Neue Zeile in die Index-Tabelle einfügen (ans Tabellenende anhängen)
printf '| %s | [%s](./%s) |\n' "$DATE" "$TITLE" "$DATE-$SLUG.md" >> "$INDEX"

echo "Neuer Artikel angelegt: blog/$DATE-$SLUG.md"
echo "Im Index ergänzt:       blog/README.md"
echo "Jetzt nur noch den Inhalt ausformulieren. ✍️"
