"use client";

import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Shield, Zap } from "lucide-react";
import { EnhancedCard } from "./ui/enhanced-card";
import { useWebsiteSettings } from "@/hooks/useWebsiteSettings";

export default function ContactInfo() {
  const { settings, loading } = useWebsiteSettings();

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50/30 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading contact information...</span>
          </div>
        </div>
      </section>
    );
  }

  const contactMethods = [
    {
      icon: Phone,
      title: "Call Us",
      details: settings.contact.phone,
      subtitle: "Available 24/7 for emergency support",
      color: "from-green-500 to-emerald-600",
      iconColor: "text-green-400",
      action: () => {
        if (typeof window !== 'undefined') {
          window.open(`tel:${settings.contact.phone}`, "_self");
        }
      },
    },
    {
      icon: Mail,
      title: "Email Us",
      details: settings.contact.email,
      subtitle: "We'll respond within 24 hours",
      color: "from-blue-500 to-cyan-600",
      iconColor: "text-blue-400",
      action: () => {
        if (typeof window !== 'undefined') {
          window.open(`mailto:${settings.contact.email}`, "_self");
        }
      },
    },
    {
      icon: MapPin,
      title: "Visit Us",
      details: settings.contact.address,
      subtitle: "Visit our showroom and facility",
      color: "from-purple-500 to-indigo-600",
      iconColor: "text-purple-400",
      action: () => {
        if (typeof window !== 'undefined') {
          const encodedAddress = encodeURIComponent(settings.contact.address);
          window.open(`https://maps.google.com/?q=${encodedAddress}`, "_blank");
        }
      },
    },
  ];

  const features = [
    {
      icon: Shield,
      title: "Reliable Support",
      description: "24/7 technical assistance and emergency response for all medical equipment.",
    },
    {
      icon: Zap,
      title: "Quick Response",
      description: "Fast installation, maintenance, and repair services to minimize downtime.",
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50/30 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Contact Methods Grid - More Compact */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {contactMethods.map((method, index) => (
            <motion.div
              key={method.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <EnhancedCard 
                className="p-6 h-full cursor-pointer hover:scale-105 transition-all duration-300"
                onClick={method.action}
              >
                <div className="flex flex-col items-center text-center">
                  <motion.div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${method.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <method.icon className={`w-8 h-8 ${method.iconColor}`} />
                  </motion.div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {method.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-3 font-medium whitespace-pre-line">
                    {method.details}
                  </p>
                  
                  <p className="text-gray-500 text-xs">
                    {method.subtitle}
                  </p>
                </div>
              </EnhancedCard>
            </motion.div>
          ))}
        </div>

        {/* Features Section - Simplified */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
              viewport={{ once: true }}
              className="flex items-start space-x-4 p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 flex items-center justify-center flex-shrink-0">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h4>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
