import React from 'react';
import { ScrollView, Text, StyleSheet, Dimensions, View } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { useDrives } from '../context/DrivesContext';
import { prepareDriveAnalytics } from '../utils/analytics';

const screenWidth = Dimensions.get('window').width;

export default function AnalyticsScreen() {
  const { drives } = useDrives();
  const { summary, lineChartData } = prepareDriveAnalytics(drives);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📊 Placement Analytics</Text>

      {/* Summary Metrics */}
      <View style={styles.summary}>
        <Text>Total Drives: {summary.totalDrives}</Text>
        <Text>Upcoming: {summary.upcomingDrives}</Text>
        <Text>Finished: {summary.finishedDrives}</Text>
        <Text>Registered: {summary.registeredDrives}</Text>
        <Text>Selected: {summary.selectedDrives}</Text>
        <Text>Finished & Selected: {summary.finishedSelected}</Text>
        <Text>Finished & Not Selected: {summary.finishedNotSelected}</Text>
      </View>

      {/* Status Bar Chart */}
      <Text style={styles.chartTitle}>Drives Status Overview</Text>
      <BarChart
        data={{
          labels: ['Upcoming', 'Finished'],
          datasets: [
            { data: [summary.upcomingDrives, summary.finishedDrives] },
          ],
        }}
        width={screenWidth - 32}
        height={220}
        chartConfig={{
          backgroundGradientFrom: '#f5f5f5',
          backgroundGradientTo: '#f5f5f5',
          color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
          labelColor: () => '#000',
          decimalPlaces: 0,
        }}
        style={{ marginVertical: 12 }}
      />

      {/* Success Line Chart */}
      <Text style={styles.chartTitle}>Drives Trend Over Time</Text>
      <LineChart
        data={{
          labels: lineChartData.labels,
          datasets: [
            { data: lineChartData.upcoming, color: () => '#2196F3', strokeWidth: 2, label: 'Upcoming' },
            { data: lineChartData.finished, color: () => '#4CAF50', strokeWidth: 2, label: 'Finished' },
            { data: lineChartData.registered, color: () => '#FFC107', strokeWidth: 2, label: 'Registered' },
            { data: lineChartData.selected, color: () => '#FF5722', strokeWidth: 2, label: 'Selected' },
          ],
          legend: ['Upcoming', 'Finished', 'Registered', 'Selected'],
        }}
        width={screenWidth - 32}
        height={280}
        chartConfig={{
          backgroundGradientFrom: '#f5f5f5',
          backgroundGradientTo: '#f5f5f5',
          color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
          labelColor: () => '#000',
          decimalPlaces: 0,
        }}
        style={{ marginVertical: 12 }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 },
  summary: { marginBottom: 24 },
  chartTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8, textAlign: 'center' },
});
