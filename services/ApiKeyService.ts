// app/services/ApiKeyService.ts
import * as SecureStore from 'expo-secure-store';

const KEY = 'GEMINI_API_KEY';

export const ApiKeyService = {
  async saveKey(key: string) {
    await SecureStore.setItemAsync(KEY, key);
  },
  async getKey(): Promise<string | null> {
    return await SecureStore.getItemAsync(KEY);
  },
  async clearKey() {
    await SecureStore.deleteItemAsync(KEY);
  }
};
