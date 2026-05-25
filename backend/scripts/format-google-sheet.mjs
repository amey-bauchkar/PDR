import 'dotenv/config'
import { google } from 'googleapis'

const SHEET_ID = process.env.GOOGLE_SHEETS_ID
const TAB_NAME = process.env.GOOGLE_SHEETS_TAB_NAME || 'Sheet1'
const CLIENT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
let PRIVATE_KEY = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY

if (!SHEET_ID || !CLIENT_EMAIL || !PRIVATE_KEY) {
  console.error('Missing Google Sheets environment variables. See .env for GOOGLE_SHEETS_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY')
  process.exit(1)
}

// Convert escaped newlines to real newlines if needed
PRIVATE_KEY = PRIVATE_KEY.replace(/\\n/g, '\n')

async function main() {
  const auth = new google.auth.JWT({
    email: CLIENT_EMAIL,
    key: PRIVATE_KEY,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })

  const sheets = google.sheets({ version: 'v4', auth })

  // Get spreadsheet metadata to find the sheetId and column count
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID })
  const sheetsMeta = meta.data.sheets || []
  const sheet = sheetsMeta.find(s => s.properties?.title === TAB_NAME) || sheetsMeta[0]
  if (!sheet || !sheet.properties) {
    console.error('Could not find sheet tab:', TAB_NAME)
    process.exit(1)
  }

  const sheetId = sheet.properties.sheetId
  const columnCount = sheet.properties.gridProperties?.columnCount || 10

  const requests = [
    // Freeze header row
    {
      updateSheetProperties: {
        properties: { sheetId, gridProperties: { frozenRowCount: 1 } },
        fields: 'gridProperties.frozenRowCount',
      },
    },
    // Bold + center + wrap header row
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 0, endRowIndex: 1 },
        cell: {
          userEnteredFormat: {
            textFormat: { bold: true },
            horizontalAlignment: 'CENTER',
            wrapStrategy: 'WRAP',
          },
        },
        fields: 'userEnteredFormat(textFormat,wrapStrategy,horizontalAlignment)',
      },
    },
    // Enable wrap for body cells (rows 2..1000)
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 0, endColumnIndex: columnCount },
        cell: { userEnteredFormat: { wrapStrategy: 'WRAP' } },
        fields: 'userEnteredFormat.wrapStrategy',
      },
    },
    // Auto-resize all columns to fit content
    {
      autoResizeDimensions: {
        dimensions: { sheetId, dimension: 'COLUMNS', startIndex: 0, endIndex: columnCount },
      },
    },
  ]

  const resp = await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: { requests },
  })

  console.log('Formatting applied to sheet:', TAB_NAME)
  console.log('BatchUpdate response:', resp.status)
}

main().catch(err => {
  console.error('Error formatting sheet:', err)
  process.exit(1)
})
