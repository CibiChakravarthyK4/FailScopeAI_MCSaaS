#!/usr/bin/env bash
# Backs up the RootTrace Ivory database and uploaded artifacts.
# NOTE: container/db/volume names below are the old "failscope" identifiers,
# kept deliberately (CLAUDE.md Section 7) - renaming them is a planned,
# separate task, not part of ordinary feature work.
# Usage: scripts/backup.sh
set -euo pipefail

# Git Bash on Windows auto-converts POSIX-looking arguments (like /data below,
# meant to be a path inside the container) into Windows paths. This disables
# that conversion for this script; harmless no-op on Linux/Mac.
export MSYS_NO_PATHCONV=1

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$ROOT_DIR/backups"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"

mkdir -p "$BACKUP_DIR"

DB_CONTAINER="${DB_CONTAINER:-failscope-ai-db-1}"
DB_USER="${DB_USER:-failscope}"
DB_NAME="${DB_NAME:-failscope}"
ARTIFACT_VOLUME="${ARTIFACT_VOLUME:-failscope-ai_artifact_storage}"

echo "==> Backing up database ($DB_CONTAINER) ..."
docker exec "$DB_CONTAINER" pg_dump -U "$DB_USER" -Fc "$DB_NAME" > "$BACKUP_DIR/db_${TIMESTAMP}.dump"
echo "    saved to backups/db_${TIMESTAMP}.dump"

echo "==> Backing up artifact storage volume ($ARTIFACT_VOLUME) ..."
# Streamed through stdout rather than a second bind mount: a Windows host path
# passed to `-v` contains its own colon (C:\...), which collides with Docker's
# "source:dest" volume-spec parsing when run through Git Bash's path mangling.
docker run --rm -v "${ARTIFACT_VOLUME}:/data:ro" alpine tar czf - -C /data . \
  > "$BACKUP_DIR/artifacts_${TIMESTAMP}.tar.gz"
echo "    saved to backups/artifacts_${TIMESTAMP}.tar.gz"

echo "==> Backup complete: db_${TIMESTAMP}.dump, artifacts_${TIMESTAMP}.tar.gz"
