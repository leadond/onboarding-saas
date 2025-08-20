const fs = require('fs')

const filePath = 'app/api/kits/[kitId]/steps/[stepId]/route.ts'
let content = fs.readFileSync(filePath, 'utf8')

// Replace all params.kitId and params.stepId references
content = content.replace(/params\.kitId/g, 'kitId')
content = content.replace(/params\.stepId/g, 'stepId')

// Fix validation variable conflicts
content = content.replace(/const kitId = z\.string\(\)\.uuid\(\)\.parse\(kitId\)/g, 'const validatedKitId = z.string().uuid().parse(kitId)')
content = content.replace(/const stepId = z\.string\(\)\.uuid\(\)\.parse\(stepId\)/g, 'const validatedStepId = z.string().uuid().parse(stepId)')

// Update references to use validated variables
content = content.replace(/\.eq\('id', stepId\)/g, ".eq('id', validatedStepId)")
content = content.replace(/\.eq\('kit_id', kitId\)/g, ".eq('kit_id', validatedKitId)")
content = content.replace(/id: stepId,/g, 'id: validatedStepId,')

fs.writeFileSync(filePath, content)
console.log('Fixed kit steps params')