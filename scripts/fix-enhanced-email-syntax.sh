#!/bin/bash

# Fix syntax errors in enhanced email service
set -e

echo "🔧 Fixing Enhanced Email Service Syntax"
echo "======================================="

# Remove extra parentheses and fix syntax
sed -i '' 's/      })/      }/g' lib/services/enhanced-email-service.ts
sed -i '' 's/    })/    }/g' lib/services/enhanced-email-service.ts
sed -i '' 's/        continue/        return/g' lib/services/enhanced-email-service.ts
sed -i '' 's/        }), email.delay/        }, email.delay/g' lib/services/enhanced-email-service.ts
sed -i '' 's/      }) else {/      } else {/g' lib/services/enhanced-email-service.ts
sed -i '' 's/      })/      }/g' lib/services/enhanced-email-service.ts
sed -i '' 's/    })/    }/g' lib/services/enhanced-email-service.ts
sed -i '' 's/      })/      }/g' lib/services/enhanced-email-service.ts

echo "✅ Fixed syntax errors"