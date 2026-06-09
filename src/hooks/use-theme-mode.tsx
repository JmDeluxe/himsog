import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'theme_mode';

interface ThemeModeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  resolved: 'light' | 'dark';
}

const ThemeModeContext = createContext<ThemeModeContextValue>({
  mode: 'system',
  setMode: () => {},
  resolved: 'light',
});

export function ThemeModeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useSystemColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        setModeState(stored);
      }
      setLoaded(true);
    });
  }, []);

  const setMode = (m: ThemeMode) => {
    setModeState(m);
    AsyncStorage.setItem(STORAGE_KEY, m);
  };

  const resolved: 'light' | 'dark' =
    mode === 'system'
      ? (systemScheme === 'dark' ? 'dark' : 'light')
      : mode;

  if (!loaded) return null;

  return (
    <ThemeModeContext.Provider value={{ mode, setMode, resolved }}>
      {children}
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  return useContext(ThemeModeContext);
}