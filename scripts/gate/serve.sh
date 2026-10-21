#!/usr/bin/env bash
# Standalone-Server einer Gate-Build-Variante starten/stoppen (docs/gate.md).
#
#   scripts/gate/serve.sh start <build-ordner> <port>   # Ordner von build.sh (mit info.json)
#   scripts/gate/serve.sh stop <port>
#   scripts/gate/serve.sh status <port>
#
# start beendet vorher jeden Node-Lauscher auf dem Port (ein verwaister next-server lieferte
# sonst den alten Build) und wartet, bis / mit 200 antwortet. Laufzeit-Umgebung: GHOST_URL/
# GHOST_CONTENT_KEY zeigen auf den Ghost-Mock (On-Demand-Seiten wie /blog/<neu>); weitere
# Variablen (z. B. CONTACT_* für den Resend-Mock beim Formular-Build) erbt der Server vom Aufrufer.
# Log: <build-ordner>/server-<port>.log
set -euo pipefail

cmd="${1:-}"

listeners() {
  # Node-Prozesse, die auf dem Port lauschen (Kommandoname laut lsof; ps zeigt bei Next
  # „next-server (v…)“)
  { lsof -nP -a -iTCP:"$1" -sTCP:LISTEN -Fpc 2>/dev/null || true; } | awk '
    /^p/ { pid = substr($0, 2) }
    /^c/ { if (substr($0, 2) ~ /node|next-server/) print pid }' | sort -u
}

stop_port() {
  local pids
  pids="$(listeners "$1")"
  if [ -z "$pids" ]; then
    return 0
  fi
  # shellcheck disable=SC2086
  kill $pids 2>/dev/null || true
  for _ in $(seq 1 50); do
    [ -z "$(listeners "$1")" ] && return 0
    sleep 0.1
  done
  # shellcheck disable=SC2086
  kill -9 $(listeners "$1") 2>/dev/null || true
}

other_listener() {
  { lsof -nP -a -iTCP:"$1" -sTCP:LISTEN -Fpc 2>/dev/null || true; } | awk '
    /^p/ { pid = substr($0, 2) }
    /^c/ { if (substr($0, 2) !~ /node|next-server/) print pid }' | sort -u
}

case "$cmd" in
  start)
    dir="${2:?Build-Ordner fehlt}"
    port="${3:?Port fehlt}"
    dir="$(cd "$dir" && pwd)"
    if [ -f "$dir/info.json" ]; then
      server_js="$(sed -nE 's/.*"server": "([^"]+)".*/\1/p' "$dir/info.json")"
    else
      server_js="$(find "$dir" -name server.js -not -path '*/node_modules/*' -maxdepth 6 | head -1)"
    fi
    [ -n "$server_js" ] && [ -f "$server_js" ] || { echo "server.js nicht gefunden in $dir" >&2; exit 1; }
    if [ -n "$(other_listener "$port")" ]; then
      echo "Port $port ist von einem anderen Programm belegt (kein Node) – abgebrochen." >&2
      exit 1
    fi
    stop_port "$port"
    log="$dir/server-$port.log"
    (
      cd "$(dirname "$server_js")"
      GHOST_URL="${GHOST_URL:-http://127.0.0.1:2368}" \
        GHOST_CONTENT_KEY="${GHOST_CONTENT_KEY:-1234567890abcdef1234567890}" \
        PORT="$port" HOSTNAME=127.0.0.1 NEXT_TELEMETRY_DISABLED=1 \
        nohup node server.js >"$log" 2>&1 &
      echo $! >"$dir/server-$port.pid"
    )
    for _ in $(seq 1 150); do
      code="$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:$port/" || true)"
      if [ "$code" = "200" ]; then
        echo "› läuft: http://127.0.0.1:$port ($server_js, Log $log)"
        exit 0
      fi
      sleep 0.2
    done
    echo "Server antwortet nicht mit 200 (zuletzt: ${code:-–}), Log: $log" >&2
    tail -20 "$log" >&2 || true
    exit 1
    ;;
  stop)
    port="${2:?Port fehlt}"
    stop_port "$port"
    echo "› Port $port frei"
    ;;
  status)
    port="${2:?Port fehlt}"
    pids="$(listeners "$port")"
    if [ -n "$pids" ]; then
      echo "› Port $port: Node-Prozess $pids, / → $(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:$port/" || true)"
    else
      echo "› Port $port: kein Node-Server"
      exit 1
    fi
    ;;
  *)
    echo "Nutzung: scripts/gate/serve.sh start <build-ordner> <port> | stop <port> | status <port>" >&2
    exit 2
    ;;
esac
