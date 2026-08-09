#!/usr/bin/env bash

set -euo pipefail

MODE="${1:-start}"
APP_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORKSPACE_ROOT="$(cd "$APP_ROOT/../.." && pwd)"
EXPO_PORT="${FINANCIAL_COMPANION_EXPO_PORT:-8082}"

show_usage() {
  cat <<'USAGE'
usage: ./script/build_and_run.sh [mode]

Modes:
  start, run        Start the API and Expo dev server on port 8082
  --web, web        Start the API and open the Expo web app
  --ios, ios        Start the API and open the iOS simulator
  --android, android
                    Start the API and open Android
  --tunnel, tunnel  Start the API and Expo using tunnel transport
  --export-web, export-web
                    Export the web build locally
  --doctor, doctor  Run Expo diagnostics
  --help, help      Show this help
USAGE
}

run_mobile_stack() {
  cd "$WORKSPACE_ROOT"
  exec corepack pnpm dev:mobile -- "$@"
}

case "$MODE" in
  start | run)
    run_mobile_stack --localhost --port "$EXPO_PORT"
    ;;
  --web | web)
    run_mobile_stack --web --localhost --port "$EXPO_PORT"
    ;;
  --ios | ios)
    run_mobile_stack --ios --localhost --port "$EXPO_PORT"
    ;;
  --android | android)
    run_mobile_stack --android --localhost --port "$EXPO_PORT"
    ;;
  --tunnel | tunnel)
    run_mobile_stack --tunnel --port "$EXPO_PORT"
    ;;
  --export-web | export-web)
    cd "$APP_ROOT"
    exec corepack pnpm exec expo export --platform web
    ;;
  --doctor | doctor)
    cd "$APP_ROOT"
    exec corepack pnpm exec expo-doctor
    ;;
  --help | help)
    show_usage
    ;;
  *)
    show_usage >&2
    exit 2
    ;;
esac
