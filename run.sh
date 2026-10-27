#!/usr/bin/env bash
# Kids Coding Studio — Char & Vic creative studio on 127.0.0.1:4331
#   ./run.sh          start (idempotent)
#   ./run.sh stop     stop
#   ./run.sh status   status
#   ./run.sh test     smoke test
#   ./run.sh restart  stop + start
set -euo pipefail
cd "$(dirname "$0")"
PORT="${KCS_PORT:-4331}"
PIDF=data/server.pid
LOG=data/server.log
mkdir -p data

status() {
  if [[ -f "$PIDF" ]] && kill -0 "$(cat "$PIDF")" 2>/dev/null; then
    if curl -sf "http://127.0.0.1:$PORT/healthz" >/dev/null; then
      echo "running on http://127.0.0.1:$PORT/ (pid $(cat "$PIDF"))"
      return 0
    fi
  fi
  echo "not running"
  return 1
}

start() {
  if status >/dev/null 2>&1; then status; return 0; fi
  # Clear stale pid
  rm -f "$PIDF"
  setsid nohup python3 server.py >>"$LOG" 2>&1 < /dev/null &
  echo $! > "$PIDF"
  for i in 1 2 3 4 5 6 7 8 9 10; do
    if curl -sf "http://127.0.0.1:$PORT/healthz" >/dev/null; then
      status
      return 0
    fi
    sleep 0.2
  done
  echo "failed to start — see $LOG" >&2
  return 1
}

stop() {
  if [[ -f "$PIDF" ]]; then
    kill "$(cat "$PIDF")" 2>/dev/null || true
    rm -f "$PIDF"
  fi
  # Also kill anything still bound to the port (best-effort)
  if command -v ss >/dev/null; then
    pid=$(ss -ltnp "sport = :$PORT" 2>/dev/null | sed -n 's/.*pid=\([0-9]*\).*/\1/p' | head -1 || true)
    [[ -n "${pid:-}" ]] && kill "$pid" 2>/dev/null || true
  fi
  echo stopped
}

case "${1:-start}" in
  start) start ;;
  stop) stop ;;
  restart) stop; start ;;
  status) status ;;
  test) start; python3 tests/smoke_test.py ;;
  *) echo "usage: $0 start|stop|restart|status|test"; exit 2 ;;
esac
