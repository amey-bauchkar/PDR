// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { google } from "npm:googleapis@126.0.1"
import { v4 as uuidv4 } from "npm:uuid@9.0.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SHEET_HEADERS = [
  'Submitted At', 'RFQ ID', 'Session Hash', 'Name',
  'Email', 'Company', 'Notes', 'Item Count',
  'Products (name and qty)', 'Status',
]

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function sanitizePrivateKey(raw: string) {
  let key = raw
  if (key.startsWith('"') && key.endsWith('"')) key = key.slice(1, -1)
  if (key.startsWith("'") && key.endsWith("'")) key = key.slice(1, -1)
  key = key.replace(/\\\\n/g, '\n')
  key = key.replace(/\\n/g, '\n')
  return key
}

function getSheetsContext() {
  const spreadsheetId = Deno.env.get('GOOGLE_SHEETS_ID')
  const email = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_EMAIL')
  const rawKey = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY')
  
  if (!spreadsheetId || !email || !rawKey) {
    return null
  }
  
  const key = sanitizePrivateKey(rawKey)
  const auth = new google.auth.JWT({ 
    email, 
    key, 
    scopes: ['https://www.googleapis.com/auth/spreadsheets'] 
  })
  
  return { 
    spreadsheetId, 
    sheetName: Deno.env.get('GOOGLE_SHEETS_TAB_NAME') || 'Sheet1', 
    sheets: google.sheets({ version: 'v4', auth }) 
  }
}

async function logToGoogleSheets(rfqData: any, items: any[]) {
  try {
    const ctx = getSheetsContext()
    if (!ctx) { 
      return { success: false, error: 'Google Sheets not configured' } 
    }
    
    const headerRes = await ctx.sheets.spreadsheets.values.get({ 
      spreadsheetId: ctx.spreadsheetId, 
      range: `${ctx.sheetName}!A1:J1` 
    })
    
    if (!headerRes.data.values || headerRes.data.values.length === 0) {
      await ctx.sheets.spreadsheets.values.update({ 
        spreadsheetId: ctx.spreadsheetId, 
        range: `${ctx.sheetName}!A1:J1`, 
        valueInputOption: 'RAW', 
        requestBody: { values: [SHEET_HEADERS] } 
      })
    }
    
    const itemsSummary = items.map(i => `${i.productName || i.productId || 'Item'} (${i.quantity || 1})`).join(', ')
    
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
    })
    return { success: true }
  } catch (err: any) {
    console.error('Google Sheets error:', err.message)
    return { success: false, error: err.message }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { sessionHash, name, email, company, notes, items } = await req.json()

    if (!name || !email || !company || !items || items.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields: name, email, company, items' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    if (!isValidEmail(email)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid email format' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const rfqId = uuidv4()
    const submittedAt = new Date().toISOString()

    const rfqRecord = {
      id: rfqId,
      session_hash: sessionHash || `live-${Date.now()}`,
      full_name: name,
      email,
      company,
      notes: notes || '',
      status: 'new',
      submitted_at: submittedAt,
    }

    // Save to Supabase using the existing RPC
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('MY_SERVICE_ROLE_KEY')
    
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey)
      
      const rpcItems = items.map((item: any) => ({
        slug: item.productId,
        title: item.productName,
        specs: item.configuration?.specs || '',
        image: item.configuration?.image || '',
        qty: item.quantity,
      }))

      const { error: rpcError } = await supabase.rpc('submit_quote_request', {
        p_session_hash: sessionHash || `live-${Date.now()}`,
        p_contact: {
          name,
          email,
          company,
          notes: notes || '',
        },
        p_items: rpcItems,
      })

      if (rpcError) {
        console.warn('Supabase RPC submit_quote_request error:', rpcError.message)
      }
    }

    // Log to Google Sheets
    const sheetsResult = await logToGoogleSheets(rfqRecord, items)

    return new Response(
      JSON.stringify({
        success: true,
        data: { id: rfqId, sessionHash, name, email, company, notes, items, status: 'submitted', submittedAt },
        sheets: sheetsResult,
        timestamp: Date.now(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 201 }
    )
  } catch (err: any) {
    console.error('RFQ submission error:', err)
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error', message: err.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
