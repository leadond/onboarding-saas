const sharp = require('sharp');
const path = require('path');

async function refineLogo() {
  const inputPath = path.join(__dirname, '../public/my-company-logo-backup.png');
  const outputPath = path.join(__dirname, '../public/my-company-logo-refined.png');
  
  try {
    console.log('Creating refined logo with better transparency...');
    
    // More sophisticated background removal
    const image = sharp(inputPath);
    const { width, height } = await image.metadata();
    
    // Create a mask for non-black pixels and apply transparency
    await image
      .raw()
      .toBuffer({ resolveWithObject: true })
      .then(({ data, info }) => {
        const { channels } = info;
        const output = Buffer.alloc(width * height * 4); // RGBA output
        
        for (let i = 0; i < data.length; i += channels) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // More nuanced black detection
          const brightness = Math.max(r, g, b);
          const saturation = Math.max(r, g, b) - Math.min(r, g, b);
          
          // Consider a pixel "background" if it's very dark and low saturation
          const isBackground = brightness < 30 && saturation < 20;
          
          const outputIndex = (i / channels) * 4;
          output[outputIndex] = r;
          output[outputIndex + 1] = g;
          output[outputIndex + 2] = b;
          output[outputIndex + 3] = isBackground ? 0 : 255;
        }
        
        return sharp(output, { raw: { width, height, channels: 4 } })
          .png()
          .toFile(outputPath);
      });
    
    console.log('✅ Refined logo created successfully!');
    console.log(`✅ Refined logo saved as: ${outputPath}`);
    
  } catch (error) {
    console.error('❌ Error creating refined logo:', error.message);
  }
}

refineLogo();