const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Fixing Calendar icon module resolution issue...');

// Clear Next.js cache
const nextCachePath = path.join(process.cwd(), '.next');
if (fs.existsSync(nextCachePath)) {
  console.log('🗑️  Clearing Next.js cache...');
  fs.rmSync(nextCachePath, { recursive: true, force: true });
}

// Clear node_modules cache
const nodeModulesCachePath = path.join(process.cwd(), 'node_modules', '.cache');
if (fs.existsSync(nodeModulesCachePath)) {
  console.log('🗑️  Clearing node_modules cache...');
  fs.rmSync(nodeModulesCachePath, { recursive: true, force: true });
}

// Reinstall lucide-react to ensure clean installation
console.log('📦 Reinstalling lucide-react...');
try {
  execSync('npm uninstall lucide-react', { stdio: 'inherit' });
  execSync('npm install lucide-react@^0.539.0', { stdio: 'inherit' });
} catch (error) {
  console.log('⚠️  Could not reinstall lucide-react, continuing...');
}

console.log('✅ Cache cleared and dependencies updated!');
console.log('🚀 You can now restart your development server with: npm run dev');






