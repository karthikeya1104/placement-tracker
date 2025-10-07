import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useThemeContext } from '../context/ThemeContext';

interface Round {
  id: number;
  round_name: string;
  round_date: string;
  status: string;
  round_number: number;
}

interface DriveCardProps {
  drive: {
    id: number;
    company_name: string;
    role: string;
    ctc_stipend: string;
    status: string;
    selected: boolean;
    rounds: Round[];
  };
}

export default function DriveCard({ drive }: DriveCardProps) {
  const navigation = useNavigation<NavigationProp<{ DriveDetail: { drive: any } }>>();
  const { mode } = useThemeContext();

  const nextRound =
    drive.status !== 'finished'
      ? drive.rounds
          ?.filter(r => r.status === 'upcoming')
          .sort((a, b) => (a.round_number || 0) - (b.round_number || 0))[0]
      : null;

  const bgColor = mode === 'dark' ? '#1e1e1e' : '#fff';
  const textColor = mode === 'dark' ? '#fff' : '#333';
  const subTextColor = mode === 'dark' ? '#ccc' : '#555';
  const ctcColor = mode === 'dark' ? '#aaa' : '#666';
  const roundColor = mode === 'dark' ? '#4da6ff' : '#007bff';
  const finishedColor = '#f44336';

  return (
    <View style={[styles.card, { backgroundColor: bgColor }]}>
      <Text style={[styles.company, { color: textColor }]}>{drive.company_name}</Text>
      <Text style={[styles.role, { color: subTextColor }]}>{drive.role}</Text>
      <Text style={[styles.ctc, { color: ctcColor }]}>CTC/Stipend: {drive.ctc_stipend}</Text>

      {drive.status === 'finished' ? (
        <View style={styles.finished}>
          <Text style={[styles.finishedText, { color: finishedColor }]}>Drive Finished</Text>
          <Text style={[styles.selectionText, { color: textColor }]}>
            {drive.selected ? 'Selected' : 'Not Selected'}
          </Text>
        </View>
      ) : nextRound ? (
        <Text style={[styles.nextRound, { color: roundColor }]}>
          Next Round: {nextRound.round_name} ({(nextRound.round_date && nextRound.round_date !== "DD-MM-YYYY HH:MM")|| 'TBD'})
        </Text>
      ) : (
        <Text style={[styles.nextRound, { color: roundColor }]}>No upcoming rounds</Text>
      )}

      <TouchableOpacity
        style={[styles.button, { backgroundColor: roundColor }]}
        onPress={() => navigation.navigate('DriveDetail', { drive })}
      >
        <Text style={styles.buttonText}>View Details</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  company: { fontSize: 18, fontWeight: '700' },
  role: { fontSize: 16, marginTop: 4 },
  ctc: { fontSize: 14, marginTop: 2 },
  nextRound: { fontSize: 14, marginTop: 8, fontWeight: '500' },
  finished: { marginTop: 8 },
  finishedText: { fontSize: 14, fontWeight: '500' },
  selectionText: { fontSize: 14, marginTop: 2 },
  button: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});
