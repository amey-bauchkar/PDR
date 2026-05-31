import { google } from 'googleapis';
import dotenv from 'dotenv';
dotenv.config();

async function checkSheet() {
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  if (!spreadsheetId || !email || !rawKey) {
    console.error('Missing env vars');
    return;
  }
  const key = rawKey.replace(/\\n/g, '\n');
  const auth = new google.auth.JWT({ email, key, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
  const sheets = google.sheets({ version: 'v4', auth });
  
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${process.env.GOOGLE_SHEETS_TAB_NAME || 'Sheet1'}!A1:J20`
  });
  console.log('Sheet rows:');
  console.log(JSON.stringify(res.data.values, null, 2));
}

checkSheet().catch(console.error);
