// app/screens/SetupApiKeyScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { ApiKeyService } from '../services/ApiKeyService';

interface Props {
  onKeySaved: () => void;
}

export default function SetupApiKeyScreen({ onKeySaved }: Props) {
  const [apiKey, setApiKey] = useState('');

  const handleSave = async () => {
    if (!apiKey.trim()) {
      Alert.alert('Error', 'Please enter a valid Gemini API Key');
      return;
    }
    try {
      await ApiKeyService.saveKey(apiKey.trim());
      onKeySaved();
    } catch (error) {
      Alert.alert('Error', 'Failed to save API key. Try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Setup Gemini API Key</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your Gemini API key"
        value={apiKey}
        onChangeText={setApiKey}
      />
      <Button title="Save & Continue" onPress={handleSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 20, marginBottom: 20, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 6,
    marginBottom: 20,
  },
});
