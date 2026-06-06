# Hướng Dẫn & Bộ Tiêu Chuẩn Thiết Kế Giao Diện (Design System Guidelines)

Tài liệu này định nghĩa các nguyên tắc và tiêu chuẩn thiết kế giao diện (UI/UX) cho thương hiệu **GearUp** (nền tảng thuê máy ảnh & thiết bị quay phim chuyên nghiệp), giúp duy trì tính nhất quán, chuyên nghiệp và đặc trưng riêng của thương hiệu.

---

## 1. Hệ Thống Màu Sắc & Gradient (Color Palette)

Thương hiệu sử dụng hai màu chủ đạo tương phản bổ trợ nhau: **Xanh đại dương (Ocean Blue)** và **Cam năng động (Vibrant Orange)** trên nền sáng thanh lịch.

### Màu sắc chủ đạo (Brand Colors)
*   **Primary (Màu chính - Ocean Blue)**: `#0066ff` (`var(--color-primary)`)
    *   Trạng thái Hover: `#0052cc` (`var(--color-primary-hover)`)
    *   Nền bổ trợ nhẹ (Soft blue tint): `#e6f0ff` (`var(--color-primary-light)`)
*   **Secondary (Màu nhấn - Vibrant Orange)**: `#ff7800` (`var(--color-secondary)`)
    *   Trạng thái Hover: `#e66c00` (`var(--color-secondary-hover)`)
    *   Nền bổ trợ nhẹ (Soft orange tint): `#fff2e6` (`var(--color-secondary-light)`)

### Màu trung tính (Neutrals)
*   **Dark (Chữ tiêu đề, tiêu điểm)**: `#0f172a` (`var(--color-dark)`)
*   **Body Text (Chữ nội dung)**: `#334155` (`var(--color-text-main)`)
*   **Muted Text (Chữ phụ, chú thích)**: `#64748b` (`var(--color-text-muted)`)
*   **Nền giao diện chính**: `#ffffff` (`var(--color-light)`) - **Lưu ý**: *Không áp dụng chế độ tối (Dark Mode) toàn cục cưỡng bức để tránh lỗi tương phản màu sắc với các mã inline styles.*

### Dải màu đặc biệt (Special Gradients)
*   **Dải màu Chiến dịch (Ví dụ: Ưu Đãi Tháng 6)**:
    *   Mã màu: Tuyến tính từ `#0066ff` (Ocean Blue) đến `#ff7800` (Vibrant Orange).
    *   CSS: `background: linear-gradient(135deg, #0066ff, #ff7800);`
    *   Mục tiêu: Tạo cảm giác chuyển màu mượt mà, thu hút ánh nhìn nhưng vẫn gắn kết hai màu nhận diện thương hiệu.

---

## 2. Typography & Iconography

### Phông chữ (Fonts)
*   **Tiêu đề (Headings)**: Sử dụng font **Plus Jakarta Sans** (`var(--font-primary)`) để tạo nét hiện đại, góc cạnh vững chãi cho thương hiệu công nghệ/dịch vụ thuê thiết bị.
*   **Nội dung (Body text)**: Sử dụng font **Inter** (`var(--font-secondary)`) để tối ưu khả năng đọc ở mọi kích thước màn hình.

### Bộ Icon tiêu chuẩn
*   Sử dụng thư viện **lucide-react** cho toàn bộ giao diện.
*   **Thông số stroke**: Độ dày viền icon đặt ở mức mảnh chuyên nghiệp (`strokeWidth={1.5}` hoặc mặc định là `2`).
*   **Nguyên tắc**: Tuyệt đối không dùng các icon Emoji trẻ con cho các thành phần điều hướng hay tính năng cốt lõi.

---

## 3. Tiêu Chuẩn Thiết Kế Component

### A. Thẻ Sản Phẩm (Product Card)
Thẻ sản phẩm là thành phần cốt lõi của trang danh sách. Thiết kế cần tối giản, chuyên nghiệp và đáng tin cậy.

1.  **Ảnh Sản Phẩm**:
    *   Không đóng khung viền ảnh. Để ảnh **tràn viền** tự nhiên ở 3 cạnh trên.
    *   Tỷ lệ ảnh bắt buộc: `aspect-ratio: 1 / 1` (hình vuông).
    *   Cắt ảnh: Dùng `object-fit: cover` để ảnh tự động lấp đầy khung hình vuông bất kể người dùng tải lên ảnh ngang hay dọc.
2.  **Bố cục thông tin đồng đều**:
    *   Các khối thông tin dưới ảnh (Tên, thông số, giá thuê, số lượt thuê, đánh giá) phải **luôn luôn thẳng hàng ngang** giữa các thẻ kề nhau.
    *   Sử dụng CSS Flexbox/Grid với chiều cao cố định tối thiểu (`min-height`) cho phần tên sản phẩm để tránh trường hợp tên dài làm xô lệch các thông số bên dưới.
3.  **Tương tác Hover**:
    *   **Loại bỏ hiệu ứng nhảy lên (translateY)** gây rối mắt và làm giật khung màn hình.
    *   **Thay bằng**: Thay đổi màu viền nhẹ nhàng (ví dụ: `border: 1px solid rgba(0, 102, 255, 0.2)` hoặc `var(--color-primary-light)`).
4.  **Bỏ Nút CTA trực tiếp trên Card**:
    *   Loại bỏ nút "Thuê ngay" trên thẻ sản phẩm ở trang danh sách để giữ giao diện thoáng đạt, nhường chỗ cho các thông số kỹ thuật rõ ràng.

### B. Họa Tiết Trang Trí Nền (Halftone Dot Gradient Pattern)
Dùng để trang trí cho các thanh điều hướng (Nav bar) đơn sắc, tạo chiều sâu thị giác mang phong cách đồ họa in ấn chuyên nghiệp (Halftone).

*   **Vị trí**: Chỉ xuất hiện duy nhất ở **góc bên trái** của thanh menu, cách lề trái `20px`, hoàn toàn tránh xa khu vực chứa chữ để không cản trở khả năng đọc.
*   **Trạng thái**: Tĩnh hoàn toàn (`background-repeat: no-repeat`), không chạy animation để tránh gây mất tập trung.
*   **Cấu trúc chấm**: Các chấm tròn xếp thành dải chéo xiên từ trên-phải xuống dưới-trái và mờ dần:
    *   *Hàng 1 (trên cùng)*: Chấm to nhất ($5.5\text{px}$), mờ nhẹ (`opacity: 0.4`).
    *   *Hàng 2*: Chấm trung bình ($4.25\text{px}$), mờ hơn (`opacity: 0.28`).
    *   *Hàng 3*: Chấm nhỏ ($3\text{px}$), mờ đậm (`opacity: 0.18`).
    *   *Hàng 4 (dưới cùng)*: Chấm siêu nhỏ ($1.75\text{px}$), mờ nhất (`opacity: 0.08`).

---

## 4. Quy Tắc Giao Diện Responsive & Bố Cục (UX Principles)

*   **Độc lập bố cục (Layout Independence)**: Các phần tử không được co giãn phụ thuộc vào kích thước tự nhiên của tài nguyên động (như ảnh sản phẩm hay độ dài mô tả). Mọi thẻ phải có khung bảo vệ kích thước cố định.
*   **Khoảng thở (Spacing)**: Sử dụng hệ thống spacing chuẩn của dự án (`--spacing-sm` = 12px, `--spacing-md` = 16px, `--spacing-lg` = 24px) để phân chia các phần, giữ giao diện gọn gàng, thoáng đãng.
