import { ContactInquiryPayload } from '../types/index.js';
export declare class ContactService {
    submitContactInquiry(payload: ContactInquiryPayload): Promise<{
        id: any;
        createdAt: any;
    }>;
}
export declare const contactService: ContactService;
//# sourceMappingURL=contactService.d.ts.map