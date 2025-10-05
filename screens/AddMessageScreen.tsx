import React, { useState } from 'react';
import {
  View,
  TextInput,
  Alert,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useDrives } from '../context/DrivesContext';
import { Drive } from '../context/DrivesContext';
import DriveService from '../services/DriveService';

export default function AddMessageScreen() {
  const { drives, refreshDrives } = useDrives();
  const [mode, setMode] = useState<'new' | 'update'>('new');
  const [selectedDrive, setSelectedDrive] = useState<number | null>(null);
  const [rawMessage, setRawMessage] = useState('');
  const [registrationStatus, setRegistrationStatus] = useState<'registered' | 'not_registered'>('registered');
  const [loading, setLoading] = useState(false);

  const activeDrives = drives.filter(d => d.status !== 'finished');

  const handleSave = async () => {
    if (!rawMessage.trim()) {
      Alert.alert('Error', 'Please enter a raw message.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'new') {
        const driveData: Partial<Drive> = {
          registration_status: registrationStatus,
        };
        await DriveService.createDrive(rawMessage, driveData);
        Alert.alert('Success', 'New drive created.');
      } else {
        if (!selectedDrive) {
          Alert.alert('Error', 'Please select a drive to update.');
          return;
        }
        await DriveService.appendMessage(selectedDrive, rawMessage);
        Alert.alert('Success', 'Message added to existing drive.');
      }

      // Reset form
      setRawMessage('');
      setSelectedDrive(null);
      setMode('new');
      setRegistrationStatus('registered');

      refreshDrives();
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', error?.message || 'Failed to save message. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Choose Action:</Text>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, mode === 'new' && styles.activeButton]}
            onPress={() => setMode('new')}
          >
            <Text style={[styles.toggleText, mode === 'new' && styles.activeText]}>Start New Drive</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, mode === 'update' && styles.activeButton]}
            onPress={() => setMode('update')}
          >
            <Text style={[styles.toggleText, mode === 'update' && styles.activeText]}>Update Existing Drive</Text>
          </TouchableOpacity>
        </View>

        {mode === 'update' && (
          <View style={styles.pickerWrapper}>
            <Text style={styles.label}>Select Drive:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedDrive}
                onValueChange={setSelectedDrive}
                style={styles.picker}
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

        {mode === 'new' && (
          <View style={styles.pickerWrapper}>
            <Text style={styles.label}>Registration Status:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={registrationStatus}
                onValueChange={setRegistrationStatus}
                style={styles.picker}
                dropdownIconColor="#007bff"
              >
                <Picker.Item label="Registered" value="registered" />
                <Picker.Item label="Not Registered" value="not_registered" />
              </Picker>
            </View>
          </View>
        )}

        <TextInput
          style={[styles.input, { height: 140, textAlignVertical: 'top' }]}
          placeholder="Paste raw message here..."
          multiline
          value={rawMessage}
          onChangeText={setRawMessage}
        />

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Message</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16, backgroundColor: '#f5f5f5' },
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
    backgroundColor: '#fff',
  },
  activeButton: { backgroundColor: '#007bff', borderColor: '#007bff' },
  toggleText: { color: '#000' },
  activeText: { color: '#fff', fontWeight: '600' },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  pickerWrapper: { marginBottom: 16 },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    backgroundColor: '#fff',
    overflow: 'hidden',
    marginBottom: 12,
  },
  picker: {
    height: 55,
    color: '#000',
    paddingHorizontal: 8,
  },
  saveButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  saveButtonText: { color: '#fff', fontWeight: '600' },
});
