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
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useDrives } from '../context/DrivesContext';
import { Drive } from '../context/DrivesContext';
import DriveService from '../services/DriveService';
import { ApiKeyService } from '../services/ApiKeyService';
import CustomAlertModal from '../components/CustomAlertModal';
import { useThemeContext } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';

export default function AddMessageScreen() {
  const { drives, refreshDrives } = useDrives();
  const { mode } = useThemeContext();
  const [themeDark] = useState(mode === 'dark');

  const [localMode, setLocalMode] = useState<'new' | 'update'>('new');
  const [selectedDrive, setSelectedDrive] = useState<number | null>(null);
  const [rawMessage, setRawMessage] = useState('');
  const [registrationStatus, setRegistrationStatus] = useState<'registered' | 'not_registered'>('registered');
  const [loading, setLoading] = useState(false);

  // Custom alert for API key missing
  const [showKeyAlert, setShowKeyAlert] = useState(false);

  // Custom alert for operation result (success/error)
  const [showResultAlert, setShowResultAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [alertTitle, setAlertTitle] = useState<string>('');

  const activeDrives = drives.filter(d => d.status !== 'finished');
  const navigation = useNavigation();

  const getErrorMessage = (errorMsg?: string) => {
    switch (errorMsg) {
      case 'INVALID_API_KEY':
        return { title: 'Invalid API Key', message: 'Your Gemini API key is invalid. Please update it in settings.' };
      case 'NETWORK_ERROR':
        return { title: 'Network Error', message: 'Unable to reach the server. Check your internet connection.' };
      case 'SERVER_OVERLOADED':
        return { title: 'Server Busy', message: 'Gemini servers are currently overloaded. Please try again later.' };
      default:
        return { title: 'Error', message: errorMsg || 'Drive saved locally and queued to parse later.' };
    }
  };

  const handleSave = async () => {
    if (!rawMessage.trim()) {
      setAlertTitle('Validation Error');
      setAlertMessage('Please enter a raw message.');
      setShowResultAlert(true);
      return;
    }

    const key = await ApiKeyService.getKey();
    if (!key) {
      setShowKeyAlert(true);
      return;
    }

    setLoading(true);

    try {
      let result: any;

      if (localMode === 'new') {
        result = await DriveService.createDrive(rawMessage, { registration_status: registrationStatus });
      } else {
        if (!selectedDrive) {
          setAlertTitle('Validation Error');
          setAlertMessage('Please select a drive to update.');
          setShowResultAlert(true);
          return;
        }
        result = await DriveService.appendMessage(selectedDrive, rawMessage);
      }

      if (result?.success) {
        setAlertTitle('Success');
        setAlertMessage('Drive saved successfully.');
      } else if (result?.error) {
        const { title, message } = getErrorMessage(result.error);
        setAlertTitle(title);
        setAlertMessage(message);
      } else {
        const { title, message } = getErrorMessage();
        setAlertTitle(title);
        setAlertMessage(message);
      }

      setShowResultAlert(true);
      
      // Reset inputs
      setRawMessage('');
      setSelectedDrive(null);
      setLocalMode('new');
      setRegistrationStatus('registered');
      refreshDrives();

    } catch (error: any) {
      console.error('Error saving drive:', error);

      const { title, message } = getErrorMessage(error?.message);

      setAlertTitle(title);
      setAlertMessage(message);
      setShowResultAlert(true);
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

      {/* API Key Missing Alert */}
      <CustomAlertModal
        visible={showKeyAlert}
        title="Gemini API Key Required"
        message="Before adding messages, please set up your Gemini API key so we can process them correctly."
        secondaryLabel="Maybe Later"
        primaryLabel="Add Now"
        onSecondary={() => setShowKeyAlert(false)}
        onPrimary={() => {
          setShowKeyAlert(false);
          navigation.navigate('SetupApiKey');
        }}
      />

      {/* Operation Result Alert */}
      <CustomAlertModal
        visible={showResultAlert}
        title={alertTitle}
        message={alertMessage}
        primaryLabel="OK"
        onPrimary={() => setShowResultAlert(false)}
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
  toggleText: { fontWeight: '600' },
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
