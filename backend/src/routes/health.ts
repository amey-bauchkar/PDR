import { Router, Request, Response } from 'express';

const router = Router();

/**
 * Health check endpoint
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: Date.now(),
    uptime: process.uptime(),
  });
});

/**
 * API info endpoint
 */
router.get('/info', (req: Request, res: Response) => {
  res.json({
    name: 'PDR World API',
    version: '1.0.0',
    description: 'Professional Backend API for PDR World',
    timestamp: Date.now(),
  });
});

/**
 * Env check endpoint (diagnostic)
 */
router.get('/env-diag', (req: Request, res: Response) => {
  res.json({
    supabaseUrl: !!process.env.VITE_SUPABASE_URL,
    anonKey: !!process.env.VITE_SUPABASE_ANON_KEY,
    serviceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    nodeEnv: process.env.NODE_ENV,
  });
});

/**
 * Google Sheets Diagnostic Endpoint
 */
router.get('/test-sheets', async (req: Request, res: Response) => {
  try {
    const { google } = await import('googleapis');
    const { config } = await import('../config/env.js');
    const { cleanKey } = await import('../config/database.js');

    const spreadsheetId = cleanKey(config.googleSheets.sheetsId);
    const serviceAccountEmail = cleanKey(config.googleSheets.serviceAccountEmail);
    const serviceAccountPrivateKey = cleanKey(config.googleSheets.serviceAccountPrivateKey);

    if (!spreadsheetId || !serviceAccountEmail || !serviceAccountPrivateKey) {
      return res.json({
        success: false,
        error: 'Missing Google Sheets configuration',
        details: {
          hasSpreadsheetId: !!spreadsheetId,
          hasEmail: !!serviceAccountEmail,
          hasPrivateKey: !!serviceAccountPrivateKey,
        }
      });
    }

    const auth = new google.auth.JWT({
      email: serviceAccountEmail,
      key: serviceAccountPrivateKey.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    // Just try to fetch the spreadsheet properties
    const response = await sheets.spreadsheets.get({
      spreadsheetId
    });

    res.json({
      success: true,
      message: 'Successfully authenticated with Google Sheets!',
      title: response.data.properties?.title,
      tabNameConfigured: cleanKey(config.googleSheets.sheetName),
    });
  } catch (error: any) {
    res.json({
      success: false,
      error: error.message,
      stack: error.stack,
    });
  }
});

export default router;
