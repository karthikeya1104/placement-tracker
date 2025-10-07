import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Modal, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDrives } from '../context/DrivesContext';
import { useThemeContext } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';

export default function SettingsScreen() {
  const { mode, toggleTheme } = useThemeContext();
  const navigation = useNavigation();
  const [darkModeSwitch, setDarkModeSwitch] = useState(mode === 'dark');
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const { clearAllDrives } = useDrives();

  const handleToggleDarkMode = () => {
    toggleTheme();
    setDarkModeSwitch(!darkModeSwitch);
  };

  const handleResetDb = async () => {
    if (confirmText === 'DELETE') {
      try {
        await clearAllDrives();
        setModalVisible(false);
        setConfirmText('');
        Alert.alert('Deleted', 'All database data has been removed.');
      } catch (error) {
        Alert.alert('Error', 'Failed to reset database.');
      }
    } else {
      Alert.alert('Cancelled', 'Database reset cancelled.');
    }
  };

  return (
    <View style={[styles.container, mode === 'dark' && { backgroundColor: '#121212' }]}>
      <ScrollView>
        <Text style={[styles.title, mode === 'dark' && { color: '#fff' }]}>Settings</Text>

        <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('SetupApiKey')}>
          <Text style={[styles.optionText, mode === 'dark' && { color: '#fff' }]}>🔑 Manage API Key</Text>
        </TouchableOpacity>

        <View style={styles.optionRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons
              name={darkModeSwitch ? 'moon' : 'sunny'}
              size={22}
              color={darkModeSwitch ? '#fff' : '#f39c12'}
              style={{ marginRight: 10 }}
            />
            <Text style={[styles.optionText, mode === 'dark' && { color: '#fff' }]}>
              {darkModeSwitch ? 'Dark Mode' : 'Light Mode'}
            </Text>
          </View>
          <Switch value={darkModeSwitch} onValueChange={handleToggleDarkMode} />
        </View>

        <TouchableOpacity
          style={styles.option}
          onPress={() =>
            Alert.alert(
              'About',
              'Placement Tracker v1.0.0\n\nDeveloped by Nagelli Karthikeya Goud 💙\n\nA smart, easy-to-use app to organize, monitor, and streamline campus recruitment drives.\n\n© 2025 All rights reserved.',
            )
          }
        >
          <Text style={[styles.optionText, mode === 'dark' && { color: '#fff' }]}>ℹ️ About</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.dangerOption} onPress={() => setModalVisible(true)}>
          <Text style={styles.dangerText}>🧨 Reset Database</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal for DELETE confirmation */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reset Database</Text>
            <Text style={styles.modalText}>
              This will permanently delete all drives and rounds. Type "DELETE" to confirm.
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Type DELETE to confirm"
              value={confirmText}
              onChangeText={setConfirmText}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={handleResetDb}>
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 20 },
  option: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#eee' },
  optionText: { fontSize: 16, color: '#333' },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dangerOption: {
    marginTop: 30,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#ffdddd',
    borderRadius: 8,
  },
  dangerText: { color: '#d00', fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '85%',
  },
  modalTitle: { fontSize: 20, fontWeight: '600', marginBottom: 10 },
  modalText: { fontSize: 16, marginBottom: 15 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 15,
  },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end' },
  cancelBtn: { marginRight: 15 },
  cancelText: { color: '#555', fontWeight: '600' },
  deleteBtn: {},
  deleteText: { color: '#d00', fontWeight: '600' },
});
