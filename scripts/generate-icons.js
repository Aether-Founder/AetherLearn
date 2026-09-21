const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
const archiveDir = path.join(__dirname, '..', 'public', 'icons', 'archive');
const sourceImage = path.join(iconsDir, 'icon-512x512(edited).png');

// Create archive directory if it doesn't exist
if (!fs.existsSync(archiveDir)) {
  fs.mkdirSync(archiveDir, { recursive: true });
}

// Sizes to generate
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcons() {
  try {
    console.log('Starting icon generation...');
    
    // Archive old icons
    console.log('Archiving old icons...');
    const oldIcons = fs.readdirSync(iconsDir).filter(file => 
      file.startsWith('icon-') && file.endsWith('.png') && !file.includes('(edited)')
    );
    
    for (const icon of oldIcons) {
      const oldPath = path.join(iconsDir, icon);
      const newPath = path.join(archiveDir, icon);
      if (fs.existsSync(oldPath)) {
        fs.renameSync(oldPath, newPath);
        console.log(`Archived: ${icon}`);
      }
    }
    
    // Generate new icons from the edited source
    console.log('Generating new icons...');
    for (const size of sizes) {
      const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
      await sharp(sourceImage)
        .resize(size, size, {
          fit: 'cover',
          position: 'center'
        })
        .png()
        .toFile(outputPath);
      console.log(`Generated: icon-${size}x${size}.png`);
    }
    
    console.log('Icon generation complete!');
    console.log('Old icons archived to:', archiveDir);
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();
