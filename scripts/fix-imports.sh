#!/bin/bash

# OnboardKit - Fix Import Issues Script
# This script fixes common import issues across the codebase

set -e

echo "🔧 Fixing Import Issues Across Codebase"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counter for fixes
fixes_applied=0

# Function to fix imports in a file
fix_imports_in_file() {
    local file="$1"
    local description="$2"
    
    if [ -f "$file" ]; then
        echo -e "${BLUE}Fixing: $file - $description${NC}"
        
        # Fix server import to client import
        if grep -q "@/lib/supabase/server" "$file"; then
            sed -i '' 's|@/lib/supabase/server|@/lib/supabase/client|g' "$file"
            echo -e "${GREEN}  ✅ Fixed Supabase import${NC}"
            fixes_applied=$((fixes_applied + 1))
        fi
        
        # Fix missing type imports
        if grep -q "import.*User.*from '@supabase/supabase-js'" "$file" && ! grep -q "import type" "$file"; then
            sed -i '' 's|import { User } from|import type { User } from|g' "$file"
            echo -e "${GREEN}  ✅ Fixed User type import${NC}"
            fixes_applied=$((fixes_applied + 1))
        fi
        
        # Fix React imports for components
        if [[ "$file" == *"components/"* ]] && [[ "$file" == *".tsx" ]] && ! grep -q "import.*React" "$file"; then
            sed -i '' '1i\
import React from '\''react'\''
' "$file"
            echo -e "${GREEN}  ✅ Added React import${NC}"
            fixes_applied=$((fixes_applied + 1))
        fi
        
    else
        echo -e "${YELLOW}  ⚠️  File not found: $file${NC}"
    fi
}

# Fix API route files
echo -e "${YELLOW}📁 Fixing API Routes${NC}"
echo "==================="

# API routes with server imports
api_files=(
    "app/api/graphql/route.ts"
    "app/api/integrations/boldsign/route.ts"
    "app/api/integrations/email-marketing/route.ts"
    "app/api/user/profile/route.ts"
    "app/api/v1/analytics/route.ts"
    "app/api/v1/api-keys/route.ts"
    "app/api/v1/api-keys/[keyId]/route.ts"
    "app/api/v1/experiments/route.ts"
    "app/api/v1/experiments/[experimentId]/route.ts"
    "app/api/v1/organizations/route.ts"
    "app/api/v1/organizations/[organizationId]/teams/route.ts"
    "app/api/v1/organizations/[organizationId]/teams/[teamId]/members/route.ts"
    "app/api/v1/webhooks/route.ts"
    "app/api/webhooks/boldsign/route.ts"
)

for file in "${api_files[@]}"; do
    fix_imports_in_file "$file" "API route"
done

# Fix component files
echo ""
echo -e "${YELLOW}📁 Fixing Components${NC}"
echo "==================="

component_files=(
    "components/ai/advanced-ai-features.tsx"
    "components/analytics/advanced-analytics-dashboard.tsx"
    "components/audit/activity-log-viewer.tsx"
    "components/integrations/advanced-crm-integrations.tsx"
    "components/notifications/notification-system.tsx"
    "components/pwa/pwa-install-prompt.tsx"
    "components/security/enterprise-security-compliance.tsx"
    "components/team/team-management-dashboard.tsx"
    "components/teams/simple-team-dashboard.tsx"
    "components/teams/team-management-dashboard.tsx"
    "components/workflow/advanced-workflow-builder.tsx"
    "components/workflow/workflow-automation-dashboard.tsx"
)

for file in "${component_files[@]}"; do
    fix_imports_in_file "$file" "Component"
done

# Fix library files
echo ""
echo -e "${YELLOW}📁 Fixing Library Files${NC}"
echo "======================"

lib_files=(
    "lib/auth/rbac.ts"
    "lib/api/enhanced-gateway.ts"
    "lib/api/gateway.ts"
    "lib/graphql/resolvers.ts"
    "lib/webhooks/webhook-manager.ts"
    "lib/pwa/pwa-utils.ts"
    "lib/pwa/service-worker.ts"
)

for file in "${lib_files[@]}"; do
    fix_imports_in_file "$file" "Library file"
done

# Fix page files
echo ""
echo -e "${YELLOW}📁 Fixing Page Files${NC}"
echo "==================="

page_files=(
    "app/(protected)/dashboard/analytics/page.tsx"
    "app/(protected)/dashboard/kits/[kitId]/steps/[stepId]/page.tsx"
    "app/api-test/page.tsx"
)

for file in "${page_files[@]}"; do
    fix_imports_in_file "$file" "Page component"
done

# Fix example files
echo ""
echo -e "${YELLOW}📁 Fixing Example Files${NC}"
echo "======================"

example_files=(
    "examples/boldsign-usage.ts"
)

for file in "${example_files[@]}"; do
    fix_imports_in_file "$file" "Example file"
done

# Additional TypeScript fixes
echo ""
echo -e "${YELLOW}🔧 Additional TypeScript Fixes${NC}"
echo "==============================="

# Fix common TypeScript issues
find . -name "*.ts" -o -name "*.tsx" | grep -E "(app|components|lib)" | while read -r file; do
    if [ -f "$file" ]; then
        # Fix any remaining Set spread issues
        if grep -q "\[\.\.\.new Set" "$file"; then
            echo -e "${BLUE}Fixing Set spread in: $file${NC}"
            # Replace Set spread with filter approach
            sed -i '' 's|\[\.\.\.new Set(\[\.\.\..*\])\]|allItems.filter((item, index) => allItems.indexOf(item) === index)|g' "$file"
            fixes_applied=$((fixes_applied + 1))
        fi
        
        # Fix missing async/await types
        if grep -q "async.*=>" "$file" && ! grep -q "Promise<" "$file"; then
            echo -e "${BLUE}Checking async types in: $file${NC}"
            # This would need more specific logic per file
        fi
    fi
done

# Summary
echo ""
echo -e "${GREEN}🎉 IMPORT FIXES COMPLETED!${NC}"
echo "=========================="
echo -e "${BLUE}Total fixes applied: ${fixes_applied}${NC}"

if [ $fixes_applied -gt 0 ]; then
    echo ""
    echo -e "${YELLOW}📋 Next Steps:${NC}"
    echo "1. Run type check: npm run type-check"
    echo "2. Run tests: npm run test"
    echo "3. Build application: npm run build"
    echo "4. Verify all fixes: npm run validate-production"
else
    echo -e "${GREEN}No import issues found!${NC}"
fi

echo ""
echo -e "${BLUE}Import fixes completed at $(date)${NC}"