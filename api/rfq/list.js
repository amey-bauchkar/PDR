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

    // Fetch ALL columns A through J, starting from row 2 (skip header)
    const response = await ctx.sheets.spreadsheets.values.get({
      spreadsheetId: ctx.spreadsheetId,
      range: `${ctx.sheetName}!A2:J`,
    });

    const rows = response.data.values || [];

    // Build RFQs from every row - only skip rows that are 100% empty
    const rfqs = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      // Skip ONLY if the row is completely empty (no data in any cell)
      const hasAnyData = row && row.length > 0 && row.some(cell => cell && String(cell).trim() !== '');
      if (!hasAnyData) continue;

      rfqs.push({
        createdAt: (row[0] || '').trim() || new Date().toISOString(),
        id: (row[1] || '').trim() || `sheet-rfq-${i}`,
        sessionHash: (row[2] || '').trim(),
        name: (row[3] || '').trim() || 'Unknown',
        email: (row[4] || '').trim() || 'N/A',
        company: (row[5] || '').trim() || 'N/A',
        notes: (row[6] || '').trim(),
        itemCount: parseInt(row[7], 10) || 1,
        items: row[8] ? [row[8].trim()] : [],
        status: (row[9] || '').trim() || 'submitted',
      });
    }

    // Newest first
    rfqs.reverse();

    return res.status(200).json({
      success: true,
      data: rfqs,
      total: rfqs.length,
      rawRowCount: rows.length,
      timestamp: Date.now(),
    });
  } catch (err) {
    console.error('RFQ list fetch error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error', message: err.message });
  }
}
