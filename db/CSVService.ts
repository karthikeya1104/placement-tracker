import { getAllDrives, getRoundsByDrive, insertDrive, insertRound } from './SQLiteService';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import Constants from 'expo-constants';
import Papa from 'papaparse';
import { format } from 'date-fns';

export type CSVRow = {
  type: 'drive' | 'round';
  drive_id?: number;
  company_name?: string;
  role?: string;
  location?: string;
  ctc_stipend?: string;
  status: string;
  registration_status?: string;
  selected?: number;
  skills_notes?: string;
  raw_messages?: string;
  parse_status?: string;
  queued_for_retry?: number;
  created_at?: string;
  updated_at?: string;
  round_number?: number;
  round_name?: string;
  round_date?: string;
  result?: string;
};

// Generate unique file name
export const generateCSVFileName = () => {
  const now = new Date();
  return `Placement_Tracker_DB_${format(now, 'dd-MM-yyyy_HH-mm-ss')}`;
};

// Export CSV (Share or Save)
export const exportToCSV = async (
  fileName: string,
  options?: { mode?: 'share-only' | 'save-only' }
) => {
  try {
    const drives = await getAllDrives();
    const rows: CSVRow[] = [];

    // Collect all drives and rounds
    for (const drive of drives) {
      rows.push({
        type: 'drive',
        company_name: drive.company_name || '',
        role: drive.role || '',
        location: drive.location || '',
        ctc_stipend: drive.ctc_stipend || '',
        status: drive.status || '',
        registration_status: drive.registration_status || '',
        selected: drive.selected ? 1 : 0,
        skills_notes: drive.skills_notes || '',
        raw_messages: JSON.stringify(drive.raw_messages || []),
        parse_status: drive.parse_status || '',
        queued_for_retry: drive.queued_for_retry ? 1 : 0,
        created_at: drive.created_at || '',
        updated_at: drive.updated_at || '',
      });

      const rounds = await getRoundsByDrive(drive.id);
      for (const round of rounds) {
        rows.push({
          type: 'round',
          drive_id: drive.id,
          round_number: round.round_number || 0,
          round_name: round.round_name || '',
          round_date: round.round_date || '',
          status: round.status || '',
          result: round.result || '',
        });
      }
    }

    // Define headers to maintain consistent columns
    const headers = [
      'type', 'drive_id', 'company_name', 'role', 'location', 'ctc_stipend', 'status',
      'registration_status', 'selected', 'skills_notes', 'raw_messages', 'parse_status',
      'queued_for_retry', 'created_at', 'updated_at', 'round_number', 'round_name',
      'round_date', 'result'
    ];

    const csvRows = rows.map(row => {
      const newRow: Record<string, string | number> = {};
      headers.forEach(h => {
        newRow[h] = row[h as keyof CSVRow] ?? '';
      });
      return newRow;
    });

    const csv = Papa.unparse(csvRows, { columns: headers });
    const tempUri = `${FileSystem.cacheDirectory}${fileName}.csv`;

    await FileSystem.writeAsStringAsync(tempUri, csv, { encoding: 'utf8' });

    const mode = options?.mode;

    // Share mode
    if (mode === 'share-only' || (mode !== 'save-only' && Constants.appOwnership === 'expo')) {
      if (!(await Sharing.isAvailableAsync())) throw new Error('Sharing not available');
      await Sharing.shareAsync(tempUri, { mimeType: 'text/csv', dialogTitle: 'Share CSV' });
      return tempUri;
    }

    // Save mode → Downloads folder
    let permission = await MediaLibrary.getPermissionsAsync();
    if (!permission.granted) permission = await MediaLibrary.requestPermissionsAsync();
    if (!permission.granted) throw new Error('Permission denied');

    const asset = await MediaLibrary.createAssetAsync(tempUri);
    let album = await MediaLibrary.getAlbumAsync('Download');
    if (!album) album = await MediaLibrary.createAlbumAsync('Download', asset, false);
    else await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);

    return asset.uri;

  } catch (err) {
    console.error('Export CSV error:', err);
    throw err;
  }
};

// Import CSV
export const importFromCSV = async () => {
  try {
    const DocumentPicker = await import('expo-document-picker');
    const file = await DocumentPicker.getDocumentAsync({
      type: ['text/csv', 'application/vnd.ms-excel', '*/*'],
      copyToCacheDirectory: true,
    });

    if (file.canceled) throw new Error('Import cancelled');
    const fileUri = file.assets?.[0]?.uri || file.uri;

    const csvContent = await FileSystem.readAsStringAsync(fileUri, { encoding: 'utf8' });
    const parsed: CSVRow[] = Papa.parse<CSVRow>(csvContent, { header: true }).data;

    let lastDriveId: number | null = null;
    for (const row of parsed) {
      if (row.type === 'drive') {
        lastDriveId = await insertDrive({
          company_name: row.company_name || '',
          role: row.role || '',
          location: row.location || '',
          ctc_stipend: row.ctc_stipend || '',
          status: row.status || '',
          registration_status: row.registration_status || '',
          selected: row.selected === 1 || row.selected === '1',
          skills_notes: row.skills_notes || '',
          raw_messages: row.raw_messages ? JSON.parse(row.raw_messages) : [],
          parse_status: row.parse_status || '',
          queued_for_retry: row.queued_for_retry === 1 || row.queued_for_retry === '1',
          created_at: row.created_at || new Date().toISOString(),
          updated_at: row.updated_at || new Date().toISOString(),
        });
      } else if (row.type === 'round' && lastDriveId) {
        await insertRound({
          drive_id: lastDriveId,
          round_number: Number(row.round_number) || 0,
          round_name: row.round_name || '',
          round_date: row.round_date || '',
          status: row.status || '',
          result: row.result || '',
        });
      }
    }

    return true;

  } catch (err) {
    console.error('Import CSV error:', err);
    throw err;
  }
};
