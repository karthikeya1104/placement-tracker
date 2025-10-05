// app/_layout.tsx
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { DrivesProvider } from '../context/DrivesContext';
import BottomTabs from '../navigation/BottomTabs';
import SetupApiKeyScreen from '../screens/SetupApiKeyScreen';
import { ApiKeyService } from '../services/ApiKeyService';

export default function Layout() {
  const [loading, setLoading] = useState(true);
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      const key = await ApiKeyService.getKey();
      setHasKey(!!key);
      setLoading(false);
    };
    checkKey();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <DrivesProvider>
      {hasKey ? (
        <BottomTabs />
      ) : (
        <SetupApiKeyScreen onKeySaved={() => setHasKey(true)} />
      )}
    </DrivesProvider>
  );
}
