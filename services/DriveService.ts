import GeminiService from './GeminiService';
import { insertDrive, updateDrive, getDriveById, insertRound, getRoundsByDrive, updateRound } from '../db/SQLiteService';
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

      await DriveService.tryParseDrive(id, [rawMessage]);
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

      const messages = JSON.parse(drive.raw_messages || '[]');
      messages.push(rawMessage);

      await updateDrive(driveId, {
        raw_messages: JSON.stringify(messages),
        parse_status: 'pending',
        queued_for_retry: 1,
      });

      await DriveService.tryParseDrive(driveId, messages);
      return { success: true };
    } catch (error: any) {
      console.error('appendMessage failed:', error);
      return { success: false, error: error?.message || 'Unknown error' };
    }
  }

  static async tryParseDrive(driveId: number, rawMessages: string[]) {
    try {
      const drive = await getDriveById(driveId);
      const rounds = await getRoundsByDrive(driveId);

      if (!drive) throw new Error(`Drive ${driveId} not found in DB`);

      let parsed = null;
      try {
        parsed =
          drive.parse_status === 'pending'
            ? await GeminiService.parseRawMessage(rawMessages)
            : await GeminiService.parseDriveUpdate(drive, rounds, rawMessages[rawMessages.length - 1]);
      } catch (err) {
        console.warn(`Gemini parsing failed for drive ${driveId}`);
        await updateDrive(driveId, { queued_for_retry: 1 });
        return;
      }

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

      // ----------------------------
      // Round synchronization using Gemini's round_number
      // ----------------------------
      if (Array.isArray(parsed.rounds) && parsed.rounds.length > 0) {
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

    } catch (error) {
      console.warn(`Parsing failed for drive ${driveId}. Will retry later.`);
      console.error(error);
      await updateDrive(driveId, { queued_for_retry: 1 });
    }
  }
}

export default DriveService;
