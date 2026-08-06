// Temporary debug endpoint to diagnose Google Sheets key format on Vercel
// DELETE THIS FILE after debugging is complete

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || '';
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '';
  const sheetsId = process.env.GOOGLE_SHEETS_ID || '';

  // Sanitize for display — never expose the actual key
  const firstChars = rawKey.slice(0, 40);
  const lastChars = rawKey.slice(-40);
  const hasLiteralBackslashN = rawKey.includes('\\n');
  const hasRealNewline = rawKey.includes('\n');
  const startsWithQuote = rawKey.startsWith('"');
  const endsWithQuote = rawKey.endsWith('"');
  const startsWithBegin = rawKey.includes('-----BEGIN');

  return res.status(200).json({
    sheetsId: sheetsId ? `${sheetsId.slice(0, 10)}...` : 'MISSING',
    email: email || 'MISSING',
    key: {
      length: rawKey.length,
      firstChars,
      lastChars,
      hasLiteralBackslashN,
      hasRealNewline,
      startsWithQuote,
      endsWithQuote,
      startsWithBegin,
    },
  });
}
