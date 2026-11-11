const fs = require('fs');
const path = require('path');

const booksDir = path.join(__dirname, '..', 'content', 'books');
const publicDir = path.join(__dirname, '..', 'public', 'content', 'books');

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Copy the index.json file
const indexJsonSrc = path.join(booksDir, 'index.json');
const indexJsonDest = path.join(publicDir, 'index.json');
if (fs.existsSync(indexJsonSrc)) {
  fs.copyFileSync(indexJsonSrc, indexJsonDest);
  console.log('Copied index.json');
}

// Get all book directories
const bookDirs = fs.readdirSync(booksDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

// Copy each book directory
bookDirs.forEach(bookName => {
  const sourceDir = path.join(booksDir, bookName);
  const destDir = path.join(publicDir, bookName);

  // Create destination directory
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  // Copy all files
  const files = fs.readdirSync(sourceDir);
  files.forEach(file => {
    const srcFile = path.join(sourceDir, file);
    const destFile = path.join(destDir, file);
    fs.copyFileSync(srcFile, destFile);
  });

  console.log(`Copied ${bookName}`);
});

console.log('All books copied to public directory');
