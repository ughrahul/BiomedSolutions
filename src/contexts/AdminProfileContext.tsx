"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AdminProfile {
  full_name: string;
  avatar_url?: string;
  role?: string;
  employee_id?: string;
  department?: string;
}

interface AdminProfileContextType {
  profile: AdminProfile;
  updateProfile: (updates: Partial<AdminProfile>) => void;
  saveProfile: () => Promise<void>;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const AdminProfileContext = createContext<AdminProfileContextType | undefined>(undefined);

export const useAdminProfile = () => {
  const context = useContext(AdminProfileContext);
  if (!context) {
    throw new Error('useAdminProfile must be used within an AdminProfileProvider');
  }
  return context;
};

export const AdminProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<AdminProfile>({
    full_name: 'Admin User',
  });
  const [loading, setLoading] = useState(false);

  const refreshProfile = async () => {
    try {
      const response = await fetch('/api/admin-profile');
      if (response.ok) {
        const data = await response.json();
        if (data.profile) {
          setProfile(data.profile);
          // Also save to localStorage for offline access
          localStorage.setItem('admin-profile', JSON.stringify(data.profile));
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Fallback to localStorage if API fails
      const savedProfile = localStorage.getItem('admin-profile');
      if (savedProfile) {
        try {
          setProfile(JSON.parse(savedProfile));
        } catch (error) {
          console.error('Error parsing saved profile:', error);
        }
      }
    }
  };

  useEffect(() => {
    refreshProfile();
  }, []);

  const updateProfile = (updates: Partial<AdminProfile>) => {
    setProfile(prev => {
      const newProfile = { ...prev, ...updates };
      // Save to localStorage immediately for persistence
      localStorage.setItem('admin-profile', JSON.stringify(newProfile));
      return newProfile;
    });
  };

  const saveProfile = async () => {
    setLoading(true);
    try {
      // Save to database via API
      const response = await fetch('/api/admin-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save profile');
      }

      const data = await response.json();
      
      // Update profile with the response from database
      if (data.profile) {
        setProfile(data.profile);
        localStorage.setItem('admin-profile', JSON.stringify(data.profile));
      }
      
      console.log('Profile saved to database:', data.profile);
    } catch (error) {
      console.error('Error saving profile:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminProfileContext.Provider
      value={{
        profile,
        updateProfile,
        saveProfile,
        loading,
        refreshProfile,
      }}
    >
      {children}
    </AdminProfileContext.Provider>
  );
};
