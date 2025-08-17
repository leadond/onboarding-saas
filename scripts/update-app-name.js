const fs = require('fs');
const path = require('path');

// Function to recursively get all files in a directory
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

// Function to replace text in a file
function replaceInFile(filePath, searchValue, replaceValue) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const newContent = content.replace(new RegExp(searchValue, 'g'), replaceValue);
    
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`Updated: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error.message);
  }
}

// Get all files in the project
const allFiles = getAllFiles('.');

// Files to exclude from updates
const excludePatterns = [
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  'coverage',
  '.vscode',
  '.idea',
  '.DS_Store'
];

// Filter out excluded files
const filesToUpdate = allFiles.filter(file => 
  !excludePatterns.some(pattern => file.includes(pattern)) &&
  (file.endsWith('.md') || file.endsWith('.mdx') || file.endsWith('.txt'))
);

// Perform replacements
const replacements = [
  { from: 'OnboardKit', to: 'Onboard Hero' },
  { from: 'onboardkit.com', to: 'onboardhero.com' },
  { from: 'OnboardKit Team', to: 'Onboard Hero Team' }
];

filesToUpdate.forEach(file => {
  replacements.forEach(replacement => {
    replaceInFile(file, replacement.from, replacement.to);
  });
});

console.log('App name update completed!');