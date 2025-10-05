import React from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import DriveCard from '../components/DriveCard';
import { useDrives } from '../context/DrivesContext';

export default function AllDrivesScreen() {
  const { drives } = useDrives();

  return (
    <View style={styles.container}>
      {drives.length === 0 ? (
        <Text style={styles.empty}>No drives found.</Text>
      ) : (
        <FlatList
          data={drives}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => <DriveCard drive={item} />}
          initialNumToRender={10}
          windowSize={5}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  empty: { textAlign: 'center', marginTop: 20, fontSize: 16 },
});
