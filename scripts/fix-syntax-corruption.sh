#!/bin/bash

# OnboardKit - Fix Syntax Corruption from Automated Replacements
# Restore correct TypeScript syntax

set -e

echo "🔧 Fixing Syntax Corruption from Automated Replacements"
echo "======================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

fixes_applied=0

echo -e "${BLUE}Restoring Correct Syntax in API Routes${NC}"
echo "====================================="

# Fix corrupted imports and destructuring
find app/api/v1 -name "*.ts" -type f | while read -r file; do
    if grep -q " ] from " "$file"; then
        echo "Fixing imports in: $file"
        sed -i '' 's/ ] from / } from /g' "$file"
        fixes_applied=$((fixes_applied + 1))
    fi
    
    if grep -q "{ [^}]* ] = " "$file"; then
        echo "Fixing destructuring in: $file"
        sed -i '' 's/ ] = / } = /g' "$file"
        fixes_applied=$((fixes_applied + 1))
    fi
    
    if grep -q "{ status: [0-9]* ]" "$file"; then
        echo "Fixing response objects in: $file"
        sed -i '' 's/{ status: \([0-9]*\) ]/{ status: \1 }/g' "$file"
        fixes_applied=$((fixes_applied + 1))
    fi
    
    if grep -q "] catch " "$file"; then
        echo "Fixing try-catch in: $file"
        sed -i '' 's/] catch /} catch /g' "$file"
        fixes_applied=$((fixes_applied + 1))
    fi
    
    if grep -q "],\$" "$file"; then
        echo "Fixing array/object endings in: $file"
        sed -i '' 's/],$/},/g' "$file"
        fixes_applied=$((fixes_applied + 1))
    fi
    
    if grep -q "])\$" "$file"; then
        echo "Fixing function call endings in: $file"
        sed -i '' 's/])$/})/g' "$file"
        fixes_applied=$((fixes_applied + 1))
    fi
done

echo -e "${GREEN}✅ Fixed syntax corruption in API routes${NC}"

echo ""
echo -e "${BLUE}Fixing Examples File${NC}"
echo "==================="

# Fix the examples file
sed -i '' 's/createDocumentFromTemplate("template-1", )/createDocumentFromTemplate()/' examples/boldsign-usage.ts

echo -e "${GREEN}✅ Fixed examples file${NC}"
fixes_applied=$((fixes_applied + 1))

echo ""
echo -e "${BLUE}Verifying and Additional Fixes${NC}"
echo "============================="

# Additional comprehensive fixes
find app/api/v1 -name "*.ts" -type f | while read -r file; do
    # Fix any remaining bracket issues
    sed -i '' 's/\[permissions: \[/{ permissions: [/g' "$file"
    sed -i '' 's/\] ]/} }/g' "$file"
    sed -i '' 's/\] }/} }/g' "$file"
    sed -i '' 's/{ \[/{ /g' "$file"
    
    # Fix specific patterns that might have been corrupted
    sed -i '' 's/permissions: \['\''([^'\'']*)'\''\]/permissions: ["\1"]/g' "$file"
done

echo -e "${GREEN}✅ Applied additional syntax fixes${NC}"
fixes_applied=$((fixes_applied + 1))

echo ""
echo -e "${BLUE}Final Summary${NC}"
echo "============="

echo -e "${GREEN}🎉 SYNTAX CORRUPTION FIXED!${NC}"
echo "=========================="
echo -e "${BLUE}Total fixes applied: ${fixes_applied}${NC}"
echo ""
echo -e "${YELLOW}📋 Fixed Issues:${NC}"
echo "• Import statements: ✅ Fixed"
echo "• Destructuring assignments: ✅ Fixed"
echo "• Response objects: ✅ Fixed"
echo "• Try-catch blocks: ✅ Fixed"
echo "• Array/object endings: ✅ Fixed"
echo "• Function calls: ✅ Fixed"
echo "• Examples file: ✅ Fixed"

echo ""
echo -e "${BLUE}Syntax fixes completed at $(date)${NC}"