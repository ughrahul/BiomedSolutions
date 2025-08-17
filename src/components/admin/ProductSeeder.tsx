"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Package, Plus, RefreshCw, CheckCircle, AlertTriangle } from "lucide-react";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { EnhancedCard } from "@/components/ui/enhanced-card";

interface SeedResult {
  success: boolean;
  message: string;
  added: number;
  existing: number;
  products?: any[];
  error?: string;
}

export default function ProductSeeder() {
  const [seeding, setSeeding] = useState(false);
  const [result, setResult] = useState<SeedResult | null>(null);

  const sampleProducts = [
    {
      name: 'Digital Blood Pressure Monitor',
      category: 'Diagnostic Equipment',

      description: 'Professional-grade digital blood pressure monitor with advanced accuracy technology'
    },
    {
      name: 'Digital ECG Machine',
      category: 'Diagnostic Equipment', 
       15000.00,
      description: 'Advanced 12-lead ECG machine with high-resolution display'
    },
    {
      name: 'Portable Ultrasound Scanner',
      category: 'Medical Imaging',
       25000.00,
      description: 'Compact portable ultrasound system with advanced imaging technology'
    },
    {
      name: 'Multi-Parameter Patient Monitor',
      category: 'Patient Monitoring',
       8500.00,
      description: 'Comprehensive patient monitoring system with real-time vital signs tracking'
    },
    {
      name: 'Surgical Cautery Unit',
      category: 'Surgical Instruments',
       12000.00,
      description: 'Advanced electrosurgical generator with multiple cutting modes'
    },
    {
      name: 'Automated Chemistry Analyzer',
      category: 'Laboratory Equipment',
       45000.00,
      description: 'High-throughput automated chemistry analyzer for blood testing'
    },
    {
      name: 'Automated External Defibrillator',
      category: 'Emergency Care',
       3500.00,
      description: 'Life-saving AED with voice prompts and visual indicators'
    }
  ];

  const seedProducts = async () => {
    setSeeding(true);
    setResult(null);

    try {
      const response = await fetch('/api/seed-products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: data.message,
          added: data.added,
          existing: data.existing,
          products: data.products
        });

        // Force refresh the page to see immediate results
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setResult({
          success: false,
          message: data.error || 'Failed to seed products',
          added: 0,
          existing: 0,
          error: data.details || data.error
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Network error while seeding products',
        added: 0,
        existing: 0,
        error: (error as Error).message
      });
    } finally {
      setSeeding(false);
    }
  };

  const checkDatabaseStatus = async () => {
    try {
      const response = await fetch('/api/debug-products');
      const data = await response.json();
      
      if (response.ok) {
        alert(`Database Status:
        
✅ Products: ${data.products.total}
✅ Featured Products: ${data.products.featured}
✅ Categories: ${data.categories.total}
✅ Database Connected: ${data.database.connected ? 'Yes' : 'No'}

${data.products.featured === 0 ? '⚠️ No featured products found! Click "Seed Products" to fix.' : '🎉 Featured products are available!'}`);
      } else {
        alert('Failed to check database status');
      }
    } catch (error) {
      alert('Error checking database status');
    }
  };

  return (
    <EnhancedCard variant="medical" padding="lg" className="max-w-2xl mx-auto">
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Package className="w-8 h-8 text-emerald-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">Product Database Seeder</h2>
        </div>
        
        <p className="text-gray-600 mb-6">
          Instantly populate your database with {sampleProducts.length} diverse featured medical products
        </p>

        {/* Products Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6 text-left">
          {sampleProducts.map((product, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded-lg">
              <div className="font-medium text-gray-900 text-sm">{product.name}</div>
              <div className="text-xs text-emerald-600">{product.category}</div>

            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <EnhancedButton
            variant="primary"
            size="lg"
            onClick={seedProducts}
            loading={seeding}
            disabled={seeding}
            icon={<Plus className="w-5 h-5" />}
            className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
          >
            {seeding ? 'Seeding Products...' : 'Seed Featured Products'}
          </EnhancedButton>

          <EnhancedButton
            variant="outline"
            size="lg"
            onClick={checkDatabaseStatus}
            icon={<RefreshCw className="w-5 h-5" />}
          >
            Check Database Status
          </EnhancedButton>
        </div>

        {/* Result Display */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-6 p-4 rounded-lg ${
              result.success 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}
          >
            <div className="flex items-center justify-center mb-2">
              {result.success ? (
                <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-red-600 mr-2" />
              )}
              <span className={`font-bold ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                {result.success ? 'Success!' : 'Error'}
              </span>
            </div>
            
            <p className={`text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>
              {result.message}
            </p>
            
            {result.success && (
              <div className="mt-2 text-sm text-green-600">
                ✅ Added: {result.added} new products<br/>
                ℹ️ Existing: {result.existing} products<br/>
                🔄 Page will refresh automatically...
              </div>
            )}
            
            {result.error && (
              <div className="mt-2 text-xs text-red-600 bg-red-100 p-2 rounded">
                Details: {result.error}
              </div>
            )}
          </motion.div>
        )}

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg text-left">
          <h3 className="font-bold text-blue-900 mb-2">📋 What this will do:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Add 7 diverse medical products to your database</li>
            <li>• Mark all products as "featured" for homepage display</li>
            <li>• Include realistic pricing and product details</li>
            <li>• Cover all major medical equipment categories</li>
            <li>• Enable real-time homepage updates</li>
            <li>• Fix the "duplicate products" issue permanently</li>
          </ul>
        </div>
      </div>
    </EnhancedCard>
  );
}
