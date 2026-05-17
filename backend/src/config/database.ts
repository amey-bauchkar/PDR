import { createClient } from '@supabase/supabase-js';
import { config } from './env.js';

const hasSupabaseConfig = Boolean(config.supabase.url && config.supabase.serviceRoleKey && config.supabase.anonKey);

// Initialize Supabase client only when environment variables are available.
const supabaseServiceClient = hasSupabaseConfig
  ? createClient(config.supabase.url, config.supabase.serviceRoleKey, {
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
