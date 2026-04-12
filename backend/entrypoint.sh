#!/bin/sh
set -e

echo "Running migrations..."
npm run migrate:up

echo "Running seeds..."
psql $DATABASE_URL -f seeds/seed.sql

echo "Starting server..."
exec node dist/index.js