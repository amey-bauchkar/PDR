import { google } from 'googleapis';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

function cleanKey(key: string): string {
  if (!key) return '';
  return key.replace(/^["']|["']$/g, '').trim();
}

async function getSheetInfo() {
    const sheetId = cleanKey(process.env.VITE_GOOGLE_SHEETS_ID || process.env.GOOGLE_SHEETS_ID as string);
    const email = cleanKey(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL as string);
    const pk = cleanKey(process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY as string);
    
    console.log("SheetID:", sheetId);
    console.log("Email:", email);
    
    const auth = new google.auth.JWT({
      email: email,
      key: pk.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    try {
        const metadata = await sheets.spreadsheets.get({
            spreadsheetId: sheetId,
        });
        console.log("Success! Sheets in document:");
        metadata.data.sheets?.forEach(s => {
           console.log("-", s.properties?.title); 
        });
    } catch (e: any) {
        console.error("Error connecting to Google Sheets:", e.message);
    }
}

getSheetInfo();
