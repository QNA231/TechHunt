# Tech Deal Hunter 🎯

**Hệ thống tổng hợp, tra cứu và săn đồ điện tử, điện thoại, laptop & linh kiện máy tính cũ giá rẻ.**

---

## 🌟 Tính Năng Nổi Bật

1. **Tra Cứu Đa Nguồn Song Song (Multi-Source Aggregator):**
   - **Chợ Tốt:** Tận dụng Gateway Public API chính thức để lấy dữ liệu thời gian thực theo danh mục và khu vực.
   - **VoZ Forums (box f68):** Diễn đàn linh kiện PC uy tín hàng đầu, bóc tách bài đăng và mức giá niêm yết của thành viên.
   - **Nhật Tảo:** Diễn đàn công nghệ và mua bán đồ cũ lâu năm.
   - **Chuỗi bán lẻ đổi trả (CellphoneS, Thế Giới Di Động):** Lựa chọn máy cũ đã kiểm định kỹ thuật 30 bước, có bảo hành chính hãng 6-12 tháng.

2. **Bộ Lọc Thông Minh & Chống Tin Rác (Anti-Scam Filter):**
   - Tự động phát hiện và loại bỏ các tin báo giá ảo (1.000đ, 0đ, quảng cáo trả góp trá hình).
   - Tự động nhận diện từ khóa máy xác / lỗi nặng / dính tài khoản: `xác`, `icloud`, `bypass`, `màn sọc`, `chết nguồn`, `mất face id`, `lỗi vram`...
   - Tùy chọn lọc: *Chỉ người dùng bán* (loại bớt thợ buôn/tiệm).

3. **Định Giá Thị Trường & Gắn Nhãn Kèo Thơm (Deal Rating):**
   - Tự động tính toán giá thấp nhất, giá cao nhất, giá trung bình và **giá trung vị (median)** của thị trường cho model đang tìm.
   - Đánh giá mức độ hời theo phần trăm chênh lệch:
     - 🔥 **KÈO SIÊU THƠM:** Rẻ hơn 20%+ so với thị trường.
     - ✨ **GIÁ TỐT:** Rẻ hơn từ 8% đến 20%.
     - ⚖️ **GIÁ HỢP LÝ:** Đúng khoảng giá thị trường.
     - 📈 **GIÁ CAO:** Cao hơn thị trường trên 15%.

4. **Săn Kèo Tự Động 24/7 (Watchdog & Telegram Bot Alert):**
   - Đặt sẵn tiêu chí theo dõi (ví dụ: *Tìm RTX 3060 dưới 4.2 triệu tại Hà Nội*).
   - Hệ thống quét nền định kỳ mỗi 5 phút.
   - Khi có người vừa đăng tin mới thỏa mãn điều kiện, bot sẽ lập tức gửi thông báo kèm ảnh và link bài đăng về điện thoại của bạn qua Telegram.

---

## 🚀 Hướng Dẫn Khởi Chạy

Dự án được xây dựng bằng **Node.js 22 thuần túy (Zero External Dependencies)**, không cần cài đặt các thư viện nặng nề hay lo ngại lỗi môi trường.

### 1. Khởi động Web App:
Mở Terminal / PowerShell và chạy lệnh:
```bash
cd C:\Users\anhqu\.gemini\antigravity\scratch\tech-deal-hunter
npm start
```
*(Hoặc `node src/server.js`)*

### 2. Mở trình duyệt:
Truy cập:
👉 **http://localhost:3000**

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
