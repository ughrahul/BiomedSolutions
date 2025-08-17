# 🚀 Biomed Solutions - Complete Deployment Guide

## 📋 Overview
This guide will help you deploy a fully functional, production-ready Biomed Solutions website with Supabase backend and Vercel hosting.

## 🏗️ Architecture
- **Frontend**: Next.js 15 with TypeScript
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Hosting**: Vercel
- **Features**: Real products, admin panel, contact system, image management

## 🔧 Prerequisites
- Supabase account (free tier available)
- Vercel account (free tier available)
- Node.js 18+ installed locally

---

## 🗄️ Step 1: Supabase Database Setup

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create account
2. Click "New Project"
3. Choose organization and enter:
   - **Name**: `biomed-solutions`
   - **Database Password**: (secure password)
   - **Region**: Choose closest to your users
4. Wait 2-3 minutes for setup completion

### 1.2 Run Database Setup
1. Go to your Supabase Dashboard → **SQL Editor**
2. Copy the entire contents of `scripts/quick-setup.sql`
3. Paste and click **"Run"**
4. ✅ This creates all tables, sample data, and security policies

### 1.3 Get Your Credentials
1. Go to **Settings** → **API**
2. Copy these values:
   ```
   Project URL: https://your-project-id.supabase.co
   anon public key: eyJ...
   service_role key: eyJ...
   ```

---

## 🌐 Step 2: Vercel Deployment

### 2.1 Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project directory
cd biomed-nextjs✅
vercel

# Follow prompts:
# - Link to existing project? N
# - Project name: biomed-solutions
# - Directory: ./
# - Framework: Next.js
```

### 2.2 Set Environment Variables
In Vercel Dashboard → **Settings** → **Environment Variables**:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_DATABASE_MODE=full
NEXT_PUBLIC_APP_NAME=Biomed Solutions
NEXT_PUBLIC_DISABLE_DEMO_BANNER=true
```

### 2.3 Custom Domain (Optional)
1. Go to **Domains** → **Add Domain**
2. Enter your domain: `biomedsolutions.com.np`
3. Follow DNS configuration instructions

---

## 👨‍💼 Step 3: Create Admin User

### 3.1 Create Admin Account
1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Click **"Add User"**
3. Enter:
   - **Email**: `admin@biomed.com.np`
   - **Password**: (secure password)
   - **Auto Confirm**: ✅ Yes

### 3.2 Set Admin Role
1. Go to **SQL Editor**
2. Run this query:
```sql
UPDATE profiles 
SET role = 'admin', full_name = 'Biomed Admin' 
WHERE email = 'admin@biomed.com.np';
```

---

## 📷 Step 4: Upload Real Product Images

### 4.1 Enable Storage
1. Go to **Storage** → **New Bucket**
2. Name: `product-images`
3. Make it **Public**

### 4.2 Upload Images
1. Upload your product images to the bucket
2. Copy image URLs (format: `https://your-project.supabase.co/storage/v1/object/public/product-images/image.jpg`)

### 4.3 Update Products with Real Images
```sql
-- Update products with real image URLs
UPDATE products 
SET images = ARRAY['https://your-project.supabase.co/storage/v1/object/public/product-images/ecg-machine.jpg']
WHERE sku = 'ECG-DIG-001';

UPDATE products 
SET images = ARRAY['https://your-project.supabase.co/storage/v1/object/public/product-images/ultrasound.jpg']
WHERE sku = 'USG-PORT-002';

-- Add more real images...
```

---

## ✅ Step 5: Test Everything

### 5.1 Test Website Functions
1. **Homepage**: ✅ Products display with real images
2. **Products Page**: ✅ All products listed with details
3. **Product Details**: ✅ Individual product pages work
4. **Contact Form**: ✅ Messages save to database
5. **Admin Login**: ✅ Login at `/auth/login`
6. **Admin Panel**: ✅ Manage products, view messages

### 5.2 Test Admin Features
1. **Product Management**: Add/edit/delete products
2. **Image Upload**: Upload product images
3. **Contact Messages**: View and manage inquiries
4. **Inventory Tracking**: Monitor product changes

---

## 🏃‍♂️ Step 6: Performance Optimization

### 6.1 Image Optimization
```bash
# Install Sharp for optimized images (already included)
npm install sharp

# Images are automatically optimized by Next.js
```

### 6.2 SEO Configuration
The site includes:
- ✅ Meta tags and OpenGraph
- ✅ Structured data
- ✅ Sitemap generation
- ✅ Robots.txt

### 6.3 Performance Features
- ✅ Server-side rendering (SSR)
- ✅ Static generation for product pages
- ✅ Image lazy loading
- ✅ Code splitting
- ✅ Caching strategies

---

## 🔒 Step 7: Security & Production Setup

### 7.1 Environment Security
```env
# Production environment variables
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 7.2 Database Security
- ✅ Row Level Security (RLS) enabled
- ✅ Proper user permissions
- ✅ API rate limiting
- ✅ Input validation

### 7.3 Enable HTTPS
- ✅ Vercel provides automatic HTTPS
- ✅ SSL certificates auto-renewed

---

## 📊 Step 8: Analytics & Monitoring

### 8.1 Vercel Analytics
1. Enable in Vercel Dashboard → **Analytics**
2. Monitor performance and usage

### 8.2 Supabase Monitoring
1. Monitor database usage in Supabase Dashboard
2. Set up alerts for resource limits

---

## 🎯 Production Checklist

### Pre-Launch
- [ ] Database setup complete with real data
- [ ] Admin user created and tested
- [ ] Real product images uploaded
- [ ] Contact form tested
- [ ] Admin panel functionality verified
- [ ] Environment variables set correctly
- [ ] Custom domain configured (if applicable)

### Post-Launch
- [ ] Monitor website performance
- [ ] Check error logs in Vercel
- [ ] Monitor database usage in Supabase
- [ ] Test contact form submissions
- [ ] Verify admin panel access

---

## 🚨 Troubleshooting

### Common Issues

#### 1. "Navbar not visible"
- **Cause**: Missing environment variables
- **Solution**: Ensure all Supabase env vars are set in Vercel

#### 2. "Products not loading"
- **Cause**: Database connection issue
- **Solution**: Verify Supabase URL and keys are correct

#### 3. "Admin login not working"
- **Cause**: User doesn't have admin role
- **Solution**: Run the admin role SQL query

#### 4. "Images not displaying"
- **Cause**: Wrong image URLs or storage not public
- **Solution**: Check Supabase storage bucket is public

### Support
- **Vercel Support**: [vercel.com/help](https://vercel.com/help)
- **Supabase Support**: [supabase.com/docs](https://supabase.com/docs)

---

## 🎉 Congratulations!

Your Biomed Solutions website is now:
- ✅ **Fully functional** with real database
- ✅ **Production-ready** with proper security
- ✅ **Scalable** with Supabase and Vercel
- ✅ **Fast** with optimized performance
- ✅ **Professional** with admin management

**Live URL**: `https://your-project.vercel.app`

The website includes:
- 🏥 Real medical equipment catalog
- 📱 Responsive design for all devices
- 🔐 Secure admin panel
- 📧 Contact form with database storage
- 🖼️ Image management system
- 📊 Inventory tracking
- 🚀 Lightning-fast performance 