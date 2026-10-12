FROM python:3.11-slim

WORKDIR /app
RUN apt-get update && apt-get install -y gcc libpq-dev && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY ./app ./app
COPY alembic.ini .
COPY ./alembic ./alembic

RUN mkdir -p /app/storage && useradd -m appuser && chown -R appuser:appuser /app
# /app/storage is a volume mount point; creating it with appuser ownership
# before the volume is first attached ensures Docker copies that ownership
# into the new volume (it only inherits the image's permissions on first
# creation) - otherwise the volume defaults to root and appuser can't write to it.
USER appuser

EXPOSE 8000
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
