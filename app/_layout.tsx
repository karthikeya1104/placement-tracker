import React, { useEffect } from 'react';
import { StatusBar, Platform } from 'react-native';
import { DrivesProvider } from '../context/DrivesContext';
import BottomTabs from '../navigation/BottomTabs';
import { ThemeProvider, useThemeContext } from '../context/ThemeContext';
import * as NavigationBar from 'expo-navigation-bar';

function ThemeStatusWrapper({ children }: { children: React.ReactNode }) {
  const { mode } = useThemeContext();

  useEffect(() => {
    const isDark = mode === 'dark';

    StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content');
    if (Platform.OS === 'android') {
      NavigationBar.setBackgroundColorAsync(isDark ? '#1e1e1e' : '#fff');
      NavigationBar.setButtonStyleAsync(isDark ? 'light' : 'dark');
    }
  }, [mode]);

  return (
    <>
      <StatusBar
        barStyle={mode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={mode === 'dark' ? '#1e1e1e' : '#fff'}
      />
      {children}
    </>
  );
}

export default function Layout() {
  return (
    <ThemeProvider>
      <DrivesProvider>
        <ThemeStatusWrapper>
          <BottomTabs />
        </ThemeStatusWrapper>
      </DrivesProvider>
    </ThemeProvider>
  );
}
