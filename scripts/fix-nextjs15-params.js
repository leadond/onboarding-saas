#!/usr/bin/env node

/**
 * Fix Next.js 15 params issues across all API routes
 * This script updates route handlers to properly handle Promise<params>
 */

const fs = require('fs')
const path = require('path')

const routesToFix = [
  'app/api/kits/[kitId]/route.ts',
  'app/api/onboarding/steps/[stepId]/route.ts', 
  'app/api/kits/[kitId]/steps/[stepId]/route.ts'
]

function fixParamsInFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`)
    return
  }

  let content = fs.readFileSync(filePath, 'utf8')
  let modified = false

  // Fix function signatures that don't use Promise<params>
  const oldSignaturePattern = /{ params }: { params: { ([^}]+) } }/g
  if (content.match(oldSignaturePattern)) {
    content = content.replace(oldSignaturePattern, '{ params }: { params: Promise<{ $1 }> }')
    modified = true
  }

  // Add await params destructuring at start of function
  const functionStartPattern = /export async function (GET|POST|PUT|PATCH|DELETE)\(\s*[^)]+\) {\s*try {/g
  const matches = [...content.matchAll(functionStartPattern)]
  
  for (const match of matches.reverse()) {
    const insertPos = match.index + match[0].length
    if (!content.slice(insertPos, insertPos + 100).includes('await params')) {
      // Extract param names from the function signature
      const paramMatch = content.match(/{ params }: { params: Promise<{ ([^}]+) }> }/)
      if (paramMatch) {
        const paramNames = paramMatch[1].split(',').map(p => p.split(':')[0].trim())
        const destructure = `\n    const { ${paramNames.join(', ')} } = await params`
        content = content.slice(0, insertPos) + destructure + content.slice(insertPos)
        modified = true
      }
    }
  }

  // Replace direct params.property access with destructured variables
  content = content.replace(/params\.(\w+)/g, '$1')

  if (modified) {
    fs.writeFileSync(filePath, content)
    console.log(`Fixed: ${filePath}`)
  } else {
    console.log(`No changes needed: ${filePath}`)
  }
}

// Fix the identified files
routesToFix.forEach(route => {
  const fullPath = path.join(process.cwd(), route)
  fixParamsInFile(fullPath)
})

console.log('Next.js 15 params fix completed!')