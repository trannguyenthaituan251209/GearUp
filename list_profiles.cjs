const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: profiles } = await supabase.from('profiles').select('*');
  console.log('Profiles:', profiles.map(p => ({ id: p.id, name: p.name })));
}

run();
