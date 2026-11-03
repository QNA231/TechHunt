# TechHunt 🎯

Hệ thống tổng hợp, tra cứu và săn đồ công nghệ, điện thoại, laptop và linh kiện máy tính cũ giá tốt đa nền tảng tại Việt Nam.

---

## 🌟 Tính năng nổi bật

### 1. Bảng giá linh kiện điện tử hàng ngày (Daily Price Index)
- **Bố cục Bento Grid hiện đại:** Hiển thị trực quan biến động thị trường theo phong cách Kokonut Ui với các khối tiêu điểm (Spotlight).
- **Phân khúc linh kiện đa dạng:** Card đồ họa (GPU), vi xử lý (CPU), RAM & SSD, điện thoại cũ, laptop cũ, màn hình.
- **Thống kê thị trường thực tế:** So sánh giá sàn săn được và giá trung bình thị trường.
- **Săn bài đăng 1-click:** Bấm nút chuyển thẳng sang trang tra cứu và tự động kích hoạt bộ lọc giá tối ưu mà không lo bị ẩn mất deal hời.

### 2. Tra cứu đa nguồn song song (Multi-Source Aggregator)
- **Chợ Tốt:** Tận dụng gateway public api chính thức để truy xuất dữ liệu bài đăng thời gian thực theo danh mục và khu vực.
- **Nhật Tảo:** Diễn đàn công nghệ và mua bán đồ cũ lâu đời tại Việt Nam, bóc tách giá thông minh và hình ảnh chuẩn gốc.
- **Hệ thống bán lẻ & thu cũ đổi mới uy tín:** CellphoneS, Thế Giới Di Động máy đổi trả, Hoàng Hà Mobile, FPT Shop đổi trả, Tin Học Ngôi Sao.
- **Hội nhóm Facebook (1-Click Deep Search):** Tự động tạo liên kết tìm kiếm bài đăng mới nhất trên các cộng đồng mua bán công nghệ lớn.

### 3. Giao diện người dùng Kokonut Ui & diễn hoạt Anime.js
- **Bảng màu trung tính dịu mắt:** Mặc định nền sáng trung tính (`#f8f9fa`) và hỗ trợ đầy đủ chế độ nền tối (Dark mode) sang trọng.
- **Chuyển động vi mô mượt mà:** Hiệu ứng số đếm tăng dần (numeric counter), xuất hiện phân tầng (stagger reveal) cho các thẻ xúc giác (tactile cards).
- **Phím tắt toàn cục thông minh:** Nhấn `Ctrl + K` hoặc phím `/` để lấy nét nhanh vào thanh tìm kiếm từ bất kỳ đâu.
- **Bộ lọc săn kèo thích ứng:** Thanh trượt khoảng giá lớn kết hợp các nút preset nhanh (`Tất cả`, `< 5tr`, `< 12tr`, `< 20tr`) được đồng bộ hóa trạng thái hai chiều.
- **Tối ưu di động:** Hỗ trợ ngăn kéo bộ lọc (drawer) và nút thao tác nổi (fab button) tự động ẩn hiện theo hướng cuộn trang.

### 4. Thẩm định mã phần cứng tự động (Hardware Verifier)
- **Kiểm tra IMEI:** Tự động phát hiện và kiểm tra thuật toán Luhn Checksum chuẩn quốc tế của GSMA.
- **Phân tích dải TAC:** Nhận diện thương hiệu thiết bị, cảnh báo mã giả mạo hoặc nhân bản.
- **Hỗ trợ đa nền tảng:** Apple Serial Number, Dell Service Tag, Lenovo Serial Number.

### 5. Định giá thị trường & đánh giá độ hời (Deal Rating)
- Tự động phân tích giá thấp nhất, cao nhất, trung bình và **giá trung vị (median)** để loại trừ giá ảo hoặc tin rác.
- Gắn nhãn tự động: 🔥 **Kèo rất hời** (rẻ hơn từ 20% so với thị trường), ✨ **Giá tốt** (rẻ hơn từ 8% đến 20%).

### 6. Trợ lý săn tin tự động 24/7 (Watchdog & Telegram Bot Alert)
- Thiết lập từ khóa và mức giá trần mong muốn (ví dụ: `Ryzen 5 5600` giá trần `2.500.000 đ`).
- Hệ thống định kỳ rà soát các nguồn dữ liệu ngầm và gửi thông báo kèm link chi tiết bài đăng trực tiếp về Telegram cá nhân.

---

## 🚀 Hướng dẫn cài đặt & khởi chạy cục bộ

Dự án được xây dựng bằng **Node.js thuần túy (Zero External Dependencies)**, không yêu cầu cài đặt thêm các gói thư viện nặng nề.

### Yêu cầu hệ thống
- Node.js phiên bản 18 trở lên (khuyên dùng Node.js 20 hoặc 22).

### Khởi chạy nhanh trên Windows
1. Nhấp đúp chuột vào file **`Start-App.bat`** để khởi động máy chủ và tự động mở trình duyệt.
2. Hoặc nhấp đúp **`Tao-Shortcut-Desktop.bat`** để tạo biểu tượng khởi chạy nhanh trên màn hình chính.

### Khởi chạy bằng dòng lệnh
```bash
# Di chuyển vào thư mục dự án
cd D:\Quan\TechHunter

# Khởi động máy chủ web
npm start
```

Mở trình duyệt và truy cập: **`http://localhost:3000`**

---

## ☁️ Hướng dẫn triển khai lên Cloudflare

Để sử dụng ứng dụng mọi lúc mọi nơi trên điện thoại và duy trì bot Telegram tự động săn kèo 24/7 mà không cần bật máy tính cá nhân:

### 1. Triển khai giao diện lên Cloudflare Pages
1. Đăng nhập vào bảng điều khiển **Cloudflare Dashboard** (`dash.cloudflare.com`).
2. Điều hướng tới mục **Workers & Pages** > chọn **Create application** > chọn thẻ **Pages**.
3. Chọn **Connect to Git** và liên kết với tài khoản GitHub, chọn repository `TechHunt`.
4. Thiết lập cấu hình triển khai:
   - **Framework preset:** `None`
   - **Build output directory:** `public`
5. Bấm **Save and Deploy**. Cloudflare sẽ cấp đường dẫn trực tuyến (ví dụ: `https://techhunt.pages.dev`). Bạn có thể lưu vào màn hình chính của điện thoại để dùng như một ứng dụng độc lập.

### 2. Triển khai tác vụ quét tự động lên Cloudflare Workers Cron Trigger
- Sử dụng tính năng Cron Trigger của Cloudflare Workers để kích hoạt hàm quét tin định kỳ mỗi 1 - 5 phút một lần.
- Cấu hình các biến môi trường bí mật trong mục **Settings > Variables**:
  - `TELEGRAM_BOT_TOKEN`: Token bot từ `@BotFather`.
  - `TELEGRAM_CHAT_ID`: ID người nhận từ `@userinfobot`.

---

## 📁 Cấu trúc thư mục dự án

```text
TechHunt/
├── public/                  # Giao diện ứng dụng đơn trang (SPA Frontend)
│   ├── index.html           # Cấu trúc giao diện ngữ nghĩa chuẩn Sentence Case
│   ├── app.js               # Logic điều phối giao diện, tìm kiếm, lưu trữ & Anime.js
│   └── style.css            # Hệ thống màu Kokonut Ui, hiệu ứng thẻ xúc giác & thanh cuộn
├── src/
│   ├── scrapers/            # Các module thu thập dữ liệu nguồn
│   │   ├── chotot.js        # Gateway API Chợ Tốt thời gian thực
│   │   ├── nhattao.js       # Bộ trích xuất dữ liệu diễn đàn Nhật Tảo
│   │   ├── retail.js        # Dữ liệu đối chiếu từ hệ thống bán lẻ uy tín
│   │   └── index.js         # Bộ tổng hợp và điều phối tìm kiếm đa luồng
│   ├── services/
│   │   ├── dailyPrices.js   # Bảng chỉ số giá linh kiện điện tử hàng ngày
│   │   ├── analyzer.js      # Thuật toán thống kê giá thị trường & chấm điểm kèo hời
│   │   ├── filter.js        # Bộ lọc tin rác, máy xác, dính iCloud hoặc giá ảo
│   │   ├── hardwareVerifier.js # Thẩm định thuật toán Luhn IMEI, Serial Apple/Dell/Lenovo
│   │   ├── facebookGroups.js# Bộ sinh liên kết tìm kiếm sâu nhóm Facebook
│   │   └── watchdog.js      # Tác vụ nền theo dõi kèo & bắn tin nhắn Telegram
│   └── server.js            # Máy chủ HTTP phục vụ API và tài nguyên tĩnh
├── package.json             # Cấu hình dự án Node.js ES Modules
├── .gitignore               # Danh sách tệp loại trừ không đưa lên Git
└── README.md                # Tài liệu hướng dẫn sử dụng và triển khai
```

---

## 📄 Giấy phép

Dự án được phát triển phục vụ mục đích học tập, nghiên cứu công nghệ và hỗ trợ người dùng tìm kiếm sản phẩm công nghệ giá tốt một cách an toàn và minh bạch.
