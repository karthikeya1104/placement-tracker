import GeminiService from './GeminiService';
import { insertDrive, updateDrive, getDriveById, insertRound, getRoundsByDrive, updateRound, getDB  } from '../db/SQLiteService';
import { Drive } from '../context/DrivesContext';

class DriveService {
  static async createDrive(rawMessage: string, options?: Partial<Drive>) {
    try {
      const drive: Partial<Drive> = {
        company_name: 'Not Provided',
        role: 'Not Provided',
        ctc_stipend: 'Not Provided',
        location: 'Not Provided',
        skills_notes: 'Not Provided',
        status: 'upcoming',
        registration_status: options?.registration_status || 'registered',
        raw_messages: JSON.stringify([rawMessage]),
        parse_status: 'pending',
        queued_for_retry: 1,
      };

      const id = await insertDrive(drive);
      if (!id) throw new Error('Failed to insert drive');

      await DriveService.tryParseDrive(id, [rawMessage], 'new');
      return { success: true };
    } catch (error: any) {
      console.error('createDrive failed:', error);
      return { success: false, error: error?.message || 'Unknown error' };
    }
  }

  static async appendMessage(driveId: number, rawMessage: string) {
    try {
      const drive = await getDriveById(driveId);
      if (!drive) return { success: false, error: 'Drive not found' };

      // Safely parse raw_messages
      let messages: string[] = [];
      try {
        messages = JSON.parse(drive.raw_messages || '[]');
        if (!Array.isArray(messages)) messages = [];
      } catch {
        console.warn(`Invalid raw_messages for drive ${driveId}, resetting to empty array`);
        messages = [];
      }

      messages.push(rawMessage);

      await updateDrive(driveId, {
        raw_messages: JSON.stringify(messages),
        parse_status: 'pending',
        queued_for_retry: 1,
      });

      await DriveService.tryParseDrive(driveId, messages, 'update');
      return { success: true };
    } catch (error: any) {
      console.error('appendMessage failed:', error);
      return { success: false, error: error?.message || 'Unknown error' };
    }
  }

  static async tryParseDrive(driveId: number, rawMessages: string[], mode: string) {
    const drive = await getDriveById(driveId);
    const rounds = await getRoundsByDrive(driveId);

    if (!drive) throw new Error(`Drive ${driveId} not found in DB`);

    try {
      const parsed =
        mode === 'new'
          ? await GeminiService.parseRawMessage(rawMessages)
          : await GeminiService.parseDriveUpdate(drive, rounds, rawMessages[rawMessages.length - 1]);

      const safeValue = (newVal: any, oldVal: any) =>
        newVal && newVal !== 'Not Provided' && newVal.trim() !== '' ? newVal : oldVal;

      await updateDrive(driveId, {
        company_name: safeValue(parsed.company_name, drive.company_name),
        role: safeValue(parsed.role, drive.role),
        ctc_stipend: safeValue(parsed.ctc_stipend, drive.ctc_stipend),
        location: safeValue(parsed.location, drive.location),
        skills_notes: safeValue(parsed.skills_notes, drive.skills_notes),
        parse_status: 'parsed',
        queued_for_retry: 0,
      });

      // Sync rounds
      if (Array.isArray(parsed.rounds)) {
        for (const parsedRound of parsed.rounds) {
          const existing = rounds.find(
            r => r.round_name.trim().toLowerCase() === parsedRound.round_name.trim().toLowerCase()
          );
          if (existing) {
            await updateRound(existing.id, {
              round_number: parsedRound.round_number || existing.round_number,
              round_date: parsedRound.round_date || existing.round_date,
              status: parsedRound.status || existing.status,
            });
          } else {
            await insertRound({
              drive_id: driveId,
              round_number: parsedRound.round_number,
              round_name: parsedRound.round_name,
              round_date: parsedRound.round_date || '',
              status: parsedRound.status || 'upcoming',
            });
          }
        }
      }
    } catch (err: any) {
      await updateDrive(driveId, { queued_for_retry: 1 });

      if (err.message.includes('API key')) {
        throw new Error(
          'Invalid Gemini API key. Drive saved locally and queued to parse. Please update your key.'
        );
      } else {
        throw new Error(
          'Network or service issue: Drive saved locally and queued to parse later.'
        );
      }
    }
  }

  static async clearAll() {
    try {
      const db = getDB();
      await db.runAsync(`DELETE FROM rounds`);
      await db.runAsync(`DELETE FROM drives`);
      console.log('All database data cleared.');
      
    } catch (error) {
      console.error('Failed to clear DB:', error);
      throw error;
    }
  }
}

export default DriveService;
