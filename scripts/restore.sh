#!/usr/bin/env bash
# Restores the FailScope AI database and artifacts from a backup pair.
# Usage: scripts/restore.sh <timestamp>
#   where <timestamp> matches backups/db_<timestamp>.dump and backups/artifacts_<timestamp>.tar.gz
set -euo pipefail

# See backup.sh - Git Bash mangles POSIX-looking container-side paths otherwise.
export MSYS_NO_PATHCONV=1

if [ $# -lt 1 ]; then
  echo "Usage: $0 <timestamp>   (e.g. 20261012_120000)" >&2
  echo "Available backups:" >&2
  ls -1 "$(dirname "${BASH_SOURCE[0]}")/../backups" 2>/dev/null | grep "^db_" || echo "  (none found)" >&2
  exit 1
fi

TIMESTAMP="$1"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$ROOT_DIR/backups"

DB_DUMP="$BACKUP_DIR/db_${TIMESTAMP}.dump"
ARTIFACTS_TAR="$BACKUP_DIR/artifacts_${TIMESTAMP}.tar.gz"

[ -f "$DB_DUMP" ] || { echo "Missing $DB_DUMP" >&2; exit 1; }
[ -f "$ARTIFACTS_TAR" ] || { echo "Missing $ARTIFACTS_TAR" >&2; exit 1; }

DB_CONTAINER="${DB_CONTAINER:-failscope-ai-db-1}"
DB_USER="${DB_USER:-failscope}"
DB_NAME="${DB_NAME:-failscope}"
ARTIFACT_VOLUME="${ARTIFACT_VOLUME:-failscope-ai_artifact_storage}"

echo "==> Restoring database from db_${TIMESTAMP}.dump (this replaces all current data) ..."
docker exec -i "$DB_CONTAINER" pg_restore -U "$DB_USER" -d "$DB_NAME" --clean --if-exists < "$DB_DUMP"

echo "==> Restoring artifact storage volume from artifacts_${TIMESTAMP}.tar.gz ..."
# Streamed through stdin rather than a second bind mount - see backup.sh for why.
docker run --rm -i -v "${ARTIFACT_VOLUME}:/data" alpine sh -c "rm -rf /data/* && tar xzf - -C /data" \
  < "$ARTIFACTS_TAR"

echo "==> Restore complete from timestamp ${TIMESTAMP}"
