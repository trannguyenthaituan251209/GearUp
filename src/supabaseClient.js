import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

// Detect if keys are valid (not empty and not default placeholders)
const isConfigured = 
  supabaseUrl.trim() !== '' && 
  supabaseAnonKey.trim() !== '' && 
  !supabaseUrl.includes('your-supabase-url') &&
  !supabaseAnonKey.includes('your-supabase-anon-key');

let supabaseInstance = null;

try {
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  console.log('[Supabase] Initializing real Supabase client.');
} catch (err) {
  console.error('[Supabase] Error initializing client:', err);
}

if (!supabaseInstance) {
  throw new Error('[Supabase] CRITICAL: Real Supabase client failed to initialize. Please check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY / VITE_SUPABASE_PUBLISHABLE_KEY variables.');
}

export const supabase = supabaseInstance;
