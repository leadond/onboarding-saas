#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const COPYRIGHT_HEADER = `/*
 * Copyright (c) 2024 Marvelously Made LLC DBA Dev App Hero. All rights reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * 
 * This software contains proprietary and confidential information.
 * Unauthorized copying, distribution, or use is strictly prohibited.
 * 
 * For licensing information, contact: legal@devapphero.com
 */

`;

function addCopyrightToFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Skip if copyright already exists
  if (content.includes('PROPRIETARY AND CONFIDENTIAL')) {
    return;
  }
  
  // Add copyright header
  const newContent = COPYRIGHT_HEADER + content;
  fs.writeFileSync(filePath, newContent);
  console.log(`Added copyright to: ${filePath}`);
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      processDirectory(filePath);
    } else if (file.match(/\.(ts|tsx|js|jsx)$/)) {
      addCopyrightToFile(filePath);
    }
  });
}

// Run the script
processDirectory('./app');
processDirectory('./components');
processDirectory('./lib');
console.log('Copyright headers added to all source files');