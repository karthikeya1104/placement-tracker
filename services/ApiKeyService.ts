import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'GEMINI_API_KEY';

async function isSecureStoreAvailable() {
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

export const ApiKeyService = {
  async saveKey(key: string) {
    if (await isSecureStoreAvailable()) {
      await SecureStore.setItemAsync(KEY, key);
    } else {
      await AsyncStorage.setItem(KEY, key);
    }
  },

  async getKey(): Promise<string | null> {
    if (await isSecureStoreAvailable()) {
      return await SecureStore.getItemAsync(KEY);
    } else {
      return await AsyncStorage.getItem(KEY);
    }
  },

  async clearKey() {
    if (await isSecureStoreAvailable()) {
      await SecureStore.deleteItemAsync(KEY);
    } else {
      await AsyncStorage.removeItem(KEY);
    }
  },
};
