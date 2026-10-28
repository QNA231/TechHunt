# TechHunter 🎯

**Hệ thống tổng hợp, tra cứu và săn đồ công nghệ, điện thoại, laptop & linh kiện máy tính cũ giá tốt đa nền tảng.**

---

## 🌟 Tính Năng Nổi Bật

1. **Tra Cứu Đa Nguồn Song Song (Multi-Source Aggregator):**
   - **Chợ Tốt:** Tận dụng Gateway Public API chính thức để lấy dữ liệu thời gian thực theo danh mục và khu vực.
   - **Nhật Tảo:** Diễn đàn công nghệ và mua bán đồ cũ lâu năm tại Việt Nam, bóc tách giá thông minh và ảnh chuẩn gốc.
   - **VoZ Forums (box f68):** Diễn đàn công nghệ hàng đầu, bóc tách bài đăng mới nhất trong 14 ngày.
   - **Hệ thống bán lẻ & Thu cũ uy tín:** CellphoneS Thu Cũ Đổi Mới, Thế Giới Di Động Máy Đổi Trả, Hoàng Hà Mobile, FPT Shop, Laptop88, Tin Học Ngôi Sao.
   - **Facebook Groups (1-Click Deep Search):** Tự động tạo link tìm kiếm sẵn bộ lọc "Recent posts" trên các nhóm giao lưu buôn bán công nghệ lớn.

2. **Bộ Lọc Săn Kèo Hiện Đại & Sticky Sidebar:**
   - Bộ lọc nguồn nền tảng riêng biệt: CellphoneS, TGDĐ, Chợ Tốt, Nhật Tảo, VoZ...
   - Thanh trượt khoảng giá lớn (Range Slider) kết hợp nút preset nhanh (< 5tr, < 12tr, < 20tr).
   - Tùy chọn lọc rác / máy xác / iCloud ẩn / hàng lỗi.
   - Drawer thò thụt tiện lợi tối ưu riêng cho điện thoại di động (Responsive).
   - Thẻ sản phẩm hiện đại: Tiêu đề gắn link trực tiếp bài đăng, huy hiệu sắc nét độ tương phản cao.

3. **Thẩm Định Phần Cứng Tự Động (IMEI / Serial / Service Tag):**
   - Tự động quét và kiểm tra thuật toán Luhn Checksum của GSMA cho mã IMEI.
   - Nhận diện dải TAC quốc tế, thương hiệu thiết bị và cảnh báo mã giả / nhân bản.
   - Hỗ trợ Apple Serial Number, Dell Service Tag, Lenovo Serial.

4. **Định Giá Thị Trường & Gắn Nhãn Kèo Thơm (Deal Rating):**
   - Tự động tính toán giá thấp nhất, cao nhất, trung bình và **giá trung vị (median)**.
   - Gắn nhãn: 🔥 **KÈO RẤT HỜI** (>20% rẻ hơn thị trường), ✨ **GIÁ TỐT** (8-20%).

5. **Săn Kèo Tự Động 24/7 (Watchdog & Telegram Bot Alert):**
   - Đặt tiêu chí theo dõi ngầm, tự động bắn thông báo kèm link về Telegram.

---

## 🚀 Hướng Dẫn Khởi Chạy

Dự án sử dụng **Node.js 22 thuần túy (Zero External Dependencies)**, không cần `npm install`.

### Cách 1: Click Đúp Chuột
- Click đúp vào file **`Start-App.bat`** trong thư mục `D:\Quan\TechHunter` để khởi động máy chủ và tự động mở trình duyệt!
- Muốn tạo shortcut ra màn hình chính, chỉ cần click đúp **`Tao-Shortcut-Desktop.bat`**.

### Cách 2: Chạy Qua Command Line
```bash
cd D:\Quan\TechHunter
npm start
```
Truy cập: 👉 **http://localhost:3000**

---

## 🛠️ Cấu Trúc Thư Mục

```text
tech-deal-hunter/
├── data/                    # Nơi lưu trữ danh sách các nhiệm vụ Watchdog (JSON)
├── public/                  # Giao diện Web Người Dùng (Frontend SPA)
│   ├── index.html           # HTML cấu trúc giao diện
│   ├── app.js               # Logic tìm kiếm, lọc, render, kết nối Telegram
│   └── style.css            # Hiệu ứng chuyển động & CSS tùy biến
├── src/
│   ├── scrapers/            # Các module thu thập dữ liệu
│   │   ├── chotot.js        # Chợ Tốt Gateway API
│   │   ├── voz.js           # VoZ f68 Forums Parser
│   │   ├── nhattao.js       # Nhật Tảo Parser
│   │   ├── retail.js        # Chuỗi bán lẻ máy cũ CellphoneS / TGDĐ
│   │   └── index.js         # Bộ điều phối quét song song đa nguồn
│   ├── services/
│   │   ├── filter.js        # Bộ lọc tin rác, giá ảo, máy xác
│   │   ├── analyzer.js      # Phân tích giá thị trường & tính điểm kèo thơm
│   │   ├── mockData.js      # Kho dữ liệu phong phú hỗ trợ chạy offline/demo
│   │   └── watchdog.js      # Bộ lập lịch quét ngầm & gửi cảnh báo Telegram
│   └── server.js            # Máy chủ Web & API Server
└── package.json
```
