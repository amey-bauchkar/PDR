import { google } from 'googleapis';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

function cleanKey(key: string): string {
  if (!key) return '';
  return key.replace(/^["']|["']$/g, '').trim();
}

async function testWrite() {
    const sheetId = cleanKey(process.env.VITE_GOOGLE_SHEETS_ID || process.env.GOOGLE_SHEETS_ID as string);
    const email = cleanKey(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL as string);
    const pk = cleanKey(process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY as string);
    const sheetName = cleanKey(process.env.GOOGLE_SHEETS_TAB_NAME || 'Sheet1');
    
    const auth = new google.auth.JWT({
      email: email,
      key: pk.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    try {
        const res = await sheets.spreadsheets.values.append({
          spreadsheetId: sheetId,
          range: `${sheetName}!A:J`,
          valueInputOption: 'USER_ENTERED',
          insertDataOption: 'INSERT_ROWS',
          requestBody: {
            values: [[
              new Date().toISOString(),
              "TEST-ID",
              "TEST-SESSION",
              "Test Name",
              "test@example.com",
              "Test Co",
              "Notes",
              "1",
              "1x Test Item",
              "submitted",
            ]],
          },
        });
        console.log("Success! Appended row:", res.data.updates?.updatedRange);
    } catch (e: any) {
        console.error("Error appending to Google Sheets:", e.message);
    }
}

testWrite();
