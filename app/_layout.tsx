// app/_layout.tsx
import React from 'react';
import { StatusBar } from 'react-native';
import { DrivesProvider } from '../context/DrivesContext';
import BottomTabs from '../navigation/BottomTabs';
import { ThemeProvider, useThemeContext } from '../context/ThemeContext';

// Wrapper component to handle StatusBar based on theme
function ThemeStatusWrapper({ children }: { children: React.ReactNode }) {
  const { mode } = useThemeContext();

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
