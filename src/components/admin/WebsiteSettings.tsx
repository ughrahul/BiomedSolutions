"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Save,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Building,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
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

export default function WebsiteSettings({
  className = "",
}: WebsiteSettingsProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

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

  // useEffect moved below loadSettings to avoid referencing before initialization

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);

      // First, try to load from API to get the most up-to-date settings
      try {
        const response = await fetch("/api/website-settings");
        if (response.ok) {
          const data = await response.json();

          // Update state with API data, ensuring all fields are present
          if (data.contact) {
            const mergedContact = {
              phone: "",
              email: "",
              address: "",
              whatsapp: "",
              businessHours: "",
              hospitalPhone: "",
              supportPhone: "",
              ...data.contact,
            } as ContactSettings;
            setContactSettings(mergedContact);

            // Update localStorage with the merged data
            localStorage.setItem(
              "website-contact-settings",
              JSON.stringify(mergedContact)
            );
          }
        }
      } catch (apiError) {
        if (process.env.NODE_ENV === "development") {
          console.warn(
            "Error loading from API, falling back to localStorage:",
            apiError
          );
        }
      }

      // Fallback to localStorage if API fails or returns no data
      const savedContactSettings = localStorage.getItem(
        "website-contact-settings"
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
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error loading settings:", error);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();

    // Listen for real-time updates from other admin instances
    const handleSettingsUpdate = (event: CustomEvent) => {
      if (event.detail.contact) {
        setContactSettings((prev) => ({
          ...prev,
          ...event.detail.contact,
        }));
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener(
        "websiteSettingsUpdated",
        handleSettingsUpdate as EventListener
      );

      return () => {
        window.removeEventListener(
          "websiteSettingsUpdated",
          handleSettingsUpdate as EventListener
        );
      };
    }
  }, [loadSettings]);

  const saveSettings = async () => {
    setSaving(true);
    try {
      // Save to localStorage and API
      localStorage.setItem(
        "website-contact-settings",
        JSON.stringify(contactSettings)
      );

      // Save to API for real-time frontend updates
      await fetch("/api/website-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contact: contactSettings,
        }),
      });

      setLastSaved(new Date());

      // Trigger a custom event for real-time updates
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("websiteSettingsUpdated", {
            detail: {
              contact: contactSettings,
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

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadSettings();
      setLastRefreshed(new Date());
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-2">
          Loading website settings from database...
        </p>
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
          {lastRefreshed && (
            <div className="flex items-center gap-2 mt-2 text-sm text-blue-600">
              <RefreshCw className="w-4 h-4" />
              <span>Last refreshed: {lastRefreshed.toLocaleTimeString()}</span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <EnhancedButton
            variant="outline"
            onClick={handleRefresh}
            loading={refreshing}
            icon={<RefreshCw className="w-4 h-4" />}
          >
            Refresh
          </EnhancedButton>
          <EnhancedButton
            variant="primary"
            onClick={saveSettings}
            loading={saving}
            icon={<Save className="w-4 h-4" />}
          >
            Save Changes
          </EnhancedButton>
        </div>
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
              instantly. Settings are automatically loaded from the database on
              page load.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Contact Information */}
      <EnhancedCard variant="outline" padding="lg">
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
              onChange={(e) => updateContactSetting("phone", e.target.value)}
              icon={<Phone className="w-4 h-4" />}
              placeholder="+977-980-120-335"
            />

            <EnhancedInput
              label="Email Address"
              type="email"
              value={contactSettings.email || ""}
              onChange={(e) => updateContactSetting("email", e.target.value)}
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
              onChange={(e) => updateContactSetting("whatsapp", e.target.value)}
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
              onChange={(e) => updateContactSetting("address", e.target.value)}
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
      </EnhancedCard>
    </div>
  );
}
