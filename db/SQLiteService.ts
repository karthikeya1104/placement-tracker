// app/db/SQLiteService.ts
import * as SQLite from 'expo-sqlite';
import { createDrivesTable, createRoundsTable } from './schema';

let db: any; // Async wrapper DB instance

// ---------------- Helper ----------------
const safeParseJSON = (str: string | null) => {
  if (!str) return [];
  try {
    return JSON.parse(str);
  } catch (err) {
    console.warn('Invalid JSON in raw_messages, returning empty array:', str);
    return [];
  }
};

// ---------------- DB Init ----------------
export const initDB = async () => {
  try {
    db = await SQLite.openDatabaseAsync('placementDB'); // async wrapper
    await db.execAsync(`
      ${createDrivesTable}
      ${createRoundsTable}
    `);
    console.log('Database initialized successfully.');
  } catch (error) {
    console.error('DB init error:', error);
  }
};

const getDB = () => {
  if (!db) throw new Error('Database not initialized. Call initDB() first.');
  return db;
};

export { getDB };

// ---------------- Drives CRUD ----------------
export const insertDrive = async (drive: any): Promise<number | null> => {
  try {
    const db = getDB();
    const result = await db.runAsync(
      `INSERT INTO drives (
        company_name, role, location, ctc_stipend,
        status, registration_status, selected,
        skills_notes, raw_messages, parse_status,
        queued_for_retry, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        drive.company_name || 'Not Provided',
        drive.role || 'Not Provided',
        drive.location || 'Not Provided',
        drive.ctc_stipend || 'Not Provided',
        drive.status || 'upcoming',
        drive.registration_status || 'not_registered',
        drive.selected ? 1 : 0,
        drive.skills_notes || 'Not Provided',
        JSON.stringify(drive.raw_messages || []),
        drive.parse_status || 'pending',
        drive.queued_for_retry ? 1 : 0,
        new Date().toISOString(),
        new Date().toISOString(),
      ]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error('Insert drive error:', error);
    return null;
  }
};

export const getAllDrives = async (): Promise<any[]> => {
  try {
    const db = getDB();
    const rows = await db.getAllAsync('SELECT * FROM drives ORDER BY created_at DESC');
    return rows.map(row => ({
      ...row,
      company_name: row.company_name || 'Not Provided',
      role: row.role || 'Not Provided',
      location: row.location || 'Not Provided',
      ctc_stipend: row.ctc_stipend || 'Not Provided',
      skills_notes: row.skills_notes || 'Not Provided',
      raw_messages: safeParseJSON(row.raw_messages),
      selected: row.selected === 1,
      queued_for_retry: row.queued_for_retry === 1,
    }));
  } catch (error) {
    console.error('Get drives error:', error);
    return [];
  }
};

export const updateDrive = async (id: number, fields: any): Promise<boolean> => {
  try {
    const db = getDB();
    const updates: string[] = [];
    const values: any[] = [];

    Object.keys(fields).forEach(key => {
      let value = fields[key];
      if (key === 'raw_messages' && Array.isArray(value)) value = JSON.stringify(value);
      updates.push(`${key} = ?`);
      values.push(value);
    });

    // Add updated_at timestamp
    updates.push('updated_at = ?');
    values.push(new Date().toISOString());

    values.push(id); // WHERE id = ?

    await db.runAsync(`UPDATE drives SET ${updates.join(', ')} WHERE id = ?`, values);
    return true;
  } catch (error) {
    console.error('Update drive error:', error);
    return false;
  }
};

export const deleteDrive = async (id: number): Promise<boolean> => {
  try {
    const db = getDB();
    await db.runAsync(`DELETE FROM drives WHERE id = ?`, [id]);
    await db.runAsync(`DELETE FROM rounds WHERE drive_id = ?`, [id]); // remove associated rounds
    return true;
  } catch (error) {
    console.error('Delete drive error:', error);
    return false;
  }
};

// ---------------- Rounds CRUD ----------------
export const insertRound = async (round: any): Promise<number | null> => {
  try {
    const db = getDB();
    const result = await db.runAsync(
      `INSERT INTO rounds (drive_id, round_number, round_name, round_date, status, result)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        round.drive_id,
        round.round_number || 1, 
        round.round_name || 'Unnamed Round',
        round.round_date || '',
        round.status || 'upcoming',
        round.result || 'not_conducted',
      ]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error('Insert round error:', error);
    return null;
  }
};

export const getRoundsByDrive = async (drive_id: number): Promise<any[]> => {
  try {
    const db = getDB();
    const rows = await db.getAllAsync(
      'SELECT * FROM rounds WHERE drive_id = ? ORDER BY round_number ASC',
      [drive_id]
    );
    return rows.map(row => ({
      ...row,
      round_number: row.round_number || 1,
      round_name: row.round_name || 'Unnamed Round',
      round_date: row.round_date || '',
      status: row.status || 'upcoming',
      result: row.result || 'not_conducted',
    }));
  } catch (error) {
    console.error('Get rounds error:', error);
    return [];
  }
};

export const updateRound = async (id: number, updates: Partial<any>): Promise<boolean> => {
  try {
    const db = getDB();
    const keys = Object.keys(updates);
    if (!keys.length) return false;
    const values = Object.values(updates);
    const setClause = keys.map(k => `${k} = ?`).join(', ');
    await db.runAsync(`UPDATE rounds SET ${setClause} WHERE id = ?`, [...values, id]);
    return true;
  } catch (error) {
    console.error('Update round error:', error);
    return false;
  }
};

export const deleteRound = async (id: number): Promise<boolean> => {
  try {
    const db = getDB();
    await db.runAsync(`DELETE FROM rounds WHERE id = ?`, [id]);
    return true;
  } catch (error) {
    console.error('Delete round error:', error);
    return false;
  }
};

export const getDriveById = async (id: number): Promise<any | null> => {
  try {
    const db = getDB();
    const rows = await db.getAllAsync('SELECT * FROM drives WHERE id = ?', [id]);
    if (!rows || rows.length === 0) return null;

    const row = rows[0];
    return {
      ...row,
      company_name: row.company_name || 'Not Provided',
      role: row.role || 'Not Provided',
      location: row.location || 'Not Provided',
      ctc_stipend: row.ctc_stipend || 'Not Provided',
      skills_notes: row.skills_notes || 'Not Provided',
      raw_messages: safeParseJSON(row.raw_messages),
      selected: row.selected === 1,
      queued_for_retry: row.queued_for_retry === 1,
    };
  } catch (error) {
    console.error('Get drive by ID error:', error);
    return null;
  }
};
