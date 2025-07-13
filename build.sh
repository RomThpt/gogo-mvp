#!/bin/bash

echo "🚀 Building GOGO MVP for deployment..."

# Navigate to frontend directory
cd frontend

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🏗️ Building Next.js project..."
npm run build

echo "✅ Build complete!"