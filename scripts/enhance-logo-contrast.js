const sharp = require('sharp');
const path = require('path');

async function enhanceLogoContrast() {
  const inputPath = path.join(__dirname, '../public/my-company-logo-backup.png');
  const outputPath = path.join(__dirname, '../public/my-company-logo-enhanced.png');
  
  try {
    console.log('🎨 Enhancing logo contrast and visibility...');
    
    await sharp(inputPath)
      .raw()
      .toBuffer({ resolveWithObject: true })
      .then(({ data, info }) => {
        const { width, height, channels } = info;
        const output = Buffer.alloc(width * height * 4); // RGBA output
        
        for (let i = 0; i < data.length; i += channels) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // Enhanced black detection and contrast
          const brightness = Math.max(r, g, b);
          const saturation = Math.max(r, g, b) - Math.min(r, g, b);
          
          // More aggressive background removal
          const isBackground = brightness < 40 && saturation < 30;
          
          // Enhance contrast for non-background pixels
          let newR = r, newG = g, newB = b;
          if (!isBackground) {
            // Increase contrast and darken colors
            newR = Math.min(255, Math.max(0, (r - 128) * 1.5 + 128));
            newG = Math.min(255, Math.max(0, (g - 128) * 1.5 + 128));
            newB = Math.min(255, Math.max(0, (b - 128) * 1.5 + 128));
            
            // Make colors darker and more saturated
            newR = Math.max(0, newR * 0.8);
            newG = Math.max(0, newG * 0.8);
            newB = Math.max(0, newB * 0.8);
          }
          
          const outputIndex = (i / channels) * 4;
          output[outputIndex] = newR;
          output[outputIndex + 1] = newG;
          output[outputIndex + 2] = newB;
          output[outputIndex + 3] = isBackground ? 0 : 255;
        }
        
        return sharp(output, { raw: { width, height, channels: 4 } })
          .png()
          .toFile(outputPath);
      });
    
    console.log('✅ Enhanced logo created successfully!');
    console.log(`✅ Enhanced logo saved as: ${outputPath}`);
    
    // Replace the current logo with the enhanced version
    const fs = require('fs');
    fs.copyFileSync(outputPath, path.join(__dirname, '../public/my-company-logo.png'));
    console.log('✅ Current logo updated with enhanced version');
    
  } catch (error) {
    console.error('❌ Error enhancing logo:', error.message);
  }
}

enhanceLogoContrast();