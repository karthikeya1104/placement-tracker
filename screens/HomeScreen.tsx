import React from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import DriveCard from '../components/DriveCard';
import { useDrives } from '../context/DrivesContext';

export default function HomeScreen() {
  const { drives } = useDrives();

  const upcoming = drives.filter(
    d => (d.status === 'upcoming' || d.status === 'ongoing') && d.registration_status === 'registered'
  );

  return (
    <View style={styles.container}>
      {upcoming.length === 0 ? (
        <Text style={styles.empty}>No upcoming drives.</Text>
      ) : (
        <FlatList
          data={upcoming}
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
