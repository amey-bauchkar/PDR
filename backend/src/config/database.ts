import { createClient } from '@supabase/supabase-js';
import { config } from './env.js';

const hasSupabaseConfig = Boolean(config.supabase.url && config.supabase.serviceRoleKey && config.supabase.anonKey);

function getValidServiceKey(url: string, serviceKey: string, anonKey: string): string {
  try {
    const parts = serviceKey.split('.');
    if (parts.length >= 2) {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
      const urlMatch = url.match(/https:\/\/([^.]+)\.supabase/);
      if (urlMatch && payload.ref === urlMatch[1]) {
        console.log('[Supabase] Service Role Key matches project ref. Using service role client.');
        return serviceKey;
      }
    }
  } catch (e) {
    // Fail silently
  }
  console.warn('[Supabase] Service Role Key is invalid or mismatching. falling back to Anon Key.');
  return anonKey;
}

// Initialize Supabase client. Fallback to anonKey to keep all backend admin operations active.
const serviceKeyToUse = hasSupabaseConfig 
  ? getValidServiceKey(config.supabase.url, config.supabase.serviceRoleKey, config.supabase.anonKey)
  : '';

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
