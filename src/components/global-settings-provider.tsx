/**
 * Global Settings Provider
 * Provides site-wide settings to all components
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { fetchGlobalSettings } from '@/utils/api';

interface GlobalSettings {
  branding: {
    siteLogo: string;
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
  };
  contact: {
    email: string;
    phone: string;
    whatsapp: string;
  };
  social: {
    facebook: string;
    instagram: string;
    linkedin: string;
    youtube: string;
    fiverr: string;
  };
  features: {
    enableReferrals: boolean;
    enableStreaks: boolean;
    enableTokens: boolean;
    enablePopups: boolean;
    enableChatbot: boolean;
  };
  analytics: {
    googleAnalyticsId: string;
    facebookPixelId: string;
  };
  integrations: {
    mailchimpApiKey: string;
    calendlyUrl: string;
  };
}

interface GlobalSettingsContextType {
  settings: GlobalSettings | null;
  loading: boolean;
  error: string | null;
  refreshSettings: () => Promise<void>;
}

const GlobalSettingsContext = createContext<GlobalSettingsContextType | undefined>(undefined);

interface GlobalSettingsProviderProps {
  children: ReactNode;
}

export function GlobalSettingsProvider({ children }: GlobalSettingsProviderProps) {
  const [settings, setSettings] = useState<GlobalSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchGlobalSettings();
      setSettings(data as GlobalSettings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  // Apply CSS custom properties when settings change
  useEffect(() => {
    if (settings?.branding) {
      const root = document.documentElement;
      
      if (settings.branding.primaryColor) {
        root.style.setProperty('--youtube-red', settings.branding.primaryColor);
      }
      
      if (settings.branding.fontFamily) {
        root.style.setProperty('--font-family', settings.branding.fontFamily);
      }
    }
  }, [settings]);

  const refreshSettings = async () => {
    await loadSettings();
  };

  const value: GlobalSettingsContextType = {
    settings,
    loading,
    error,
    refreshSettings,
  };

  return (
    <GlobalSettingsContext.Provider value={value}>
      {children}
    </GlobalSettingsContext.Provider>
  );
}

export function useGlobalSettings() {
  const context = useContext(GlobalSettingsContext);
  if (context === undefined) {
    throw new Error('useGlobalSettings must be used within a GlobalSettingsProvider');
  }
  return context;
}