import React, { useState } from 'react';
import { View, FlatList, Text, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import DriveCard from '../components/DriveCard';
import { useDrives } from '../context/DrivesContext';
import { useThemeContext } from '../context/ThemeContext';

export default function AllDrivesScreen() {
  const { drives } = useDrives();
  const { mode } = useThemeContext();
  const [search, setSearch] = useState('');

  const filteredDrives = drives.filter(
    d => (d.company_name || '').toLowerCase().includes(search.toLowerCase().trim())
  );

  return (
    <View style={[styles.container, { backgroundColor: mode === 'dark' ? '#121212' : '#fff' }]}>
      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: mode === 'dark' ? '#333' : '#f0f0f0' }]}>
        <Ionicons name="search" size={20} color={mode === 'dark' ? '#fff' : '#888'} style={{ marginRight: 8 }} />
        <TextInput
          style={[styles.searchInput, { color: mode === 'dark' ? '#fff' : '#000' }]}
          placeholder="Search by company"
          placeholderTextColor={mode === 'dark' ? '#aaa' : '#888'}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {filteredDrives.length === 0 ? (
        <Text style={[styles.empty, { color: mode === 'dark' ? '#fff' : '#333' }]}>No drives found.</Text>
      ) : (
        <FlatList
          data={filteredDrives}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => <DriveCard drive={item} />}
          initialNumToRender={10}
          windowSize={5}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  
  searchInput: {
    flex: 1,
    height: 40,
  },
  
  empty: { textAlign: 'center', marginTop: 20, fontSize: 16 },
});