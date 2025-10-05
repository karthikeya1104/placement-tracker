import { ApiKeyService } from './ApiKeyService';

export type ParsedRound = {
  round_name: string;
  round_date?: string;
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

class GeminiService {
  /**
   * Parse raw placement messages using Gemini API.
   * Handles nested objects, markdown formatting, and safe defaults.
   */
  static async parseRawMessage(rawMessages: string[] | string): Promise<ParsedDriveData> {
    if (!rawMessages) throw new Error('No messages provided');
    if (!Array.isArray(rawMessages)) rawMessages = [rawMessages];

    const apiKey = await ApiKeyService.getKey();
    if (!apiKey) throw new Error('Gemini API Key not found');

    const prompt = `
You are an expert assistant that extracts structured JSON from placement messages.
Remove all formatting and bullets. Extract:
- company_name
- role (default "Not Provided")
- ctc_stipend (default "Not Provided")
- location (default "Not Provided")
- skills_notes (default "Not Provided")
- rounds (array: round_name, optional round_date, status default "upcoming")
Ignore URLs, registration deadlines, contact info.

Messages:
${rawMessages.join('\n')}

Return only valid JSON.
`;

    const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    try {
      // Wait for Gemini API response
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      });

      if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);

      // Parse JSON body fully
      const data = await response.json();

      // ----------------------
      // 1. Extract text safely from all possible Gemini v2 structures
      // ----------------------
      let textOutput = '';

      if (Array.isArray(data?.candidates) && data.candidates[0]?.content) {
        const content = data.candidates[0].content;
        if (Array.isArray(content)) {
          textOutput = content.map((c: any) => c.text).join('');
        } else if (content.parts && Array.isArray(content.parts)) {
          textOutput = content.parts.map((c: any) => c.text).join('');
        } else if (typeof content.text === 'string') {
          textOutput = content.text;
        }
      } else if (Array.isArray(data?.output?.[0]?.content)) {
        textOutput = data.output[0].content.map((c: any) => c.text).join('');
      } else if (typeof data?.text === 'string') {
        textOutput = data.text;
      }
      
      if (!textOutput) {
        console.error('Gemini raw response:', JSON.stringify(data, null, 2));
        throw new Error('Empty response from Gemini API');
      }

      // ----------------------
      // 2. Strip Markdown code blocks (```json ... ``` or ```)
      // ----------------------
      textOutput = textOutput.replace(/```(?:json)?\s*([\s\S]*?)```/gm, '$1').trim();

      // ----------------------
      // 3. Parse JSON safely
      // ----------------------
      try {
        const parsed: ParsedDriveData = JSON.parse(textOutput);

        // Ensure defaults
        parsed.role = parsed.role || 'Not Provided';
        parsed.ctc_stipend = parsed.ctc_stipend || 'Not Provided';
        parsed.location = parsed.location || 'Not Provided';
        parsed.skills_notes = parsed.skills_notes || 'Not Provided';
        parsed.rounds = parsed.rounds?.map(r => ({
          round_name: r.round_name,
          round_date: r.round_date,
          status: r.status || 'upcoming'
        })) || [];

        return parsed;
      } catch (err) {
        console.error('Failed to parse JSON after cleanup:', textOutput);
        throw new Error('Invalid JSON returned from Gemini API');
      }
    } catch (err) {
      console.error('Gemini parsing failed:', err);
      throw err;
    }
  }
}

export default GeminiService;
