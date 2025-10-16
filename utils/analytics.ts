export function prepareDriveAnalytics(drives) {
  // ---------- Registered drives ----------
  const registeredDrives = drives.filter(d => d.registration_status === 'registered');

  const registeredStatusCounts = { upcoming: 0, ongoing: 0, finished: 0 };
  registeredDrives.forEach(d => {
    if (d.status === 'upcoming') registeredStatusCounts.upcoming += 1;
    else if (d.status === 'ongoing') registeredStatusCounts.ongoing += 1;
    else if (d.status === 'finished' || new Date(d.updated_at) > new Date(d.created_at)) {
      registeredStatusCounts.finished += 1;
    }
  });

  // ---------- All drives status ----------
  const allStatusCounts = { upcoming: 0, ongoing: 0, finished: 0 };
  drives.forEach(d => {
    if (d.status === 'upcoming') allStatusCounts.upcoming += 1;
    else if (d.status === 'ongoing') allStatusCounts.ongoing += 1;
    else if (d.status === 'finished') allStatusCounts.finished += 1;
  });

  // ---------- Selected vs Not Selected ----------
  const selectionCounts = { selected: 0, not_selected: 0 };
  drives.forEach(d => {
    if (d.selected) selectionCounts.selected += 1;
    else selectionCounts.not_selected += 1;
  });

  return {
    registered: {
      statusCounts: registeredStatusCounts,
    },
    allDrivesStatus: allStatusCounts,
    selectionData: selectionCounts,
  };
}
