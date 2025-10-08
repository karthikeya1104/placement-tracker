import { getAllDrives, getRoundsByDrive, insertDrive, insertRound } from './SQLiteService';
import { File, Directory } from 'expo-file-system';
import Papa from 'papaparse';

type CSVDrive = {
  id: number;
  company_name: string;
  role: string;
  location: string;
  ctc_stipend: string;
  status: string;
  registration_status: string;
  selected: number;
  skills_notes: string;
  raw_messages: string; // JSON string
  parse_status: string;
  queued_for_retry: number;
  created_at: string;
  updated_at: string;
};

type CSVRound = {
  id: number;
  drive_id: number;
  round_number: number;
  round_name: string;
  round_date: string;
  status: string;
  result: string;
};

/**
 * Export database data (drives + rounds) to CSV files
 */
export const exportToCSV = async (): Promise<{ drivesPath: string; roundsPath: string }> => {
  try {
    const drives = await getAllDrives();
    const drivesCSV = Papa.unparse(
      drives.map((d) => ({
        ...d,
        raw_messages: JSON.stringify(d.raw_messages || []),
        selected: d.selected ? 1 : 0,
        queued_for_retry: d.queued_for_retry ? 1 : 0,
      }))
    );

    let rounds: CSVRound[] = [];
    for (const drive of drives) {
      const driveRounds = await getRoundsByDrive(drive.id);
      rounds = rounds.concat(driveRounds.map((r) => ({ ...r, drive_id: drive.id })));
    }
    const roundsCSV = Papa.unparse(rounds);

    // Save files to app's document directory
    const drivesPath = Directory.document + '/drives.csv';
    const roundsPath = Directory.document + '/rounds.csv';

    await File.writeAsStringAsync(drivesPath, drivesCSV, { encoding: 'utf8' });
    await File.writeAsStringAsync(roundsPath, roundsCSV, { encoding: 'utf8' });

    return { drivesPath, roundsPath };
  } catch (error) {
    console.error('Export to CSV error:', error);
    throw error;
  }
};

/**
 * Import CSV data into database
 * @param drivesCSV CSV string of drives
 * @param roundsCSV CSV string of rounds
 */
export const importFromCSV = async (drivesCSV: string, roundsCSV: string) => {
  try {
    const parsedDrives = Papa.parse<CSVDrive>(drivesCSV, { header: true }).data;
    const parsedRounds = Papa.parse<CSVRound>(roundsCSV, { header: true }).data;
    
    const driveIdMap: Record<number, number> = {}; // oldId -> newId

    // Insert drives
    for (const drive of parsedDrives) {
      const newId = await insertDrive({
        company_name: drive.company_name,
        role: drive.role,
        location: drive.location,
        ctc_stipend: drive.ctc_stipend,
        status: drive.status,
        registration_status: drive.registration_status,
        selected: drive.selected === 1,
        skills_notes: drive.skills_notes,
        raw_messages: JSON.parse(drive.raw_messages || '[]'),
        parse_status: drive.parse_status,
        queued_for_retry: drive.queued_for_retry === 1,
      });

      if (newId !== null) driveIdMap[drive.id] = newId;
    }

    // Insert rounds
    for (const round of parsedRounds) {
      const newDriveId = driveIdMap[round.drive_id];
      if (!newDriveId) continue; // skip if drive not found

      await insertRound({
        drive_id: newDriveId,
        round_number: round.round_number,
        round_name: round.round_name,
        round_date: round.round_date,
        status: round.status,
        result: round.result,
      });
    }

    return true;
  } catch (error) {
    console.error('Import from CSV error:', error);
    throw error;
  }
};
