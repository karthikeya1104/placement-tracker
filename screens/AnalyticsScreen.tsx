import React from 'react';
import { ScrollView, Text, StyleSheet, Dimensions, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { useDrives } from '../context/DrivesContext';
import { useThemeContext } from '../context/ThemeContext';

const screenWidth = Dimensions.get('window').width;

export default function AnalyticsScreen() {
  const { drives } = useDrives();
  const { mode } = useThemeContext();

  const bgColor = mode === 'dark' ? '#121212' : '#f5f5f5';
  const textColor = mode === 'dark' ? '#fff' : '#222';

  if (drives.length === 0) {
    return (
      <View style={[styles.noDataContainer, { backgroundColor: bgColor }]}>
        <Text style={[styles.noDataText, { color: textColor }]}>
          No drive data available to display analytics.
        </Text>
      </View>
    );
  }

  // --- Registered drives ---
  const registeredDrives = drives.filter(d => d.registration_status === 'registered');
  const registeredStatusCounts = { upcoming: 0, ongoing: 0, finished: 0 };
  registeredDrives.forEach(d => {
    if (d.status === 'upcoming') registeredStatusCounts.upcoming += 1;
    else if (d.status === 'ongoing') registeredStatusCounts.ongoing += 1;
    else if (d.status === 'finished') registeredStatusCounts.finished += 1;
  });

  const registeredPieData = [
    { name: 'Upcoming', count: registeredStatusCounts.upcoming, color: mode === 'dark' ? '#64B5F6' : '#1976D2', legendFontColor: textColor, legendFontSize: 14 },
    { name: 'Ongoing', count: registeredStatusCounts.ongoing, color: mode === 'dark' ? '#FFB74D' : '#F57C00', legendFontColor: textColor, legendFontSize: 14 },
    { name: 'Finished', count: registeredStatusCounts.finished, color: mode === 'dark' ? '#81C784' : '#388E3C', legendFontColor: textColor, legendFontSize: 14 },
  ].filter(d => d.count > 0);

  // --- All drives status ---
  const allStatusCounts = { upcoming: 0, ongoing: 0, finished: 0 };
  drives.forEach(d => {
    if (d.status === 'upcoming') allStatusCounts.upcoming += 1;
    else if (d.status === 'ongoing') allStatusCounts.ongoing += 1;
    else if (d.status === 'finished') allStatusCounts.finished += 1;
  });

  const allDrivesPieData = [
    { name: 'Upcoming', count: allStatusCounts.upcoming, color: mode === 'dark' ? '#BA68C8' : '#7B1FA2', legendFontColor: textColor, legendFontSize: 14 },
    { name: 'Ongoing', count: allStatusCounts.ongoing, color: mode === 'dark' ? '#FFD54F' : '#FBC02D', legendFontColor: textColor, legendFontSize: 14 },
    { name: 'Finished', count: allStatusCounts.finished, color: mode === 'dark' ? '#4DD0E1' : '#0097A7', legendFontColor: textColor, legendFontSize: 14 },
  ].filter(d => d.count > 0);

  // --- Selected vs Not Selected ---
  const selectedCounts = { selected: 0, not_selected: 0 };
  registeredDrives.forEach(d => {
    if (d.selected) selectedCounts.selected += 1;
    else selectedCounts.not_selected += 1;
  });

  const selectedPieData = [
    { name: 'Selected', count: selectedCounts.selected, color: mode === 'dark' ? '#81C784' : '#388E3C', legendFontColor: textColor, legendFontSize: 14 },
    { name: 'Not Selected', count: selectedCounts.not_selected, color: mode === 'dark' ? '#E57373' : '#D32F2F', legendFontColor: textColor, legendFontSize: 14 },
  ].filter(d => d.count > 0);

  return (
    <ScrollView style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Registered Drives Status */}
      <Text style={[styles.title, { color: textColor }]}>📊 Registered Drives Status</Text>
      <PieChart
        data={registeredPieData}
        width={screenWidth - 32}
        height={220}
        chartConfig={{
          backgroundGradientFrom: bgColor,
          backgroundGradientTo: bgColor,
          color: () => textColor,
          labelColor: () => textColor,
          propsForLabels: { fontWeight: 'bold' },
        }}
        accessor="count"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
      />

      {/* All Drives Status */}
      <Text style={[styles.title, { color: textColor }]}>📊 All Drives Status</Text>
      <PieChart
        data={allDrivesPieData}
        width={screenWidth - 32}
        height={220}
        chartConfig={{
          backgroundGradientFrom: bgColor,
          backgroundGradientTo: bgColor,
          color: () => textColor,
          labelColor: () => textColor,
          propsForLabels: { fontWeight: 'bold' },
        }}
        accessor="count"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
      />

      {/* Selected vs Not Selected */}
      <Text style={[styles.title, { color: textColor }]}>🎯 Selected vs Not Selected (Registered)</Text>
      <PieChart
        data={selectedPieData}
        width={screenWidth - 32}
        height={220}
        chartConfig={{
          backgroundGradientFrom: bgColor,
          backgroundGradientTo: bgColor,
          color: () => textColor,
          labelColor: () => textColor,
          propsForLabels: { fontWeight: 'bold' },
        }}
        accessor="count"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 12, textAlign: 'center' },
  noDataContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  noDataText: { fontSize: 16, textAlign: 'center', paddingHorizontal: 20 },
});
