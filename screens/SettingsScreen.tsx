import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDrives } from '../context/DrivesContext';
import { useThemeContext } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { exportToCSV, importFromCSV, generateCSVFileName } from '@/db/CSVService';
import CustomAlertModal from '../components/CustomAlertModal';
import AboutModal from '@/components/AboutModal';

export default function SettingsScreen() {
  const { mode, toggleTheme } = useThemeContext();
  const navigation = useNavigation();
  const [darkModeSwitch, setDarkModeSwitch] = useState(mode === 'dark');

  // Modals
  const [aboutVisible, setAboutVisible] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [onAlertPrimary, setOnAlertPrimary] = useState<(choice?: any) => void>(() => {});

  const { clearAllDrives, refreshDrives } = useDrives();
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const handleToggleDarkMode = () => {
    toggleTheme();
    setDarkModeSwitch(!darkModeSwitch);
  };

  const showCustomAlert = (
    title: string,
    message: string,
    onPrimary: (choice?: any) => void = () => setAlertVisible(false)
  ) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setOnAlertPrimary(() => onPrimary);
    setAlertVisible(true);
  };

  // Reset DB
  const handleResetDb = async () => {
    if (confirmText === 'DELETE') {
      try {
        await clearAllDrives();
        setModalVisible(false);
        setConfirmText('');
        showCustomAlert('Deleted', 'All database data has been removed.');
      } catch (error) {
        showCustomAlert('Error', 'Failed to reset database.');
      }
    } else {
      showCustomAlert('Cancelled', 'Database reset cancelled.');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const fileName = generateCSVFileName();

    showCustomAlert(
      'Export CSV',
      'Do you want to Share the CSV file or Save it to Downloads?',
      async (choice?: 'share' | 'save') => {
        if (!choice) return setAlertVisible(false);

        try {
          if (choice === 'share') {
            await exportToCSV(fileName, { mode: 'share-only' });
            showCustomAlert('Success', 'CSV shared successfully!');
          } else if (choice === 'save') {
            await exportToCSV(fileName, { mode: 'save-only' });
            
            showCustomAlert('Saved', 'CSV saved to Downloads!');
          }
        } catch (error) {
          console.error(error);
          showCustomAlert('Error', 'Failed to export CSV.');
        }

        setAlertVisible(false);
      }
    );
  };

  // Import CSV
  const handleImportCSV = async () => {
    try {
      await importFromCSV();
      await refreshDrives();
      showCustomAlert('Imported', 'CSV imported successfully!');
    } catch (error) {
      showCustomAlert('Error', 'Failed to import CSV.');
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

        <TouchableOpacity style={styles.option} onPress={() => setAboutVisible(true)}>
          <Text style={[styles.optionText, mode === 'dark' && { color: '#fff' }]}>ℹ️ About</Text>
        </TouchableOpacity>

        <AboutModal visible={aboutVisible} onClose={() => setAboutVisible(false)} />

        <TouchableOpacity style={styles.option} onPress={handleExportCSV}>
          <Text style={[styles.optionText, mode === 'dark' && { color: '#fff' }]}>💾 Export to CSV</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.option} onPress={handleImportCSV}>
          <Text style={[styles.optionText, mode === 'dark' && { color: '#fff' }]}>📂 Import from CSV</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.dangerOption} onPress={() => setModalVisible(true)}>
          <Text style={styles.dangerText}>🧨 Reset Database</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal for DELETE confirmation */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: mode === 'dark' ? '#1e1e1e' : '#fff' }]}>
            <Text style={[styles.modalTitle, { color: mode === 'dark' ? '#fff' : '#000' }]}>Reset Database</Text>
            <Text style={[styles.modalText, { color: mode === 'dark' ? '#ccc' : '#333' }]}>
              This will permanently delete all drives and rounds. Type "DELETE" to confirm.
            </Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: mode === 'dark' ? '#333' : '#f9f9f9',
                color: mode === 'dark' ? '#fff' : '#000',
                borderColor: mode === 'dark' ? '#555' : '#ccc',
              }]}
              placeholder="Type DELETE to confirm"
              placeholderTextColor={mode === 'dark' ? '#888' : '#aaa'}
              value={confirmText}
              onChangeText={setConfirmText}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={[styles.cancelText, { color: mode === 'dark' ? '#ccc' : '#555' }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={handleResetDb}>
                <Text style={[styles.deleteText, { color: '#d00' }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Custom Alert */}
      <CustomAlertModal
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        // Only show Share/Save for export prompt
        primaryLabel={alertTitle === 'Export CSV' ? 'Share' : 'OK'}
        secondaryLabel={alertTitle === 'Export CSV' ? 'Save' : undefined}
        primaryValue="share"
        secondaryValue="save"
        onPrimary={onAlertPrimary}
        onSecondary={onAlertPrimary}
        onClose={() => setAlertVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 20 },
  option: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#eee' },
  optionText: { fontSize: 16, color: '#333' },
  optionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#eee' },
  dangerOption: { marginTop: 30, paddingVertical: 14, alignItems: 'center', backgroundColor: '#ffdddd', borderRadius: 8 },
  dangerText: { color: '#d00', fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 10, width: '85%' },
  modalTitle: { fontSize: 20, fontWeight: '600', marginBottom: 10 },
  modalText: { fontSize: 16, marginBottom: 15 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 8, marginBottom: 15 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end' },
  cancelBtn: { marginRight: 15 },
  cancelText: { color: '#555', fontWeight: '600' },
  deleteBtn: {},
  deleteText: { color: '#d00', fontWeight: '600' },
});
