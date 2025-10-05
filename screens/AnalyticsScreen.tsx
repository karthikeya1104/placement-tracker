import React from 'react';
import { ScrollView, Text, StyleSheet, Dimensions, View } from 'react-native';
import { PieChart, LineChart } from 'react-native-chart-kit';
import { useDrives } from '../context/DrivesContext';
import { prepareDriveAnalytics } from '../utils/analytics';

const screenWidth = Dimensions.get('window').width;

export default function AnalyticsScreen() {
  const { drives } = useDrives();
  const { statusCounts, lineChartData } = prepareDriveAnalytics(drives);

  // Pie chart dataset
  const pieData = [
    { name: 'Upcoming', count: statusCounts.upcoming, color: '#2196F3', legendFontColor: '#000', legendFontSize: 14 },
    { name: 'Ongoing', count: statusCounts.ongoing, color: '#FFC107', legendFontColor: '#000', legendFontSize: 14 },
    { name: 'Finished', count: statusCounts.finished, color: '#4CAF50', legendFontColor: '#000', legendFontSize: 14 },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📊 Registered Drives Analytics</Text>

      {/* Pie Chart */}
      <Text style={styles.chartTitle}>Registered Drives Status</Text>
      <PieChart
        data={pieData}
        width={screenWidth - 32}
        height={220}
        chartConfig={{
          backgroundGradientFrom: '#f5f5f5',
          backgroundGradientTo: '#f5f5f5',
          color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
        }}
        accessor="count"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
      />

      {/* Timeline Chart */}
      <Text style={styles.chartTitle}>Registered Drives Timeline</Text>
      <LineChart
        data={{
          labels: lineChartData.labels,
          datasets: [
            { data: lineChartData.added, color: () => '#2196F3', strokeWidth: 2, label: 'Added' },
            { data: lineChartData.finished, color: () => '#4CAF50', strokeWidth: 2, label: 'Finished' },
          ],
          legend: ['Added', 'Finished'],
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
  chartTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8, textAlign: 'center' },
});
