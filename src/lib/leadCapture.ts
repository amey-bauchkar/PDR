import { hasSupabaseConfig, supabase } from './supabase';
import type { ContactInquiryPayload, QuoteItem, QuoteRequestPayload } from './formTypes';

const CONTACT_API_URL = import.meta.env.VITE_CONTACT_API_URL || '/api/contact';
const RFQ_API_URL = import.meta.env.VITE_RFQ_API_URL || '/api/rfq/submit';
const LOCAL_CONTACT_STORAGE_KEY = 'pdrworld-pending-contact-inquiries';

function saveToLocalFallback(payload: ContactInquiryPayload) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(LOCAL_CONTACT_STORAGE_KEY);
    const pending = raw ? JSON.parse(raw) : [];
    if (Array.isArray(pending)) {
      pending.push(payload);
      localStorage.setItem(LOCAL_CONTACT_STORAGE_KEY, JSON.stringify(pending));
      window.dispatchEvent(new Event('local-storage-update'));
    }
  } catch (err) {
    console.warn('Failed to save contact inquiry to local storage', err);
  }
}

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

function saveRfqToLocalFallback(payload: QuoteRequestPayload, items: QuoteItem[]) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem('pdrworld-admin-rfqs-v1');
    const pending = raw ? JSON.parse(raw) : [];
    if (Array.isArray(pending)) {
      const newRfq = {
        id: `local-rfq-${Date.now()}`,
        email: payload.email,
        name: payload.name,
        company: payload.company,
        items: items.map(i => `${i.qty}x ${i.title} (${i.specs})`),
        status: 'new',
        createdAt: new Date().toISOString(),
        notes: payload.notes,
      };
      pending.unshift(newRfq);
      localStorage.setItem('pdrworld-admin-rfqs-v1', JSON.stringify(pending));
      window.dispatchEvent(new Event('local-storage-update'));
    }
  } catch (err) {
    console.warn('Failed to save RFQ to local storage', err);
  }
}

export async function submitQuoteRequest(sessionHash: string, payload: QuoteRequestPayload, items: QuoteItem[]) {
  const backendItems = items.map((item) => ({
    productId: item.title,
    productName: item.title,
    quantity: item.qty,
    configuration: {
      specs: item.specs,
      image: item.image,
    },
  }));

  if (typeof window !== 'undefined') {
    try {
      const response = await fetch(RFQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionHash,
          name: payload.name,
          email: payload.email,
          company: payload.company,
          notes: payload.notes,
          items: backendItems,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return { id: typeof data?.data?.id === 'string' ? data.data.id : null, viaSupabase: false };
      }
    } catch (error) {
      console.warn('Backend RFQ API unavailable, falling back to Supabase', error);
    }
  }

  const client = ensureSupabaseClient();
  if (!client) {
    await new Promise((resolve) => setTimeout(resolve, 900));
    saveRfqToLocalFallback(payload, items);
    return { id: `local-${Date.now()}` as string | null, viaSupabase: false };
  }

  try {
    const { data, error } = await client.rpc('submit_quote_request', {
      p_session_hash: sessionHash,
      p_contact: payload,
      p_items: items,
    });

    if (error) {
      console.warn('Supabase quote request failed:', error.message);
      saveRfqToLocalFallback(payload, items);
      return { id: `local-${Date.now()}` as string | null, viaSupabase: false };
    }

    return { id: typeof data === 'string' ? data : null, viaSupabase: true };
  } catch (err) {
    console.warn('Supabase quote request threw an error:', err);
    saveRfqToLocalFallback(payload, items);
    return { id: `local-${Date.now()}` as string | null, viaSupabase: false };
  }
}

export async function submitContactInquiry(payload: ContactInquiryPayload) {
  if (typeof window !== 'undefined') {
    try {
      const response = await fetch(CONTACT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        return { id: typeof data?.data?.id === 'string' ? data.data.id : null, viaSupabase: false };
      }
    } catch (error) {
      console.warn('Backend contact API unavailable, falling back to Supabase', error);
    }
  }

  const client = ensureSupabaseClient();
  if (!client) {
    saveToLocalFallback(payload);
    return { id: `local-${Date.now()}`, viaSupabase: false };
  }

  try {
    const { data, error } = await client.rpc('submit_contact_inquiry', {
      p_contact: payload,
    });

    if (error) {
      console.warn('Supabase contact submission failed, falling back to local storage:', error.message);
      saveToLocalFallback(payload);
      return { id: `local-${Date.now()}`, viaSupabase: false };
    }

    return { id: typeof data === 'string' ? data : null, viaSupabase: true };
  } catch (err) {
    console.warn('Supabase contact submission threw an error, falling back to local storage:', err);
    saveToLocalFallback(payload);
    return { id: `local-${Date.now()}`, viaSupabase: false };
  }
}
