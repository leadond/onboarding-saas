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

// Clean up duplicate imports
const cleanupDuplicates = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  // Remove duplicate import lines
  const lines = content.split('\n');
  const seenImports = new Set();
  const cleanedLines = [];
  
  for (const line of lines) {
    if (line.trim().startsWith('import type { Tables } from \'@/types/supabase\'')) {
      if (!seenImports.has(line.trim())) {
        seenImports.add(line.trim());
        cleanedLines.push(line);
      } else {
        changed = true;
        // Skip duplicate
      }
    } else {
      cleanedLines.push(line);
    }
  }
  
  if (changed) {
    content = cleanedLines.join('\n');
    fs.writeFileSync(filePath, content);
    console.log(`Cleaned duplicates in: ${filePath}`);
  }
};

// Main execution
const projectRoot = process.cwd();
const files = findFiles(projectRoot);

console.log(`Cleaning up duplicate imports in ${files.length} files...`);

let cleanedCount = 0;
for (const file of files) {
  try {
    const originalContent = fs.readFileSync(file, 'utf8');
    cleanupDuplicates(file);
    const newContent = fs.readFileSync(file, 'utf8');
    
    if (originalContent !== newContent) {
      cleanedCount++;
    }
  } catch (error) {
    console.error(`Error processing ${file}:`, error.message);
  }
}

console.log(`Cleaned duplicates in ${cleanedCount} files.`);