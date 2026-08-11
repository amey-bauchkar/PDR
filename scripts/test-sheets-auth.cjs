// Test Google Sheets authentication locally with the .env key
const fs = require('fs');
const path = require('path');

// Load .env
try {
  const envPath = path.join(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const parts = line.split('=');
      if (parts.length >= 2 && !line.startsWith('#')) {
        process.env[parts[0].trim()] = parts.slice(1).join('=').trim();
      }
    }
  }
} catch (e) { /* ignore */ }

const { google } = require('googleapis');

const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

console.log('Config check:');
console.log('  GOOGLE_SHEETS_ID:', spreadsheetId ? `${spreadsheetId.slice(0,10)}...` : 'MISSING');
console.log('  GOOGLE_SERVICE_ACCOUNT_EMAIL:', email || 'MISSING');
console.log('  GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY:', rawKey ? `${rawKey.length} chars, starts with: ${rawKey.slice(0,30)}` : 'MISSING');

// Sanitize key
let key = rawKey;
if (key.startsWith('"') && key.endsWith('"')) key = key.slice(1, -1);
if (key.startsWith("'") && key.endsWith("'")) key = key.slice(1, -1);
key = key.replace(/\\\\n/g, '\n');
key = key.replace(/\\n/g, '\n');

console.log('\nSanitized key:');
console.log('  Length:', key.length);
console.log('  Starts with:', key.slice(0,30));
console.log('  Ends with:', key.slice(-30));
console.log('  Has real newlines:', key.includes('\n'));
console.log('  Has literal \\n:', key.includes('\\n'));

async function testAuth() {
  try {
    const auth = new google.auth.JWT({
      email,
      key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    console.log('\nAttempting to authorize...');
    await auth.authorize();
    console.log('✅ Auth SUCCESS!');

    const sheets = google.sheets({ version: 'v4', auth });
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A1:J1',
    });
    console.log('✅ Sheet read SUCCESS! Headers:', res.data.values?.[0]);
  } catch (err) {
    console.error('❌ Auth FAILED:', err.message);
  }
}

testAuth();
