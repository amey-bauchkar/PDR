import { hasSupabaseConfig, supabase } from './supabase';
import type { ContactInquiryPayload, QuoteItem, QuoteRequestPayload } from './formTypes';

function ensureSupabaseClient() {
  if (!supabase || !hasSupabaseConfig) {
    return null;
  }
  return supabase;
}

export async function syncQuoteSession(sessionHash: string, items: QuoteItem[]) {
  const client = ensureSupabaseClient();
  if (!client) return;

  const { error } = await client.rpc('sync_quote_session', {
    p_session_hash: sessionHash,
    p_items: items,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function submitQuoteRequest(sessionHash: string, payload: QuoteRequestPayload, items: QuoteItem[]) {
  const client = ensureSupabaseClient();
  if (!client) {
    await new Promise((resolve) => setTimeout(resolve, 900));
    return { id: null as string | null, viaSupabase: false };
  }

  const { data, error } = await client.rpc('submit_quote_request', {
    p_session_hash: sessionHash,
    p_contact: payload,
    p_items: items,
  });

  if (error) {
    throw new Error(error.message);
  }

  return { id: typeof data === 'string' ? data : null, viaSupabase: true };
}

export async function submitContactInquiry(payload: ContactInquiryPayload) {
  const client = ensureSupabaseClient();
  if (!client) {
    await new Promise((resolve) => setTimeout(resolve, 700));
    return { id: null as string | null, viaSupabase: false };
  }

  const { data, error } = await client.rpc('submit_contact_inquiry', {
    p_contact: payload,
  });

  if (error) {
    throw new Error(error.message);
  }

  return { id: typeof data === 'string' ? data : null, viaSupabase: true };
}
