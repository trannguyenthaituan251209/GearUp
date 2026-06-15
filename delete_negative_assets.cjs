const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.from('assets').delete().lt('price_per_day', 0);
  console.log('Deleted assets:', data);
  if (error) console.error('Error:', error);
}

run();
