"use client";

import { useState, useEffect } from "react";

export interface WebsiteSettings {
  contact: {
    phone: string;
    email: string;
    address: string;
    website: string;
    whatsapp: string;
    businessHours: string;
  };
  social: {
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
  };
  company: {
    name: string;
    tagline: string;
    description: string;
    logo: string;
  };
}

const defaultSettings: WebsiteSettings = {
  contact: {
    phone: "+977-980-120-335",
    email: "info@annapurnahospitals.com",
    address: "Annapurna Neurological Institute, Maitighar, Kathmandu, Nepal",
    website: "https://annapurnahospitals.com",
    whatsapp: "+977-980-120-335",
    businessHours:
      "Monday - Friday: 8:00 AM - 6:00 PM, Saturday: 9:00 AM - 4:00 PM",
  },
  social: {
    facebook: "https://facebook.com/annapurnahospitals",
    twitter: "https://twitter.com/annapurnahospitals",
    instagram: "https://instagram.com/annapurnahospitals",
    linkedin: "https://linkedin.com/company/annapurnahospitals",
  },
  company: {
    name: "Biomed Solutions",
    tagline: "Advanced Medical Equipment for Healthcare Excellence",
    description:
      "Leading provider of cutting-edge medical equipment and healthcare solutions at Annapurna Neurological Institute.",
    logo: "/assets/images/logo.png",
  },
};

export function useWebsiteSettings() {
  const [settings, setSettings] = useState<WebsiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
        const localCompanySettings = localStorage.getItem(
          "website-company-settings"
        );

        if (
          localContactSettings &&
          localSocialSettings &&
          localCompanySettings
        ) {
          try {
            setSettings({
              contact: JSON.parse(localContactSettings),
              social: JSON.parse(localSocialSettings),
              company: JSON.parse(localCompanySettings),
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
          company: { ...prevSettings.company, ...data.company },
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

  return { settings, loading, refreshSettings: loadSettings };
}
