import React, { useEffect, useState } from 'react';
import { StatusBar, Platform, View, ActivityIndicator } from 'react-native';
import { DrivesProvider } from '../context/DrivesContext';
import BottomTabs from '../navigation/BottomTabs';
import { ThemeProvider, useThemeContext } from '../context/ThemeContext';
import * as NavigationBar from 'expo-navigation-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TutorialScreen from '../screens/TutorialScreen';

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
  const [showTutorial, setShowTutorial] = useState<boolean | null>(null);

  useEffect(() => {
    const checkTutorial = async () => {
      const alreadyLaunched = await AsyncStorage.getItem('alreadyLaunched');
      setShowTutorial(alreadyLaunched === null); // show tutorial only if not completed
    };
    checkTutorial();
  }, []);

  if (showTutorial === null) {
    return (
      <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
        <ActivityIndicator size="large" />
      </View>
    ); // Loading screen while checking AsyncStorage
  }

  return (
    <ThemeProvider>
      <DrivesProvider>
        <ThemeStatusWrapper>
          {showTutorial ? (
            <TutorialScreen onFinish={() => setShowTutorial(false)} />
          ) : (
            <BottomTabs />
          )}
        </ThemeStatusWrapper>
      </DrivesProvider>
    </ThemeProvider>
  );
}
