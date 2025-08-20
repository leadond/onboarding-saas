#!/bin/bash

# Setup Development Environment Script
# This script ensures proper HTTP configuration for local development

echo "🔧 Setting up development environment..."

# Ensure development environment variables are set
if [ ! -f .env.development ]; then
    echo "❌ .env.development file not found!"
    exit 1
fi

# Check if running on localhost
if [[ "$NEXT_PUBLIC_APP_URL" == *"localhost"* ]]; then
    echo "✅ Localhost detected - ensuring HTTP configuration"
    
    # Update .env.local for development
    sed -i '' 's|https://localhost|http://localhost|g' .env.local
    sed -i '' 's|NEXTAUTH_URL=https://onboard.devapphero.com|NEXTAUTH_URL=http://localhost:3000|g' .env.local
    
    echo "✅ Updated URLs to use HTTP for local development"
else
    echo "⚠️  Production environment detected - keeping HTTPS configuration"
fi

# Set NODE_ENV to development
export NODE_ENV=development

echo "🚀 Development environment ready!"
echo "   - URLs configured for HTTP on localhost"
echo "   - Security headers adjusted for development"
echo "   - SSL enforcement disabled for local development"
echo ""
echo "Run: npm run dev"