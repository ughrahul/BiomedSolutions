"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { RefreshCw, AlertTriangle, CheckCircle, Package, Zap, Database } from "lucide-react";

interface DatabaseStatus {
  totalProducts: number;
  featuredProducts: number;
  databaseConnected: boolean;
  featuredProductsList: any[];
}

export default function FeaturedProductsFixer() {
  const [status, setStatus] = useState<DatabaseStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/debug-products');
      const data = await response.json();
      
      setStatus({
        totalProducts: data.products?.total || 0,
        featuredProducts: data.products?.featured || 0,
        databaseConnected: data.database?.connected || false,
        featuredProductsList: data.products?.featuredProductsList || []
      });
    } catch (error) {
      console.error('Error checking status:', error);
    } finally {
      setLoading(false);
    }
  };

  const fixFeaturedProducts = async () => {
    setFixing(true);
    setLastAction(null);
    
    try {
      const response = await fetch('/api/seed-products', { method: 'POST' });
      const result = await response.json();
      
      if (response.ok) {
        setLastAction(`✅ Success! Added ${result.added} products, Updated ${result.updated} products`);
        // Wait a moment then refresh status
        setTimeout(() => {
          checkStatus();
        }, 1000);
      } else {
        setLastAction(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      setLastAction(`❌ Network Error: ${(error as Error).message}`);
    } finally {
      setFixing(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const isIssueDetected = status && status.featuredProducts < 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 max-w-md mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-3">
          <Package className="w-8 h-8 text-emerald-600 mr-2" />
          <h2 className="text-xl font-bold text-gray-900">Featured Products Status</h2>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center">
            <RefreshCw className="w-5 h-5 animate-spin text-blue-600 mr-2" />
            <span className="text-gray-600">Checking database...</span>
          </div>
        ) : status ? (
          <div className="space-y-3">
            {/* Status indicators */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-900">{status.totalProducts}</div>
                <div className="text-xs text-blue-700">Total Products</div>
              </div>
              <div className="text-center p-3 bg-emerald-50 rounded-lg">
                <div className="text-2xl font-bold text-emerald-900">{status.featuredProducts}</div>
                <div className="text-xs text-emerald-700">Featured Products</div>
              </div>
            </div>

            {/* Issue detection */}
            {isIssueDetected ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                  <span className="font-bold text-red-800">Issue Detected!</span>
                </div>
                <div className="text-sm text-red-700">
                  {status.featuredProducts === 0 ? (
                    "No featured products found. This is why your homepage shows duplicates or empty carousel."
                  ) : status.featuredProducts < 3 ? (
                    `Only ${status.featuredProducts} featured product(s) found. You need at least 3-7 for a diverse carousel.`
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="font-bold text-green-800">All Good!</span>
                </div>
                <div className="text-sm text-green-700">
                  Your homepage should display {status.featuredProducts} diverse products in the carousel.
                </div>
              </div>
            )}

            {/* Featured products list */}
            {status.featuredProductsList.length > 0 && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-900 mb-2">Current Featured Products:</div>
                <div className="space-y-1">
                  {status.featuredProductsList.slice(0, 5).map((product, idx) => (
                    <div key={idx} className="text-xs text-gray-700 truncate">
                      • {product.name}
                    </div>
                  ))}
                  {status.featuredProductsList.length > 5 && (
                    <div className="text-xs text-gray-500">
                      ...and {status.featuredProductsList.length - 5} more
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-gray-500">Unable to check status</div>
        )}
      </div>

      {/* Action buttons */}
      <div className="space-y-3">
        {isIssueDetected && (
          <button
            onClick={fixFeaturedProducts}
            disabled={fixing}
            className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-emerald-600 hover:to-green-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {fixing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                Fixing Issue...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 mr-2" />
                🚀 Fix Featured Products Now
              </>
            )}
          </button>
        )}

        <button
          onClick={checkStatus}
          disabled={loading}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Status
        </button>
      </div>

      {/* Last action result */}
      {lastAction && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-4 p-3 rounded-lg text-sm ${
            lastAction.includes('✅') 
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {lastAction}
        </motion.div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-3 bg-blue-50 rounded-lg">
        <div className="text-xs text-blue-800">
          <strong>How it works:</strong> This tool checks your database for featured products. 
          If you have fewer than 3, it will add 7 diverse medical products to fix the homepage carousel.
        </div>
      </div>
    </motion.div>
  );
}
