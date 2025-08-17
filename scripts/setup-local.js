#!/usr/bin/env node

/**
 * Quick Local Setup Script for Biomed Solutions
 * This script helps set up the project for local development
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Biomed Solutions - Quick Local Setup\n');

// Check if we're in the right directory
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ Please run this script from the project root directory');
  process.exit(1);
}

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env.local file...');
  
  const envContent = `# Biomed Solutions - Local Development
# Replace with your actual Supabase credentials

# Your Supabase project URL
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# Your Supabase anon/public key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Service role key for server-side operations (keep secret)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Database Mode Configuration
NEXT_PUBLIC_DATABASE_MODE=full

# Application Settings
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME="Biomed Solutions"

# Remove demo banner for production
NEXT_PUBLIC_DISABLE_DEMO_BANNER=true
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env.local file');
} else {
  console.log('✅ .env.local already exists');
}

// Install dependencies
console.log('\n📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed');
} catch (error) {
  console.error('❌ Failed to install dependencies');
  process.exit(1);
}

// Check if node_modules exists and has required packages
const nodeModulesPath = path.join(process.cwd(), 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.error('❌ node_modules not found. Please run npm install manually.');
  process.exit(1);
}

console.log('\n🎉 Setup Complete!\n');

console.log('📋 Next Steps:');
console.log('1. Update .env.local with your Supabase credentials');
console.log('2. Set up your Supabase database using scripts/quick-setup.sql');
console.log('3. Run: npm run dev');
console.log('4. Open: http://localhost:3001\n');

console.log('📚 Documentation:');
console.log('- Quick Setup: ./scripts/quick-setup.sql');
console.log('- Deployment: ./DEPLOYMENT_GUIDE.md');
console.log('- Database Setup: ./DATABASE_SETUP_GUIDE.md\n');

console.log('🔧 Commands:');
console.log('- Start dev server: npm run dev');
console.log('- Build for production: npm run build');
console.log('- Start production: npm start');
console.log('- Run linter: npm run lint\n');

console.log('🌟 Features Available:');
console.log('- ✅ Modern medical equipment catalog');
console.log('- ✅ Admin panel for product management');
console.log('- ✅ Contact form with database storage');
console.log('- ✅ Responsive design for all devices');
console.log('- ✅ SEO optimized');
console.log('- ✅ Fast performance with Next.js 15\n');

console.log('Happy coding! 🎯'); 