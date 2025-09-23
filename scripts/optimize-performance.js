#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting Performance Optimization...\n');

// Check if .next directory exists
const nextDir = path.join(process.cwd(), '.next');
if (!fs.existsSync(nextDir)) {
  console.log('❌ .next directory not found. Please run "npm run build" first.');
  process.exit(1);
}

// Analyze bundle sizes
console.log('📊 Analyzing bundle sizes...');
try {
  const bundleAnalyzer = execSync('npx @next/bundle-analyzer .next/static/chunks', { 
    encoding: 'utf8',
    stdio: 'pipe'
  });
  console.log('✅ Bundle analysis completed');
} catch (error) {
  console.log('⚠️  Bundle analyzer not available. Install with: npm install --save-dev @next/bundle-analyzer');
}

// Check for large files
console.log('\n🔍 Checking for large files...');
const staticDir = path.join(nextDir, 'static');
if (fs.existsSync(staticDir)) {
  const files = getAllFiles(staticDir);
  const largeFiles = files
    .map(file => ({
      path: file,
      size: fs.statSync(file).size
    }))
    .filter(file => file.size > 100 * 1024) // Files larger than 100KB
    .sort((a, b) => b.size - a.size);

  if (largeFiles.length > 0) {
    console.log('📁 Large files found:');
    largeFiles.slice(0, 10).forEach(file => {
      console.log(`   ${(file.size / 1024).toFixed(1)}KB - ${path.relative(process.cwd(), file.path)}`);
    });
  } else {
    console.log('✅ No large files found');
  }
}

// Check image optimization
console.log('\n🖼️  Checking image optimization...');
const publicDir = path.join(process.cwd(), 'public');
if (fs.existsSync(publicDir)) {
  const imageFiles = getAllFiles(publicDir)
    .filter(file => /\.(jpg|jpeg|png|gif|webp|avif)$/i.test(file));
  
  if (imageFiles.length > 0) {
    console.log(`📸 Found ${imageFiles.length} image files`);
    console.log('💡 Consider converting to WebP/AVIF format for better compression');
  }
}

// Check for unused dependencies
console.log('\n📦 Checking for unused dependencies...');
try {
  const depcheck = execSync('npx depcheck --json', { 
    encoding: 'utf8',
    stdio: 'pipe'
  });
  const result = JSON.parse(depcheck);
  
  if (result.dependencies.length > 0) {
    console.log('⚠️  Potentially unused dependencies:');
    result.dependencies.forEach(dep => console.log(`   ${dep}`));
  }
  
  if (result.devDependencies.length > 0) {
    console.log('⚠️  Potentially unused dev dependencies:');
    result.devDependencies.forEach(dep => console.log(`   ${dep}`));
  }
  
  if (result.dependencies.length === 0 && result.devDependencies.length === 0) {
    console.log('✅ No unused dependencies found');
  }
} catch (error) {
  console.log('⚠️  Depcheck not available. Install with: npm install --save-dev depcheck');
}

// Performance recommendations
console.log('\n💡 Performance Recommendations:');
console.log('   1. Use Next.js Image component with proper sizing');
console.log('   2. Implement lazy loading for below-the-fold content');
console.log('   3. Use font-display: swap for web fonts');
console.log('   4. Enable compression (gzip/brotli) on your server');
console.log('   5. Use CDN for static assets');
console.log('   6. Implement service worker for caching');
console.log('   7. Monitor Core Web Vitals');

// Check Core Web Vitals thresholds
console.log('\n🎯 Core Web Vitals Targets:');
console.log('   LCP (Largest Contentful Paint): ≤ 2.5s');
console.log('   FID (First Input Delay): ≤ 100ms');
console.log('   CLS (Cumulative Layout Shift): ≤ 0.1');

console.log('\n✅ Performance optimization analysis completed!');

function getAllFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...getAllFiles(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  
  return files;
}
