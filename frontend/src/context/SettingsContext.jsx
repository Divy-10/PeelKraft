import { createContext, useContext, useState, useEffect } from 'react';
import { settingsApi } from '../api';

const SettingsContext = createContext(null);

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    companyName: 'PeelKraft',
    tagline: 'Premium Sustainable Food from Orange Peels',
    email: 'info@peelkraft.com',
    phone: '+91 85115 33004',
    address: '5Q82+VM Surat, Gujarat, India',
    whatsapp: '+918511533004',
    socialLinks: {},
    footerText: '© 2024 PeelKraft by JuiceTap Global Pvt Ltd. All rights reserved.',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await settingsApi.get();
        if (res.data) setSettings(res.data);
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const updateSettings = (newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
