"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Save,
  Phone,
  Mail,
  MapPin,
  Globe,
  MessageCircle,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Building,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { EnhancedCard } from "@/components/ui/enhanced-card";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { EnhancedInput } from "@/components/ui/enhanced-input";

interface WebsiteSettingsProps {
  className?: string;
}

interface ContactSettings {
  phone: string;
  email: string;
  address: string;
  whatsapp: string;
  businessHours: string;
  hospitalPhone: string;
  supportPhone: string;
}

interface SocialMediaSettings {
  facebook: string;
  twitter: string;
  instagram: string;
  linkedin: string;
}

export default function WebsiteSettings({
  className = "",
}: WebsiteSettingsProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState("contact");

  const [contactSettings, setContactSettings] = useState<ContactSettings>({
    phone: "+977-980-120-335",
    email: "hingmang75@gmail.com",
    address:
      "Annapurna Neurological Institute & Allied Sciences, Maitighar Mandala-10, Kathmandu 44600, Nepal",
    whatsapp: "+977-980-120-335",
    businessHours:
      "Monday - Friday: 8:00 AM - 6:00 PM, Saturday: 9:00 AM - 4:00 PM",
    hospitalPhone: "01-5356568",
    supportPhone: "980120335/61",
  });

  const [socialSettings, setSocialSettings] = useState<SocialMediaSettings>({
    facebook: "https://facebook.com/annapurnahospitals",
    twitter: "https://twitter.com/annapurnahospitals",
    instagram: "https://instagram.com/annapurnahospitals",
    linkedin: "https://linkedin.com/company/annapurnahospitals",
  });

  const tabs = [
    { id: "contact", label: "Contact Info", icon: Phone },
    { id: "social", label: "Social Media", icon: Globe },
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);

      // Load settings from localStorage or API
      const savedContactSettings = localStorage.getItem(
        "website-contact-settings"
      );
      const savedSocialSettings = localStorage.getItem(
        "website-social-settings"
      );

      if (savedContactSettings) {
        try {
          const parsedContact = JSON.parse(savedContactSettings);
          setContactSettings((prev) => ({
            ...prev,
            ...parsedContact,
          }));
        } catch (parseError) {
          if (process.env.NODE_ENV === "development") {
            console.error("Error parsing contact settings:", parseError);
          }
        }
      }

      if (savedSocialSettings) {
        try {
          const parsedSocial = JSON.parse(savedSocialSettings);
          setSocialSettings((prev) => ({
            ...prev,
            ...parsedSocial,
          }));
        } catch (parseError) {
          if (process.env.NODE_ENV === "development") {
            console.error("Error parsing social settings:", parseError);
          }
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error loading settings:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // Save to localStorage and API
      localStorage.setItem(
        "website-contact-settings",
        JSON.stringify(contactSettings)
      );
      localStorage.setItem(
        "website-social-settings",
        JSON.stringify(socialSettings)
      );

      // Save to API for real-time frontend updates
      await fetch("/api/website-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contact: contactSettings,
          social: socialSettings,
        }),
      });

      setLastSaved(new Date());

      // Trigger a custom event for real-time updates
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("websiteSettingsUpdated", {
            detail: {
              contact: contactSettings,
              social: socialSettings,
            },
          })
        );
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error saving settings:", error);
      }
    } finally {
      setSaving(false);
    }
  };

  const updateContactSetting = (
    field: keyof ContactSettings,
    value: string
  ) => {
    setContactSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateSocialSetting = (
    field: keyof SocialMediaSettings,
    value: string
  ) => {
    setSocialSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-2">Loading website settings...</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-gray-600">
            Manage contact information and company details that appear on your
            website
          </p>
          {lastSaved && (
            <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
            </div>
          )}
        </div>
        <EnhancedButton
          variant="primary"
          onClick={saveSettings}
          loading={saving}
          icon={<Save className="w-4 h-4" />}
        >
          Save Changes
        </EnhancedButton>
      </div>

      {/* Live Preview Alert */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-50 border border-blue-200 rounded-lg p-4"
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">Real-time Updates</h4>
            <p className="text-sm text-blue-700 mt-1">
              Changes made here will be immediately reflected on your website
              frontend. Customers will see updated contact information
              instantly.
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <EnhancedCard variant="outline" padding="sm">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </EnhancedCard>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <EnhancedCard variant="outline" padding="lg">
            {activeTab === "contact" && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <Phone className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Contact Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <EnhancedInput
                    label="Phone Number"
                    value={contactSettings.phone || ""}
                    onChange={(e) =>
                      updateContactSetting("phone", e.target.value)
                    }
                    icon={<Phone className="w-4 h-4" />}
                    placeholder="+977-980-120-335"
                  />

                  <EnhancedInput
                    label="Email Address"
                    type="email"
                    value={contactSettings.email || ""}
                    onChange={(e) =>
                      updateContactSetting("email", e.target.value)
                    }
                    icon={<Mail className="w-4 h-4" />}
                    placeholder="hingmang75@gmail.com"
                  />

                  <EnhancedInput
                    label="Hospital Phone"
                    value={contactSettings.hospitalPhone || ""}
                    onChange={(e) =>
                      updateContactSetting("hospitalPhone", e.target.value)
                    }
                    icon={<Building className="w-4 h-4" />}
                    placeholder="01-5356568"
                  />

                  <EnhancedInput
                    label="24/7 Support Phone"
                    value={contactSettings.supportPhone || ""}
                    onChange={(e) =>
                      updateContactSetting("supportPhone", e.target.value)
                    }
                    icon={<Phone className="w-4 h-4" />}
                    placeholder="980120335/61"
                  />

                  <EnhancedInput
                    label="WhatsApp Number"
                    value={contactSettings.whatsapp || ""}
                    onChange={(e) =>
                      updateContactSetting("whatsapp", e.target.value)
                    }
                    icon={<MessageCircle className="w-4 h-4" />}
                    placeholder="+977-980-120-335"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Address
                  </label>
                  <textarea
                    value={contactSettings.address || ""}
                    onChange={(e) =>
                      updateContactSetting("address", e.target.value)
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Annapurna Neurological Institute, Maitighar, Kathmandu, Nepal"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-2" />
                    Business Hours
                  </label>
                  <textarea
                    value={contactSettings.businessHours || ""}
                    onChange={(e) =>
                      updateContactSetting("businessHours", e.target.value)
                    }
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Monday - Friday: 8:00 AM - 6:00 PM"
                  />
                </div>
              </div>
            )}

            {activeTab === "social" && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <Globe className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Social Media Links
                  </h3>
                </div>

                <div className="space-y-4">
                  <EnhancedInput
                    label="Facebook"
                    value={socialSettings.facebook || ""}
                    onChange={(e) =>
                      updateSocialSetting("facebook", e.target.value)
                    }
                    icon={<Facebook className="w-4 h-4" />}
                    placeholder="https://facebook.com/annapurnahospitals"
                  />

                  <EnhancedInput
                    label="Twitter"
                    value={socialSettings.twitter || ""}
                    onChange={(e) =>
                      updateSocialSetting("twitter", e.target.value)
                    }
                    icon={<Twitter className="w-4 h-4" />}
                    placeholder="https://twitter.com/annapurnahospitals"
                  />

                  <EnhancedInput
                    label="Instagram"
                    value={socialSettings.instagram || ""}
                    onChange={(e) =>
                      updateSocialSetting("instagram", e.target.value)
                    }
                    icon={<Instagram className="w-4 h-4" />}
                    placeholder="https://instagram.com/annapurnahospitals"
                  />

                  <EnhancedInput
                    label="LinkedIn"
                    value={socialSettings.linkedin || ""}
                    onChange={(e) =>
                      updateSocialSetting("linkedin", e.target.value)
                    }
                    icon={<Linkedin className="w-4 h-4" />}
                    placeholder="https://linkedin.com/company/annapurnahospitals"
                  />
                </div>
              </div>
            )}
          </EnhancedCard>
        </div>
      </div>
    </div>
  );
}
