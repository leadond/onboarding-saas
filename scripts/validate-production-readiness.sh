#!/bin/bash

# OnboardKit Flagship Platform - Production Readiness Validation
# This script validates that all systems are ready for production deployment

set -e  # Exit on any error

echo "🔍 OnboardKit Production Readiness Validation"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Validation results
validation_results=()
total_checks=0
passed_checks=0

# Function to add validation result
add_result() {
    local check_name="$1"
    local status="$2"
    local message="$3"
    
    total_checks=$((total_checks + 1))
    
    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✅ $check_name${NC}"
        passed_checks=$((passed_checks + 1))
    elif [ "$status" = "WARN" ]; then
        echo -e "${YELLOW}⚠️  $check_name - $message${NC}"
        passed_checks=$((passed_checks + 1))
    else
        echo -e "${RED}❌ $check_name - $message${NC}"
    fi
    
    validation_results+=("$check_name:$status:$message")
}

echo -e "${BLUE}Starting comprehensive validation...${NC}"
echo ""

# 1. Environment Configuration Check
echo -e "${YELLOW}📋 Environment Configuration${NC}"
echo "================================"

if [ -f ".env.local" ]; then
    add_result "Environment File" "PASS" ""
    
    # Load environment variables
    set -a
    source .env.local
    set +a
    
    # Check critical environment variables
    if [ -n "$NEXT_PUBLIC_SUPABASE_URL" ]; then
        add_result "Supabase URL" "PASS" ""
    else
        add_result "Supabase URL" "FAIL" "Missing NEXT_PUBLIC_SUPABASE_URL"
    fi
    
    if [ -n "$SUPABASE_SERVICE_ROLE_KEY" ]; then
        add_result "Supabase Service Key" "PASS" ""
    else
        add_result "Supabase Service Key" "FAIL" "Missing SUPABASE_SERVICE_ROLE_KEY"
    fi
    
    if [ -n "$STRIPE_SECRET_KEY" ]; then
        add_result "Stripe Configuration" "PASS" ""
    else
        add_result "Stripe Configuration" "WARN" "Stripe not configured"
    fi
    
    if [ -n "$SENDGRID_API_KEY" ] || [ -n "$RESEND_API_KEY" ]; then
        add_result "Email Service" "PASS" ""
    else
        add_result "Email Service" "WARN" "No email service configured"
    fi
    
else
    add_result "Environment File" "FAIL" ".env.local not found"
fi

echo ""

# 2. Database Connectivity Check
echo -e "${YELLOW}🗄️  Database Connectivity${NC}"
echo "=========================="

if [ -n "$NEXT_PUBLIC_SUPABASE_URL" ] && [ -n "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    # Test Supabase connection
    response=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
        -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
        "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/" 2>/dev/null || echo "000")
    
    if [ "$response" = "200" ]; then
        add_result "Database Connection" "PASS" ""
    else
        add_result "Database Connection" "FAIL" "HTTP $response"
    fi
else
    add_result "Database Connection" "FAIL" "Missing credentials"
fi

echo ""

# 3. Application Build Check
echo -e "${YELLOW}🏗️  Application Build${NC}"
echo "===================="

# Check if package.json exists
if [ -f "package.json" ]; then
    add_result "Package Configuration" "PASS" ""
else
    add_result "Package Configuration" "FAIL" "package.json not found"
fi

# Check if node_modules exists
if [ -d "node_modules" ]; then
    add_result "Dependencies Installed" "PASS" ""
else
    add_result "Dependencies Installed" "FAIL" "Run npm install"
fi

# Try to build the application
echo -e "${BLUE}Building application...${NC}"
if npm run build > /dev/null 2>&1; then
    add_result "Application Build" "PASS" ""
else
    add_result "Application Build" "FAIL" "Build failed"
fi

echo ""

# 4. Feature Implementation Check
echo -e "${YELLOW}🎯 Feature Implementation${NC}"
echo "========================="

# Check if key feature files exist
feature_files=(
    "app/test-dashboard/page.tsx"
    "app/api/health/route.ts"
    "components/ui/button.tsx"
    "lib/supabase/client.ts"
)

for file in "${feature_files[@]}"; do
    if [ -f "$file" ]; then
        add_result "Core File: $(basename $file)" "PASS" ""
    else
        add_result "Core File: $(basename $file)" "FAIL" "File missing"
    fi
done

echo ""

# 5. Deployment Configuration Check
echo -e "${YELLOW}🚀 Deployment Configuration${NC}"
echo "============================"

# Check deployment configuration files
if [ -f "vercel.json" ]; then
    add_result "Vercel Configuration" "PASS" ""
else
    add_result "Vercel Configuration" "WARN" "vercel.json not found"
fi

if [ -f "netlify.toml" ]; then
    add_result "Netlify Configuration" "PASS" ""
else
    add_result "Netlify Configuration" "WARN" "netlify.toml not found"
fi

if [ -f "Dockerfile" ]; then
    add_result "Docker Configuration" "PASS" ""
else
    add_result "Docker Configuration" "WARN" "Dockerfile not found"
fi

echo ""

# 6. Health Check Validation
echo -e "${YELLOW}🏥 Application Health${NC}"
echo "===================="

# Check if the application is running (try both ports)
if curl -s -f "http://localhost:3000/api/health" > /dev/null 2>&1; then
    app_port="3000"
elif curl -s -f "http://localhost:3001/api/health" > /dev/null 2>&1; then
    app_port="3001"
else
    app_port=""
fi

if [ -n "$app_port" ]; then
    add_result "Application Running" "PASS" ""
    
    # Get health status
    health_response=$(curl -s "http://localhost:${app_port}/api/health" 2>/dev/null || echo "{}")
    
    if echo "$health_response" | grep -q '"status":"healthy"'; then
        add_result "Health Check Status" "PASS" ""
    elif echo "$health_response" | grep -q '"status":"development"'; then
        add_result "Health Check Status" "WARN" "Development mode"
    else
        add_result "Health Check Status" "FAIL" "Unhealthy status"
    fi
    
    # Check flagship features
    if echo "$health_response" | grep -q '"implemented":21'; then
        add_result "Flagship Features" "PASS" "All 21 features implemented"
    else
        add_result "Flagship Features" "WARN" "Feature count mismatch"
    fi
    
else
    add_result "Application Running" "FAIL" "Start with npm run dev"
    add_result "Health Check Status" "FAIL" "Application not accessible"
    add_result "Flagship Features" "FAIL" "Cannot verify"
fi

echo ""

# 7. Security Configuration Check
echo -e "${YELLOW}🔒 Security Configuration${NC}"
echo "========================="

if [ -n "$NEXTAUTH_SECRET" ]; then
    add_result "NextAuth Secret" "PASS" ""
else
    add_result "NextAuth Secret" "WARN" "NEXTAUTH_SECRET not set"
fi

if [ -n "$NEXTAUTH_URL" ]; then
    add_result "NextAuth URL" "PASS" ""
else
    add_result "NextAuth URL" "WARN" "NEXTAUTH_URL not set"
fi

echo ""

# 8. Performance Check
echo -e "${YELLOW}⚡ Performance Validation${NC}"
echo "========================"

# Check if .next directory exists (build output)
if [ -d ".next" ]; then
    add_result "Build Output" "PASS" ""
else
    add_result "Build Output" "FAIL" "No build output found"
fi

# Check bundle size (simplified)
if [ -d ".next/static" ]; then
    add_result "Static Assets" "PASS" ""
else
    add_result "Static Assets" "WARN" "No static assets found"
fi

echo ""

# Generate Summary Report
echo -e "${BLUE}📊 VALIDATION SUMMARY${NC}"
echo "===================="
echo ""

success_rate=$((passed_checks * 100 / total_checks))

echo -e "${BLUE}Total Checks: ${total_checks}${NC}"
echo -e "${GREEN}Passed: ${passed_checks}${NC}"
echo -e "${RED}Failed: $((total_checks - passed_checks))${NC}"
echo -e "${BLUE}Success Rate: ${success_rate}%${NC}"

echo ""

# Determine overall status
if [ $success_rate -ge 90 ]; then
    echo -e "${GREEN}🎉 PRODUCTION READY!${NC}"
    echo "OnboardKit is ready for production deployment."
    overall_status="READY"
elif [ $success_rate -ge 75 ]; then
    echo -e "${YELLOW}⚠️  MOSTLY READY${NC}"
    echo "OnboardKit is mostly ready with minor issues to address."
    overall_status="MOSTLY_READY"
else
    echo -e "${RED}❌ NOT READY${NC}"
    echo "OnboardKit requires significant fixes before production deployment."
    overall_status="NOT_READY"
fi

echo ""

# Recommendations
echo -e "${YELLOW}📋 RECOMMENDATIONS${NC}"
echo "=================="

if [ $success_rate -lt 100 ]; then
    echo "Address the following issues before deployment:"
    echo ""
    
    for result in "${validation_results[@]}"; do
        IFS=':' read -r name status message <<< "$result"
        if [ "$status" = "FAIL" ]; then
            echo -e "${RED}• Fix: $name - $message${NC}"
        elif [ "$status" = "WARN" ]; then
            echo -e "${YELLOW}• Consider: $name - $message${NC}"
        fi
    done
else
    echo -e "${GREEN}All checks passed! Ready for deployment.${NC}"
fi

echo ""

# Next Steps
echo -e "${YELLOW}🚀 NEXT STEPS${NC}"
echo "============"

if [ "$overall_status" = "READY" ]; then
    echo "1. Choose deployment platform:"
    echo "   npm run deploy:vercel"
    echo "   npm run deploy:netlify"
    echo "   npm run deploy:aws"
    echo ""
    echo "2. Set up production database schema in Supabase Dashboard"
    echo ""
    echo "3. Configure production environment variables"
    echo ""
    echo "4. Monitor deployment and validate all features"
else
    echo "1. Address failed validation checks"
    echo "2. Re-run validation: npm run validate-production"
    echo "3. Proceed with deployment once all checks pass"
fi

echo ""
echo -e "${BLUE}Validation completed at $(date)${NC}"

# Exit with appropriate code
if [ "$overall_status" = "READY" ]; then
    exit 0
elif [ "$overall_status" = "MOSTLY_READY" ]; then
    exit 1
else
    exit 2
fi