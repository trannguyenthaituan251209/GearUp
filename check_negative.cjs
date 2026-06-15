const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.from('assets').select('*').lt('price_per_day', 0);
  console.log('Negative assets count:', data ? data.length : 0);
  if (data && data.length > 0) {
    console.log(data);
  }
  if (error) console.error('Error:', error);
}

run();
