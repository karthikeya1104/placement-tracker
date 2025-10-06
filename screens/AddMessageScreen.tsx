import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useDrives } from '../context/DrivesContext';
import { Drive } from '../context/DrivesContext';
import DriveService from '../services/DriveService';
import { ApiKeyService } from '../services/ApiKeyService';
import SetupApiKeyScreen from './SetupApiKeyScreen';
import CustomAlertModal from '../components/CustomAlertModal';
import { useThemeContext } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';

export default function AddMessageScreen() {
  const { drives, refreshDrives } = useDrives();
  const { mode } = useThemeContext(); // ✅ global theme
  const [themeDark] = useState(mode === 'dark');

  const [localMode, setLocalMode] = useState<'new' | 'update'>('new');
  const [selectedDrive, setSelectedDrive] = useState<number | null>(null);
  const [rawMessage, setRawMessage] = useState('');
  const [registrationStatus, setRegistrationStatus] = useState<'registered' | 'not_registered'>('registered');
  const [loading, setLoading] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [showCustomAlert, setShowCustomAlert] = useState(false);

  const activeDrives = drives.filter(d => d.status !== 'finished');
  const navigation = useNavigation();

  const handleSave = async () => {
    if (!rawMessage.trim()) {
      alert('Please enter a raw message.');
      return;
    }

    const key = await ApiKeyService.getKey();
    if (!key) {
      setShowCustomAlert(true);
      return;
    }

    setLoading(true);
    try {
      if (localMode === 'new') {
        await DriveService.createDrive(rawMessage, { registration_status: registrationStatus });
        alert('New drive created.');
      } else {
        if (!selectedDrive) {
          alert('Please select a drive to update.');
          return;
        }
        await DriveService.appendMessage(selectedDrive, rawMessage);
        alert('Message added to existing drive.');
      }

      setRawMessage('');
      setSelectedDrive(null);
      setLocalMode('new');
      setRegistrationStatus('registered');
      refreshDrives();
    } catch (error: any) {
      console.error(error);
      alert(error?.message || 'Failed to save message.');
    } finally {
      setLoading(false);
    }
  };

  const backgroundColor = mode === 'dark' ? '#121212' : '#f5f5f5';
  const cardBackground = mode === 'dark' ? '#1f1f1f' : '#fff';
  const textColor = mode === 'dark' ? '#fff' : '#000';
  const borderColor = mode === 'dark' ? '#333' : '#ccc';

  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView
          contentContainerStyle={[styles.container, { backgroundColor }]}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.label, { color: textColor }]}>Choose Action:</Text>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                localMode === 'new' && { backgroundColor: '#007bff', borderColor: '#007bff' },
              ]}
              onPress={() => setLocalMode('new')}
            >
              <Text
                style={[
                  styles.toggleText,
                  { color: localMode === 'new' ? '#fff' : mode === 'dark' ? '#fff' : '#000', fontWeight: localMode === 'new' ? '600' : '400' },
                ]}
              >
                Start New Drive
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleButton,
                localMode === 'update' && { backgroundColor: '#007bff', borderColor: '#007bff' },
              ]}
              onPress={() => setLocalMode('update')}
            >
              <Text
                style={[
                  styles.toggleText,
                  { color: localMode === 'update' ? '#fff' : mode === 'dark' ? '#fff' : '#000', fontWeight: localMode === 'update' ? '600' : '400' },
                ]}
              >
                Update Existing Drive
              </Text>
            </TouchableOpacity>
          </View>

          {localMode === 'update' && (
            <View style={styles.pickerWrapper}>
              <Text style={[styles.label, { color: textColor }]}>Select Drive:</Text>
              <View style={[styles.pickerContainer, { backgroundColor: cardBackground, borderColor }]}>
                <Picker
                  selectedValue={selectedDrive}
                  onValueChange={setSelectedDrive}
                  style={[styles.picker, { color: textColor }]}
                  dropdownIconColor="#007bff"
                >
                  <Picker.Item label="-- Select Drive --" value={null} />
                  {activeDrives.map((drive: Drive) => (
                    <Picker.Item
                      key={drive.id}
                      label={`${drive.company_name || 'Unknown'} (${drive.role || 'Role N/A'})`}
                      value={drive.id}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          )}

          {localMode === 'new' && (
            <View style={styles.pickerWrapper}>
              <Text style={[styles.label, { color: textColor }]}>Registration Status:</Text>
              <View style={[styles.pickerContainer, { backgroundColor: cardBackground, borderColor }]}>
                <Picker
                  selectedValue={registrationStatus}
                  onValueChange={setRegistrationStatus}
                  style={[styles.picker, { color: textColor }]}
                  dropdownIconColor="#007bff"
                >
                  <Picker.Item label="Registered" value="registered" />
                  <Picker.Item label="Not Registered" value="not_registered" />
                </Picker>
              </View>
            </View>
          )}

          <TextInput
            style={[styles.input, { backgroundColor: cardBackground, borderColor, color: textColor, height: 140, textAlignVertical: 'top' }]}
            placeholder="Paste raw message here..."
            placeholderTextColor={mode === 'dark' ? '#888' : '#888'}
            multiline
            value={rawMessage}
            onChangeText={setRawMessage}
          />

          <TouchableOpacity style={[styles.saveButton, { backgroundColor: '#007bff' }]} onPress={handleSave} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save Message</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={showKeyModal} animationType="slide">
        <SetupApiKeyScreen
          onKeySaved={() => {
            setShowKeyModal(false);
            alert('API key saved! You can now add messages.');
          }}
          onCancel={() => setShowKeyModal(false)}
        />
      </Modal>

      <CustomAlertModal
        visible={showCustomAlert}
        title="Gemini API Key Required"
        message="Before adding messages, please set up your Gemini API key so we can process them correctly."
        secondaryLabel="Maybe Later"
        primaryLabel="Add Now"
        onSecondary={() => setShowCustomAlert(false)}
        onPrimary={() => {
          setShowCustomAlert(false);
          navigation.navigate('SetupApiKey');
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16 },
  label: { fontWeight: '600', marginBottom: 8 },
  toggleContainer: { flexDirection: 'row', marginBottom: 12 },
  toggleButton: {
    flex: 1,
    padding: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    borderRadius: 6,
    marginRight: 8,
  },
  toggleText: { fontWeight: '600' }, // base style
  input: {
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
    borderWidth: 1,
  },
  pickerWrapper: { marginBottom: 16 },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  picker: { height: 55, paddingHorizontal: 8 },
  saveButton: { paddingVertical: 12, borderRadius: 6, alignItems: 'center' },
  saveButtonText: { color: '#fff', fontWeight: '600' },
});
