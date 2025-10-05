import GeminiService, { ParsedDriveData } from './GeminiService';
import { insertDrive, updateDrive, getDriveById, insertRound } from '../db/SQLiteService';
import { Drive } from '../context/DrivesContext';

class DriveService {

  /**
   * Create a new drive with raw message.
   * Returns { success: boolean, error?: string }
   */
  static async createDrive(rawMessage: string, options?: Partial<Drive>): Promise<{ success: boolean; error?: string }> {
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

  /**
   * Append a message to an existing drive.
   */
  static async appendMessage(driveId: number, rawMessage: string): Promise<{ success: boolean; error?: string }> {
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

  /**
   * Try parsing the drive using Gemini API.
   * Keeps queued_for_retry = 1 if parsing fails.
   */
  static async tryParseDrive(driveId: number, rawMessages: string[]) {
    try {
      const parsed: ParsedDriveData = await GeminiService.parseRawMessage(rawMessages);

      const updates: Partial<Drive> = {
        company_name: parsed.company_name || 'Not Provided',
        role: parsed.role || 'Not Provided',
        ctc_stipend: parsed.ctc_stipend || 'Not Provided',
        location: parsed.location || 'Not Provided',
        skills_notes: parsed.skills_notes || 'Not Provided',
        parse_status: 'parsed',
        queued_for_retry: 0,
      };

      await updateDrive(driveId, updates);

      if (parsed.rounds?.length) {
        for (const r of parsed.rounds) {
          await insertRound({
            drive_id: driveId,
            round_name: r.round_name,
            round_date: r.round_date || null,
            status: r.status || 'upcoming',
          });
        }
      }
    } catch (error) {
      console.warn(`Parsing failed for drive ${driveId}. Will retry later.`);
      console.error(error);
      // Do not throw; keep queued_for_retry = 1
    }
  }
}

export default DriveService;
