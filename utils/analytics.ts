// utils/analytics.ts
export function prepareDriveAnalytics(drives) {
  // Filter only registered drives
  const registeredDrives = drives.filter(d => d.registration_status === 'registered');

  // Pie chart data: status distribution (using last update for finished)
  const statusCounts = { upcoming: 0, ongoing: 0, finished: 0 };
  registeredDrives.forEach(d => {
    if (d.status === 'upcoming') statusCounts.upcoming += 1;
    else if (d.status === 'ongoing') statusCounts.ongoing += 1;
    else if (d.status === 'finished' || d.status === 'ongoing' && new Date(d.updated_at) > new Date(d.created_at)) {
      // Treat updated drives as finished
      statusCounts.finished += 1;
    }
  });

  // Timeline data: when added vs finished
  const timelineData: Record<string, { added: number; finished: number }> = {};
  registeredDrives.forEach(d => {
    const createdDate = d.created_at.split('T')[0];
    if (!timelineData[createdDate]) timelineData[createdDate] = { added: 0, finished: 0 };
    timelineData[createdDate].added += 1;

    // Finished drives determined by updated_at > created_at
    if (new Date(d.updated_at) > new Date(d.created_at)) {
      const finishedDate = d.updated_at.split('T')[0];
      if (!timelineData[finishedDate]) timelineData[finishedDate] = { added: 0, finished: 0 };
      timelineData[finishedDate].finished += 1;
    }
  });

  const sortedDates = Object.keys(timelineData).sort();
  const lineChartData = {
    labels: sortedDates,
    added: sortedDates.map(d => timelineData[d].added),
    finished: sortedDates.map(d => timelineData[d].finished),
  };

  return { statusCounts, lineChartData };
}
