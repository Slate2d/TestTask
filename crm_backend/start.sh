#!/bin/bash

echo "Waiting for postgres..."
echo "PostgreSQL started"

echo "Running database migrations..."
alembic upgrade head

echo "Loading initial data..."
python -m app.db.initial_data

echo "Starting FastAPI server..."
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload