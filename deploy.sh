#!/bin/bash
# Quick Deployment Script for munasiq.org
# Run this script to deploy your application

set -e  # Exit on error

echo "🚀 Starting deployment for munasiq.org..."

# Check if .env.prod exists
if [ ! -f .env.prod ]; then
    echo "❌ Error: .env.prod not found!"
    exit 1
fi

# Create letsencrypt directory
echo "📁 Creating SSL certificate directory..."
mkdir -p letsencrypt
chmod 600 letsencrypt

# Build Docker image
echo "🔨 Building Docker image..."
docker build -f Dockerfile.prod -t 46.224.110.223:5000/laravel_app:latest .

# Push to registry
echo "📤 Pushing to registry..."
docker push 46.224.110.223:5000/laravel_app:latest

# Deploy services
echo "🐳 Starting Docker services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 10

# Run migrations
echo "🗄️  Running database migrations..."
docker exec laravel_app php artisan migrate --force

# Optimize Laravel
echo "⚡ Optimizing Laravel..."
docker exec laravel_app php artisan config:cache
docker exec laravel_app php artisan route:cache
docker exec laravel_app php artisan view:cache
docker exec laravel_app php artisan optimize

echo "✅ Deployment complete!"
echo ""
echo "🌐 Access your application at:"
echo "   Main App: https://munasiq.org"
echo "   PHPMyAdmin: http://46.224.110.223:8080"
echo "   Traefik: http://46.224.110.223:8081"
echo ""
echo "📝 Note: SSL certificate generation may take 1-2 minutes"
echo "   Monitor with: docker-compose -f docker-compose.prod.yml logs -f traefik"
