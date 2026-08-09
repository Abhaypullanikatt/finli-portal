#!/bin/sh

set -eu

api_started=false
api_pid=""

cleanup() {
  if [ "$api_started" = "true" ]; then
    kill "$api_pid" 2>/dev/null || true
    wait "$api_pid" 2>/dev/null || true
  fi
}

trap cleanup EXIT INT TERM

if [ "${1:-}" = "--" ]; then
  shift
fi

if [ "${FINANCIAL_COMPANION_API_EXTERNAL:-false}" != "true" ] && \
  ! curl -fsS --max-time 1 http://127.0.0.1:4000/v1/health >/dev/null 2>&1; then
  AUTH_MODE="${AUTH_MODE:-development}" \
    INVESTMENT_EXPLORER_ENABLED="${INVESTMENT_EXPLORER_ENABLED:-true}" \
    pnpm --filter @financial-companion/api dev &
  api_pid=$!
  api_started=true
fi

EXPO_PUBLIC_USE_DEV_SERVER_API=true \
  EXPO_METRO_API_PROXY=true \
  EXPO_METRO_API_PROXY_PORT=4000 \
  EXPO_PUBLIC_INVESTMENT_EXPLORER_ENABLED="${EXPO_PUBLIC_INVESTMENT_EXPLORER_ENABLED:-true}" \
  pnpm --filter @financial-companion/mobile dev:expo "$@"
