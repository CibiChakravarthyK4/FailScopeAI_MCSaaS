# Environments, Backup & Restore

## Environments

RootTrace Ivory uses separate environments. Databases, object storage, credentials, OpenAI keys and Jira connections are never shared between them.

| Environment | Purpose | Data | Where it runs |
|---|---|---|---|
| **Development** | Build and debug features | Local test data | Local Docker Compose (see root `CLAUDE.md` for ports) |
| **Staging / QA** | Validate release candidates, run release testing, UAT and pilot dry-runs | Test data and test integrations only (Jira sandbox project, test OpenAI key) | TBD (hosting and URL to be confirmed) |
| **Production / Live** | Serve real customers | Real customer data | TBD (hosting and URL to be confirmed) |
| **Demo (optional)** | Stable demonstration | Synthetic data only | TBD |

### Environment rules

- Keep **separate** databases, storage volumes/buckets, secrets, OpenAI API keys and Jira connections per environment. Production data must never be copied into dev, staging or demo without redaction.
- A public demo must **not** be used as the everyday testing environment.
- Select the environment with an `APP_ENV` setting (`development`, `staging`, `production`, `demo`). Never hard-code environment-specific URLs, keys or ports.
- Secrets stay on the server and outside GitHub. `.env` files and credentials are excluded through `.gitignore`. Commit only `.env.example` with placeholder values.
- Use test payment credentials in development and staging once subscriptions are added (C06 follow-up after pilot validation).
- Production is **not** a code backup. Recover code from GitHub; keep versioned releases and a recovery option for every production deploy.
- Backups of the database and uploaded artifacts are taken in every environment that holds data worth keeping, and restore must be tested (see Backup & Restore below).

## Backup & Restore (C07)

`scripts/backup.sh` dumps the Postgres database (`pg_dump -Fc`) and the artifact storage volume (tarball) to `backups/<name>_<timestamp>.{dump,tar.gz}`. `scripts/restore.sh <timestamp>` reverses it - `pg_restore --clean` against the db container plus extracting the tarball back into the storage volume.

Both scripts set `MSYS_NO_PATHCONV=1` and stream through stdin/stdout rather than a second bind mount, to avoid a Git-Bash-on-Windows path-mangling gotcha where a POSIX-looking argument meant for *inside* the container gets rewritten as a Windows host path.

Verified end-to-end (2026-10-12): imported a run, backed up, wiped both volumes with `docker compose down -v`, restored, and confirmed both the database row and the actual artifact file on disk survived intact.

```bash
bash scripts/backup.sh                  # writes backups/db_<ts>.dump + artifacts_<ts>.tar.gz
bash scripts/restore.sh <ts>             # restores that pair, replacing current data
```
