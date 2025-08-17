"use client";

import ProductSeeder from "@/components/admin/ProductSeeder";

export default function SeedProductsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          🚀 Fix Featured Products Issue
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Your homepage is showing duplicate "Digital Blood Pressure Monitor" cards because 
          your database only has 1 product. This tool will instantly fix that by adding 
          7 diverse medical products.
        </p>
      </div>

      {/* Product Seeder Component */}
      <ProductSeeder />

      {/* Additional Information */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-yellow-50 rounded-xl border border-yellow-200">
          <h3 className="text-lg font-bold text-yellow-900 mb-3">🔍 Current Issue</h3>
          <ul className="text-sm text-yellow-800 space-y-2">
            <li>• Homepage shows only "Digital Blood Pressure Monitor"</li>
            <li>• Same product appears multiple times in carousel</li>
            <li>• No product diversity across medical categories</li>
            <li>• Database likely contains only 1 sample product</li>
          </ul>
        </div>

        <div className="p-6 bg-green-50 rounded-xl border border-green-200">
          <h3 className="text-lg font-bold text-green-900 mb-3">✅ After Fix</h3>
          <ul className="text-sm text-green-800 space-y-2">
            <li>• 7 different medical products in carousel</li>
            <li>• Products from all major categories</li>
            <li>• Realistic pricing from $299 to $45,000</li>
            <li>• Professional product descriptions</li>
            <li>• Real-time updates when you add more products</li>
          </ul>
        </div>
      </div>

      {/* Technical Details */}
      <div className="max-w-4xl mx-auto">
        <div className="p-6 bg-gray-50 rounded-xl">
          <h3 className="text-lg font-bold text-gray-900 mb-3">🛠️ Technical Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <h4 className="font-semibold mb-2">Products to be added:</h4>
              <ul className="space-y-1">
                <li>• Digital Blood Pressure Monitor ($299)</li>
                <li>• Digital ECG Machine ($15,000)</li>
                <li>• Portable Ultrasound Scanner ($25,000)</li>
                <li>• Multi-Parameter Patient Monitor ($8,500)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Additional products:</h4>
              <ul className="space-y-1">
                <li>• Surgical Cautery Unit ($12,000)</li>
                <li>• Automated Chemistry Analyzer ($45,000)</li>
                <li>• Automated External Defibrillator ($3,500)</li>
                <li>• All marked as "featured" products</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
