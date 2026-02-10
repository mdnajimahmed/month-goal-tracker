#!/bin/bash
set -e

# Tag format: fe-YYYY-MM-DD-HHMM-<git_sha_short> and be-YYYY-MM-DD-HHMM-<git_sha_short>
IMAGE_BASE=ivplay4689/ruthless-execution
DATETIME=$(date +%Y-%m-%d-%H%M)
GIT_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "nosha")
FE_TAG="fe-${DATETIME}-${GIT_SHA}"
BE_TAG="be-${DATETIME}-${GIT_SHA}"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "🐳 Building and pushing Docker images..."
echo "   FE tag: $FE_TAG"
echo "   BE tag: $BE_TAG"
echo ""

# Build and push backend
echo "📦 Building backend..."
docker build -t "${IMAGE_BASE}:${BE_TAG}" -f backend/Dockerfile backend/
echo "📤 Pushing ${IMAGE_BASE}:${BE_TAG}"
docker push "${IMAGE_BASE}:${BE_TAG}"

# Build and push frontend (API URL for local docker-compose)
echo "📦 Building frontend..."
docker build -t "${IMAGE_BASE}:${FE_TAG}" \
  --build-arg VITE_API_URL=http://localhost:9559/api \
  -f Dockerfile.fe .
echo "📤 Pushing ${IMAGE_BASE}:${FE_TAG}"
docker push "${IMAGE_BASE}:${FE_TAG}"

echo ""
echo "✅ Pushed:"
echo "   ${IMAGE_BASE}:${FE_TAG}"
echo "   ${IMAGE_BASE}:${BE_TAG}"
echo ""
echo "--- Copy and paste to run locally with these images ---"
echo "export FE_TAG=${FE_TAG} BE_TAG=${BE_TAG}"
echo "docker compose -f docker-compose.images.yml up -d"
echo "---"
echo ""
