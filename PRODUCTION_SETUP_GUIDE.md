# 🚀 Biomed Solutions - Production Setup & Deployment Guide

## 📋 Overview
Complete guide to set up your Biomed Solutions website with real-time database connectivity and deploy to production with live code update capabilities.

---

## 🗄️ Step 1: Database Setup (Using Your Existing complete-setup.sql)

### 1.1 Run Your Database Schema
You already have the perfect `scripts/complete-setup.sql` file! Let's use it:

1. **Go to your Supabase Dashboard** → **SQL Editor**
2. **Copy the entire contents** of `scripts/complete-setup.sql`
3. **Paste and click "Run"**
4. ✅ This creates all tables, indexes, triggers, and sample data

### 1.2 Verify Database Setup
After running the SQL, you should have these tables:
- ✅ `profiles` - User management
- ✅ `categories` - Product categories
- ✅ `products` - Medical equipment catalog
- ✅ `contact_messages` - Customer inquiries
- ✅ `inventory_history` - Stock tracking
- ✅ `website_settings` - Dynamic content
- ✅ `admin_settings` - Admin preferences

---

## 🔐 Step 2: Environment Configuration

### 2.1 Update .env.local with Your Credentials
Replace the placeholder values in `.env.local`:

```env
# Your actual Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key

# Enable all features
NEXT_PUBLIC_DATABASE_MODE=full
NEXT_PUBLIC_DISABLE_DEMO_BANNER=true
NEXT_PUBLIC_ENABLE_REALTIME=true
NODE_ENV=production
```

### 2.2 Get Your Supabase Credentials
1. **Go to Supabase Dashboard** → **Settings** → **API**
2. **Copy these values**:
   - **Project URL**: `https://xxx.supabase.co`
   - **anon public key**: `eyJ...`
   - **service_role key**: `eyJ...`

---

## 👨‍💼 Step 3: Create Admin User

### 3.1 Method 1: Supabase Dashboard
1. **Go to Authentication** → **Users**
2. **Click "Add User"**
3. **Enter**:
   - Email: `admin@biomed.com.np`
   - Password: (secure password)
   - **Auto Confirm**: ✅ Yes

### 3.2 Method 2: SQL Command
Run this in Supabase SQL Editor:
```sql
-- Create admin user and set role
INSERT INTO auth.users (
    email, 
    email_confirmed_at, 
    raw_user_meta_data
) VALUES (
    'admin@biomed.com.np', 
    now(), 
    '{"full_name": "Biomed Admin"}'
);

-- Update profile to admin role
UPDATE profiles 
SET 
    role = 'admin', 
    full_name = 'Biomed Admin',
    access_level = 'super_admin'
WHERE email = 'admin@biomed.com.np';
```

---

## ⚡ Step 4: Enable Real-Time Features

Your `complete-setup.sql` already has real-time triggers! Let's enhance the frontend:

### 4.1 Real-Time Product Updates
```typescript
// Already implemented in ProductGrid.tsx
const { data: products } = useRealtime('products', {
  filters: { is_active: true }
});
```

### 4.2 Real-Time Contact Messages
```typescript
// Already implemented in ContactMessages.tsx
const { data: messages } = useRealtime('contact_messages');
```

### 4.3 Real-Time Inventory Tracking
```typescript
// Already implemented in InventoryHistory.tsx
const { data: history } = useRealtime('inventory_history');
```

---

## 🌐 Step 5: Production Deployment

### 5.1 Deploy to Vercel (Recommended)

#### Quick Deploy:
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy (one command!)
vercel --prod

# Follow prompts:
# - Project name: biomed-solutions
# - Framework: Next.js
# - Root directory: ./
```

#### Set Environment Variables in Vercel:
1. **Go to Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**
2. **Add these variables**:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
NEXT_PUBLIC_DATABASE_MODE=full
NEXT_PUBLIC_DISABLE_DEMO_BANNER=true
NEXT_PUBLIC_ENABLE_REALTIME=true
```

### 5.2 Custom Domain Setup
1. **In Vercel Dashboard** → **Domains**
2. **Add your domain**: `biomedsolutions.com.np`
3. **Follow DNS configuration instructions**

---

## 🔄 Step 6: Live Code Updates & Dynamic Development

### 6.1 Git-Based Deployment (Auto-Deploy)
```bash
# Connect to GitHub for auto-deployment
git remote add origin https://github.com/yourusername/biomed-solutions.git
git push -u origin main

# Now any push to main branch auto-deploys!
git add .
git commit -m "Update product catalog"
git push origin main
# ✅ Auto-deploys to production in 2 minutes!
```

### 6.2 Branch-Based Development
```bash
# Create feature branch for safe development
git checkout -b feature/new-products
# Make changes...
git push origin feature/new-products
# ✅ Creates preview deployment at: feature-new-products.biomed-solutions.vercel.app
```

### 6.3 Dynamic Content Management
**Admin Panel Features** (already built):
- ✅ **Add/Edit Products** - Real-time updates
- ✅ **Upload Images** - Direct to Supabase Storage
- ✅ **Manage Categories** - Dynamic filtering
- ✅ **Website Settings** - Live content updates
- ✅ **Contact Messages** - Real-time notifications

---

## 📊 Step 7: Real-Time Database Features

### 7.1 Live Product Updates
```sql
-- When you add a product in admin panel:
INSERT INTO products (name, description, price, sku, category_id, is_featured)
VALUES ('New ECG Machine', 'Latest technology...', 15000, 'ECG-2024', category_id, true);
-- ✅ Immediately appears on website!
```

### 7.2 Live Inventory Tracking
```sql
-- Update stock automatically triggers inventory history:
UPDATE products SET stock_quantity = 45 WHERE sku = 'ECG-2024';
-- ✅ History logged automatically!
-- ✅ Admin dashboard updates in real-time!
```

### 7.3 Live Contact Messages
```sql
-- New contact form submission:
-- ✅ Instantly appears in admin panel
-- ✅ Real-time notification system
-- ✅ Auto-status tracking
```

---

## 🛠️ Step 8: Advanced Development Workflow

### 8.1 Local Development with Live Database
```bash
# Start development with production database
npm run dev
# ✅ Connected to live Supabase
# ✅ Real-time updates
# ✅ Shared data with production
```

### 8.2 Safe Code Updates
```bash
# Test changes safely
git checkout -b test/ui-improvements
npm run dev
# ✅ Test with live data
# ✅ No impact on production

# Deploy to staging
git push origin test/ui-improvements
# ✅ Preview at: test-ui-improvements.biomed.vercel.app

# Deploy to production
git checkout main
git merge test/ui-improvements
git push origin main
# ✅ Auto-deploys to production
```

### 8.3 Database Migrations
```sql
-- Add new table/column:
ALTER TABLE products ADD COLUMN warranty_period INTEGER DEFAULT 12;

-- Update app code to use new field
-- Deploy seamlessly!
```

---

## 🚀 Step 9: Testing Your Setup

### 9.1 Test Database Connection
```bash
# Start development server
npm run dev

# Check console for:
# ✅ "Supabase client initialized"
# ✅ "Database connection successful"
# ✅ "Real-time subscriptions active"
```

### 9.2 Test Admin Panel
1. **Go to**: `http://localhost:3001/auth/login`
2. **Login with**: `admin@biomed.com.np`
3. **Test features**:
   - ✅ Add a new product
   - ✅ Upload an image
   - ✅ Check real-time updates
   - ✅ View contact messages

### 9.3 Test Real-Time Features
1. **Open two browser tabs**:
   - Tab 1: Admin panel
   - Tab 2: Website
2. **Add product in admin**
3. **✅ See it appear instantly on website!**

---

## 📈 Step 10: Performance & Monitoring

### 10.1 Built-in Performance Features
- ✅ **Next.js 15** - Latest performance optimizations
- ✅ **Image optimization** - Automatic WebP conversion
- ✅ **Code splitting** - Faster page loads
- ✅ **Edge caching** - Global CDN
- ✅ **Real-time subscriptions** - Efficient updates

### 10.2 Monitoring
```bash
# Check Vercel analytics
vercel --logs

# Monitor Supabase
# Dashboard → Logs & Monitoring
```

---

## 🎯 Production Checklist

### Pre-Launch
- [ ] Database schema deployed (`complete-setup.sql`)
- [ ] Admin user created and tested
- [ ] Environment variables set in Vercel
- [ ] Custom domain configured
- [ ] Real-time features tested
- [ ] Contact form working
- [ ] Product catalog populated

### Post-Launch
- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Test real-time updates
- [ ] Verify admin panel access
- [ ] Monitor database usage

---

## 🔧 Future Code Changes Workflow

### Daily Development
```bash
# 1. Create feature branch
git checkout -b feature/description

# 2. Make changes locally
npm run dev  # Test with live database

# 3. Push for preview
git push origin feature/description
# ✅ Preview at: feature-description.biomed.vercel.app

# 4. Merge to production
git checkout main
git merge feature/description
git push origin main
# ✅ Auto-deploys to production!
```

### Emergency Updates
```bash
# Quick hotfix
git checkout -b hotfix/urgent-fix
# Make critical changes
git push origin hotfix/urgent-fix
# Deploy immediately to production
```

### Database Updates
```sql
-- Add new fields/tables directly in Supabase
-- Update code to use new schema
-- Deploy seamlessly with zero downtime
```

---

## 🎉 You're All Set!

Your Biomed Solutions website now has:
- ✅ **Real-time database** with live updates
- ✅ **Production deployment** on Vercel
- ✅ **Auto-deploy workflow** via Git
- ✅ **Dynamic admin panel** for content management
- ✅ **Live code updates** without downtime
- ✅ **Professional medical equipment catalog**
- ✅ **Real-time inventory tracking**
- ✅ **Customer inquiry management**

**🌐 Your website will be live at**: `https://your-project.vercel.app`

**🛡️ Admin access**: `https://your-project.vercel.app/auth/login`

**📱 Features**: Fully responsive, SEO optimized, production-ready!

---

## 🆘 Need Help?

- **Vercel Issues**: [vercel.com/docs](https://vercel.com/docs)
- **Supabase Issues**: [supabase.com/docs](https://supabase.com/docs)
- **Next.js Issues**: [nextjs.org/docs](https://nextjs.org/docs)

**Your Biomed Solutions website is now a powerful, real-time, production-ready platform! 🚀** 