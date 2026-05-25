import { google } from 'googleapis';
import { config } from '../config/env.js';
import { supabaseServiceClient as rawSupabaseServiceClient } from '../config/database.js';
const supabaseServiceClient = rawSupabaseServiceClient!;
import { QuoteRequest, QuoteItem } from '../types/index.js';
import { AppError } from '../types/index.js';
import { v4 as uuidv4 } from 'uuid';

const SHEET_HEADERS = [
  'Submitted At',
  'RFQ ID',
  'Session Hash',
  'Name',
  'Email',
  'Company',
  'Notes',
  'Item Count',
  'Products (name and qty)',
  'Status',
];

export class RfqService {
  /**
   * Submit an RFQ (Request for Quotation)
   */
  async submitRfq(
    sessionHash: string,
    name: string,
    email: string,
    company: string,
    notes: string | undefined,
    items: QuoteItem[]
  ): Promise<QuoteRequest> {
    try {
      // Validate input
      if (!name || !email || !company || items.length === 0) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Missing required fields');
      }

      if (!this.isValidEmail(email)) {
        throw new AppError(400, 'INVALID_EMAIL', 'Invalid email format');
      }

      const rfqId = uuidv4();
      const submittedAt = new Date().toISOString();

      const rfqRecord = {
        id: rfqId,
        session_hash: sessionHash,
        full_name: name,
        email,
        company,
        notes: notes || '',
        status: 'submitted',
        submitted_at: submittedAt,
      } as any;

      // Store RFQ in database
      let rfqData: any = rfqRecord;
      if (supabaseServiceClient) {
        const { data, error } = await supabaseServiceClient
          .from('quote_requests')
          .insert([rfqRecord])
          .select()
          .single();

        if (error || !data) {
          console.warn('Failed to create RFQ in Supabase, continuing with Google Sheets only:', error);
        } else {
          rfqData = data;
        }
      }

      // Store RFQ items
      const itemsToInsert = items.map((item, index) => ({
        id: uuidv4(),
        quote_request_id: rfqId,
        product_id: item.productId,
        product_name: item.productName,
        quantity: item.quantity,
        configuration: item.configuration || {},
        sort_order: index,
      }));

      const { error: itemsError } = await supabaseServiceClient
        .from('quote_request_items')
        .insert(itemsToInsert);

      if (itemsError) {
        console.warn('Failed to store RFQ items in Supabase, continuing with Google Sheets only:', itemsError);
      }

      // Trigger downstream integrations
      await this.triggerCrmIntegration(rfqData, items);
      await this.logToGoogleSheets(rfqData, items);

      return {
        id: rfqId,
        sessionHash,
        name,
        email,
        company,
        notes,
        items,
        status: 'submitted',
        submittedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      console.error('Error submitting RFQ:', error);
      throw new AppError(500, 'RFQ_SUBMISSION_ERROR', 'Failed to submit RFQ', error.message);
    }
  }

  /**
   * Get RFQ by ID
   */
  async getRfq(rfqId: string): Promise<QuoteRequest> {
    try {
      const { data: rfqData, error: rfqError } = await supabaseServiceClient
        .from('quote_requests')
        .select('*')
        .eq('id', rfqId)
        .single();

      if (rfqError || !rfqData) {
        throw new AppError(404, 'RFQ_NOT_FOUND', 'RFQ not found');
      }

      // Fetch items
      const { data: itemsData, error: itemsError } = await supabaseServiceClient
        .from('quote_request_items')
        .select('*')
        .eq('quote_request_id', rfqId)
        .order('sort_order', { ascending: true });

      if (itemsError) {
        throw new AppError(500, 'ITEMS_FETCH_ERROR', 'Failed to fetch RFQ items');
      }

      const items: QuoteItem[] = (itemsData || []).map((item: any) => ({
        productId: item.product_id,
        productName: item.product_name,
        quantity: item.quantity,
        configuration: item.configuration,
      }));

      return {
        id: rfqData.id,
        sessionHash: rfqData.session_hash,
        name: rfqData.full_name || rfqData.name,
        email: rfqData.email,
        company: rfqData.company,
        items,
        status: rfqData.status,
        submittedAt: rfqData.submitted_at,
        createdAt: rfqData.created_at,
        updatedAt: rfqData.updated_at,
      };
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      console.error('Error fetching RFQ:', error);
      throw new AppError(500, 'RFQ_FETCH_ERROR', 'Failed to fetch RFQ', error.message);
    }
  }

  /**
   * Get all RFQs (for admin)
   */
  async getAllRfqs(page = 1, pageSize = 10) {
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, count, error } = await supabaseServiceClient
        .from('quote_requests')
        .select('*', { count: 'exact' })
        .range(from, to)
        .order('submitted_at', { ascending: false });

      if (error) throw error;

      const total = count || 0;
      const totalPages = Math.ceil(total / pageSize);

      return {
        items: data || [],
        total,
        page,
        pageSize,
        totalPages,
      };
    } catch (error: any) {
      console.error('Error fetching RFQs:', error);
      throw new AppError(500, 'RFQ_FETCH_ERROR', 'Failed to fetch RFQs', error.message);
    }
  }

  /**
   * Trigger CRM webhook integration
   */
  private async triggerCrmIntegration(rfqData: any, items: QuoteItem[]) {
    try {
      const crmWebhookUrl = process.env.CRM_WEBHOOK_URL;

      if (!crmWebhookUrl) {
        console.log('CRM webhook URL not configured, skipping CRM integration');
        return;
      }

      const payload = {
        id: rfqData.id,
        name: rfqData.full_name || rfqData.name,
        email: rfqData.email,
        company: rfqData.company,
        items: items.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          configuration: item.configuration,
        })),
        submittedAt: rfqData.submitted_at,
      };

      // Send to CRM (implement retry logic in production)
      console.log('Triggering CRM integration with payload:', payload);
      // await axios.post(crmWebhookUrl, payload, { headers: { 'Authorization': `Bearer ${process.env.CRM_API_KEY}` } });
    } catch (error: any) {
      console.error('Error triggering CRM integration:', error);
      // Don't throw - let RFQ submission succeed even if CRM fails
    }
  }

  /**
   * Log RFQ to Google Sheets (optional)
   */
  private async logToGoogleSheets(rfqData: any, items: QuoteItem[]) {
    try {
      const sheetsContext = this.getSheetsContext();

      if (!sheetsContext) {
        console.log('Google Sheets credentials not configured, skipping sheet logging');
        return;
      }

      await this.ensureSheetHeaders(sheetsContext);
      await this.appendRfqRowToSheet(sheetsContext, rfqData, items);

      console.log('Logged RFQ to Google Sheets:', { rfqId: rfqData.id, name: rfqData.full_name || rfqData.name });
    } catch (error: any) {
      console.error('Error logging to Google Sheets:', error);
      // Don't throw - let RFQ submission succeed even if logging fails
    }
  }

  private getSheetsContext() {
    const spreadsheetId = config.googleSheets.sheetsId;
    const serviceAccountEmail = config.googleSheets.serviceAccountEmail;
    const serviceAccountPrivateKey = config.googleSheets.serviceAccountPrivateKey;

    if (!spreadsheetId || !serviceAccountEmail || !serviceAccountPrivateKey) {
      return null;
    }

    const auth = new google.auth.JWT({
      email: serviceAccountEmail,
      key: serviceAccountPrivateKey.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    return {
      spreadsheetId,
      sheetName: config.googleSheets.sheetName || 'Sheet1',
      sheets: google.sheets({ version: 'v4', auth }),
    };
  }

  private async ensureSheetHeaders(ctx: { spreadsheetId: string; sheetName: string; sheets: any }) {
    const headerResponse = await ctx.sheets.spreadsheets.values.get({
      spreadsheetId: ctx.spreadsheetId,
      range: `${ctx.sheetName}!A1:J1`,
    });

    if (!headerResponse.data.values || headerResponse.data.values.length === 0) {
      await ctx.sheets.spreadsheets.values.update({
        spreadsheetId: ctx.spreadsheetId,
        range: `${ctx.sheetName}!A1:J1`,
        valueInputOption: 'RAW',
        requestBody: { values: [SHEET_HEADERS] },
      });
    }
  }

  private async appendRfqRowToSheet(
    ctx: { spreadsheetId: string; sheetName: string; sheets: any },
    rfqData: any,
    items: QuoteItem[]
  ) {
    const submittedAt = rfqData.submitted_at || rfqData.submittedAt || new Date().toISOString();
    // Build a human-friendly, multi-line summary for items
    const formatSpec = (spec?: string) => {
      if (!spec) return '';
      // normalize some known patterns
      return spec.replace(/Insertion Loss \(IL\):\s*/i, 'Insertion Loss: ').replace(/Standard Factory Specs/i, 'Standard factory specs (suitable for Gigabit Ethernet)');
    };

    // Ultra-simple summary: "Name (qty), Name (qty)"
    const itemsSummary = items
      .map((item) => `${item.productName || item.productId || 'Item'} (${item.quantity || 1})`)
      .join(', ');

    await ctx.sheets.spreadsheets.values.append({
      spreadsheetId: ctx.spreadsheetId,
      range: `${ctx.sheetName}!A:J`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [[
          submittedAt,
          rfqData.id,
          rfqData.session_hash || rfqData.sessionHash || '',
          rfqData.full_name || rfqData.name,
          rfqData.email,
          rfqData.company,
          rfqData.notes || '',
          String(items.length),
          itemsSummary,
          rfqData.status || 'submitted',
        ]],
      },
    });
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

export const rfqService = new RfqService();
