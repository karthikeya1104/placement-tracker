// app/db/schema.ts
export const createDrivesTable = `
CREATE TABLE IF NOT EXISTS drives (
  id INTEGER PRIMARY KEY NOT NULL,
  company_name TEXT,
  role TEXT,
  location TEXT,
  ctc_stipend TEXT,
  status TEXT,               -- upcoming / ongoing / finished
  registration_status TEXT,  -- registered / not_registered
  selected INTEGER,          -- 1 for selected, 0 for not
  skills_notes TEXT,
  raw_messages TEXT,         -- JSON array of raw messages
  parse_status TEXT,         -- pending / pending_update / failed
  queued_for_retry INTEGER,  -- 1 if in network queue
  created_at TEXT,
  updated_at TEXT
);
`;

export const createRoundsTable = `
CREATE TABLE IF NOT EXISTS rounds (
  id INTEGER PRIMARY KEY NOT NULL,
  drive_id INTEGER,
  round_number INTEGER,      -- 1 for first round, 2 for second, etc.
  round_name TEXT,           -- OA / Technical / HR / etc.
  round_date TEXT,
  status TEXT,               -- upcoming / finished
  result TEXT,               -- shortlisted / rejected
  FOREIGN KEY (drive_id) REFERENCES drives(id)
);
`;
