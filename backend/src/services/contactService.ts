import { supabaseServiceClient as rawSupabaseServiceClient } from '../config/database.js';
const supabaseServiceClient = rawSupabaseServiceClient!;
import { AppError, ContactInquiryPayload } from '../types/index.js';

export class ContactService {
  async submitContactInquiry(payload: ContactInquiryPayload) {
    const firstName = payload.firstName.trim();
    const lastName = payload.lastName.trim();
    const email = payload.email.trim();
    const phone = payload.phone.trim();
    const company = payload.company.trim();
    const inquiryType = payload.inquiryType.trim();
    const message = payload.message.trim();

    if (!firstName || !lastName || !email || !phone || !company || !inquiryType) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Missing required contact fields');
    }

    if (!supabaseServiceClient) {
      return {
        id: `local-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
    }

    const { data, error } = await supabaseServiceClient
      .from('contact_inquiries')
      .insert({
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        company,
        inquiry_type: inquiryType,
        message,
      })
      .select('id, created_at')
      .single();

    if (error || !data) {
      throw new AppError(500, 'CONTACT_SUBMISSION_ERROR', 'Failed to submit contact inquiry');
    }

    return {
      id: data.id,
      createdAt: data.created_at,
    };
  }
}

export const contactService = new ContactService();