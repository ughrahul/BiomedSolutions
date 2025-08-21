"use client";

import { useState, useEffect } from "react";

export interface WebsiteSettings {
  contact: {
    phone: string;
    email: string;
    address: string;
    whatsapp: string;
    businessHours: string;
    hospitalPhone: string;
    supportPhone: string;
  };
  social: {
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
  };
}

const defaultSettings: WebsiteSettings = {
  contact: {
    phone: "+977-980-120-335",
    email: "hingmang75@gmail.com",
    address: "Annapurna Neurological Institute & Allied Sciences, Maitighar Mandala-10, Kathmandu 44600, Nepal",
    whatsapp: "+977-980-120-335",
    businessHours:
      "Monday - Friday: 8:00 AM - 6:00 PM, Saturday: 9:00 AM - 4:00 PM",
    hospitalPhone: "01-5356568",
    supportPhone: "980120335/61",
  },
  social: {
    facebook: "https://facebook.com/annapurnahospitals",
    twitter: "https://twitter.com/annapurnahospitals",
    instagram: "https://instagram.com/annapurnahospitals",
    linkedin: "https://linkedin.com/company/annapurnahospitals",
  },
};

export function useWebsiteSettings() {
  const [settings, setSettings] = useState<WebsiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadSettings();

    // Listen for real-time updates from admin panel
    const handleSettingsUpdate = (event: CustomEvent) => {
      setSettings(event.detail);
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
  }, []);

  const loadSettings = async () => {
    try {
      // Try to load from localStorage first for instant updates
      if (typeof window !== "undefined") {
        const localContactSettings = localStorage.getItem(
          "website-contact-settings"
        );
        const localSocialSettings = localStorage.getItem(
          "website-social-settings"
        );

        if (
          localContactSettings &&
          localSocialSettings
        ) {
          try {
            setSettings({
              contact: JSON.parse(localContactSettings),
              social: JSON.parse(localSocialSettings),
            });
          } catch (parseError) {
            console.warn("Error parsing localStorage settings:", parseError);
          }
        }
      }

      // Then try to load from API
      const response = await fetch("/api/website-settings");
      if (response.ok) {
        const data = await response.json();
        // Merge with existing settings to ensure all properties are present
        setSettings((prevSettings) => ({
          ...prevSettings,
          ...data,
          contact: { ...prevSettings.contact, ...data.contact },
          social: { ...prevSettings.social, ...data.social },
        }));
      }
    } catch (error) {
      console.error("Error loading website settings:", error);
      // Use default settings on error
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  return { settings, loading, mounted, refreshSettings: loadSettings };
}
