import { QuoteRequest, QuoteItem } from '../types/index.js';
export declare class RfqService {
    /**
     * Submit an RFQ (Request for Quotation)
     */
    submitRfq(sessionHash: string, name: string, email: string, company: string, notes: string | undefined, items: QuoteItem[]): Promise<QuoteRequest>;
    /**
     * Get RFQ by ID
     */
    getRfq(rfqId: string): Promise<QuoteRequest>;
    /**
     * Get all RFQs (for admin)
     */
    getAllRfqs(page?: number, pageSize?: number): Promise<{
        items: any[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    /**
     * Get RFQs in the shape expected by the Vite admin panel.
     */
    getAdminRfqList(): Promise<{
        createdAt: any;
        id: any;
        sessionHash: any;
        name: any;
        email: any;
        company: any;
        notes: any;
        itemCount: any;
        items: string[];
        status: any;
    }[]>;
    /**
     * Trigger CRM webhook integration
     */
    private triggerCrmIntegration;
    /**
     * Log RFQ to Google Sheets (optional)
     */
    logToGoogleSheets(rfqData: any, items: QuoteItem[]): Promise<boolean>;
    private getSheetsContext;
    private ensureSheetHeaders;
    private appendRfqRowToSheet;
    /**
     * Validate email format
     */
    private isValidEmail;
}
export declare const rfqService: RfqService;
//# sourceMappingURL=rfqService.d.ts.map