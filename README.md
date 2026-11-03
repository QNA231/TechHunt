# TechHunt 🎯

Hệ thống tổng hợp, tra cứu và theo dõi thông tin sản phẩm công nghệ, điện thoại, máy tính và linh kiện điện tử đã qua sử dụng tại Việt Nam.

---

## 🌟 Tính năng chính

### 1. Bảng giá thị trường hàng ngày (Daily Price Index)
- Theo dõi mặt bằng giá sàn và giá trung bình của các dòng vi xử lý (CPU), card đồ họa (GPU), RAM, ổ cứng SSD, điện thoại, laptop và màn hình.
- Trực quan hóa dữ liệu theo bố cục Bento Grid hiện đại và các chỉ số tiêu điểm.
- Hỗ trợ thao tác nhanh để chuyển sang tra cứu trực tiếp theo từng sản phẩm.

### 2. Tổng hợp dữ liệu đa nguồn (Multi-Source Aggregator)
- Kết nối và đối chiếu thông tin từ nhiều nền tảng mua bán và hệ thống bán lẻ uy tín.
- Hỗ trợ công cụ tìm kiếm nhanh trên các hội nhóm trao đổi công nghệ.

### 3. Giao diện trực quan & chuyển động vi mô
- Thiết kế theo phong cách tối giản, sử dụng tông màu trung tính dịu mắt và hỗ trợ cả chế độ sáng / tối (Dark mode).
- Tích hợp hiệu ứng chuyển động mượt mà và phím tắt tiện lợi (`Ctrl + K` hoặc `/` để tìm kiếm).
- Bộ lọc khoảng giá đồng bộ hai chiều giữa thanh trượt và các nút chọn nhanh.
- Tương thích tốt trên cả máy tính và các thiết bị di động.

### 4. Hỗ trợ xác thực mã thiết bị
- Kiểm tra tính hợp lệ của mã số IMEI theo thuật toán Luhn.
- Nhận diện và phân tích định dạng số sê-ri của các hãng phổ biến (Apple, Dell, Lenovo).

### 5. Đánh giá mức độ ưu đãi (Deal Rating)
- Tự động tính toán giá trung vị và khoảng giá thị trường để lọc các bài đăng bất thường hoặc tin rác.
- Gắn nhãn nhận diện bài đăng có mức giá tốt so với mặt bằng chung.

### 6. Cảnh báo tự động qua Telegram
- Cho phép thiết lập danh sách sản phẩm cần theo dõi kèm mức giá trần mong muốn.
- Tự động gửi thông báo đến tài khoản Telegram cá nhân khi phát hiện bài đăng phù hợp.

---

## 🚀 Hướng dẫn khởi chạy

Ứng dụng được phát triển bằng **Node.js thuần túy**, không yêu cầu cài đặt thêm các gói thư viện bên ngoài.

### Yêu cầu
- Node.js phiên bản 18 trở lên.

### Khởi chạy ứng dụng
1. Mở cửa sổ dòng lệnh tại thư mục dự án và chạy lệnh:
   ```bash
   npm start
   ```
2. Hoặc trên hệ điều hành Windows, có thể nhấp đúp trực tiếp vào file **`Start-App.bat`**.

Sau khi khởi chạy, truy cập vào địa chỉ: **`http://localhost:3000`**

Để dừng ứng dụng, đóng cửa sổ dòng lệnh hoặc chạy file **`Stop-App.bat`**.

---

## 📁 Cấu trúc thư mục

```text
TechHunt/
├── public/                  # Giao diện ứng dụng người dùng (Frontend)
│   ├── index.html           # Cấu trúc trang web
│   ├── app.js               # Logic điều phối giao diện, lọc và hiển thị
│   └── style.css            # Định dạng giao diện và hiệu ứng chuyển động
├── src/
│   ├── scrapers/            # Các module thu thập và đối chiếu dữ liệu
│   ├── services/            # Xử lý logic nghiệp vụ, thẩm định và cảnh báo
│   └── server.js            # Máy chủ web phục vụ dịch vụ và tài nguyên
├── package.json             # Cấu hình dự án
├── .gitignore               # Danh sách tệp loại trừ không đưa lên Git
├── Start-App.bat            # Lệnh khởi chạy ứng dụng nhanh
├── Stop-App.bat             # Lệnh dừng ứng dụng
└── README.md                # Tài liệu tổng quan dự án
```

---

## 📄 Giấy phép

Dự án phục vụ mục đích nghiên cứu, học tập và cung cấp công cụ tham khảo thông tin thị trường công nghệ.
