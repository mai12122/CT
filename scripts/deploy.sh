#!/bin/bash
set -e

echo "🚀 Starting automated deployment on EC2..."

# Navigate to app directory (fallback to current directory)
APP_DIR="${APP_DIR:-$(pwd)}"
cd "$APP_DIR"

# 1. Pull latest code from main
echo "📥 Pulling latest changes from origin/main..."
git fetch origin main
git reset --hard origin/main

# 2. Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# 3. Prisma schema sync
echo "🗄️ Synchronizing Prisma schema..."
npx prisma generate
npx prisma db push

# 4. Reload or start backend service using PM2
echo "🔄 Managing PM2 processes..."
if command -v pm2 > /dev/null 2>&1; then
    if pm2 describe concert-api > /dev/null 2>&1; then
        echo "Reloading existing concert-api PM2 process..."
        pm2 reload concert-api --update-env
    else
        echo "Starting new concert-api PM2 process..."
        pm2 start "npx tsx server/index.ts" --name concert-api
    fi
    pm2 save
else
    echo "⚠️ PM2 not found. Please install PM2 globally: npm install -g pm2"
    exit 1
fi

echo "✅ Automated deployment completed successfully!"
