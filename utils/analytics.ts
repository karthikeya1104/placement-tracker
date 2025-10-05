// utils/analytics.ts
export function prepareDriveAnalytics(drives) {
  // Summary metrics
  const totalDrives = drives.length;
  const upcomingDrives = drives.filter(d => d.status === 'upcoming').length;
  const finishedDrives = drives.filter(d => d.status === 'finished').length;
  const registeredDrives = drives.filter(d => d.registration_status === 'registered').length;
  const selectedDrives = drives.filter(d => d.selected).length;

  // Success rate for finished drives
  const finishedRegistered = drives.filter(d => d.status === 'finished' && d.registration_status === 'registered').length;
  const finishedSelected = drives.filter(d => d.status === 'finished' && d.selected).length;
  const finishedNotSelected = finishedRegistered - finishedSelected;

  // Drives over time
  const drivesByDate: Record<string, { upcoming: number; finished: number; registered: number; selected: number }> = {};
  drives.forEach(d => {
    const date = d.created_at.split('T')[0];
    if (!drivesByDate[date]) drivesByDate[date] = { upcoming: 0, finished: 0, registered: 0, selected: 0 };
    drivesByDate[date].upcoming += d.status === 'upcoming' ? 1 : 0;
    drivesByDate[date].finished += d.status === 'finished' ? 1 : 0;
    drivesByDate[date].registered += d.registration_status === 'registered' ? 1 : 0;
    drivesByDate[date].selected += d.selected ? 1 : 0;
  });

  const sortedDates = Object.keys(drivesByDate).sort();
  const lineChartData = {
    labels: sortedDates,
    upcoming: sortedDates.map(d => drivesByDate[d].upcoming),
    finished: sortedDates.map(d => drivesByDate[d].finished),
    registered: sortedDates.map(d => drivesByDate[d].registered),
    selected: sortedDates.map(d => drivesByDate[d].selected),
  };

  return {
    summary: {
      totalDrives,
      upcomingDrives,
      finishedDrives,
      registeredDrives,
      selectedDrives,
      finishedSelected,
      finishedNotSelected,
    },
    lineChartData,
  };
}
