"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Mail, X, MessageCircle, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { useWebsiteSettings } from "@/hooks/useWebsiteSettings";

export default function FloatingContact() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showHelpText, setShowHelpText] = useState(false);
  const { settings, loading } = useWebsiteSettings();

  if (loading) return null;

  const contactOptions = [
    {
      icon: Phone,
      label: "Call Us",
      value: settings.contact.phone,
      action: () => window.open(`tel:${settings.contact.phone}`, "_self"),
      bgColor: "from-green-500 to-emerald-600",
      hoverColor: "from-green-400 to-emerald-500",
      iconColor: "text-green-400",
    },
    {
      icon: Mail,
      label: "Email Us",
      value: settings.contact.email,
      action: () => window.open(`mailto:${settings.contact.email}`, "_self"),
      bgColor: "from-blue-500 to-cyan-600",
      hoverColor: "from-blue-400 to-cyan-500",
      iconColor: "text-blue-400",
    },
    {
      icon: MessageCircle,
      label: "WhatsApp",
      value: settings.contact.whatsapp,
      action: () => window.open(`https://wa.me/${settings.contact.whatsapp.replace(/[^0-9]/g, '')}`, "_blank"),
      bgColor: "from-green-600 to-green-500",
      hoverColor: "from-green-500 to-green-400",
      iconColor: "text-green-300",
    },
    {
      icon: MapPin,
      label: "Location",
      value: "Find Us",
      action: () => {
        const encodedAddress = encodeURIComponent(settings.contact.address);
        window.open(`https://maps.google.com/?q=${encodedAddress}`, "_blank");
      },
      bgColor: "from-purple-500 to-indigo-600",
      hoverColor: "from-purple-400 to-indigo-500",
      iconColor: "text-purple-400",
    },
    {
      icon: Facebook,
      label: "Facebook",
      value: "Follow Us",
      action: () => window.open(settings.social.facebook, "_blank"),
      bgColor: "from-blue-600 to-blue-700",
      hoverColor: "from-blue-500 to-blue-600",
      iconColor: "text-blue-500",
    },
    {
      icon: Twitter,
      label: "Twitter",
      value: "Follow Us",
      action: () => window.open(settings.social.twitter, "_blank"),
      bgColor: "from-sky-400 to-sky-600",
      hoverColor: "from-sky-300 to-sky-500",
      iconColor: "text-sky-400",
    },
    {
      icon: Instagram,
      label: "Instagram",
      value: "Follow Us",
      action: () => window.open(settings.social.instagram, "_blank"),
      bgColor: "from-pink-500 to-rose-600",
      hoverColor: "from-pink-400 to-rose-500",
      iconColor: "text-pink-500",
    },
    {
      icon: Linkedin,
      label: "LinkedIn",
      value: "Connect",
      action: () => window.open(settings.social.linkedin, "_blank"),
      bgColor: "from-blue-700 to-blue-800",
      hoverColor: "from-blue-600 to-blue-700",
      iconColor: "text-blue-600",
    },
  ];

  return (
    <>
      {/* Floating Contact System */}
      <div className="fixed bottom-6 right-6 z-40">
        {/* Help Text */}
        <AnimatePresence>
          {showHelpText && !isExpanded && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.8 }}
              className="absolute bottom-20 right-0 bg-gradient-to-r from-gray-900 to-slate-800 text-white px-4 py-2 rounded-xl shadow-2xl border border-cyan-400/30 whitespace-nowrap"
            >
              <motion.p
                className="text-sm font-medium"
                animate={{ color: ["#ffffff", "#06b6d4", "#ffffff"] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Need help? Contact us now!
              </motion.p>
              <div className="absolute -bottom-1 right-4 w-2 h-2 bg-gray-900 rotate-45"></div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Contact Options */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute bottom-20 right-0 space-y-3"
            >
              {contactOptions.map((option, index) => (
                <motion.button
                  key={option.label}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  onClick={option.action}
                  className={`group flex items-center gap-3 bg-gradient-to-r ${option.bgColor} hover:${option.hoverColor} text-white px-4 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 whitespace-nowrap`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <option.icon className="w-5 h-5" />
                  </motion.div>
                  <div className="text-left">
                    <p className="text-sm font-semibold">{option.label}</p>
                    <p className="text-xs opacity-90">{option.value}</p>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Toggle Button */}
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          onMouseEnter={() => setShowHelpText(true)}
          onMouseLeave={() => setShowHelpText(false)}
          className="group relative w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-110 animate-pulse hover:animate-none"
          whileHover={{ rotate: 360 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.6 }}
        >
          <AnimatePresence mode="wait">
            {isExpanded ? (
              <motion.div
                key="close"
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 180, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <X className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div
                key="contact"
                initial={{ rotate: 180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -180, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-center"
              >
                <Phone className="w-6 h-6" />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="absolute inset-0 bg-cyan-400 rounded-full opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-300"></div>
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full opacity-75 blur animate-pulse"></div>
        </motion.button>
      </div>
    </>
  );
}
