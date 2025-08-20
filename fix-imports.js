#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find all TypeScript files that need fixing
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

// Fix imports in a file
const fixImports = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  // Fix database types imports
  const oldImports = [
    /import type { Tables } from '@\/lib\/supabase\/database\.types'/g,
    /import type { Database } from '@\/lib\/supabase\/database\.types'/g,
    /type Tables<T extends keyof Database\['public'\]\['Tables'\]> = Database\['public'\]\['Tables'\]\[T\]\['Row'\]/g,
  ];
  
  const newImport = "import type { Tables } from '@/types/supabase'";
  
  for (const oldImport of oldImports) {
    if (oldImport.test(content)) {
      content = content.replace(oldImport, newImport);
      changed = true;
    }
  }
  
  // Fix Supabase client imports
  const supabaseImports = [
    /import { createClient } from '@\/lib\/supabase\/client'/g,
    /import { createClient } from '@\/lib\/supabase\/server'/g,
  ];
  
  for (const supabaseImport of supabaseImports) {
    if (supabaseImport.test(content)) {
      content = content.replace(supabaseImport, "import { getSupabaseClient } from '@/lib/supabase'");
      changed = true;
    }
  }
  
  // Remove duplicate type definitions
  const duplicateTypes = [
    /type ClientProgress = Tables<'client_progress'>/g,
    /type Tables<T extends keyof Database\['public'\]\['Tables'\]> = Database\['public'\]\['Tables'\]\[T\]\['Row'\]/g,
  ];
  
  for (const duplicateType of duplicateTypes) {
    if (duplicateType.test(content)) {
      content = content.replace(duplicateType, '// Type imported from @/types/supabase');
      changed = true;
    }
  }
  
  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed imports in: ${filePath}`);
  }
};

// Main execution
const projectRoot = process.cwd();
const files = findFiles(projectRoot);

console.log(`Found ${files.length} TypeScript files to check...`);

let fixedCount = 0;
for (const file of files) {
  try {
    const originalContent = fs.readFileSync(file, 'utf8');
    fixImports(file);
    const newContent = fs.readFileSync(file, 'utf8');
    
    if (originalContent !== newContent) {
      fixedCount++;
    }
  } catch (error) {
    console.error(`Error processing ${file}:`, error.message);
  }
}

console.log(`Fixed imports in ${fixedCount} files.`);