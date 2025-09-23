#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧹 Clearing all caches and forcing refresh...');

// Remove Next.js cache
const nextCachePath = path.join(process.cwd(), '.next');
if (fs.existsSync(nextCachePath)) {
  console.log('Removing .next cache...');
  execSync('rm -rf .next', { stdio: 'inherit' });
}

// Remove node_modules cache
const nodeModulesCachePath = path.join(process.cwd(), 'node_modules', '.cache');
if (fs.existsSync(nodeModulesCachePath)) {
  console.log('Removing node_modules cache...');
  execSync('rm -rf node_modules/.cache', { stdio: 'inherit' });
}

// Clear npm cache
console.log('Clearing npm cache...');
execSync('npm cache clean --force', { stdio: 'inherit' });

// Reinstall dependencies to ensure clean state
console.log('Reinstalling dependencies...');
execSync('npm install', { stdio: 'inherit' });

console.log('✅ Cache cleared successfully!');
console.log('🔄 Please restart your development server with: npm run dev');
console.log('💡 Also try hard refresh in browser: Ctrl+Shift+R (or Cmd+Shift+R on Mac)');
