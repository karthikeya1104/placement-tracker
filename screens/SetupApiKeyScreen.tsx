import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemeContext } from '../context/ThemeContext';
import CustomAlertModal from '@/components/CustomAlertModal';

const KEY = 'GEMINI_API_KEY';

// Utility to check if SecureStore is available
async function isSecureStoreAvailable(): Promise<boolean> {
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

// Service for API key storage
const ApiKeyService = {
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

export default function SetupApiKeyScreen() {
  const navigation = useNavigation();
  const { mode } = useThemeContext();

  const [apiKey, setApiKey] = useState('');
  const [originalKey, setOriginalKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [keyLoaded, setKeyLoaded] = useState(false);
  const [editing, setEditing] = useState(false);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertLinkUrl, setAlertLinkUrl] = useState<string | undefined>();
  const [alertLinkText, setAlertLinkText] = useState<string | undefined>();
  const [onAlertPrimary, setOnAlertPrimary] = useState<() => void>(() => {});

  const bgColor = mode === 'dark' ? '#121212' : '#fff';
  const textColor = mode === 'dark' ? '#fff' : '#222';
  const subTextColor = mode === 'dark' ? '#aaa' : '#555';
  const inputBg = mode === 'dark' ? '#1e1e1e' : '#e0e0e0';
  const inputBorder = mode === 'dark' ? '#333' : '#ccc';
  const buttonColor = '#007bff';

  useEffect(() => {
    const fetchKey = async () => {
      const storedKey = await ApiKeyService.getKey();
      if (storedKey) {
        setApiKey(storedKey);
        setOriginalKey(storedKey);
      }
      setKeyLoaded(true);
    };
    fetchKey();
  }, []);

  const handleSave = async () => {
    if (!apiKey.trim()) {
      showCustomAlert('Invalid Key', 'Please enter a valid Gemini API key.');
      return;
    }

    setLoading(true);

    try {
      await ApiKeyService.saveKey(apiKey.trim());
      setOriginalKey(apiKey.trim());
      setEditing(false);
      showCustomAlert('Saved', 'API key saved successfully!');
    } catch (error: any) {
      console.error('Error saving API key:', error);
      showCustomAlert('Error', 'Failed to save API key. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const showCustomAlert = (
    title: string,
    message: string,
    onPrimary: () => void = () => setAlertVisible(false),
    linkUrl?: string,
    linkText?: string
  ) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertLinkUrl(linkUrl);
    setAlertLinkText(linkText);
    setOnAlertPrimary(() => onPrimary);
    setAlertVisible(true);
  };

  const handleCancelEdit = () => {
    setApiKey(originalKey);
    setEditing(false);
  };

  const handleRemove = async () => {
    try {
      await ApiKeyService.clearKey();
      setApiKey('');
      setOriginalKey('');
      setEditing(false);
    } catch (err) {
      console.error('Failed to remove API key:', err);
      showCustomAlert('Error', 'Failed to remove API key.');
    }
  };

  const handleShowApiKeySteps = () => {
    showCustomAlert(
      'How to get a Gemini API Key',
      'Follow these steps to get your API key:\n\n' +
      '1. Go to Google AI Studio.\n' +
      '2. Sign in with your Google account.\n' +
      '3. Navigate to "Get API key" on the left-hand menu.\n' +
      '4. Click "Create API key in new project".\n' +
      '5. Copy your API key and store it securely.\n\n' +
      'Click the link below to open Google AI Studio:',
      () => setAlertVisible(false),
      'https://aistudio.google.com',
      'Open Google AI Studio'
    );
  };

  if (!keyLoaded) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: bgColor, justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <ActivityIndicator size="large" color={buttonColor} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: bgColor }]}
    >
      <ScrollView contentContainerStyle={styles.body}>
        {originalKey && !editing ? (
          <View style={[styles.keyCard, { backgroundColor: inputBg }]}>
            <Text style={[styles.label, { color: subTextColor }]}>Current Gemini API Key:</Text>
            <Text selectable style={[styles.keyText, { color: textColor }]}>
              {originalKey}
            </Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.curvedButton, { backgroundColor: buttonColor }]}
                onPress={() => setEditing(true)}
              >
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.curvedButton, { backgroundColor: 'red' }]}
                onPress={handleRemove}
              >
                <Text style={styles.buttonText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <Text style={[styles.title, { color: textColor }]}>
              {editing ? 'Edit Gemini API Key' : 'Add Gemini API Key'}
            </Text>
            <Text style={[styles.subtitle, { color: subTextColor }]}>
              Enter your Gemini API key to enable message processing.
            </Text>

            <TextInput
              style={[
                styles.input,
                { backgroundColor: inputBg, borderColor: inputBorder, color: textColor },
              ]}
              placeholder="Enter your Gemini API key"
              placeholderTextColor={subTextColor}
              value={apiKey}
              onChangeText={setApiKey}
              autoCapitalize="none"
              autoCorrect={false}
            />

            {!originalKey && !editing && (
              <TouchableOpacity style={{ marginBottom: 20 }} onPress={handleShowApiKeySteps}>
                <Text style={{ color: buttonColor, textAlign: 'center', textDecorationLine: 'underline' }}>
                  How to get an API key?
                </Text>
              </TouchableOpacity>
            )}

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.curvedButton, { backgroundColor: buttonColor }, loading && { opacity: 0.6 }]}
                onPress={handleSave}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save</Text>}
              </TouchableOpacity>
              {editing && (
                <TouchableOpacity
                  style={[styles.curvedButton, { backgroundColor: 'gray' }]}
                  onPress={handleCancelEdit}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        )}
      </ScrollView>

      <CustomAlertModal
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        primaryLabel="OK"
        onPrimary={onAlertPrimary}
        onClose={() => setAlertVisible(false)}
        linkText={alertLinkText}
        linkUrl={alertLinkUrl}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  body: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, marginBottom: 20, textAlign: 'center', lineHeight: 20 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 10, fontSize: 16 },
  keyCard: { padding: 16, borderRadius: 12, alignItems: 'center' },
  label: { fontSize: 14, marginBottom: 8 },
  keyText: { fontSize: 16, fontWeight: '600', textAlign: 'center', marginBottom: 12 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-evenly', width: '100%' },
  curvedButton: { flex: 1, paddingVertical: 14, marginHorizontal: 5, borderRadius: 25, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
