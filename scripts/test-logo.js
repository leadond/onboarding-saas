// Test script to verify logo configuration
console.log('🔍 Testing Logo Configuration...\n');

// Check environment variables
console.log('Environment Variables:');
console.log('NEXT_PUBLIC_APP_LOGO_URL:', process.env.NEXT_PUBLIC_APP_LOGO_URL || 'NOT SET');
console.log('NEXT_PUBLIC_APP_NAME:', process.env.NEXT_PUBLIC_APP_NAME || 'NOT SET');
console.log('NEXT_PUBLIC_APP_TAGLINE:', process.env.NEXT_PUBLIC_APP_TAGLINE || 'NOT SET');

// Check if logo file exists
const fs = require('fs');
const path = require('path');

const logoPath = path.join(__dirname, '../public/my-company-logo.png');
const logoExists = fs.existsSync(logoPath);

console.log('\nLogo File Check:');
console.log('Logo file exists:', logoExists ? '✅ YES' : '❌ NO');
console.log('Logo path:', logoPath);

if (logoExists) {
  const stats = fs.statSync(logoPath);
  console.log('Logo file size:', Math.round(stats.size / 1024) + 'KB');
}

console.log('\n📋 Next Steps:');
console.log('1. Make sure your development server is stopped (Ctrl+C)');
console.log('2. Restart with: npm run dev');
console.log('3. Check the sidebar and login page for your logo');
console.log('4. If still showing text, clear browser cache (Cmd+Shift+R)');