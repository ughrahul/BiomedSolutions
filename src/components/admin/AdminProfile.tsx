"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  User, 
  Building, 
  MapPin,
  Bell,
  Shield,
  Key,
  Save,
  Camera,
  Settings,
  Globe,
  Upload,
  Mail,
  Phone
} from "lucide-react";
import { EnhancedCard } from "@/components/ui/enhanced-card";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { EnhancedInput } from "@/components/ui/enhanced-input";
import { getCurrentUser } from "@/lib/auth";
import { useAdminProfile } from "@/contexts/AdminProfileContext";
import toast from "react-hot-toast";

interface AdminProfileProps {
  className?: string;
}

interface AdminSettings {
  personal: {
    full_name: string;
    avatar_url?: string;
  };
  company: {
    name: string;
    email: string;
    phone: string;
    website: string;
    address: string;
    description: string;
  };
  security: {
    two_factor_enabled: boolean;
    session_timeout: number;
    password_strength: 'weak' | 'medium' | 'strong';
    login_notifications: boolean;
  };
  notifications: {
    email_notifications: boolean;
    push_notifications: boolean;
    sms_notifications: boolean;
    marketing_emails: boolean;
  };
}

export default function AdminProfile({ className = "" }: AdminProfileProps) {
  const { profile, updateProfile, saveProfile, loading: profileLoading } = useAdminProfile();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [settings, setSettings] = useState<AdminSettings>({
    personal: {
      full_name: profile.full_name,
      avatar_url: profile.avatar_url,
    },
    company: {
      name: 'Biomed Solutions',
      email: 'info@annapurnahospitals.com',
      phone: '+977-980-120-335',
      website: 'https://annapurnahospitals.com',
      address: 'Annapurna Neurological Institute, Maitighar, Kathmandu, Nepal',
      description: 'Leading provider of cutting-edge medical equipment and healthcare solutions.',
    },
    security: {
      two_factor_enabled: false,
      session_timeout: 30,
      password_strength: 'medium',
      login_notifications: true,
    },
    notifications: {
      email_notifications: true,
      push_notifications: true,
      sms_notifications: false,
      marketing_emails: false,
    },
  });

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
  ];



  useEffect(() => {
    loadUserData();
  }, []);

  // Update settings when profile changes
  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      personal: {
        ...prev.personal,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
      }
    }));
  }, [profile]);

  // Sync profile with context on mount
  useEffect(() => {
    if (profile.full_name !== settings.personal.full_name) {
      updateProfile({
        full_name: settings.personal.full_name,
        avatar_url: settings.personal.avatar_url,
      });
    }
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      
      // Update settings with current profile data
      setSettings(prev => ({
        ...prev,
        personal: {
          ...prev.personal,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
        }
      }));
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update profile with personal settings
      updateProfile({
        full_name: settings.personal.full_name,
        avatar_url: settings.personal.avatar_url,
      });
      
      // Save profile
      await saveProfile();
      
      toast.success('Profile updated successfully!');
      console.log('Profile saved:', settings.personal);
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const updatePersonalSetting = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      personal: {
        ...prev.personal,
        [field]: value
      }
    }));
    
    // Update profile immediately for real-time updates
    updateProfile({
      [field]: value
    });
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'admin-avatars');

      // Upload image
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      
      // Update profile with new avatar URL
      updatePersonalSetting('avatar_url', data.url);
      updateProfile({ avatar_url: data.url });
      
      toast.success('Profile picture updated successfully!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload profile picture');
    }
  };

  const updateCompanySetting = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      company: {
        ...prev.company,
        [field]: value
      }
    }));
  };

  const updateNotificationSetting = (field: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: value
      }
    }));
  };



  const updateSecuritySetting = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      security: {
        ...prev.security,
        [field]: value
      }
    }));
  };

  if (loading || profileLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-2">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>
        <EnhancedButton
          variant="primary"
          onClick={handleSave}
          loading={saving}
          icon={<Save className="w-4 h-4" />}
        >
          Save Changes
        </EnhancedButton>
      </div>

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
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50'
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
            {activeTab === 'personal' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                
                {/* Avatar */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    {settings.personal.avatar_url ? (
                      <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200">
                        <img
                          src={settings.personal.avatar_url}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-white" />
                      </div>
                    )}
                    <label className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center hover:bg-gray-50 cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                      <Camera className="w-3 h-3 text-gray-600" />
                    </label>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Profile Picture</h4>
                    <p className="text-sm text-gray-600">Click the camera icon to update your profile picture</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <EnhancedInput
                    id="full-name"
                    name="full-name"
                    label="Full Name"
                    value={settings.personal.full_name}
                    onChange={(e) => updatePersonalSetting('full_name', e.target.value)}
                    icon={<User className="w-4 h-4" />}
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            {activeTab === 'company' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Company Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <EnhancedInput
                    id="company-name"
                    name="company-name"
                    label="Company Name"
                    value={settings.company.name}
                    onChange={(e) => updateCompanySetting('name', e.target.value)}
                    icon={<Building className="w-4 h-4" />}
                    autoComplete="organization"
                  />
                  
                  <EnhancedInput
                    id="company-email"
                    name="company-email"
                    label="Company Email"
                    type="email"
                    value={settings.company.email}
                    onChange={(e) => updateCompanySetting('email', e.target.value)}
                    icon={<Mail className="w-4 h-4" />}
                    autoComplete="email"
                  />
                  
                  <EnhancedInput
                    id="company-phone"
                    name="company-phone"
                    label="Company Phone"
                    value={settings.company.phone}
                    onChange={(e) => updateCompanySetting('phone', e.target.value)}
                    icon={<Phone className="w-4 h-4" />}
                    autoComplete="tel"
                  />
                  
                  <EnhancedInput
                    id="company-website"
                    name="company-website"
                    label="Website"
                    value={settings.company.website || ''}
                    onChange={(e) => updateCompanySetting('website', e.target.value)}
                    icon={<Globe className="w-4 h-4" />}
                    autoComplete="url"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Company Address
                  </label>
                  <textarea
                    id="company-address"
                    name="company-address"
                    value={settings.company.address}
                    onChange={(e) => updateCompanySetting('address', e.target.value)}
                    rows={3}
                    autoComplete="street-address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
                
                <div className="space-y-4">
                  {Object.entries(settings.notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                      <div>
                        <h4 className="font-medium text-gray-900 capitalize">
                          {key.replace('_', ' ')}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {key === 'email' && 'Receive notifications via email'}
                          {key === 'browser' && 'Show browser notifications'}
                          {key === 'inventory_alerts' && 'Get notified about inventory changes'}
                          {key === 'new_orders' && 'Notifications for new orders'}
                          {key === 'low_stock_alerts' && 'Alert when stock is running low'}

                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => updateNotificationSetting(key, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}



            {activeTab === 'security' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
                
                <div className="space-y-6">
                  {/* Two-Factor Authentication */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                      <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                    </div>
                    <EnhancedButton
                      variant={settings.security.two_factor_enabled ? "error" : "primary"}
                      size="sm"
                      onClick={() => updateSecuritySetting('two_factor_enabled', !settings.security.two_factor_enabled)}
                    >
                      {settings.security.two_factor_enabled ? 'Disable' : 'Enable'}
                    </EnhancedButton>
                  </div>

                  {/* Session Timeout */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Session Timeout (minutes)
                    </label>
                    <select
                      value={settings.security.session_timeout}
                      onChange={(e) => updateSecuritySetting('session_timeout', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={60}>1 hour</option>
                      <option value={120}>2 hours</option>
                      <option value={240}>4 hours</option>
                      <option value={0}>Never</option>
                    </select>
                  </div>

                  {/* Login Notifications */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Login Notifications</h4>
                      <p className="text-sm text-gray-600">Get notified when someone logs into your account</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.security.login_notifications}
                        onChange={(e) => updateSecuritySetting('login_notifications', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Change Password */}
                  <div className="pt-6 border-t">
                    <h4 className="font-medium text-gray-900 mb-4">Change Password</h4>
                    <div className="space-y-4">
                      <EnhancedInput
                        type="password"
                        label="Current Password"
                        placeholder="Enter current password"
                        icon={<Key className="w-4 h-4" />}
                      />
                      <EnhancedInput
                        type="password"
                        label="New Password"
                        placeholder="Enter new password"
                        icon={<Key className="w-4 h-4" />}
                      />
                      <EnhancedInput
                        type="password"
                        label="Confirm New Password"
                        placeholder="Confirm new password"
                        icon={<Key className="w-4 h-4" />}
                      />
                      <EnhancedButton variant="primary" size="sm">
                        Update Password
                      </EnhancedButton>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </EnhancedCard>
        </div>
      </div>
    </div>
  );
}