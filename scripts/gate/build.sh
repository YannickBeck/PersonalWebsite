#!/usr/bin/env bash
# Build-Variante für das Screenshot-Gate bauen (docs/gate.md).
#
#   scripts/gate/build.sh <prod|gaps|form> [--src <repo>] [--out <ordner>] [--allow-dynamic]
#
#   prod  Produktion (ohne NEXT_PUBLIC_SHOW_GAPS, ohne NEXT_PUBLIC_CONTACT_FORM)
#   gaps  Vorschau   (NEXT_PUBLIC_SHOW_GAPS=1)
#   form  Formular   (NEXT_PUBLIC_CONTACT_FORM=1)
#
# Ablauf: Ghost-Mock prüfen bzw. starten (scripts/ghost-mock/server.mjs, Port 2368, Fake-Key),
# .next/cache/fetch-cache beiseiteschieben (sonst liefert der Build alte Mock-Antworten),
# `pnpm build` im Quellordner, Routentabelle prüfen (alle Seiten statisch, dynamisch nur
# Route-Handler und die globale 404 /_not-found – sie liest die Sprache aus dem Proxy-Header,
# Rest-Feinschliff, docs/blog-404.md), Standalone-Kopie mit .next/static und public in einen eigenen Ordner
# (<out>/standalone) – so überschreibt der nächste Build sie nicht. Startet keinen Server
# (dafür scripts/gate/serve.sh).
#
# --src   Quellordner (Standard: dieses Repo). Für einen anderen Stand einen git worktree
#         angeben – Mock und Skripte kommen immer aus diesem Repo.
# --out   Zielordner (Standard: ${GATE_DIR:-${TMPDIR:-/tmp}/yb-gate}/<variante>)
# --allow-dynamic  dynamische Seiten (ƒ) nur melden statt abzubrechen
#
# Umgebung: GHOST_MOCK_URL (Standard http://127.0.0.1:2368), GATE_GHOST_KEY (Fake-Key, 26 Hex-
# Zeichen). Nie einen echten Content-Key verwenden.
set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo="$(cd "$here/../.." && pwd)"

variant="${1:-}"
shift || true
src="$repo"
out=""
allow_dynamic=0
while [ $# -gt 0 ]; do
  case "$1" in
    --src) src="$(cd "$2" && pwd)"; shift 2 ;;
    --out) out="$2"; shift 2 ;;
    --allow-dynamic) allow_dynamic=1; shift ;;
    *) echo "unbekannte Option: $1" >&2; exit 2 ;;
  esac
done

case "$variant" in
  prod) flags=() ;;
  gaps) flags=(NEXT_PUBLIC_SHOW_GAPS=1) ;;
  form) flags=(NEXT_PUBLIC_CONTACT_FORM=1) ;;
  *) echo "Nutzung: scripts/gate/build.sh <prod|gaps|form> [--src <repo>] [--out <ordner>]" >&2; exit 2 ;;
esac

gate_dir="${GATE_DIR:-${TMPDIR:-/tmp}/yb-gate}"
out="${out:-$gate_dir/$variant}"
mkdir -p "$out"
out="$(cd "$out" && pwd)"

ghost="${GHOST_MOCK_URL:-http://127.0.0.1:2368}"
key="${GATE_GHOST_KEY:-1234567890abcdef1234567890}"

# 1) Ghost-Mock
if ! curl -sf "$ghost/__mock/health" | grep -q '"yb-ghost-mock"'; then
  port="${ghost##*:}"
  echo "› Ghost-Mock starten (Port $port)"
  nohup node "$repo/scripts/ghost-mock/server.mjs" --port="$port" --quiet >"$gate_dir/ghost-mock.log" 2>&1 &
  for _ in $(seq 1 50); do
    curl -sf "$ghost/__mock/health" >/dev/null 2>&1 && break
    sleep 0.2
  done
  curl -sf "$ghost/__mock/health" | grep -q '"yb-ghost-mock"' || { echo "Ghost-Mock antwortet nicht ($ghost)" >&2; exit 1; }
fi
echo "› Ghost-Mock: $ghost"

# 2) fetch-cache beiseite
if [ -d "$src/.next/cache/fetch-cache" ]; then
  moved="$out/fetch-cache.moved.$(date +%Y%m%d-%H%M%S)"
  mv "$src/.next/cache/fetch-cache" "$moved"
  echo "› fetch-cache verschoben nach $moved"
fi

# 3) Build
if git -C "$src" rev-parse --git-dir >/dev/null 2>&1; then
  commit="$(git -C "$src" rev-parse --short HEAD)"
  dirty="$(git -C "$src" status --porcelain | grep -c . || true)"
else
  commit="?"
  dirty="null"
fi
echo "› Build $variant aus $src (Commit $commit, geänderte Dateien: $dirty) → $out/build.log"
set +e
(
  cd "$src"
  env -u NEXT_PUBLIC_SHOW_GAPS -u NEXT_PUBLIC_CONTACT_FORM -u NEXT_PUBLIC_CF_BEACON_TOKEN \
    "${flags[@]+"${flags[@]}"}" \
    GHOST_URL="$ghost" GHOST_CONTENT_KEY="$key" NEXT_TELEMETRY_DISABLED=1 \
    pnpm build
) >"$out/build.log" 2>&1
status=$?
set -e
if [ $status -ne 0 ]; then
  tail -40 "$out/build.log" >&2
  echo "Build fehlgeschlagen (Exit $status), Log: $out/build.log" >&2
  exit $status
fi

# 4) Routentabelle: ƒ (dynamisch) nur für Route-Handler und die globale 404 (Sprache aus dem
#    Proxy-Header x-yb-lang, no-store wie vorher)
dynamic="$(grep -E '^[^/]*ƒ /' "$out/build.log" | sed -E 's|^[^/]*ƒ /|/|; s/ .*//' || true)"
unexpected="$(printf '%s\n' "$dynamic" | grep -vE '^(/api/|/rss\.xml$|/en/rss\.xml$|/_not-found$)' | grep -v '^$' || true)"
static_count="$(grep -cE '^[^/]*(○|●) /' "$out/build.log" || true)"
echo "› Routen: $static_count statisch/SSG, dynamisch: $(printf '%s' "$dynamic" | tr '\n' ' ')"
if [ -n "$unexpected" ]; then
  echo "Dynamische Seiten (erwartet: nur Route-Handler): $unexpected" >&2
  [ $allow_dynamic -eq 1 ] || exit 3
fi

# 5) Standalone-Kopie
rm -rf "$out/standalone"
mkdir -p "$out/standalone"
cp -a "$src/.next/standalone/." "$out/standalone/"
server_js="$(find "$out/standalone" -name server.js -not -path '*/node_modules/*' -maxdepth 6 | head -1)"
[ -n "$server_js" ] || { echo "server.js nicht gefunden in $out/standalone" >&2; exit 1; }
app_dir="$(dirname "$server_js")"
mkdir -p "$app_dir/.next"
cp -a "$src/.next/static" "$app_dir/.next/static"
cp -a "$src/public" "$app_dir/public"

cat >"$out/info.json" <<JSON
{
  "variant": "$variant",
  "src": "$src",
  "commit": "$commit",
  "dirtyFiles": $dirty,
  "server": "$server_js",
  "builtAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "ghost": "$ghost",
  "flags": "${flags[*]+"${flags[*]}"}"
}
JSON
echo "› fertig: $server_js"
echo "  starten: scripts/gate/serve.sh start $out <port>"
