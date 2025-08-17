#!/usr/bin/env node

/**
 * Production Setup Script for Biomed Solutions
 * Helps set up environment and database for production deployment
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupProduction() {
  console.log('🚀 Biomed Solutions - Production Setup\n');
  console.log('This script will help you set up your production environment.\n');

  // Check if user has existing credentials
  const hasCredentials = await question(
    'Do you have your Supabase credentials ready? (y/N): '
  );

  if (hasCredentials.toLowerCase() !== 'y' && hasCredentials.toLowerCase() !== 'yes') {
    console.log('\n📋 Please get your Supabase credentials first:');
    console.log('1. Go to https://supabase.com/dashboard');
    console.log('2. Select your project');
    console.log('3. Go to Settings → API');
    console.log('4. Copy the Project URL and API keys\n');
    rl.close();
    return;
  }

  console.log('\n📝 Please provide your Supabase credentials:');

  const supabaseUrl = await question(
    'Supabase Project URL (e.g., https://xxx.supabase.co): '
  );
  
  const supabaseAnonKey = await question(
    'Supabase Anon Key (starts with eyJ...): '
  );
  
  const supabaseServiceKey = await question(
    'Supabase Service Role Key (starts with eyJ...): '
  );

  // Create production environment file
  const envContent = `# Biomed Solutions - Production Environment Configuration
# Generated automatically

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnonKey}
SUPABASE_SERVICE_ROLE_KEY=${supabaseServiceKey}

# Application Configuration
NEXT_PUBLIC_DATABASE_MODE=full
NEXT_PUBLIC_APP_NAME="Biomed Solutions"
NEXT_PUBLIC_DISABLE_DEMO_BANNER=true

# Real-time Features
NEXT_PUBLIC_ENABLE_REALTIME=true

# Production Settings
NODE_ENV=production

# Generated on: ${new Date().toISOString()}
`;

  try {
    const envPath = path.join(process.cwd(), '.env.local');
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ Environment file updated successfully!');
  } catch (error) {
    console.error('\n❌ Error creating environment file:', error.message);
    rl.close();
    return;
  }

  // Check if database schema is needed
  const needsSchema = await question(
    '\nDo you need to set up your database schema? (y/N): '
  );

  if (needsSchema.toLowerCase() === 'y' || needsSchema.toLowerCase() === 'yes') {
    console.log('\n🗄️ Database Setup Instructions:');
    console.log('1. Go to your Supabase Dashboard → SQL Editor');
    console.log('2. Copy the entire contents of scripts/complete-setup.sql');
    console.log('3. Paste and click "Run"');
    console.log('4. This will create all tables, triggers, and sample data');
  }

  // Create admin user
  const needsAdmin = await question(
    '\nDo you need to create an admin user? (y/N): '
  );

  if (needsAdmin.toLowerCase() === 'y' || needsAdmin.toLowerCase() === 'yes') {
    const adminEmail = await question(
      'Admin email (default: admin@biomed.com.np): '
    ) || 'admin@biomed.com.np';

    console.log('\n👨‍💼 Admin User Setup:');
    console.log('Option 1 - Supabase Dashboard:');
    console.log('1. Go to Authentication → Users');
    console.log('2. Click "Add User"');
    console.log(`3. Email: ${adminEmail}`);
    console.log('4. Set a secure password');
    console.log('5. Auto Confirm: Yes');

    console.log('\nOption 2 - SQL Command:');
    console.log('Run this in Supabase SQL Editor:');
    console.log(`
-- Create admin user
INSERT INTO auth.users (email, email_confirmed_at, raw_user_meta_data)
VALUES ('${adminEmail}', now(), '{"full_name": "Biomed Admin"}');

-- Set admin role
UPDATE profiles 
SET role = 'admin', full_name = 'Biomed Admin', access_level = 'super_admin'
WHERE email = '${adminEmail}';
`);
  }

  // Deployment options
  console.log('\n🌐 Deployment Options:');
  console.log('1. Vercel (Recommended):');
  console.log('   npm i -g vercel');
  console.log('   vercel --prod');
  console.log('');
  console.log('2. Manual deployment:');
  console.log('   npm run build');
  console.log('   npm start');

  // Test connection
  const testNow = await question(
    '\nDo you want to test the database connection now? (y/N): '
  );

  if (testNow.toLowerCase() === 'y' || testNow.toLowerCase() === 'yes') {
    console.log('\n🧪 Testing database connection...');
    console.log('Run: npm run dev');
    console.log('Then check the console for connection status');
  }

  console.log('\n🎉 Production setup complete!');
  console.log('\n📚 Next steps:');
  console.log('1. Run database schema (scripts/complete-setup.sql)');
  console.log('2. Create admin user');
  console.log('3. Test locally: npm run dev');
  console.log('4. Deploy: vercel --prod');
  console.log('5. Configure custom domain (optional)');

  console.log('\n📖 Full guide: PRODUCTION_SETUP_GUIDE.md');
  console.log('\nHappy deploying! 🚀');

  rl.close();
}

// Error handling
process.on('unhandledRejection', (error) => {
  console.error('\n❌ Unexpected error:', error.message);
  process.exit(1);
});

// Run the setup
setupProduction().catch((error) => {
  console.error('\n❌ Setup failed:', error.message);
  process.exit(1);
}); 