#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const OLD_COPYRIGHT = 'Copyright (c) 2024 Marvelously Made LLC DBA Dev App Hero. All rights reserved.';
const NEW_COPYRIGHT = 'Copyright (c) 2024 [Your LLC Name] DBA Dev App Hero. All rights reserved.';

function updateCopyrightInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes(OLD_COPYRIGHT)) {
    const newContent = content.replace(OLD_COPYRIGHT, NEW_COPYRIGHT);
    fs.writeFileSync(filePath, newContent);
    console.log(`Updated copyright in: ${filePath}`);
  }
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      processDirectory(filePath);
    } else if (file.match(/\.(ts|tsx|js|jsx)$/)) {
      updateCopyrightInFile(filePath);
    }
  });
}

// Run the script
processDirectory('./app');
processDirectory('./components');
processDirectory('./lib');
console.log('Copyright headers updated for DBA structure');