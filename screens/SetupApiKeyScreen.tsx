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
} from 'react-native';
import { ApiKeyService } from '../services/ApiKeyService';
import { useThemeContext } from '../context/ThemeContext';

interface Props {
  onKeySaved: () => void;
  onCancel?: () => void;
}

export default function SetupApiKeyScreen({ onKeySaved, onCancel }: Props) {
  const { mode } = useThemeContext();
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [keyLoaded, setKeyLoaded] = useState(false);
  const [editing, setEditing] = useState(false);

  const bgColor = mode === 'dark' ? '#121212' : '#fff';
  const textColor = mode === 'dark' ? '#fff' : '#222';
  const subTextColor = mode === 'dark' ? '#aaa' : '#555';
  const inputBg = mode === 'dark' ? '#1e1e1e' : '#e0e0e0';
  const inputBorder = mode === 'dark' ? '#333' : '#ccc';
  const buttonColor = '#007bff';

  useEffect(() => {
    const fetchKey = async () => {
      const storedKey = await ApiKeyService.getKey();
      if (storedKey) setApiKey(storedKey);
      setKeyLoaded(true);
    };
    fetchKey();
  }, []);

  const handleSave = async () => {
    if (!apiKey.trim()) {
      alert('Please enter a valid Gemini API key.');
      return;
    }

    try {
      setLoading(true);
      await ApiKeyService.saveKey(apiKey.trim());
      setEditing(false);
      onKeySaved();
    } catch (error) {
      alert('Failed to save API key. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    await ApiKeyService.clearKey();
    setApiKey('');
    setEditing(false);
  };

  if (!keyLoaded) {
    return (
      <View style={[styles.container, { backgroundColor: bgColor, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={buttonColor} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: bgColor }]}
    >
      {/* Header */}
      {onCancel && (
        <View style={styles.header}>
          <TouchableOpacity onPress={onCancel} style={styles.backButton}>
            <Text style={[styles.backText, { color: textColor }]}>✕</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>API Key Setup</Text>
          <View style={{ width: 32 }} />
        </View>
      )}

      {/* Body */}
      <View style={styles.body}>
        {apiKey && !editing ? (
          <View style={[styles.keyCard, { backgroundColor: inputBg }]}>
            <Text style={[styles.label, { color: subTextColor }]}>Current Gemini API Key:</Text>
            <Text selectable style={[styles.keyText, { color: textColor }]}>
              {apiKey}
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
              style={[styles.input, { backgroundColor: inputBg, borderColor: inputBorder, color: textColor }]}
              placeholder="Enter your Gemini API key"
              placeholderTextColor={subTextColor}
              value={apiKey}
              onChangeText={setApiKey}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.curvedButton, { backgroundColor: buttonColor }, loading && { opacity: 0.6 }]}
                onPress={handleSave}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save</Text>}
              </TouchableOpacity>
              {apiKey && (
                <TouchableOpacity
                  style={[styles.curvedButton, { backgroundColor: 'gray' }]}
                  onPress={() => setEditing(false)}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  backButton: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 20 },
  headerTitle: { fontSize: 16, fontWeight: '600' },
  body: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, marginBottom: 20, textAlign: 'center', lineHeight: 20 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 20, fontSize: 16 },
  keyCard: { padding: 16, borderRadius: 12, alignItems: 'center' },
  label: { fontSize: 14, marginBottom: 8 },
  keyText: { fontSize: 16, fontWeight: '600', textAlign: 'center', marginBottom: 12 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-evenly', width: '100%' },
  curvedButton: { flex: 1, paddingVertical: 14, marginHorizontal: 5, borderRadius: 25, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
