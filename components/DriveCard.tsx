import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';

interface DriveCardProps {
  drive: any;
}

export default function DriveCard({ drive }: DriveCardProps) {
  const navigation = useNavigation<NavigationProp<{ DriveDetail: { drive: any } }>>();

  return (
    <View style={styles.card}>
      <Text style={styles.company}>{drive.company_name}</Text>
      <Text style={styles.role}>{drive.role}</Text>
      <Text>CTC/Stipend: {drive.ctc_stipend}</Text>
      <Text>Status: {drive.status}</Text>
      {drive.status === 'upcoming' && <Text>Next Round: {drive.next_round || 'TBD'}</Text>}

      <Button title="View Details" onPress={() => navigation.navigate('DriveDetail', { drive })} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 12,
    marginVertical: 6,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  company: { fontSize: 16, fontWeight: 'bold' },
  role: { fontSize: 14, marginBottom: 4 },
});
