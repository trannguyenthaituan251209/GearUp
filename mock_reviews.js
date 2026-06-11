import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const MOCK_USERS_COUNT = 15;
const NAMES = ['Minh Tuấn', 'Hoàng Oanh', 'Thu Hà', 'Đức Mạnh', 'Gia Hân', 'Bảo Khang', 'Lan Ngọc', 'Quang Vinh', 'Thanh Trúc', 'Tiến Đạt', 'Mai Phương', 'Công Lý', 'Diễm My', 'Trọng Tấn', 'Nhật Ánh'];
const AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
  'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
  'https://imgh.in/host/i0s5n9'
];
const COMMENTS = [
  'Thiết bị tuyệt vời, chất lượng ảnh chụp ra cực kỳ sắc nét!',
  'Dịch vụ cho thuê rất chuyên nghiệp, giao máy đúng giờ.',
  'Chủ shop nhiệt tình hướng dẫn, máy hoạt động hoàn hảo không lỗi lầm.',
  'Rất hài lòng. Lens nét căng, body máy còn rất mới.',
  'Giá cả hợp lý cho một thiết bị chất lượng như vậy.',
  'Mọi thứ đều tuyệt, nhưng pin hơi nhanh hết một chút.',
  'Quá đỉnh! Chắc chắn sẽ quay lại thuê lần sau.',
  'Thủ tục nhanh gọn, thiết bị đúng như mô tả.'
];

async function run() {
  console.log('--- STARTING SQL GENERATOR SCRIPT ---');
  
  // 1. Fetch Assets
  const { data: assets } = await supabase.from('assets').select('id, title, price_per_day');
  if (!assets || assets.length === 0) {
    console.log('No assets found to review.');
    return;
  }
  
  // 2. Fetch Users
  const { data: profiles } = await supabase.from('profiles').select('id');
  if (!profiles || profiles.length === 0) {
    console.log('No users found. Please create some users first.');
    return;
  }
  const mockUserIds = profiles.map(p => p.id);

  let sqlStatements = [];

  // 3. Create Bookings & Reviews for Assets
  for (const asset of assets) {
    // 2-5 reviews per asset
    const reviewCount = Math.floor(Math.random() * 4) + 2; 
    
    for (let i = 0; i < reviewCount; i++) {
      const randomUser = mockUserIds[Math.floor(Math.random() * mockUserIds.length)];
      
      // Create a completed booking via API since bookings table doesn't block inserts
      const bookingId = `bk-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
      
      const { error: bkErr } = await supabase.from('bookings').insert([{
        id: bookingId,
        asset_id: asset.id,
        asset_title: asset.title,
        status: 'returned',
        renter_id: randomUser,
        renter_name: 'Khách hàng',
        renter_contact: '0901234567',
        price_per_day: asset.price_per_day,
        total_price: asset.price_per_day * 2,
        start_date: new Date().toISOString(),
        end_date: new Date().toISOString()
      }]);
      
      if (!bkErr) {
        // Generate SQL for Review
        const service_rating = Math.floor(Math.random() * 2) + 4; // 4 or 5
        const equipment_rating = Math.floor(Math.random() * 2) + 4; // 4 or 5
        const avg = (service_rating + equipment_rating) / 2;
        const comment = COMMENTS[Math.floor(Math.random() * COMMENTS.length)];
        
        sqlStatements.push(`INSERT INTO public.reviews (asset_id, booking_id, user_id, service_rating, equipment_rating, average_rating, comment) VALUES ('${asset.id}', '${bookingId}', '${randomUser}', ${service_rating}, ${equipment_rating}, ${avg}, '${comment}');`);
      }
    }
  }

  // Write SQL to file
  fs.writeFileSync('seed_reviews.sql', sqlStatements.join('\n'));
  console.log(`--- GENERATED seed_reviews.sql with ${sqlStatements.length} reviews ---`);
}

run();
