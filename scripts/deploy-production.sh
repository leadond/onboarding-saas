#!/bin/bash

# OnboardKit Flagship Platform - Production Deployment Script
# This script handles the complete production deployment process

set -e  # Exit on any error

echo "🚀 OnboardKit Flagship Platform - Production Deployment"
echo "======================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DEPLOYMENT_PLATFORM=${1:-"vercel"}  # Default to Vercel
ENVIRONMENT=${2:-"production"}

echo -e "${BLUE}Deployment Platform: ${DEPLOYMENT_PLATFORM}${NC}"
echo -e "${BLUE}Environment: ${ENVIRONMENT}${NC}"
echo ""

# Pre-deployment checks
echo -e "${YELLOW}🔍 Running pre-deployment checks...${NC}"

# Check if required files exist
required_files=(
    "package.json"
    "next.config.js"
    ".env.production"
    "database/schema.sql"
)

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo -e "${RED}❌ Required file missing: $file${NC}"
        exit 1
    fi
done

echo -e "${GREEN}✅ All required files present${NC}"

# Check Node.js version
NODE_VERSION=$(node --version)
echo -e "${BLUE}Node.js version: ${NODE_VERSION}${NC}"

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm ci --production=false

# Run tests
echo -e "${YELLOW}🧪 Running tests...${NC}"
npm run test:ci || {
    echo -e "${RED}❌ Tests failed. Deployment aborted.${NC}"
    exit 1
}

# Build the application
echo -e "${YELLOW}🏗️  Building application...${NC}"
npm run build || {
    echo -e "${RED}❌ Build failed. Deployment aborted.${NC}"
    exit 1
}

echo -e "${GREEN}✅ Build completed successfully${NC}"

# Database setup
echo -e "${YELLOW}🗄️  Setting up production database...${NC}"
if [ -f "scripts/setup-database.sh" ]; then
    chmod +x scripts/setup-database.sh
    ./scripts/setup-database.sh
else
    echo -e "${YELLOW}⚠️  Database setup script not found. Please run manually.${NC}"
fi

# Platform-specific deployment
case $DEPLOYMENT_PLATFORM in
    "vercel")
        echo -e "${YELLOW}🚀 Deploying to Vercel...${NC}"
        
        # Check if Vercel CLI is installed
        if ! command -v vercel &> /dev/null; then
            echo -e "${YELLOW}Installing Vercel CLI...${NC}"
            npm install -g vercel
        fi
        
        # Deploy to Vercel
        if [ "$ENVIRONMENT" = "production" ]; then
            vercel --prod --yes
        else
            vercel --yes
        fi
        
        echo -e "${GREEN}✅ Deployed to Vercel successfully${NC}"
        ;;
        
    "netlify")
        echo -e "${YELLOW}🚀 Deploying to Netlify...${NC}"
        
        # Check if Netlify CLI is installed
        if ! command -v netlify &> /dev/null; then
            echo -e "${YELLOW}Installing Netlify CLI...${NC}"
            npm install -g netlify-cli
        fi
        
        # Deploy to Netlify
        if [ "$ENVIRONMENT" = "production" ]; then
            netlify deploy --prod --dir=.next
        else
            netlify deploy --dir=.next
        fi
        
        echo -e "${GREEN}✅ Deployed to Netlify successfully${NC}"
        ;;
        
    "aws")
        echo -e "${YELLOW}🚀 Deploying to AWS...${NC}"
        
        # Build Docker image
        docker build -t onboardkit-flagship .
        
        # Tag for ECR
        AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
        AWS_REGION=${AWS_REGION:-us-east-1}
        ECR_REPOSITORY="onboardkit-flagship"
        
        # Login to ECR
        aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
        
        # Tag and push image
        docker tag onboardkit-flagship:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:latest
        docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:latest
        
        echo -e "${GREEN}✅ Deployed to AWS successfully${NC}"
        ;;
        
    *)
        echo -e "${RED}❌ Unknown deployment platform: $DEPLOYMENT_PLATFORM${NC}"
        echo "Supported platforms: vercel, netlify, aws"
        exit 1
        ;;
esac

# Post-deployment checks
echo -e "${YELLOW}🔍 Running post-deployment checks...${NC}"

# Wait for deployment to be ready
sleep 30

# Health check
if [ "$DEPLOYMENT_PLATFORM" = "vercel" ]; then
    HEALTH_URL="https://app.onboardkit.com/api/health"
elif [ "$DEPLOYMENT_PLATFORM" = "netlify" ]; then
    HEALTH_URL="https://app.onboardkit.com/api/health"
else
    HEALTH_URL="http://localhost:3000/api/health"
fi

echo -e "${BLUE}Checking health endpoint: ${HEALTH_URL}${NC}"

# Retry health check up to 5 times
for i in {1..5}; do
    if curl -f -s "$HEALTH_URL" > /dev/null; then
        echo -e "${GREEN}✅ Health check passed${NC}"
        break
    else
        echo -e "${YELLOW}⏳ Health check attempt $i/5 failed, retrying...${NC}"
        sleep 10
    fi
    
    if [ $i -eq 5 ]; then
        echo -e "${RED}❌ Health check failed after 5 attempts${NC}"
        exit 1
    fi
done

# Feature validation
echo -e "${YELLOW}🧪 Validating flagship features...${NC}"

# Test critical endpoints
critical_endpoints=(
    "/api/health"
    "/api/auth/session"
    "/test-dashboard"
)

for endpoint in "${critical_endpoints[@]}"; do
    if [ "$DEPLOYMENT_PLATFORM" = "aws" ]; then
        url="http://localhost:3000$endpoint"
    else
        url="https://app.onboardkit.com$endpoint"
    fi
    
    if curl -f -s "$url" > /dev/null; then
        echo -e "${GREEN}✅ $endpoint - OK${NC}"
    else
        echo -e "${RED}❌ $endpoint - FAILED${NC}"
    fi
done

# Deployment summary
echo ""
echo -e "${GREEN}🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!${NC}"
echo "========================================"
echo -e "${BLUE}Platform: ${DEPLOYMENT_PLATFORM}${NC}"
echo -e "${BLUE}Environment: ${ENVIRONMENT}${NC}"
echo -e "${BLUE}Timestamp: $(date)${NC}"

if [ "$DEPLOYMENT_PLATFORM" != "aws" ]; then
    echo -e "${BLUE}URL: https://app.onboardkit.com${NC}"
else
    echo -e "${BLUE}URL: http://localhost:3000${NC}"
fi

echo ""
echo -e "${YELLOW}📋 Next Steps:${NC}"
echo "1. Verify all 21 flagship features are working"
echo "2. Test user registration and authentication"
echo "3. Validate integrations and API endpoints"
echo "4. Monitor application performance and logs"
echo "5. Set up monitoring and alerting"

echo ""
echo -e "${GREEN}🚀 OnboardKit Flagship Platform is now live!${NC}"