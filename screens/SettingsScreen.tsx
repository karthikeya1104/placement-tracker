import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DriveService from '../services/DriveService';
import { useThemeContext } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';

export default function SettingsScreen() {
  const { mode, toggleTheme } = useThemeContext();
  const navigation = useNavigation();
  const [darkModeSwitch, setDarkModeSwitch] = useState(mode === 'dark');

  useEffect(() => {
    setDarkModeSwitch(mode === 'dark');
  }, [mode]);

  const handleToggleDarkMode = () => {
    toggleTheme();
    setDarkModeSwitch(!darkModeSwitch);
  };

  const handleResetDb = () => {
    Alert.prompt(
      'Reset Database',
      'Type DELETE to confirm permanent deletion of all data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async (text) => {
            if (text?.toUpperCase() === 'DELETE') {
              await DriveService.clearAll?.();
              Alert.alert('Deleted', 'All database data has been removed.');
            } else {
              Alert.alert('Cancelled', 'Database reset cancelled.');
            }
          },
        },
      ],
      'plain-text',
      ''
    );
  };

  return (
    <View style={[styles.container, mode === 'dark' && { backgroundColor: '#121212' }]}>
      <ScrollView>
        <Text style={[styles.title, mode === 'dark' && { color: '#fff' }]}>Settings</Text>

        {/* 🔑 Manage API Key */}
        <TouchableOpacity
          style={styles.option}
          onPress={() => navigation.navigate('SetupApiKey')}
        >
          <Text style={[styles.optionText, mode === 'dark' && { color: '#fff' }]}>
            🔑 Manage API Key
          </Text>
        </TouchableOpacity>

        {/* 🌙 Dark / Light Mode */}
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

        {/* ℹ️ About */}
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

        {/* 🧨 Reset Database */}
        <TouchableOpacity style={styles.dangerOption} onPress={handleResetDb}>
          <Text style={styles.dangerText}>🧨 Reset Database</Text>
        </TouchableOpacity>
      </ScrollView>
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
});
