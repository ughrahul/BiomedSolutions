-- Complete Database Setup for Biomed Solutions
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (clean slate)
DROP TABLE IF EXISTS public.inventory_history CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.contact_messages CASCADE;
DROP TABLE IF EXISTS public.inquiries CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.admin_settings CASCADE;
DROP TABLE IF EXISTS public.website_settings CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create profiles table with all required columns
CREATE TABLE public.profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    full_name TEXT,
    email TEXT NOT NULL,
    avatar_url TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    access_level TEXT DEFAULT 'standard',
    is_active BOOLEAN DEFAULT true,
    employee_id TEXT,
    department TEXT,
    position TEXT,
    login_count INTEGER DEFAULT 0,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create categories table
CREATE TABLE public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    slug TEXT UNIQUE NOT NULL,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create products table
CREATE TABLE public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    short_description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    sale_price DECIMAL(10,2) CHECK (sale_price >= 0),
    sku VARCHAR(100) UNIQUE NOT NULL,
    stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    images TEXT[] DEFAULT '{}',
    specifications JSONB,
    features TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    meta_title TEXT,
    meta_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE public.orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE RESTRICT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    shipping_address JSONB NOT NULL,
    billing_address JSONB NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create order_items table
CREATE TABLE public.order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE RESTRICT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create contact_messages table
CREATE TABLE public.contact_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    organization TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'responded', 'resolved')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create inventory_history table
CREATE TABLE public.inventory_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'deleted', 'stock_changed', 'price_changed', 'activated', 'deactivated')),
    old_values JSONB,
    new_values JSONB,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create admin_settings table
CREATE TABLE public.admin_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    company_name TEXT DEFAULT 'Biomed Solutions',
    company_address TEXT,
    company_phone TEXT,
    company_email TEXT,
    notification_preferences JSONB DEFAULT '{"email": true, "browser": true, "inventory_alerts": true, "new_orders": true}',
    theme_preferences JSONB DEFAULT '{"sidebar_collapsed": false, "theme": "light"}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create website_settings table
CREATE TABLE public.website_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_is_active ON public.profiles(is_active);

CREATE INDEX idx_categories_slug ON public.categories(slug);
CREATE INDEX idx_categories_is_active ON public.categories(is_active);

CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_products_sku ON public.products(sku);
CREATE INDEX idx_products_is_active ON public.products(is_active);

CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);

CREATE INDEX idx_contact_messages_status ON public.contact_messages(status);
CREATE INDEX idx_contact_messages_email ON public.contact_messages(email);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_contact_messages_updated_at
    BEFORE UPDATE ON public.contact_messages
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_admin_settings_updated_at
    BEFORE UPDATE ON public.admin_settings
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_website_settings_updated_at
    BEFORE UPDATE ON public.website_settings
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, email, full_name, is_active)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), true);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to increment login count
CREATE OR REPLACE FUNCTION public.increment(row_name TEXT)
RETURNS INTEGER AS $$
BEGIN
    RETURN 1;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;

-- Create simplified RLS policies (no role-based access)
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "All authenticated users can view all profiles" ON public.profiles
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can view active categories" ON public.categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can manage categories" ON public.categories
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can view active products" ON public.products
    FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can manage products" ON public.products
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view own orders" ON public.orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view all orders" ON public.orders
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can create contact messages" ON public.contact_messages
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can manage contact messages" ON public.contact_messages
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage inventory history" ON public.inventory_history
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage own settings" ON public.admin_settings
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Authenticated users can manage website settings" ON public.website_settings
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
DROP POLICY IF EXISTS "Anyone can view product images" ON storage.objects;
CREATE POLICY "Anyone can view product images" ON storage.objects
    FOR SELECT USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Authenticated users can manage product images" ON storage.objects;
CREATE POLICY "Authenticated users can manage product images" ON storage.objects
    FOR ALL USING (
        bucket_id = 'product-images' AND
        auth.uid() IS NOT NULL
    );

-- Insert sample data
INSERT INTO public.categories (name, description, slug, is_active, sort_order) VALUES
('Diagnostic Equipment', 'Advanced medical diagnostic tools and devices', 'diagnostic-equipment', true, 1),
('Surgical Instruments', 'High-precision surgical tools and equipment', 'surgical-instruments', true, 2),
('Patient Monitoring', 'Real-time patient monitoring systems and devices', 'patient-monitoring', true, 3),
('Laboratory Equipment', 'Professional laboratory testing and analysis equipment', 'laboratory-equipment', true, 4),
('Medical Imaging', 'Advanced medical imaging and radiology equipment', 'medical-imaging', true, 5),
('Emergency Care', 'Critical care and emergency response equipment', 'emergency-care', true, 6)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample products
DO $$
DECLARE
    diagnostic_cat_id UUID;
    imaging_cat_id UUID;
    monitoring_cat_id UUID;
    surgical_cat_id UUID;
    lab_cat_id UUID;
    emergency_cat_id UUID;
BEGIN
    -- Get category IDs
    SELECT id INTO diagnostic_cat_id FROM public.categories WHERE slug = 'diagnostic-equipment';
    SELECT id INTO imaging_cat_id FROM public.categories WHERE slug = 'medical-imaging';
    SELECT id INTO monitoring_cat_id FROM public.categories WHERE slug = 'patient-monitoring';
    SELECT id INTO surgical_cat_id FROM public.categories WHERE slug = 'surgical-instruments';
    SELECT id INTO lab_cat_id FROM public.categories WHERE slug = 'laboratory-equipment';
    SELECT id INTO emergency_cat_id FROM public.categories WHERE slug = 'emergency-care';

    -- Insert products
    INSERT INTO public.products (
        name, description, short_description, price, sku, stock_quantity, 
        category_id, features, specifications, is_active, is_featured, images
    ) VALUES
    -- Featured Diagnostic Equipment
    (
        'Digital Blood Pressure Monitor',
        'Professional-grade digital blood pressure monitor with advanced accuracy technology and memory storage for comprehensive patient monitoring.',
        'Professional digital BP monitor with memory storage',
        299.99,
        'DBP-001',
        50,
        diagnostic_cat_id,
        ARRAY['Automatic inflation', 'Memory storage', 'Irregular heartbeat detection'],
        '{"accuracy": "±3 mmHg", "cuff_size": "22-42 cm", "memory": "60 readings"}',
        true,
        true,
        ARRAY['/assets/images/placeholder-product.svg']
    ),
    (
        'Digital ECG Machine',
        'Advanced 12-lead ECG machine with high-resolution display and automatic interpretation capabilities for comprehensive cardiac monitoring.',
        'Advanced 12-lead ECG machine with automatic interpretation',
        15000.00,
        'ECG-DIG-001',
        8,
        diagnostic_cat_id,
        ARRAY['12-lead ECG recording', 'Automatic interpretation', 'Wireless connectivity', 'Touch screen display'],
        '{"display": "10.1 inch touchscreen", "connectivity": "WiFi, Bluetooth", "power": "Battery + AC", "leads": "12-lead"}',
        true,
        true,
        ARRAY['/assets/images/placeholder-product.svg']
    ),
    -- Featured Medical Imaging
    (
        'Portable Ultrasound Scanner',
        'Compact portable ultrasound system with advanced imaging technology for point-of-care diagnostics and mobile medical applications.',
        'Compact portable ultrasound with advanced imaging',
        25000.00,
        'US-PORT-002',
        5,
        imaging_cat_id,
        ARRAY['Portable design', 'Multiple transducers', 'Cloud connectivity', 'Battery operated'],
        '{"weight": "2.5 kg", "battery_life": "4 hours", "display": "15 inch LED", "connectivity": "WiFi, USB"}',
        true,
        true,
        ARRAY['/assets/images/placeholder-product.svg']
    ),
    -- Featured Patient Monitoring
    (
        'Multi-Parameter Patient Monitor',
        'Comprehensive patient monitoring system with real-time vital signs tracking, alarm management, and data recording capabilities.',
        'Multi-parameter monitor for vital signs tracking',
        8500.00,
        'PM-MULTI-003',
        12,
        monitoring_cat_id,
        ARRAY['ECG monitoring', 'SpO2 measurement', 'Blood pressure', 'Temperature', 'Alarm system'],
        '{"parameters": "ECG, SpO2, NIBP, Temperature", "display": "12.1 inch", "alarms": "Audio/Visual", "connectivity": "Network ready"}',
        true,
        true,
        ARRAY['/assets/images/placeholder-product.svg']
    ),
    -- Featured Surgical Instruments
    (
        'Surgical Cautery Unit',
        'Advanced electrosurgical generator with multiple cutting and coagulation modes for precise surgical procedures.',
        'Advanced electrosurgical generator for precise surgery',
        12000.00,
        'SC-ADV-004',
        6,
        surgical_cat_id,
        ARRAY['Multiple cutting modes', 'Coagulation control', 'Safety features', 'Digital display'],
        '{"power": "400W", "modes": "Cut, Coag, Blend", "safety": "Return electrode monitoring", "display": "LCD"}',
        true,
        true,
        ARRAY['/assets/images/placeholder-product.svg']
    ),
    -- Featured Laboratory Equipment
    (
        'Automated Chemistry Analyzer',
        'High-throughput automated chemistry analyzer for comprehensive blood chemistry testing with advanced quality control.',
        'High-throughput automated chemistry analyzer',
        45000.00,
        'CA-AUTO-005',
        3,
        lab_cat_id,
        ARRAY['Automated processing', 'Quality control', 'Multiple test panels', 'Data management'],
        '{"throughput": "200 tests/hour", "sample_volume": "2-35 μL", "tests": "Chemistry panel", "connectivity": "LIS compatible"}',
        true,
        true,
        ARRAY['/assets/images/placeholder-product.svg']
    ),
    -- Featured Emergency Care
    (
        'Automated External Defibrillator',
        'Life-saving automated external defibrillator with voice prompts and visual indicators for emergency cardiac care.',
        'Life-saving AED with voice prompts and indicators',
        3500.00,
        'AED-AUTO-006',
        15,
        emergency_cat_id,
        ARRAY['Voice prompts', 'Visual indicators', 'Automatic analysis', 'Shock delivery'],
        '{"energy": "150-200J", "analysis": "Automatic", "prompts": "Voice + Visual", "battery": "5 year standby"}',
        true,
        true,
        ARRAY['/assets/images/placeholder-product.svg']
    ),
    -- Additional non-featured products for variety
    (
        'Digital Thermometer Set',
        'Professional digital thermometer set with multiple measurement modes for accurate temperature readings.',
        'Professional digital thermometer with multiple modes',
        89.99,
        'DT-SET-007',
        100,
        diagnostic_cat_id,
        ARRAY['Multiple modes', 'Quick reading', 'Memory function', 'Fever alarm'],
        '{"accuracy": "±0.1°C", "response_time": "8 seconds", "memory": "32 readings", "modes": "Oral, Rectal, Axillary"}',
        true,
        false,
        ARRAY['/assets/images/placeholder-product.svg']
    ),
    (
        'Pulse Oximeter',
        'Professional pulse oximeter for accurate SpO2 and pulse rate monitoring with digital display.',
        'Professional pulse oximeter for SpO2 monitoring',
        149.99,
        'PO-PROF-008',
        75,
        monitoring_cat_id,
        ARRAY['SpO2 monitoring', 'Pulse rate', 'Digital display', 'Low battery indicator'],
        '{"range": "70-100% SpO2", "accuracy": "±2%", "display": "LED", "battery": "30 hours continuous"}',
        true,
        false,
        ARRAY['/assets/images/placeholder-product.svg']
    )
    ON CONFLICT (sku) DO NOTHING;
END $$;

-- Insert sample website settings
INSERT INTO public.website_settings (key, value) VALUES
('company_info', '{
    "name": "Biomed Solutions",
    "tagline": "Advanced Medical Equipment for Healthcare Excellence",
    "description": "Leading provider of cutting-edge medical equipment and healthcare solutions.",
    "address": "Annapurna Neurological Institute, Maitighar, Kathmandu, Nepal",
    "phone": "+977-980-120-335",
    "email": "info@annapurnahospitals.com"
}'),
('hero_settings', '{
    "title": "Revolutionary Medical Equipment",
    "subtitle": "Advancing Healthcare Through Innovation",
    "video_url": "/assets/images/wall3.mp4",
    "cta_text": "Explore Products"
}'),
('contact_settings', '{
    "hours": "Monday - Friday: 8:00 AM - 6:00 PM",
    "emergency": "24/7 Emergency Support Available",
    "support_email": "support@biomed.com"
}')
ON CONFLICT (key) DO NOTHING;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated; 