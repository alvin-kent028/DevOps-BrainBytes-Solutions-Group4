#!/usr/bin/env bash
set -euo pipefail

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker not found. Install Docker: https://www.docker.com/get-started" >&2
  exit 1
fi

if docker compose version >/dev/null 2>&1; then
  COMPOSE_CMD="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE_CMD="docker-compose"
else
  echo "Neither 'docker compose' nor 'docker-compose' found. Install Docker Compose." >&2
  exit 1
fi

DETACH="--detach"
if [ "${1:-}" = "--foreground" ] || [ "${1:-}" = "-f" ]; then
  DETACH=""
fi

echo "Running: $COMPOSE_CMD up --build $DETACH"
exec $COMPOSE_CMD up --build $DETACH
