#!/usr/bin/env node

// Install required packages first:
// npm install -g markdown-pdf

const fs = require('fs');
const path = require('path');

console.log('To convert the DBA guide to PDF:');
console.log('');
console.log('1. Install markdown-pdf globally:');
console.log('   npm install -g markdown-pdf');
console.log('');
console.log('2. Convert the file:');
console.log('   markdown-pdf TEXAS_DBA_FILING_GUIDE.md');
console.log('');
console.log('3. Or use this one-liner:');
console.log('   npx markdown-pdf TEXAS_DBA_FILING_GUIDE.md -o DBA_Filing_Guide.pdf');
console.log('');
console.log('The PDF will be created in the same directory.');