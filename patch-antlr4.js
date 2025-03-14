const fs = require('fs');
const path = require('path');

// Files to patch
const filesToPatch = [
  'node_modules/antlr4/CharStreams.js',
  'node_modules/antlr4/FileStream.js'
];

// Patch each file
filesToPatch.forEach(filePath => {
  console.log(`Patching ${filePath}...`);
  
  try {
    // Read the file
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Replace the problematic require statements
    const patchedContent = content
      .replace(
        /var isNodeJs = typeof window === 'undefined' && typeof importScripts === 'undefined';/g,
        'var isNodeJs = false; // Patched for browser compatibility'
      )
      .replace(
        /var fs = isNodeJs \? require\("fs"\) : null;/g,
        'var fs = null; // Patched for browser compatibility'
      )
      .replace(
        /var fs = require\("fs"\);/g,
        'var fs = null; // Patched for browser compatibility'
      );
    
    // Write the patched content back to the file
    fs.writeFileSync(filePath, patchedContent, 'utf8');
    
    console.log(`Successfully patched ${filePath}`);
  } catch (error) {
    console.error(`Error patching ${filePath}:`, error);
  }
});

console.log('Patching complete!'); 