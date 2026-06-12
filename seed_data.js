import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ootioknguqaombfzbpvf.supabase.co';
const supabaseKey = 'sb_publishable_ttTjkFygkuTwwInl3vYAdQ_XVCrDW8a';
const supabase = createClient(supabaseUrl, supabaseKey);

const assets = [
  {
    id: `asset-${Date.now()}-1`,
    title: 'Sony A7IV Body Only - Likenew',
    category: 'Máy ảnh',
    price_per_day: 350000,
    image_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80',
    owner_name: 'Minh Tuấn Camera',
    owner_id: 'seed-owner-1',
    location: 'Quận 1, TP.HCM',
    description: 'Máy ảnh Sony A7IV ngoại hình đẹp, cảm biến sạch, hoạt động hoàn hảo. Kèm 2 pin và sạc đôi.',
    specs: ['33MP Full-Frame', '4K 60p Video', 'Real-time Eye AF']
  },
  {
    id: `asset-${Date.now()}-2`,
    title: 'Lens Canon EF 70-200mm f/2.8L IS III USM',
    category: 'Ống kính',
    price_per_day: 250000,
    image_url: 'https://images.unsplash.com/photo-1616423640778-28d1b53229bd?auto=format&fit=crop&q=80',
    owner_name: 'Hải Nguyễn',
    owner_id: 'seed-owner-2',
    location: 'Quận Đống Đa, Hà Nội',
    description: 'Ống kính tele đa dụng, chống rung tốt, kính trong không mốc rễ.',
    specs: ['Tiêu cự 70-200mm', 'Khẩu độ f/2.8', 'Chống rung quang học']
  },
  {
    id: `asset-${Date.now()}-3`,
    title: 'Gimbal DJI RS 3 Pro',
    category: 'Phụ kiện',
    price_per_day: 400000,
    image_url: 'https://images.unsplash.com/photo-1533095368305-6454d6b63d91?auto=format&fit=crop&q=80',
    owner_name: 'Studio 24h',
    owner_id: 'seed-owner-3',
    location: 'Quận Bình Thạnh, TP.HCM',
    description: 'Gimbal chịu tải tốt cho các dòng máy quay nặng, pin dùng liên tục 12h.',
    specs: ['Tải trọng 4.5kg', 'Màn hình OLED 1.8"', 'LiDAR Focusing']
  },
  {
    id: `asset-${Date.now()}-4`,
    title: 'Đèn Godox AD600Pro Kèm Softbox',
    category: 'Ánh sáng',
    price_per_day: 300000,
    image_url: 'https://images.unsplash.com/photo-1588691511221-512c77f0a9db?auto=format&fit=crop&q=80',
    owner_name: 'Nam Lighting',
    owner_id: 'seed-owner-4',
    location: 'Quận 3, TP.HCM',
    description: 'Đèn công suất lớn phù hợp chụp ngoại cảnh và studio, tốc độ hồi pin cực nhanh.',
    specs: ['Công suất 600Ws', 'Hồi pin 0.01-0.9s', 'Nhiệt độ màu 5600K']
  },
  {
    id: `asset-${Date.now()}-5`,
    title: 'Drone DJI Mavic 3 Cine Premium Combo',
    category: 'Flycam',
    price_per_day: 1500000,
    image_url: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80',
    owner_name: 'Flycam Sài Gòn',
    owner_id: 'seed-owner-5',
    location: 'TP Thủ Đức, TP.HCM',
    description: 'Bao gồm 3 pin, sạc nhanh, thẻ nhớ 1TB SSD. Quay phim 5.1K Apple ProRes.',
    specs: ['Hasselblad Camera', '5.1K Video', 'Bay 46 phút']
  }
];

const notifications = [
  {
    user_id: 'all',
    title: '🎉 Ưu đãi cuối tuần cực sốc!',
    message: 'Giảm 15% cho tất cả các thiết bị máy ảnh Sony. Nhanh tay đặt lịch ngay!',
    type: 'promotion'
  },
  {
    user_id: 'all',
    title: '🔔 Cảnh báo thời tiết xấu',
    message: 'Khu vực TP.HCM đang có mưa lớn, vui lòng bảo quản kỹ thiết bị khi đi quay chụp ngoài trời.',
    type: 'system'
  },
  {
    user_id: 'all',
    title: '🚀 Tính năng mới: Đánh giá người cho thuê',
    message: 'Từ hôm nay, bạn có thể xem điểm đánh giá và nhận xét chi tiết trước khi quyết định thuê thiết bị.',
    type: 'system'
  },
  {
    user_id: 'all',
    title: '📸 Workshop Nhiếp Ảnh Chân Dung',
    message: 'Đăng ký tham gia sự kiện chia sẻ kinh nghiệm chụp chân dung vào cuối tuần này hoàn toàn miễn phí.',
    type: 'promotion'
  },
  {
    user_id: 'all',
    title: '✨ 5 Thiết bị Hot nhất tháng',
    message: 'Cùng GearUp điểm mặt 5 món đồ nghề được cộng đồng thuê nhiều nhất tháng vừa qua.',
    type: 'system'
  }
];

async function seed() {
  console.log('Seeding assets...');
  for (const asset of assets) {
    const { error } = await supabase.from('assets').insert([asset]);
    if (error) console.error('Error inserting asset:', asset.title, error.message);
    else console.log('Inserted asset:', asset.title);
  }

  console.log('Seeding notifications...');
  for (const notif of notifications) {
    const { error } = await supabase.from('notifications').insert([notif]);
    if (error) console.error('Error inserting notification:', notif.title, error.message);
    else console.log('Inserted notification:', notif.title);
  }

  console.log('Done!');
}

seed();
