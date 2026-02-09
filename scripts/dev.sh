#!/bin/bash
set -e

# Ensure we run from project root (directory containing backend/, scripts/, package.json)
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "🚀 Starting local development environment (project root: $ROOT)..."

# Start PostgreSQL in Docker
echo "📦 Starting PostgreSQL container..."
docker-compose up -d

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
until docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; do
  sleep 1
done

echo "✅ PostgreSQL is ready!"

# Ensure backend .env exists and has correct PORT
if [ ! -f "backend/.env" ]; then
  echo "📝 Creating backend/.env from .env.example..."
  cp backend/.env.example backend/.env
else
  # Update PORT in existing .env if it's set to 3001
  if grep -q "PORT=3001" backend/.env 2>/dev/null; then
    echo "📝 Updating PORT in backend/.env from 3001 to 3002..."
    sed -i '' 's/PORT=3001/PORT=3002/g' backend/.env 2>/dev/null || sed -i 's/PORT=3001/PORT=3002/g' backend/.env
  fi
fi

# Install backend dependencies (ensures dotenv etc. are present)
echo "📦 Installing backend dependencies..."
(cd backend && npm install)

# Generate Prisma client
echo "🔧 Generating Prisma client..."
(cd backend && npm run prisma:generate)

# Create DB schema (use db push for dev so no migration files required on first run)
echo "🗄️  Syncing database schema..."
(cd backend && npx prisma db push)

# Start backend in development mode
echo "🔧 Starting backend server..."
(cd backend && npm run dev) &
BACKEND_PID=$!

# Install frontend dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing frontend dependencies..."
  npm install
fi

# Start frontend
echo "🎨 Starting frontend..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Development environment is running!"
echo "   Frontend: http://localhost:8080 (or next available port)"
echo "   Backend:  http://localhost:3002"
echo ""
echo "Press Ctrl+C to stop all services..."

# Wait for user interrupt
trap "echo ''; echo '🛑 Stopping services...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; docker-compose down; exit" INT TERM

wait
