import { createClient, SupabaseClient } from '@supabase/supabase-js';
import config from '../config/config';

// Create a Supabase client with the service role key for internal API access
export const supabaseAdmin = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
  {
    auth: {
      persistSession: false,
    },
  }
);

// Create a client based on the user's JWT token
export const createClientFromToken = (token: string): SupabaseClient => {
  return createClient(config.supabase.url, config.supabase.anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
};
