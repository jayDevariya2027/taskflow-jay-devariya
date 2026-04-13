#!/bin/sh
set -e

echo "Running migrations..."
npx node-pg-migrate up --database-url "$DATABASE_URL"

echo "Running seeds..."
psql $DATABASE_URL -f seeds/seed.sql

echo "Starting server..."
exec node dist/index.js