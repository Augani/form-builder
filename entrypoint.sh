#!/bin/sh

echo "Checking database existence..."

DB_EXISTS=$(psql "$DATABASE_URL" -tAc "SELECT 1" >/dev/null 2>&1 && echo "yes" || echo "no")

if [ "$DB_EXISTS" = "no" ]; then
  echo "Database not found. Creating..."
  psql -h postgres -U postgres -c "CREATE DATABASE hyst;"
else
  echo "Database already exists."
fi

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Seeding database..."
npx prisma db seed

exec "$@"