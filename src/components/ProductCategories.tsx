"use client";

import { motion } from "framer-motion";
import {
  Heart,
  Brain,
  Activity,
  Shield,
  Zap,
  Stethoscope,
  Scan,
} from "lucide-react";
import { EnhancedCard } from "@/components/ui/enhanced-card";

const categories = [
  {
    id: "cardiology",
    icon: Heart,
    title: "Cardiology",
    description: "Advanced cardiac monitoring and diagnostic equipment",
    count: 25,
    color: "from-red-500 to-pink-500",
  },
  {
    id: "neurology",
    icon: Brain,
    title: "Neurology",
    description:
      "Specialized equipment for neurological diagnostics and treatment",
    count: 18,
    color: "from-purple-500 to-indigo-500",
  },
  {
    id: "imaging",
    icon: Scan,
    title: "Imaging",
    description: "High-resolution imaging systems for accurate diagnostics",
    count: 32,
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "monitoring",
    icon: Activity,
    title: "Monitoring",
    description: "Real-time patient monitoring and vital signs equipment",
    count: 45,
    color: "from-green-500 to-emerald-500",
  },
  {
    id: "life-support",
    icon: Shield,
    title: "Life Support",
    description: "Critical care and life support systems",
    count: 28,
    color: "from-orange-500 to-red-500",
  },
  {
    id: "surgery",
    icon: Zap,
    title: "Surgery",
    description: "Advanced surgical equipment and robotic systems",
    count: 22,
    color: "from-yellow-500 to-orange-500",
  },
  {
    id: "diagnostics",
    icon: Stethoscope,
    title: "Diagnostics",
    description: "Comprehensive diagnostic tools and laboratory equipment",
    count: 35,
    color: "from-teal-500 to-green-500",
  },
  {
    id: "radiology",
    icon: Scan,
    title: "Radiology",
    description: "Advanced radiology and medical imaging solutions",
    count: 19,
    color: "from-violet-500 to-purple-500",
  },
];

interface ProductCategoriesProps {
  selectedCategory?: string;
  onCategoryChange?: (categoryId: string) => void;
}

export default function ProductCategories({
  selectedCategory,
  onCategoryChange,
}: ProductCategoriesProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Product{" "}
            <span className="bg-gradient-to-r from-primary-600 to-medical-600 bg-clip-text text-transparent">
              Categories
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Browse our comprehensive range of medical equipment organized by
            specialty. Each category features state-of-the-art technology
            designed to enhance patient care.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {categories.map((category) => (
            <motion.div key={category.id} variants={itemVariants}>
              <EnhancedCard
                variant="medical"
                hover="both"
                padding="lg"
                clickable
                className={`group cursor-pointer transition-all duration-300 ${
                  selectedCategory === category.id
                    ? "ring-2 ring-primary-500 shadow-xl scale-105"
                    : ""
                }`}
                onClick={() =>
                  onCategoryChange?.(
                    selectedCategory === category.id ? "" : category.id
                  )
                }
              >
                <div className="text-center">
                  {/* Icon with Gradient Background */}
                  <div
                    className={`mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <category.icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Category Info */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                    {category.title}
                  </h3>

                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {category.description}
                  </p>

                  {/* Product Count */}
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-2xl font-bold text-primary-600">
                      {category.count}
                    </span>
                    <span className="text-gray-500 text-sm">Products</span>
                  </div>

                  {/* Hover Indicator */}
                  <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="h-1 w-16 bg-gradient-to-r from-primary-500 to-medical-500 rounded-full mx-auto"></div>
                  </div>
                </div>
              </EnhancedCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center mt-16"
        >
          <p className="text-lg text-gray-600 mb-6">
            Can&apos;t find what you&apos;re looking for? Our medical equipment
            specialists are here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-gradient-to-r from-primary-500 to-medical-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              Contact Specialist
            </button>
            <button className="px-8 py-3 border-2 border-primary-200 text-primary-700 font-semibold rounded-xl hover:bg-primary-50 hover:border-primary-300 transform hover:scale-105 transition-all duration-300">
              Request Catalog
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
