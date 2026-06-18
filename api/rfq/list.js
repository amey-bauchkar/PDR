import { google } from 'googleapis';

function getSheetsContext() {
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  if (!spreadsheetId || !email || !rawKey) {
    console.log('Google Sheets not configured:', { spreadsheetId: !!spreadsheetId, email: !!email, rawKey: !!rawKey });
    return null;
  }
  const key = rawKey.replace(/\\n/g, '\n');
  const auth = new google.auth.JWT({ email, key, scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'] });
  return { spreadsheetId, sheetName: process.env.GOOGLE_SHEETS_TAB_NAME || 'Sheet1', sheets: google.sheets({ version: 'v4', auth }) };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ success: false, error: 'Method not allowed' });

  try {
    const ctx = getSheetsContext();
    if (!ctx) {
      return res.status(500).json({ success: false, error: 'Google Sheets not configured' });
    }

    const response = await ctx.sheets.spreadsheets.values.get({
      spreadsheetId: ctx.spreadsheetId,
      range: `${ctx.sheetName}!A2:J`,
    });

    const rows = response.data.values || [];
    
    const rfqs = rows.map((row, index) => ({
      createdAt: row[0] || new Date().toISOString(),
      id: row[1] || `sheet-rfq-${index}`,
      sessionHash: row[2] || '',
      name: row[3] || 'Unknown',
      email: row[4] || 'N/A',
      company: row[5] || 'N/A',
      notes: row[6] || '',
      itemCount: parseInt(row[7], 10) || 1,
      // Map the items summary string back into an array for the AdminPanel UI
      items: row[8] ? [row[8]] : [],
      status: row[9] || 'submitted',
    })).reverse(); // Show newest first

    return res.status(200).json({
      success: true,
      data: rfqs,
      timestamp: Date.now(),
    });
  } catch (err) {
    console.error('RFQ list fetch error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error', message: err.message });
  }
}
