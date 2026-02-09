#!/bin/bash
set -e

echo "🔧 Building backend for Lambda..."

cd "$(dirname "$0")/.."

# Clean previous build
rm -rf dist

# Build TypeScript
echo "📦 Compiling TypeScript..."
npm run build

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npm run prisma:generate

# Copy Prisma files to dist
echo "📋 Copying Prisma files..."
mkdir -p dist/node_modules/.prisma
cp -r node_modules/.prisma/client dist/node_modules/.prisma/ || true

# Copy node_modules for Lambda (only production dependencies)
echo "📦 Copying production dependencies..."
mkdir -p dist/node_modules
cp -r node_modules/@prisma dist/node_modules/ || true
cp -r node_modules/.prisma dist/node_modules/ || true
cp -r node_modules/@aws-sdk dist/node_modules/ || true
cp -r node_modules/aws-serverless-express dist/node_modules/ || true
cp -r node_modules/express dist/node_modules/ || true
cp -r node_modules/cors dist/node_modules/ || true
cp -r node_modules/express-async-errors dist/node_modules/ || true
cp -r node_modules/zod dist/node_modules/ || true

# Copy package.json
cp package.json dist/

echo "✅ Build complete!"
