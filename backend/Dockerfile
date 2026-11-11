# Backend Django (API REST)
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

# Static files
RUN python manage.py collectstatic --noinput

# User without privileges
RUN useradd --create-home --uid 1000 appuser \
    && mkdir -p /app/data \
    && chown -R appuser:appuser /app
USER appuser

ENV SQLITE_PATH=/app/data/db.sqlite3

EXPOSE 8000

# Apply migrations and start Gunicorn
CMD ["sh", "-c", "python manage.py migrate --noinput && exec gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 3 --access-logfile -"]
