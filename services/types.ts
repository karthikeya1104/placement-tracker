export type ParsedRound = {
  round_name: string;
  round_date?: string;
  round_number?: number;
  status?: 'upcoming' | 'finished';
};

export type ParsedDriveData = {
  company_name: string;
  role?: string;
  ctc_stipend?: string;
  location?: string;
  skills_notes?: string;
  rounds?: ParsedRound[];
};
