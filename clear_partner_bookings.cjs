const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const profileIds = [
    'e1207ad6-391a-40f8-b352-fe68bd782b6d',
    '7f7a28a3-6392-425e-82d0-8d6bf72d6dbc'
  ];

  for (const id of profileIds) {
    // bookings where user rented from this partner
    const { data: assets } = await supabase.from('assets').select('id').eq('owner_id', id);
    const assetIds = assets.map(a => a.id);
    if (assetIds.length > 0) {
      const { data, error } = await supabase.from('bookings').delete().in('asset_id', assetIds);
      console.log(`Deleted bookings for partner ${id}`, data, error);
    }
  }
}

run();
