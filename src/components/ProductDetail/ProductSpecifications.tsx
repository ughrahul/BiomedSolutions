"use client";

import { motion } from "framer-motion";
import { EnhancedCard } from "@/components/ui/enhanced-card";
import { Product } from "@/types/product";

interface ProductSpecificationsProps {
  product: Product;
}

export default function ProductSpecifications({
  product,
}: ProductSpecificationsProps) {

  return (
    <section className="py-16 bg-gradient-to-br from-white via-cyan-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent mb-4">
            Technical Specifications
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Detailed specifications for {product.name}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <EnhancedCard
            variant="medical"
            padding="lg"
            className="bg-white/80 backdrop-blur-sm border border-cyan-200 shadow-xl"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {product.specifications.map((spec, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex justify-between items-center p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border border-cyan-100"
                >
                  <span className="font-semibold text-gray-900">{spec.name}</span>
                  <span className="text-gray-700 font-medium">{spec.value}</span>
                </motion.div>
              ))}
            </div>
          </EnhancedCard>
        </motion.div>
      </div>
    </section>
  );
}
