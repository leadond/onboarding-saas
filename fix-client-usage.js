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

// Fix client usage
const fixClientUsage = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  // Replace createClient() calls with await getSupabaseClient()
  if (content.includes('createClient()')) {
    content = content.replace(/createClient\(\)/g, 'await getSupabaseClient()');
    changed = true;
  }
  
  // Replace const supabase = createClient with const supabase = await getSupabaseClient()
  if (content.includes('= createClient')) {
    content = content.replace(/= createClient/g, '= await getSupabaseClient()');
    changed = true;
  }
  
  // If we made changes and the function isn't already async, make it async
  if (changed && !content.includes('async function') && !content.includes('async (')) {
    // Look for function declarations and make them async
    content = content.replace(/export async function (GET|POST|PUT|DELETE|PATCH)/g, 'export async function $1');
    content = content.replace(/function ([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g, 'async function $1(');
  }
  
  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed client usage in: ${filePath}`);
  }
};

// Main execution
const projectRoot = process.cwd();
const files = findFiles(projectRoot);

console.log(`Fixing client usage in ${files.length} files...`);

let fixedCount = 0;
for (const file of files) {
  try {
    const originalContent = fs.readFileSync(file, 'utf8');
    fixClientUsage(file);
    const newContent = fs.readFileSync(file, 'utf8');
    
    if (originalContent !== newContent) {
      fixedCount++;
    }
  } catch (error) {
    console.error(`Error processing ${file}:`, error.message);
  }
}

console.log(`Fixed client usage in ${fixedCount} files.`);