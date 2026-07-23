#!/usr/bin/env bash
#
# Aktiviert die projekteigenen Git-Hooks (einmalig pro Klon ausführen).
# Setzt git so, dass Hooks aus scripts/hooks/ verwendet werden.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
git -C "$ROOT" config core.hooksPath scripts/hooks

echo "Git-Hooks aktiviert (core.hooksPath = scripts/hooks)."
echo "Zum Deaktivieren: git config --unset core.hooksPath"
