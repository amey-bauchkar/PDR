import { supabaseServiceClient } from '../config/database.js';
import { QuoteRequest, QuoteItem } from '../types/index.js';
import { AppError } from '../types/index.js';
import { v4 as uuidv4 } from 'uuid';

export class RfqService {
  /**
   * Submit an RFQ (Request for Quotation)
   */
  async submitRfq(
    sessionHash: string,
    name: string,
    email: string,
    company: string,
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

      // Store RFQ in database
      const { data: rfqData, error: rfqError } = await supabaseServiceClient
        .from('quote_requests')
        .insert([
          {
            id: rfqId,
            session_hash: sessionHash,
            name,
            email,
            company,
            status: 'submitted',
            submitted_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (rfqError || !rfqData) {
        throw new AppError(500, 'RFQ_INSERT_ERROR', 'Failed to create RFQ');
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
        throw new AppError(500, 'ITEMS_INSERT_ERROR', 'Failed to store RFQ items');
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
        name: rfqData.name,
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
        name: rfqData.name,
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
      const sheetsId = process.env.GOOGLE_SHEETS_ID;

      if (!sheetsId) {
        console.log('Google Sheets ID not configured, skipping sheet logging');
        return;
      }

      console.log('Logging to Google Sheets:', { rfqId: rfqData.id, name: rfqData.name });
      // Implement Google Sheets logging in production
    } catch (error: any) {
      console.error('Error logging to Google Sheets:', error);
      // Don't throw - let RFQ submission succeed even if logging fails
    }
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
