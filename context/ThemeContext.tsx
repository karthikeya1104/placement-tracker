// app/context/ThemeContext.tsx
import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';

type ThemeMode = 'light' | 'dark';

interface ThemeContextProps {
  mode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps>({
  mode: 'light',
  toggleTheme: () => {},
});

export const useThemeContext = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // Initialize with system preference
  const colorScheme = Appearance.getColorScheme();
  const [mode, setMode] = useState<ThemeMode>(colorScheme === 'dark' ? 'dark' : 'light');

  // Toggle function for manual override
  const toggleTheme = () => setMode(prev => (prev === 'light' ? 'dark' : 'light'));

  // Listen to system theme changes
  useEffect(() => {
    const listener = ({ colorScheme }: { colorScheme: ColorSchemeName }) => {
      if (colorScheme) setMode(colorScheme === 'dark' ? 'dark' : 'light');
    };

    const subscription = Appearance.addChangeListener(listener);

    return () => subscription.remove();
  }, []);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
