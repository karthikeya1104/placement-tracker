import React, { createContext, useState, useEffect, useContext } from 'react';
import DriveService from '../services/DriveService';
import {
  getAllDrives,
  insertDrive,
  updateDrive,
  deleteDrive,
  getRoundsByDrive,
  insertRound,
  updateRound,
  deleteRound,
  initDB
} from '../db/SQLiteService';

export type Round = {
  id: number;
  drive_id: number;
  round_name: string;
  round_date: string;
  status: string;
  result: string;
};

export type Drive = {
  id: number;
  company_name: string;
  role: string;
  location: string;
  ctc_stipend: string;
  status: string;
  registration_status: string;
  selected: number;
  skills_notes: string;
  created_at?: string;
  updated_at?: string;
  rounds?: Round[];
};

interface DrivesContextType {
  drives: Drive[];
  dbReady: boolean;
  addDrive: (drive: Drive) => Promise<Drive | null>;
  updateDriveInState: (id: number, updates: Partial<Drive>) => Promise<boolean>;
  deleteDriveInState: (id: number) => Promise<boolean>;
  refreshDrives: () => Promise<void>;
  addRoundToDrive: (driveId: number, round: Partial<Round>) => Promise<boolean>;
  updateRoundInDrive: (driveId: number, roundId: number, updates: Partial<Round>) => Promise<boolean>;
  removeRoundFromDrive: (driveId: number, roundId: number) => Promise<boolean>;
  clearAllDrives: () => Promise<void>;
}

const DrivesContext = createContext<DrivesContextType>({
  drives: [],
  dbReady: false,
  addDrive: async () => null,
  updateDriveInState: async () => false,
  deleteDriveInState: async () => false,
  refreshDrives: async () => {},
  addRoundToDrive: async () => false,
  updateRoundInDrive: async () => false,
  removeRoundFromDrive: async () => false,
  clearAllDrives: async () => {},
});

export const DrivesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [drives, setDrives] = useState<Drive[]>([]);
  const [dbReady, setDbReady] = useState(false);

  // Proper init: DB + drives + rounds
  useEffect(() => {
    const initApp = async () => {
      try {
        await initDB(); // create tables if not exists
        // fetch drives + rounds immediately
        const allDrives = await getAllDrives();
        const drivesWithRounds = await Promise.all(
          allDrives.map(async (d) => ({ ...d, rounds: await getRoundsByDrive(d.id) }))
        );
        setDrives(drivesWithRounds);
        
        setDbReady(true); // mark ready only after data loaded
      } catch (error) {
        console.error('DB init or fetch failed:', error);
      }
    };

    initApp();
  }, []);

  useEffect(() => {
    if (dbReady) {
      retryQueuedDrives();
    }
  }, [dbReady]);

  const refreshDrives = async () => {
    try {
      const allDrives = await getAllDrives();
      const drivesWithRounds = await Promise.all(
        allDrives.map(async d => ({ ...d, rounds: await getRoundsByDrive(d.id) }))
      );
      setDrives(drivesWithRounds);
    } catch (error) {
      console.error('Failed to fetch drives:', error);
    }
  };

  const addDrive = async (drive: Drive) => {
    const id = await insertDrive(drive);
    if (!id) return null;
    await refreshDrives();
    return { ...drive, id, rounds: [] };
  };

  const updateDriveInState = async (id: number, updates: Partial<Drive>) => {
    const success = await updateDrive(id, updates);
    if (success) setDrives(prev => prev.map(d => (d.id === id ? { ...d, ...updates } : d)));
    return success;
  };

  const deleteDriveInState = async (id: number) => {
    const success = await deleteDrive(id);
    if (success) setDrives(prev => prev.filter(d => d.id !== id));
    return success;
  };

  const refreshRoundsForDrive = async (driveId: number) => {
    const rounds = await getRoundsByDrive(driveId);
    setDrives(prev => prev.map(d => (d.id === driveId ? { ...d, rounds } : d)));
    return rounds;
  };

  const addRoundToDrive = async (driveId: number, round: Partial<Round>) => {
    const id = await insertRound({ ...round, drive_id: driveId });
    if (!id) return false;
    await refreshRoundsForDrive(driveId);
    return true;
  };

  const updateRoundInDrive = async (driveId: number, roundId: number, updates: Partial<Round>) => {
    const success = await updateRound(roundId, updates);
    if (success) await refreshRoundsForDrive(driveId);
    return success;
  };

  const removeRoundFromDrive = async (driveId: number, roundId: number) => {
    const success = await deleteRound(roundId);
    if (success) await refreshRoundsForDrive(driveId);
    return success;
  };

  const clearAllDrives = async () => {
    try {
      await DriveService.clearAll(); // clears DB tables
      setDrives([]); // clear context state
    } catch (error) {
      console.error('Failed to clear drives:', error);
    }
  };

  const retryQueuedDrives = async () => {
    try {
      const allDrives = await getAllDrives();
      const queuedDrives = allDrives.filter(d => d.queued_for_retry);

      for (const drive of queuedDrives) {
        try {
          const mode = drive.parse_status === 'pending' ? 'new' : 'update'; 
          // Use the existing DriveService to retry parsing
          await DriveService.tryParseDrive(drive.id, drive.raw_messages, mode);

          console.log(`Retry succeeded for drive: ${drive.company_name}`);
        } catch (error) {
          console.warn(`Retry failed for drive: ${drive.company_name}. Will keep in queue.`);
          // Drive stays queued for next startup
        }

        // Optional: stagger retries to avoid hammering API
        await new Promise(res => setTimeout(res, 2000)); // 2-second delay
      }

      // Refresh drives state after retry attempts
      await refreshDrives();

    } catch (error) {
      console.error('Retry queued drives failed:', error);
    }
  };

  return (
    <DrivesContext.Provider
      value={{
        drives,
        dbReady,
        addDrive,
        updateDriveInState,
        deleteDriveInState,
        refreshDrives,
        addRoundToDrive,
        updateRoundInDrive,
        removeRoundFromDrive,
        clearAllDrives,
      }}
    >
      {children}
    </DrivesContext.Provider>
  );
};

export const useDrives = () => useContext(DrivesContext);
