#!/usr/bin/env bash

set -u
set -o pipefail

MODE="local"
QA_ALIAS="${QA_ALIAS:-qa}"
LOCAL_PORT="${LOCAL_PORT:-8888}"
TARGET_PORT="${TARGET_PORT:-5173}"

usage() {
  cat <<'EOF'
Usage:
  ./build_and_run.sh [--local|--preview|--qa|--prod|--server|--help]

Options:
  --local    Build and run locally with Netlify Dev (default).
  --preview  Build and create a Deploy Preview style draft deploy.
  --qa       Build and deploy to a QA alias (default alias: qa).
  --prod     Build and deploy to Netlify production.
  --server   Alias of --prod.
  --help     Show this help message.

Env:
  QA_ALIAS   Alias used by --qa (default: qa).
  LOCAL_PORT Netlify dev proxy port for --local (default: 8888).
  TARGET_PORT Upstream dev server port for --local (default: 5173).
EOF
}

run_cmd() {
  echo "+ $*"
  "$@"
}

for arg in "$@"; do
  case "$arg" in
    --local)
      MODE="local"
      ;;
    --server)
      MODE="server"
      ;;
    --prod)
      MODE="prod"
      ;;
    --preview)
      MODE="preview"
      ;;
    --qa)
      MODE="qa"
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Error: unknown option '$arg'" >&2
      usage
      exit 2
      ;;
  esac
done

if ! command -v pnpm >/dev/null 2>&1; then
  echo "Error: pnpm is not installed or not on PATH." >&2
  exit 1
fi

if [[ "$MODE" == "local" ]]; then
  echo "Running local flow: build, then Netlify local dev."
  echo "Use http://localhost:${LOCAL_PORT} (Netlify proxy), not http://localhost:${TARGET_PORT} (raw Vite)."
  if ! run_cmd pnpm build; then
    echo "Error: local build failed." >&2
    exit 1
  fi
  run_cmd pnpm exec netlify dev --port "$LOCAL_PORT" --target-port "$TARGET_PORT"
  exit $?
fi

if [[ "$MODE" == "preview" ]]; then
  echo "Running preview flow: Netlify draft deploy with deploy-preview context."
  if ! run_cmd pnpm exec netlify deploy --build --context deploy-preview; then
    echo "Error: Netlify preview deploy failed." >&2
    echo "Tip: verify this folder is linked using 'pnpm exec netlify status'." >&2
    exit 1
  fi
  echo "Netlify preview deploy completed successfully."
  exit 0
fi

if [[ "$MODE" == "qa" ]]; then
  echo "Running QA flow: Netlify branch-deploy context with alias '$QA_ALIAS'."
  if ! run_cmd pnpm exec netlify deploy --build --context branch-deploy --alias "$QA_ALIAS"; then
    echo "Error: Netlify QA deploy failed." >&2
    echo "Tip: verify this folder is linked using 'pnpm exec netlify status'." >&2
    exit 1
  fi
  echo "Netlify QA deploy completed successfully."
  exit 0
fi

echo "Running production flow: Netlify production deploy."
if ! run_cmd pnpm exec netlify deploy --prod --build; then
  echo "Error: Netlify production deploy failed." >&2
  echo "Tip: verify this folder is linked using 'pnpm exec netlify status'." >&2
  exit 1
fi

echo "Netlify production deploy completed successfully."
