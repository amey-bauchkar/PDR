import { createClient } from '@supabase/supabase-js';
import { config } from './env.js';

const hasSupabaseConfig = Boolean(config.supabase.url && config.supabase.serviceRoleKey && config.supabase.anonKey);

export function cleanKey(key?: string): string {
  if (!key) return '';
  let cleaned = String(key).trim();
  // Strip all leading/trailing single, double, or escaped quotes
  cleaned = cleaned.replace(/^["'\\]+|["'\\]+$/g, '').trim();
  return cleaned;
}

// Initialize Supabase client. We MUST use the service role key to bypass RLS for admin operations.
// Do not fallback to anonKey, as that will cause confusing RLS errors if the service key is malformed.
const serviceKeyToUse = hasSupabaseConfig ? cleanKey(config.supabase.serviceRoleKey) : '';

const supabaseServiceClient = hasSupabaseConfig
  ? createClient(config.supabase.url, serviceKeyToUse, {
      auth: {
        persistSession: false,
        detectSessionInUrl: false,
      },
    })
  : null;

// Initialize Supabase client only when environment variables are available.
const supabaseAnonClient = hasSupabaseConfig
  ? createClient(config.supabase.url, config.supabase.anonKey, {
      auth: {
        persistSession: false,
        detectSessionInUrl: false,
      },
    })
  : null;

export { supabaseServiceClient, supabaseAnonClient };
