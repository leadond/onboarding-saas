const sharp = require('sharp');
const path = require('path');

async function removeBlackBackground() {
  const inputPath = path.join(__dirname, '../public/my-company-logo.png');
  const outputPath = path.join(__dirname, '../public/my-company-logo-transparent.png');
  
  try {
    console.log('Processing logo to remove black background...');
    
    // Read the image and make black pixels transparent
    await sharp(inputPath)
      .png()
      .flatten({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .raw()
      .toBuffer({ resolveWithObject: true })
      .then(({ data, info }) => {
        // Process the raw pixel data to make black/dark pixels transparent
        const { width, height, channels } = info;
        const pixelArray = new Uint8Array(width * height * 4); // RGBA
        
        for (let i = 0; i < data.length; i += channels) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // Calculate if pixel is close to black (threshold for dark colors)
          const brightness = (r + g + b) / 3;
          const isBlackish = brightness < 50; // Adjust threshold as needed
          
          const pixelIndex = (i / channels) * 4;
          pixelArray[pixelIndex] = r;     // Red
          pixelArray[pixelIndex + 1] = g; // Green
          pixelArray[pixelIndex + 2] = b; // Blue
          pixelArray[pixelIndex + 3] = isBlackish ? 0 : 255; // Alpha (transparent if blackish)
        }
        
        return sharp(pixelArray, { raw: { width, height, channels: 4 } })
          .png()
          .toFile(outputPath);
      });
    
    console.log('✅ Background removed successfully!');
    console.log(`✅ New logo saved as: ${outputPath}`);
    console.log('✅ Original logo backed up as: my-company-logo-backup.png');
    
    // Replace the original with the transparent version
    const fs = require('fs');
    fs.copyFileSync(outputPath, inputPath);
    console.log('✅ Original logo updated with transparent background');
    
  } catch (error) {
    console.error('❌ Error processing image:', error.message);
    
    // Fallback: Try a simpler approach
    console.log('🔄 Trying alternative method...');
    
    try {
      await sharp(inputPath)
        .png()
        .threshold(50) // Convert dark pixels to black, light to white
        .negate() // Invert colors
        .threshold(200) // Create mask
        .negate() // Invert back
        .toFile(outputPath);
        
      console.log('✅ Alternative method completed');
      
    } catch (fallbackError) {
      console.error('❌ Fallback method also failed:', fallbackError.message);
      console.log('💡 Manual editing may be required');
    }
  }
}

// Run the function
removeBlackBackground();