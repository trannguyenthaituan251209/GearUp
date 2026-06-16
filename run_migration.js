import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.rpc('execute_sql', { sql: 'ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS contract_template TEXT;' });
  console.log('Error:', error);
  console.log('Data:', data);
}
run();
