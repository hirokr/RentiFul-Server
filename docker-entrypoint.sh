#!/bin/sh

set -e

echo "🚀 Starting NestJS application..."

# Check if we can connect to the database
echo "🔌 Testing database connection..."
npx prisma db push --skip-generate || {
  echo "❌ Database connection failed!"
  echo "Please check your DATABASE_URL environment variable"
  exit 1
}

echo "✅ Database connection successful!"

# Run Prisma migrations
# echo "🔄 Running Prisma migrations..."
# npx prisma migrate deploy

# Seed the database if in development and seed script exists
if [ "$NODE_ENV" = "development" ] && [ -f "prisma/seed.ts" ]; then
  echo "🌱 Seeding database..."
  npm run seed || echo "⚠️  Seeding failed or no seed script available"
fi

echo "🎉 Starting the application..."

# Start the application
exec node dist/src/main.js