import { google } from 'googleapis';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

function cleanKey(key: string): string {
  if (!key) return '';
  return key.replace(/^["']|["']$/g, '').trim();
}

async function testSheets() {
    const sheetId = cleanKey(process.env.GOOGLE_SHEETS_ID || process.env.VITE_GOOGLE_SHEETS_ID as string);
    const email = cleanKey(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL as string);
    const pk = cleanKey(process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY as string);
    
    const auth = new google.auth.JWT({
      email: email,
      key: pk.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    try {
        const headerResponse = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: '"Sheet1"!A1:J1',
        });
        console.log("Success with quotes!", headerResponse.data.values);
    } catch (e) {
        console.error("Error with quotes:", e.message);
    }
}

testSheets();
