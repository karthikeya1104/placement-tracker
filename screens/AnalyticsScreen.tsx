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
    {
      name: 'Upcoming',
      count: statusCounts.upcoming,
      color: '#2196F3',
      legendFontColor: mode === 'dark' ? '#fff' : '#222',
      legendFontSize: 14,
    },
    {
      name: 'Ongoing',
      count: statusCounts.ongoing,
      color: '#FFC107',
      legendFontColor: mode === 'dark' ? '#fff' : '#222',
      legendFontSize: 14,
    },
    {
      name: 'Finished',
      count: statusCounts.finished,
      color: '#4CAF50',
      legendFontColor: mode === 'dark' ? '#fff' : '#222',
      legendFontSize: 14,
    },
  ].filter(item => item.count > 0); // Only show statuses with data

  if (!hasData) {
    return (
      <View style={[styles.noDataContainer, { backgroundColor: mode === 'dark' ? '#181818' : '#f5f5f5' }]}>
        <Text style={[styles.noDataText, { color: mode === 'dark' ? '#fff' : '#222' }]}>
          No drive data available to display analytics.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: mode === 'dark' ? '#181818' : '#f5f5f5' }]}>
      <Text style={[styles.title, { color: mode === 'dark' ? '#fff' : '#222' }]}>
        📊 Registered Drives Analytics
      </Text>

      {/* Pie Chart */}
      <Text style={[styles.chartTitle, { color: mode === 'dark' ? '#fff' : '#222' }]}>
        🥧 Registered Drives Status
      </Text>
      <PieChart
        data={pieData}
        width={screenWidth - 32}
        height={220}
        chartConfig={{
          backgroundGradientFrom: mode === 'dark' ? '#181818' : '#fff',
          backgroundGradientTo: mode === 'dark' ? '#181818' : '#fff',
          color: (opacity = 1) =>
            mode === 'dark'
              ? `rgba(255,255,255,${opacity})`
              : `rgba(34,34,34,${opacity})`,
          labelColor: () => (mode === 'dark' ? '#fff' : '#222'),
          propsForLabels: {
            fontWeight: 'bold',
          },
        }}
        accessor="count"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
      />

      {/* Timeline Chart */}
      <Text style={[styles.chartTitle, { color: mode === 'dark' ? '#fff' : '#222' }]}>
        📈 Registered Drives Timeline
      </Text>
      <LineChart
        data={{
          labels: lineChartData.labels,
          datasets: [
            {
              data: lineChartData.added,
              color: () => '#2196F3',
              strokeWidth: 2,
            },
            {
              data: lineChartData.finished,
              color: () => '#4CAF50',
              strokeWidth: 2,
            },
          ],
          legend: ['Added', 'Finished'],
        }}
        width={screenWidth - 32}
        height={260}
        chartConfig={{
          backgroundGradientFrom: mode === 'dark' ? '#181818' : '#fff',
          backgroundGradientTo: mode === 'dark' ? '#181818' : '#fff',
          color: (opacity = 1) =>
            mode === 'dark'
              ? `rgba(255,255,255,${opacity})`
              : `rgba(34,34,34,${opacity})`,
          labelColor: () => (mode === 'dark' ? '#fff' : '#222'),
          decimalPlaces: 0,
          propsForDots: {
            r: '5',
            strokeWidth: '2',
            stroke: mode === 'dark' ? '#fff' : '#222',
          },
        }}
        style={{ marginVertical: 12, borderRadius: 12 }}
        bezier
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
