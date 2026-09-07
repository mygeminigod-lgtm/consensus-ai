'use client';

import { useState, useEffect, useCallback } from 'react';
import type { AppSettings } from '@/types/consensus';
import { getSettings, saveSettings, DEFAULT_SETTINGS } from '@/utils/storage';

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    setSettings(getSettings());
    setIsLoaded(true);
  }, []);
  
  const updateSettings = useCallback((partial: Partial<AppSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...partial };
      saveSettings(updated);
      return updated;
    });
  }, []);
  
  const resetSettings = useCallback(() => {
    saveSettings(DEFAULT_SETTINGS);
    setSettings(DEFAULT_SETTINGS);
  }, []);
  
  return { settings, updateSettings, resetSettings, isLoaded };
}
