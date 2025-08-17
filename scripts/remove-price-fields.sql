-- Remove price fields from products table
-- Run this in your Supabase SQL Editor after the complete setup

-- Step 1: Drop the price constraints first
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_price_check;
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_sale_price_check;

-- Step 2: Remove price and sale_price columns
ALTER TABLE public.products DROP COLUMN IF EXISTS price;
ALTER TABLE public.products DROP COLUMN IF EXISTS sale_price;

-- Step 3: Update inventory_history action enum to remove price_changed
-- First, add any new actions we might use in the future
ALTER TABLE public.inventory_history 
DROP CONSTRAINT IF EXISTS inventory_history_action_check;

ALTER TABLE public.inventory_history 
ADD CONSTRAINT inventory_history_action_check 
CHECK (action IN ('created', 'updated', 'deleted', 'stock_changed', 'activated', 'deactivated'));

-- Step 4: Remove any existing price_changed entries from inventory_history
DELETE FROM public.inventory_history WHERE action = 'price_changed';

-- Step 5: Update orders table to remove price references (if needed in future)
-- These can remain for now as they're for order tracking, not product pricing
-- ALTER TABLE public.orders DROP COLUMN IF EXISTS total_amount;
-- ALTER TABLE public.order_items DROP COLUMN IF EXISTS unit_price;
-- ALTER TABLE public.order_items DROP COLUMN IF EXISTS total_price;

-- Confirmation message
DO $$
BEGIN
    RAISE NOTICE 'Price fields have been successfully removed from the products table.';
    RAISE NOTICE 'The database schema has been updated to exclude all pricing information.';
END $$;
