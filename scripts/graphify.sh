#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEFAULT_TARGET="."
COMMAND="${1:-init}"

resolve_python() {
  if [[ -f "$ROOT_DIR/graphify-out/.graphify_python" ]]; then
    cat "$ROOT_DIR/graphify-out/.graphify_python"
    return 0
  fi

  if command -v graphify >/dev/null 2>&1; then
    local shebang
    shebang="$(head -n 1 "$(command -v graphify)" | tr -d '#!')"
    if [[ -n "$shebang" && -x "$shebang" ]]; then
      printf '%s\n' "$shebang"
      return 0
    fi
  fi

  printf '%s\n' "python3"
}

PYTHON_BIN="$(resolve_python)"

init_graphify() {
  local input_path="${1:-$DEFAULT_TARGET}"
  mkdir -p "$ROOT_DIR/graphify-out"
  printf '%s' "$PYTHON_BIN" > "$ROOT_DIR/graphify-out/.graphify_python"
  (
    cd "$input_path"
    pwd
  ) > "$ROOT_DIR/graphify-out/.graphify_root"

  "$PYTHON_BIN" -c "
import json
from pathlib import Path
from graphify.detect import detect

target = Path(r'''$input_path''').resolve()
result = detect(target)
Path(r'''$ROOT_DIR/graphify-out/.graphify_detect.json''').write_text(
    json.dumps(result, ensure_ascii=False),
    encoding='utf-8',
)
print('Graphify initialized for', target)
print('Detected', result.get('total_files', 0), 'supported files')
"
}

case "$COMMAND" in
  init)
    init_graphify "${2:-$DEFAULT_TARGET}"
    ;;
  detect)
    init_graphify "${2:-$DEFAULT_TARGET}"
    ;;
  extract|update|query|path|explain|tree|cluster-only|watch)
    exec graphify "$COMMAND" "${@:2}"
    ;;
  *)
    exec graphify "$@"
    ;;
esac
