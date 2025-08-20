#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Find all TypeScript files
const findFiles = (dir, extensions = ['.ts', '.tsx']) => {
  const files = [];
  
  const scan = (currentDir) => {
    if (currentDir.includes('node_modules') || currentDir.includes('.next')) return;
    
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scan(fullPath);
      } else if (extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  };
  
  scan(dir);
  return files;
};

// Fix syntax errors
const fixSyntaxErrors = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  // Fix double await
  if (content.includes('await await')) {
    content = content.replace(/await await/g, 'await');
    changed = true;
  }
  
  // Fix broken function declarations
  if (content.includes('export function await getSupabaseClient')) {
    content = content.replace(/export function await getSupabaseClient/g, 'export function createClient');
    changed = true;
  }
  
  // Fix recursive calls in unified.ts
  if (filePath.includes('unified.ts') && content.includes('return await getSupabaseClient()')) {
    content = content.replace('return await getSupabaseClient()', 'return createClient()');
    changed = true;
  }
  
  // Fix hooks that can't use await at top level
  if (filePath.includes('hooks/') && content.includes('const supabase = await getSupabaseClient()')) {
    content = content.replace(/const supabase = await getSupabaseClient\(\)/g, '// Supabase client will be created in useEffect');
    changed = true;
  }
  
  // Fix class properties that can't use await
  if (content.includes('private supabase = await getSupabaseClient()')) {
    content = content.replace(/private supabase = await getSupabaseClient\(\)/g, 'private supabase: any = null');
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed syntax errors in: ${filePath}`);
  }
};

// Main execution
const projectRoot = process.cwd();
const files = findFiles(projectRoot);

console.log(`Fixing syntax errors in ${files.length} files...`);

let fixedCount = 0;
for (const file of files) {
  try {
    const originalContent = fs.readFileSync(file, 'utf8');
    fixSyntaxErrors(file);
    const newContent = fs.readFileSync(file, 'utf8');
    
    if (originalContent !== newContent) {
      fixedCount++;
    }
  } catch (error) {
    console.error(`Error processing ${file}:`, error.message);
  }
}

console.log(`Fixed syntax errors in ${fixedCount} files.`);