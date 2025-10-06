import React from 'react';
import { ScrollView, Text, StyleSheet, Dimensions, View } from 'react-native';
import { PieChart, LineChart } from 'react-native-chart-kit';
import { useDrives } from '../context/DrivesContext';
import { prepareDriveAnalytics } from '../utils/analytics';
import { useThemeContext } from '../context/ThemeContext';

const screenWidth = Dimensions.get('window').width;

export default function AnalyticsScreen() {
  const { drives } = useDrives();
  const { mode } = useThemeContext();
  const { statusCounts, lineChartData } = prepareDriveAnalytics(drives);

  const hasData = drives.length > 0;

  // Pie chart dataset
  const pieData = [
    { name: 'Upcoming', count: statusCounts.upcoming, color: '#2196F3', legendFontColor: mode === 'dark' ? '#fff' : '#000', legendFontSize: 14 },
    { name: 'Ongoing', count: statusCounts.ongoing, color: '#FFC107', legendFontColor: mode === 'dark' ? '#fff' : '#000', legendFontSize: 14 },
    { name: 'Finished', count: statusCounts.finished, color: '#4CAF50', legendFontColor: mode === 'dark' ? '#fff' : '#000', legendFontSize: 14 },
  ];

  if (!hasData) {
    return (
      <View style={[styles.noDataContainer, { backgroundColor: mode === 'dark' ? '#121212' : '#f5f5f5' }]}>
        <Text style={[styles.noDataText, { color: mode === 'dark' ? '#fff' : '#000' }]}>
          No drive data available to display analytics.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: mode === 'dark' ? '#121212' : '#f5f5f5' }]}>
      <Text style={[styles.title, { color: mode === 'dark' ? '#fff' : '#000' }]}>📊 Registered Drives Analytics</Text>

      {/* Pie Chart */}
      <Text style={[styles.chartTitle, { color: mode === 'dark' ? '#fff' : '#000' }]}>Registered Drives Status</Text>
      <PieChart
        data={pieData}
        width={screenWidth - 32}
        height={220}
        chartConfig={{
          backgroundGradientFrom: mode === 'dark' ? '#121212' : '#f5f5f5',
          backgroundGradientTo: mode === 'dark' ? '#121212' : '#f5f5f5',
          color: (opacity = 1) => `rgba(${mode === 'dark' ? '255,255,255' : '0,0,0'},${opacity})`,
        }}
        accessor="count"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
      />

      {/* Timeline Chart */}
      <Text style={[styles.chartTitle, { color: mode === 'dark' ? '#fff' : '#000' }]}>Registered Drives Timeline</Text>
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
          backgroundGradientFrom: mode === 'dark' ? '#121212' : '#f5f5f5',
          backgroundGradientTo: mode === 'dark' ? '#121212' : '#f5f5f5',
          color: (opacity = 1) => `rgba(${mode === 'dark' ? '255,255,255' : '0,0,0'},${opacity})`,
          labelColor: () => (mode === 'dark' ? '#fff' : '#000'),
          decimalPlaces: 0,
        }}
        style={{ marginVertical: 12 }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 },
  chartTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8, textAlign: 'center' },
  noDataContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  noDataText: { fontSize: 16, textAlign: 'center', paddingHorizontal: 20 },
});
