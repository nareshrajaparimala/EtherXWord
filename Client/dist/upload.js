import fs from 'fs';
import path from 'path';

// NFT.Storage is deprecated, preparing files for alternative upload

// Build the project for deployment
async function buildProject() {
  console.log('🔨 Building EtherXWord for deployment...');
  
  // Check if dist folder exists
  const distPath = './dist';
  if (fs.existsSync(distPath)) {
    console.log('✅ Build folder found at ./dist');
    console.log('💡 Run: npm run build first if you need a fresh build');
  } else {
    console.log('⚠️ No build folder found.');
    console.log('💡 Run: npm run build to create production build');
  }
  
  console.log('\n🚀 To deploy EtherXWord:');
  console.log('1. Run: npm run build');
  console.log('2. Upload the dist/ folder to your hosting service');
  console.log('3. Configure your server to serve index.html for all routes');
}

buildProject();