#!/bin/bash
set -e

echo "🚀 Deploying to AWS..."

# Check if AWS credentials are configured
if ! aws sts get-caller-identity > /dev/null 2>&1; then
  echo "❌ AWS credentials not configured. Please run 'aws configure' first."
  exit 1
fi

# Build frontend
echo "📦 Building frontend..."
npm run build

# Build backend
echo "📦 Building backend..."
cd backend
npm install
npm run build:lambda
cd ..

# Build infrastructure
echo "📦 Building infrastructure..."
cd infrastructure
npm install
npm run build
cd ..

# Bootstrap CDK if needed
echo "🔧 Bootstrapping CDK (if needed)..."
cd infrastructure
npx cdk bootstrap || echo "CDK already bootstrapped"
cd ..

# Deploy infrastructure and application
echo "🚀 Deploying infrastructure..."
cd infrastructure
npx cdk deploy --all --require-approval never
cd ..

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Getting deployment outputs..."
cd infrastructure
npx cdk list
cd ..

echo ""
echo "🎉 Your application is deployed!"
