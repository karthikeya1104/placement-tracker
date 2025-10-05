import { ApiKeyService } from './ApiKeyService';
import { ParsedDriveData, ParsedRound } from './types';

class GeminiService {
  /**
   * Parse new drive messages
   */
  static async parseRawMessage(rawMessages: string[] | string): Promise<ParsedDriveData> {
    if (!rawMessages) throw new Error('No messages provided');
    if (!Array.isArray(rawMessages)) rawMessages = [rawMessages];

    const apiKey = await ApiKeyService.getKey();
    if (!apiKey) throw new Error('Gemini API Key not found');

    const prompt = `
      You are an expert assistant that extracts structured JSON from placement messages.
      Remove formatting and bullets. Extract:
      - company_name
      - role (default "Not Provided")
      - ctc_stipend (default "Not Provided", combine CTC and stipend if both present like 10 - 12 LPA / 20K per month)
      - location (default "Not Provided")
      - skills_notes (default "Not Provided")
      - rounds (array: round_number starting at 1 for the first round, round_name, optional round_date, status default "upcoming")

      Ignore URLs, registration deadlines, contact info.

      Messages:
      ${rawMessages.join('\n')}

      Return only valid JSON with round_number for each round.
      `;

    return await this.callGemini(apiKey, prompt);
  }

  /**
   * Parse updates for an existing drive
   */
  static async parseDriveUpdate(
    drive: any,
    rounds: any[],
    newMessage: string
  ): Promise<ParsedDriveData> {
    const apiKey = await ApiKeyService.getKey();
    if (!apiKey) throw new Error('Gemini API Key not found');

    const prompt = `
      You are an expert assistant that maintains structured placement drive data in JSON.
      You will be given the **current drive details**, **existing rounds**, and a **new message update**.
      Your job is to produce an updated JSON representation that:
      1. Keeps existing data unless the new message indicates a change.
      2. Updates fields only if the message clearly shows new info.
      3. Updates rounds intelligently:
        - If a round with the same or similar name exists, modify it (new date, status, round_number).
        - If a new round appears, assign the correct round_number provided in the message.
        - Never duplicate rounds unnecessarily.

      ### CURRENT DRIVE DETAILS
      ${JSON.stringify({
            company_name: drive.company_name,
            role: drive.role,
            ctc_stipend: drive.ctc_stipend,
            location: drive.location,
            skills_notes: drive.skills_notes,
          })}

      ### EXISTING ROUNDS
      ${JSON.stringify(rounds)}

      ### NEW MESSAGE
      ${newMessage}

      Return a valid JSON object in this format:

      {
        "company_name": "string",
        "role": "string",
        "ctc_stipend": "string",
        "location": "string",
        "skills_notes": "string",
        "rounds": [
          { "round_number": number, "round_name": "string", "round_date": "string", "status": "upcoming" | "finished" }
        ]
      }

      Do not wrap the output in markdown fences. Return only JSON.
      `;

    return await this.callGemini(apiKey, prompt);
  }

  /**
   * Shared Gemini API call
   */
  private static async callGemini(apiKey: string, prompt: string): Promise<ParsedDriveData> {
    const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });

    if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);

    const data = await response.json();
    let textOutput = '';

    if (Array.isArray(data?.candidates) && data.candidates[0]?.content?.parts) {
      textOutput = data.candidates[0].content.parts.map((p: any) => p.text).join('');
    } else if (data?.candidates?.[0]?.content?.text) {
      textOutput = data.candidates[0].content.text;
    }

    textOutput = textOutput.replace(/```(?:json)?\s*([\s\S]*?)```/gm, '$1').trim();

    try {
      const parsed: ParsedDriveData = JSON.parse(textOutput);

      parsed.role ||= 'Not Provided';
      parsed.ctc_stipend ||= 'Not Provided';
      parsed.location ||= 'Not Provided';
      parsed.skills_notes ||= 'Not Provided';
      parsed.rounds = parsed.rounds?.map(r => ({
        round_number: r.round_number || 1,
        round_name: r.round_name,
        round_date: r.round_date || '',
        status: r.status || 'upcoming',
      })) || [];

      return parsed;
    } catch (err) {
      console.error('Failed to parse Gemini JSON:', textOutput);
      throw new Error('Invalid JSON returned from Gemini API');
    }
  }
}

export default GeminiService;
