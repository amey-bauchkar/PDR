import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';
import { v4 as uuidv4 } from 'uuid';

const SHEET_HEADERS = [
  'Submitted At', 'RFQ ID', 'Session Hash', 'Name',
  'Email', 'Company', 'Notes', 'Item Count',
  'Products (name and qty)', 'Status',
];

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getSupabase() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

function getSheetsContext() {
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  if (!spreadsheetId || !email || !rawKey) {
    console.log('Google Sheets not configured:', { spreadsheetId: !!spreadsheetId, email: !!email, rawKey: !!rawKey });
    return null;
  }
  const key = rawKey.replace(/\\n/g, '\n');
  const auth = new google.auth.JWT({ email, key, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
  return { spreadsheetId, sheetName: process.env.GOOGLE_SHEETS_TAB_NAME || 'Sheet1', sheets: google.sheets({ version: 'v4', auth }) };
}

async function logToGoogleSheets(rfqData, items) {
  try {
    const ctx = getSheetsContext();
    if (!ctx) { return { success: false, error: 'Google Sheets not configured' }; }
    const headerRes = await ctx.sheets.spreadsheets.values.get({ spreadsheetId: ctx.spreadsheetId, range: `${ctx.sheetName}!A1:J1` });
    if (!headerRes.data.values || headerRes.data.values.length === 0) {
      await ctx.sheets.spreadsheets.values.update({ spreadsheetId: ctx.spreadsheetId, range: `${ctx.sheetName}!A1:J1`, valueInputOption: 'RAW', requestBody: { values: [SHEET_HEADERS] } });
    }
    const itemsSummary = items.map(i => `${i.productName || i.productId || 'Item'} (${i.quantity || 1})`).join(', ');
    await ctx.sheets.spreadsheets.values.append({
      spreadsheetId: ctx.spreadsheetId,
      range: `${ctx.sheetName}!A:J`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [[
        rfqData.submitted_at,
        rfqData.id,
        rfqData.session_hash || '',
        rfqData.full_name,
        rfqData.email,
        rfqData.company,
        rfqData.notes || '',
        String(items.length),
        itemsSummary,
        rfqData.status || 'submitted',
      ]] },
    });
    return { success: true };
  } catch (err) {
    console.error('Google Sheets error:', err.message);
    return { success: false, error: err.message };
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

  try {
    const { sessionHash, name, email, company, notes, items } = req.body;

    if (!name || !email || !company || !items || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Missing required fields: name, email, company, items' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, error: 'Invalid email format' });
    }

    const rfqId = uuidv4();
    const submittedAt = new Date().toISOString();

    const rfqRecord = {
      id: rfqId,
      session_hash: sessionHash || '',
      full_name: name,
      email,
      company,
      notes: notes || '',
      status: 'new',
    };

    // Save to Supabase
    const supabase = getSupabase();
    if (supabase) {
      const { error: rfqError } = await supabase.from('quote_requests').insert([rfqRecord]);
      if (rfqError) console.warn('Supabase RFQ insert error:', rfqError.message);

      const itemsToInsert = items.map((item, idx) => ({
        id: uuidv4(),
        quote_request_id: rfqId,
        product_id: item.productId,
        product_title: item.productName,
        product_specs: item.configuration?.specs || '',
        quantity: item.quantity,
        sort_order: idx,
      }));
      const { error: itemsError } = await supabase.from('quote_request_items').insert(itemsToInsert);
      if (itemsError) console.warn('Supabase items insert error:', itemsError.message);
    }

    // Log to Google Sheets
    const sheetsResult = await logToGoogleSheets(rfqRecord, items);
    console.log('Sheets result:', sheetsResult);

    return res.status(201).json({
      success: true,
      data: { id: rfqId, sessionHash, name, email, company, notes, items, status: 'submitted', submittedAt },
      sheets: sheetsResult,
      timestamp: Date.now(),
    });
  } catch (err) {
    console.error('RFQ submission error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error', message: err.message });
  }
}
