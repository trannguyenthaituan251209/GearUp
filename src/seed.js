import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// 1. Parse .env to get Supabase credentials
const envPath = path.resolve(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.error('[Seed Error] .env file not found!');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.substring(1, value.length - 1);
    }
    env[key] = value.trim();
  }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[Seed Error] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing in .env');
  process.exit(1);
}

console.log('[Seed] Connecting to Supabase:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

// 2. Load Direct Image Links
const linksPath = path.resolve(process.cwd(), 'public/device_image_direct_link.txt');
if (!fs.existsSync(linksPath)) {
  console.error('[Seed Error] device_image_direct_link.txt not found at:', linksPath);
  process.exit(1);
}

const linksContent = fs.readFileSync(linksPath, 'utf-8');
const linkMap = {};
linksContent.split('\n').forEach(line => {
  if (!line.trim()) return;
  const parts = line.split(' - ');
  if (parts.length === 2) {
    const filename = parts[0].trim();
    const url = parts[1].trim();
    linkMap[filename] = url;
  }
});

console.log(`[Seed] Loaded ${Object.keys(linkMap).length} direct image links.`);

// 3. Define Demo Stores (Partners)
const demoPartners = [
  {
    email: 'phongcamera@gearup.vn',
    name: 'Hoàng Phong',
    phone: '0987654321',
    studioName: 'Hoàng Phong Camera',
    location: 'Hà Nội'
  },
  {
    email: 'songhanmedia@gearup.vn',
    name: 'Lê Hoàng Hải',
    phone: '0977654321',
    studioName: 'Sông Hàn Media & Rental',
    location: 'Đà Nẵng'
  },
  {
    email: 'saigonlens@gearup.vn',
    name: 'Nguyễn Minh Quân',
    phone: '0967654321',
    studioName: 'Sài Gòn Lens & Studio',
    location: 'TP. Hồ Chí Minh'
  },
  {
    email: 'mekongfilm@gearup.vn',
    name: 'Phạm Thế Vinh',
    phone: '0957654321',
    studioName: 'Mekong Film Equipment',
    location: 'Cần Thơ'
  },
  {
    email: 'taybaclens@gearup.vn',
    name: 'Giàng A Pháo',
    phone: '0947654321',
    studioName: 'Tây Bắc Lens & Accessories',
    location: 'Lào Cai'
  }
];

// 4. Define 39 Devices
const devicesMeta = [
  {
    fileKey: 'Fujifilm XH2S.jpg',
    title: 'Máy ảnh Fujifilm X-H2S Body',
    category: 'fuji_cam',
    pricePerDay: 450000,
    specs: ['26.1MP Stacked CMOS', 'Chụp liên tiếp 40 hình/s', 'Quay phim 6.2K 30p', 'Chống rung IBIS 7 stops'],
    description: 'Fujifilm X-H2S là dòng máy ảnh Hybrid hiệu suất cao với cảm biến Stacked CMOS thế hệ mới, đáp ứng hoàn hảo nhu cầu quay phim và chụp ảnh thể thao tốc độ cao.'
  },
  {
    fileKey: 'Fujifilm X-S20.jpg',
    title: 'Máy ảnh Fujifilm X-S20 Body',
    category: 'fuji_cam',
    pricePerDay: 350000,
    specs: ['26.1MP X-Trans IV', 'Quay phim 6.2K 30p', 'Chống rung IBIS 7 stops', 'Giả lập màu phim Nostalgic Neg'],
    description: 'Chiếc máy ảnh đa dụng hoàn hảo cho các vloggers và người sáng tạo nội dung du lịch nhờ thiết kế nhỏ gọn, pin trâu và chống rung vượt trội.'
  },
  {
    fileKey: 'Fujifilm XT1.jpg',
    title: 'Máy ảnh Fujifilm X-T1 Classic',
    category: 'fuji_cam',
    pricePerDay: 150000,
    specs: ['16.3MP X-Trans II', 'Kính ngắm EVF OLED', 'Khung vỏ hợp kim magie', 'Kháng thời tiết'],
    description: 'Chiếc máy ảnh huyền thoại đặt nền móng cho dòng X-T, mang thiết kế hoài cổ đậm chất cơ học cùng màu sắc mô phỏng phim đặc trưng.'
  },
  {
    fileKey: 'Fujifilm XT3.jpg',
    title: 'Máy ảnh Fujifilm X-T3 Pro',
    category: 'fuji_cam',
    pricePerDay: 250000,
    specs: ['26.1MP X-Trans IV', 'Quay phim 4K 60fps 10-bit', 'Lấy nét 425 điểm AF', 'Màn hình lật 3 chiều'],
    description: 'Lựa chọn tuyệt vời cho các thợ chụp ảnh sự kiện và quay phim bán chuyên với độ nét cao, dải động rộng và màu sắc trung thực.'
  },
  {
    fileKey: 'Fujifilm XT4.jpg',
    title: 'Máy ảnh Fujifilm X-T4 Body',
    category: 'fuji_cam',
    pricePerDay: 300000,
    specs: ['26.1MP X-Trans IV', 'Chống rung IBIS 6.5 stops', 'Quay phim Full HD 240p', 'Màn hình xoay lật đa góc'],
    description: 'Nâng cấp mạnh mẽ với chống rung trong thân máy, màn hình xoay lật tiện lợi cùng giả lập màu phim ETERNA Bleach Bypass độc đáo.'
  },
  {
    fileKey: 'Fujifilm XT10.jpg',
    title: 'Máy ảnh Fujifilm X-T10 Retro',
    category: 'fuji_cam',
    pricePerDay: 120000,
    specs: ['16.3MP APS-C', 'Đèn flash tích hợp', 'Giả lập màu Classic Chrome', 'Trọng lượng chỉ 381g'],
    description: 'Nhỏ gọn, thời trang và dễ sử dụng. Phù hợp cho những ai muốn trải nghiệm màu phim Fujifilm mà không cần đầu tư quá nhiều.'
  },
  {
    fileKey: 'Fujifilm XT-20.jpg',
    title: 'Máy ảnh Fujifilm X-T20 Body',
    category: 'fuji_cam',
    pricePerDay: 180000,
    specs: ['24.3MP X-Trans III', 'Quay phim 4K 30p', 'Màn hình cảm ứng lật', 'Bộ xử lý X-Processor Pro'],
    description: 'Sở hữu cảm biến cao cấp của X-T2 trong một thân máy nhỏ gọn hơn. Cho ảnh cực kỳ sắc nét và giả lập màu phim Acros đen trắng nghệ thuật.'
  },
  {
    fileKey: 'Fujifilm XT50.jpg',
    title: 'Máy ảnh Fujifilm X-T50 Body',
    category: 'fuji_cam',
    pricePerDay: 380000,
    specs: ['40.2MP X-Trans V HR', 'Vòng xoay giả lập màu phim chuyên biệt', 'Chống rung IBIS 7 stops', 'Bộ xử lý X-Processor 5'],
    description: 'Chiếc máy ảnh thế hệ mới nhất sở hữu cảm biến siêu phân giải 40.2MP cùng vòng xoay chọn giả lập màu phim cực kỳ tiện lợi trên thân máy.'
  },
  {
    fileKey: 'Len Sony FE 100-400mm f4.5-f5.6 GM OSS.jpg',
    title: 'Ống kính Sony FE 100-400mm f4.5-f5.6 GM OSS',
    category: 'sony_lens',
    pricePerDay: 480000,
    specs: ['Dòng G Master cao cấp', 'Chống rung SteadyShot', 'Mô-tơ lấy nét DDSSM', 'Kháng bụi & thời tiết'],
    description: 'Ống kính zoom siêu tele chất lượng vượt trội của Sony, lý tưởng cho chụp ảnh thể thao, động vật hoang dã và sự kiện ngoài trời.'
  },
  {
    fileKey: 'Lens Canon 11-24mm f4.jpg',
    title: 'Ống kính Canon EF 11-24mm f/4L USM',
    category: 'canon_lens',
    pricePerDay: 350000,
    specs: ['Góc siêu rộng 11mm', 'Dòng L chuyên nghiệp', 'Lớp phủ ASC & SWC chống lóa', 'Thấu kính Super UD'],
    description: 'Ống kính zoom góc siêu rộng đỉnh cao của Canon, mang lại hình ảnh sắc nét từ tâm ra rìa, không bị méo góc, phù hợp cho kiến trúc và phong cảnh.'
  },
  {
    fileKey: 'Lens Canon EF 50mm f1.2L DSLR.jpg',
    title: 'Ống kính Canon EF 50mm f/1.2L USM',
    category: 'canon_lens',
    pricePerDay: 200000,
    specs: ['Khẩu độ lớn f/1.2', 'Thấu kính phi cầu cỡ lớn', 'Mô-tơ lấy nét USM nhanh', 'Dòng L viền đỏ huyền thoại'],
    description: 'Huyền thoại chân dung với khả năng xóa phông mịt mù, bokeh lung linh tròn trịa và hiệu suất chụp thiếu sáng đỉnh cao.'
  },
  {
    fileKey: 'Lens Canon EF 200mm f2.8L USM.jpg',
    title: 'Ống kính Canon EF 200mm f/2.8L II USM',
    category: 'canon_lens',
    pricePerDay: 180000,
    specs: ['Tiêu cự cố định 200mm', 'Khẩu độ f/2.8', 'Hệ thống lấy nét phía sau', 'Hai thấu kính UD'],
    description: 'Ống kính tele một tiêu cự cho độ nét cực cao và màu sắc chuẩn xác, chuyên trị chân dung ngoài trời xa và thể thao trong nhà.'
  },
  {
    fileKey: 'Lens Canon EF-S 10-18mm.jpg',
    title: 'Ống kính Canon EF-S 10-18mm f/4.5-5.6 IS STM',
    category: 'canon_lens',
    pricePerDay: 100000,
    specs: ['Góc rộng cho APS-C', 'Chống rung quang học IS', 'Động cơ bước STM êm ái', 'Thiết kế siêu gọn nhẹ'],
    description: 'Ống kính góc rộng quốc dân dành cho các dòng máy crop của Canon, thích hợp quay vlog, chụp phong cảnh du lịch với chi phí tiết kiệm.'
  },
  {
    fileKey: 'Lens Canon FE 24-70mm f2.8L II USM.jpg',
    title: 'Ống kính Canon EF 24-70mm f/2.8L II USM',
    category: 'canon_lens',
    pricePerDay: 280000,
    specs: ['Khẩu độ cố định f/2.8', 'Thấu kính Super UD', 'Chống chịu thời tiết cao', 'Lớp phủ Fluorine'],
    description: 'Ống kính zoom tiêu chuẩn đa dụng được các nhiếp ảnh gia dịch vụ tin dùng nhất nhờ dải tiêu cự vàng và chất lượng quang học đỉnh cấp.'
  },
  {
    fileKey: 'Lens Nikon af-s DX nIKKOR 16-85MM F3.5-F5.6 G ED.jpg',
    title: 'Ống kính Nikon AF-S DX 16-85mm f/3.5-5.6G ED VR',
    category: 'nikon_lens',
    pricePerDay: 120000,
    specs: ['Dải zoom đa dụng 5.3x', 'Chống rung VR II', 'Động cơ sóng siêu âm SWM', 'Thấu kính ED'],
    description: 'Ống kính zoom du lịch hoàn hảo cho hệ máy DX của Nikon, đáp ứng từ chụp phong cảnh góc rộng đến chân dung tele tầm trung.'
  },
  {
    fileKey: 'Lens Nikon Z 800mm f6.3.jpg',
    title: 'Ống kính Nikon Z 800mm f/6.3 VR S-Line',
    category: 'nikon_lens',
    pricePerDay: 650000,
    specs: ['Siêu tele 800mm', 'Dòng S-Line cao cấp', 'Thấu kính PF (Phase Fresnel) nhẹ', 'Chống rung VR tích hợp'],
    description: 'Kỳ quan công nghệ của Nikon mang lại dải tiêu cự siêu tele 800mm trong một thân hình cực kỳ nhẹ nhờ thấu kính PF độc quyền.'
  },
  {
    fileKey: 'Lens Sigma 30mm f 1.4.jpg',
    title: 'Ống kính Sigma 30mm f/1.4 DC DN Contemporary',
    category: 'sigma_lens',
    pricePerDay: 120000,
    specs: ['Khẩu độ siêu lớn f/1.4', 'Tiêu cự chuẩn 45mm (APS-C)', 'Động cơ bước lấy nét nhanh', 'Bokeh mịn màng'],
    description: 'Ống kính một tiêu cự khẩu độ lớn xuất sắc từ Sigma dành cho máy ảnh không gương lật crop, xóa phông xuất sắc trong tầm giá.'
  },
  {
    fileKey: 'Lens Sony 24-50mm F2.8 G.jpg',
    title: 'Ống kính Sony FE 24-50mm f/2.8 G',
    category: 'sony_lens',
    pricePerDay: 220000,
    specs: ['Khẩu độ cố định f/2.8', 'Trọng lượng siêu nhẹ 440g', 'Dòng G chất lượng cao', 'Mô-tơ lấy nét tuyến tính kép'],
    description: 'Ống kính zoom F2.8 thế hệ mới của Sony, cực kỳ gọn nhẹ cho các chuyến hành trình nhưng vẫn đảm bảo độ nét và bokeh đỉnh cao.'
  },
  {
    fileKey: 'Lens Sony 150mm E-Mount.jpg',
    title: 'Ống kính Sony E 150mm f/2.8 Telephoto',
    category: 'sony_lens',
    pricePerDay: 190000,
    specs: ['Tiêu cự tele 150mm', 'Khẩu độ f/2.8', 'Thiết kế tối ưu cho E-mount', 'Lấy nét êm ái'],
    description: 'Ống kính chuyên biệt cho chụp chân dung cận cảnh và các sự kiện tầm xa vừa phải, mang lại độ sắc nét cao và hiệu ứng bokeh tuyệt đẹp.'
  },
  {
    fileKey: 'Lens Sony FE 12-24mm f4.jpg',
    title: 'Ống kính Sony FE 12-24mm f/4 G',
    category: 'sony_lens',
    pricePerDay: 250000,
    specs: ['Góc siêu rộng 12-24mm', 'Khẩu độ cố định f/4', 'Lớp phủ Nano AR', 'Lấy nét Direct Drive SSM'],
    description: 'Góc nhìn siêu rộng ấn tượng, không méo hình, rất thích hợp cho chụp kiến trúc nội thất, phong cảnh và quay vlog sáng tạo.'
  },
  {
    fileKey: 'Lens Tamron 17-28mm f2.8.jpg',
    title: 'Ống kính Tamron 17-28mm f/2.8 Di III RXD',
    category: 'tamron_lens',
    pricePerDay: 160000,
    specs: ['Khẩu độ f/2.8 toàn dải', 'Mô-tơ bước RXD siêu êm', 'Trọng lượng chỉ 420g', 'Kính lọc phi 67mm'],
    description: 'Ống kính zoom góc rộng khẩu lớn cực kỳ nhỏ gọn dành cho hệ máy Full-Frame Sony E, mang lại độ nét tốt và lấy nét êm ái khi quay phim.'
  },
  {
    fileKey: 'Lens Tamron 28-75mm f2.8.jpg',
    title: 'Ống kính Tamron 28-75mm f/2.8 Di III VXD G2',
    category: 'tamron_lens',
    pricePerDay: 180000,
    specs: ['Khẩu độ f/2.8 cố định', 'Động cơ tuyến tính VXD', 'Khoảng lấy nét gần 18cm', 'Thiết kế kháng ẩm'],
    description: 'Thế hệ thứ hai cải tiến vượt trội về thiết kế và độ sắc nét trên toàn dải tiêu cự. Sự lựa chọn hoàn hảo cho nhiếp ảnh gia đa dụng.'
  },
  {
    fileKey: 'Nikon D90.jpg',
    title: 'Máy ảnh Nikon D90 Legend',
    category: 'nikon_cam',
    pricePerDay: 100000,
    specs: ['12.3MP CMOS DX', 'Quay phim HD đầu tiên', 'Màn hình phụ LCD phía trên', 'Thời lượng pin cực bền'],
    description: 'Huyền thoại DSLR của Nikon nổi tiếng với chất lượng ảnh trong trẻo, thao tác cơ học trực quan và độ bền bỉ qua năm tháng.'
  },
  {
    fileKey: 'Nikon D3300.jpg',
    title: 'Máy ảnh Nikon D3300 Kit',
    category: 'nikon_cam',
    pricePerDay: 110000,
    specs: ['24.2MP không lọc OLPF', 'Bộ xử lý EXPEED 4', 'Chụp liên tục 5 fps', 'Trọng lượng nhẹ'],
    description: 'Chiếc DSLR nhỏ gọn cho chất ảnh sắc nét vượt trội nhờ loại bỏ bộ lọc răng cưa OLPF, rất phù hợp cho người mới bắt đầu học nhiếp ảnh.'
  },
  {
    fileKey: 'Nikon D3500.jpg',
    title: 'Máy ảnh Nikon D3500 Kit',
    category: 'nikon_cam',
    pricePerDay: 130000,
    specs: ['24.2MP APS-C', 'Pin chụp 1550 tấm/sạc', 'Chế độ Guide Mode trực quan', 'SnapBridge'],
    description: 'Chiếc máy ảnh quốc dân cho du lịch nhờ pin cực trâu và thao tác hướng dẫn trực quan ngay trên màn hình.'
  },
  {
    fileKey: 'Nikon D5100.jpg',
    title: 'Máy ảnh Nikon D5100 Body',
    category: 'nikon_cam',
    pricePerDay: 110000,
    specs: ['16.2MP CMOS', 'Màn hình xoay lật cảm ứng', 'Quay phim Full HD 1080p', 'Chế độ Effects'],
    description: 'Trang bị màn hình xoay lật linh hoạt đầu tiên của dòng Nikon D5000, lý tưởng để chụp các góc khó và tự quay video.'
  },
  {
    fileKey: 'Nikon D5300.jpg',
    title: 'Máy ảnh Nikon D5300 Wifi',
    category: 'nikon_cam',
    pricePerDay: 140000,
    specs: ['24.2MP không OLPF', 'Tích hợp Wifi và GPS', 'Hệ thống lấy nét 39 điểm AF', 'Quay phim 1080/60p'],
    description: 'Nâng cấp toàn diện với kết nối Wifi chia sẻ ảnh nhanh và GPS lưu trữ địa điểm ảnh trực tiếp, độ sắc nét cao.'
  },
  {
    fileKey: 'Nikon D7200.jpg',
    title: 'Máy ảnh Nikon D7200 Body',
    category: 'nikon_cam',
    pricePerDay: 220000,
    specs: ['24.2MP DX', 'Hệ thống lấy nét 51 điểm AF', 'Vỏ hợp kim chống chịu thời tiết', '2 khe cắm thẻ nhớ SD'],
    description: 'Máy ảnh bán chuyên semi-pro bền bỉ, lấy nét cực nhanh và nhạy trong bóng tối, được các tay máy chụp sự kiện tin dùng.'
  },
  {
    fileKey: 'Nikon Z FC.jpg',
    title: 'Máy ảnh Nikon Z fc Retro',
    category: 'nikon_cam',
    pricePerDay: 300000,
    specs: ['Phong cách hoài cổ retro', '20.9MP DX CMOS', 'Quay phim 4K không crop', 'Màn hình cảm ứng lật xoay'],
    description: 'Kiệt tác thiết kế lấy cảm hứng từ chiếc máy phim Nikon FM2 huyền thoại, kết hợp hoàn hảo cùng công nghệ mirrorless hiện đại.'
  },
  {
    fileKey: 'Olympus-OM-D.jpg',
    title: 'Máy ảnh Olympus OM-D E-M10 Mark IV',
    category: 'olympus_cam',
    pricePerDay: 230000,
    specs: ['20MP Micro Four Thirds', 'Chống rung 5 trục trong thân máy', 'Thiết kế siêu nhỏ gọn', 'Màn hình gập 180 độ'],
    description: 'Thiết kế hoài cổ sang trọng với hệ thống chống rung 5 trục cực mạnh, cho phép chụp ảnh sắc nét bằng tay trong điều kiện thiếu sáng.'
  },
  {
    fileKey: 'Canon EOS 6D Mark II.jpg',
    title: 'Máy ảnh Canon EOS 6D Mark II',
    category: 'canon_cam',
    pricePerDay: 400000,
    specs: ['26.2MP Full-Frame', 'Lấy nét 45 điểm chữ thập', 'Dual Pixel CMOS AF', 'Màn hình cảm ứng xoay lật'],
    description: 'Chiếc DSLR Full-Frame đa dụng tuyệt vời của Canon, cho màu sắc da người hồng hào đặc trưng và dải dynamic range tốt.'
  },
  {
    fileKey: 'Canon EOS 60D.jpg',
    title: 'Máy ảnh Canon EOS 60D',
    category: 'canon_cam',
    pricePerDay: 130000,
    specs: ['18MP APS-C', 'Màn hình xoay lật LCD', 'Chụp liên tiếp 5.3 fps', 'Thân máy thiết kế công thái học'],
    description: 'Dòng máy hai số bền bỉ của Canon, mang lại cảm giác cầm nắm chắc chắn, pin trâu và màn hình xoay lật linh hoạt.'
  },
  {
    fileKey: 'Canon EOS 77D.jpg',
    title: 'Máy ảnh Canon EOS 77D',
    category: 'canon_cam',
    pricePerDay: 200000,
    specs: ['24.2MP CMOS', 'Bộ xử lý hình ảnh DIGIC 7', 'Lấy nét Dual Pixel nhanh 0.03s', 'Màn hình phụ phía trên'],
    description: 'Chiếc máy ảnh bán chuyên trung hòa giữa sự gọn nhẹ và các nút tinh chỉnh chuyên nghiệp cùng màn hình phụ hiển thị thông số.'
  },
  {
    fileKey: 'Canon EOS 650D.jpg',
    title: 'Máy ảnh Canon EOS 650D',
    category: 'canon_cam',
    pricePerDay: 120000,
    specs: ['18MP Hybrid CMOS', 'Màn hình cảm ứng mượt mà', 'Lấy nét 9 điểm chữ thập', 'Quay phim tự động bám nét'],
    description: 'Chiếc máy ảnh mở đầu kỷ nguyên màn hình cảm ứng điện dung mượt mà của dòng Rebel, vô cùng thân thiện và dễ làm quen.'
  },
  {
    fileKey: 'Canon EOS 2000D.jpg',
    title: 'Máy ảnh Canon EOS 2000D',
    category: 'canon_cam',
    pricePerDay: 110000,
    specs: ['24.1MP APS-C', 'Kết nối Wi-Fi/NFC', 'Bộ xử lý DIGIC 4+', 'Chế độ Auto thông minh'],
    description: 'Lựa chọn lý tưởng cho người mới bắt đầu bước vào thế giới nhiếp ảnh với khả năng vận hành đơn giản và kết nối chia sẻ nhanh.'
  },
  {
    fileKey: 'Canon EOS M50 Mark II.jpg',
    title: 'Máy ảnh Canon EOS M50 Mark II',
    category: 'canon_cam',
    pricePerDay: 250000,
    specs: ['24.1MP APS-C', 'Dual Pixel AF bám nét mắt', 'Hỗ trợ livestream YouTube', 'Quay video dọc cho TikTok'],
    description: 'Dòng máy không gương lật nhỏ gọn cực kỳ thịnh hành cho việc quay Vlog, làm Youtube hay bán hàng online trực tuyến.'
  },
  {
    fileKey: 'Canon EOS R50.jpg',
    title: 'Máy ảnh Canon EOS R50 Mirrorless',
    category: 'canon_cam',
    pricePerDay: 280000,
    specs: ['24.2MP APS-C', 'Lấy nét Dual Pixel CMOS AF II', 'Quay phim 4K 30p oversmapled', 'Chụp liên tục 15 fps'],
    description: 'Chiếc mirrorless ngàm RF thời thượng siêu nhỏ gọn, trang bị các thuật toán lấy nét tự động nhận diện chủ thể AI thông minh.'
  },
  {
    fileKey: 'Canon EOS R100.jpg',
    title: 'Máy ảnh Canon EOS R100',
    category: 'canon_cam',
    pricePerDay: 220000,
    specs: ['24.1MP APS-C', 'Ngàm RF hiện đại', 'Lấy nét bám mắt Eye Detection', 'Trọng lượng nhẹ nhất dòng R'],
    description: 'Chiếc máy ảnh giá tốt nhất dòng mirrorless ngàm R của Canon, là bước đệm hoàn hảo để bước vào hệ ống kính RF chất lượng cao.'
  },
  {
    fileKey: 'Fujifilm X100ViI.jpg',
    title: 'Máy ảnh Fujifilm X100VI (Bản đặc biệt)',
    category: 'fuji_cam',
    pricePerDay: 420000,
    specs: ['40.2MP X-Trans V HR', 'Ống kính cố định 23mm f/2', 'Chống rung IBIS 6 stops', 'Kính ngắm lai độc quyền'],
    description: 'Siêu phẩm máy ảnh đường phố được săn đón nhất toàn cầu nhờ sự kết hợp giữa cảm biến 40.2MP sắc nét và giả lập màu phim Reala Ace mới nhất.'
  }
];

// 5. Execution Block
async function run() {
  try {
    const stores = [];

    console.log('[Seed] 1. Setting up demo partner user accounts...');
    
    // We create/authenticate each user one by one
    for (const partner of demoPartners) {
      console.log(`[Seed] Setting up partner: ${partner.studioName} (${partner.email})`);
      const { data, error } = await supabase.auth.signUp({
        email: partner.email,
        password: 'password123',
        options: {
          data: {
            name: partner.name,
            phone: partner.phone,
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(partner.studioName)}`
          }
        }
      });

      let userId;
      if (error) {
        if (error.message.includes('already registered') || error.status === 422) {
          // If already registered, sign in to retrieve their ID
          console.log(`[Seed] ${partner.email} already exists. Logging in to retrieve ID...`);
          const loginRes = await supabase.auth.signInWithPassword({
            email: partner.email,
            password: 'password123'
          });
          if (loginRes.error) {
            console.error(`[Seed Error] Failed to log in as ${partner.email}:`, loginRes.error.message);
            continue;
          }
          userId = loginRes.data.user.id;
        } else {
          console.error(`[Seed Error] Failed to sign up ${partner.email}:`, error.message);
          continue;
        }
      } else {
        userId = data.user.id;
        console.log(`[Seed] Signed up ${partner.email}. ID: ${userId}`);
      }

      // Upsert profile for this partner
      // We can do it directly with public profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          name: partner.name,
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(partner.studioName)}`,
          is_partner: true,
          phone: partner.phone,
          citizen_id: Math.floor(100000000000 + Math.random() * 900000000000).toString(),
          studio_name: partner.studioName
        });

      if (profileError) {
        console.error(`[Seed Error] Failed to upsert profile for ${partner.email}:`, profileError.message);
      } else {
        console.log(`[Seed] Profile updated/upserted for ${partner.studioName}`);
      }

      stores.push({
        id: userId,
        name: partner.name,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(partner.studioName)}`,
        studioName: partner.studioName,
        location: partner.location
      });
    }

    if (stores.length === 0) {
      throw new Error('No partner stores were successfully created/loaded. Seeding aborted.');
    }

    console.log('[Seed] 2. Clearing existing assets...');
    const { error: deleteError } = await supabase.from('assets').delete().neq('id', 'non-existent-id');
    if (deleteError) {
      console.warn('[Seed Warning] Failed to delete existing assets:', deleteError.message);
    } else {
      console.log('[Seed] Cleared existing assets table.');
    }

    console.log('[Seed] 3. Building and distributing 39 assets...');
    const assetsToInsert = [];

    devicesMeta.forEach((device, index) => {
      // Find the direct image URL from map
      const directUrl = linkMap[device.fileKey];
      if (!directUrl) {
        console.warn(`[Seed Warning] Direct link missing for: ${device.fileKey}. Using fallback placeholder.`);
      }

      // Assign to a random store
      const store = stores[index % stores.length];

      // Formulate unique text ID based on index and model
      const uniqueId = `asset-db-${index + 1}-${device.category}`;

      assetsToInsert.push({
        id: uniqueId,
        title: device.title,
        category: device.category,
        price_per_day: device.pricePerDay,
        image_url: directUrl || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&auto=format&fit=crop&q=80',
        owner_name: store.name,
        owner_avatar: store.avatar,
        owner_id: store.id,
        rating: parseFloat((4.5 + Math.random() * 0.5).toFixed(1)),
        location: store.location,
        description: device.description,
        specs: device.specs,
        status: 'available'
      });
    });

    console.log(`[Seed] 4. Inserting ${assetsToInsert.length} assets into the database...`);
    const { error: insertError } = await supabase.from('assets').insert(assetsToInsert);

    if (insertError) {
      throw new Error(`Failed to insert assets: ${insertError.message}`);
    }

    console.log('[Seed] SUCCESS: Seeding completed successfully!');
    console.log(`[Seed] Total stores configured: ${stores.length}`);
    console.log(`[Seed] Total assets inserted: ${assetsToInsert.length}`);
  } catch (err) {
    console.error('[Seed Error] Seeding process failed:', err.message);
  }
}

run();
