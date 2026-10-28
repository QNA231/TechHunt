/**
 * Dữ liệu mẫu thực tế hỗ trợ thử nghiệm offline & fallback khi mạng chập chờn
 */

export const MOCK_ITEMS = [
  // --- Nhóm Linh Kiện PC / Máy tính ---
  {
    id: "ct-1001",
    title: "VGA ASUS TUF RTX 3060 12GB Gaming còn bảo hành 6 tháng",
    price: 4300000,
    source: "Chợ Tốt",
    sourceBadge: "chotot",
    url: "https://www.chotot.com/1001.htm",
    image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80",
    location: "Quận 10, TP.HCM",
    postedTime: Date.now() - 1000 * 60 * 25, // 25 phút trước
    sellerName: "Hoàng Nam",
    isShop: false,
    category: "pc",
    condition: "Còn bảo hành hãng",
    description: "Nâng cấp lên 4070 cần bán lại card RTX 3060 12GB bản 3 fan mát mẻ, nguyên zin tem void, không trâu cày."
  },
  {
    id: "voz-2001",
    title: "[HN] Bán MSI RTX 3060 Ventus 2X 12GB fullbox như mới",
    price: 3950000,
    source: "VoZ f68",
    sourceBadge: "voz",
    url: "https://voz.vn/t/2001",
    image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=600&q=80",
    location: "Cầu Giấy, Hà Nội",
    postedTime: Date.now() - 1000 * 60 * 15, // 15 phút trước (kèo thơm)
    sellerName: "cuong_voz92 (Join 2014)",
    isShop: false,
    category: "pc",
    condition: "Fullbox 99%",
    description: "Hàng người dùng văn phòng chơi game nhẹ, vừa hết bh tháng trước, bao test 7 ngày lỗi hoàn tiền."
  },
  {
    id: "nt-3001",
    title: "Card màn hình GIGABYTE RTX 3060 Eagle 12G 2 fan",
    price: 4600000,
    source: "Nhật Tảo",
    sourceBadge: "nhattao",
    url: "https://nhattao.com/t/3001",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80",
    location: "Thanh Xuân, Hà Nội",
    postedTime: Date.now() - 1000 * 60 * 180, // 3 giờ trước
    sellerName: "Tin Học Công Nghệ",
    isShop: true,
    category: "pc",
    condition: "Bảo hành 3 tháng",
    description: "Cửa hàng bán thanh lý lô card văn phòng đồ họa, tặng kèm cáp chuyển đổi."
  },
  {
    id: "ct-1002",
    title: "Xác RTX 3060 cháy nguồn không lên hình cho thợ lấy linh kiện",
    price: 600000,
    source: "Chợ Tốt",
    sourceBadge: "chotot",
    url: "https://www.chotot.com/1002.htm",
    image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80",
    location: "Bình Thạnh, TP.HCM",
    postedTime: Date.now() - 1000 * 60 * 300,
    sellerName: "Tuấn PC",
    isShop: true,
    category: "pc",
    condition: "Xác máy",
    description: "Máy bị chập nguồn sét đánh, bán xác cho anh em thợ nghiên cứu."
  },
  {
    id: "voz-2002",
    title: "[Toàn Quốc] Combo CPU Intel Core i5 12400F + Main B660M Pro",
    price: 3600000,
    source: "VoZ f68",
    sourceBadge: "voz",
    url: "https://voz.vn/t/2002",
    image: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=600&q=80",
    location: "Đà Nẵng",
    postedTime: Date.now() - 1000 * 60 * 45,
    sellerName: "minhtri_dn (Join 2018)",
    isShop: false,
    category: "pc",
    condition: "Đã qua sử dụng",
    description: "Đang cắm máy dùng bình thường, lên đời i7 dư ra nên bán combo, tặng tản khí CR1000."
  },
  {
    id: "ct-1003",
    title: "RAM Corsair Vengeance LPX 16GB (2x8GB) DDR4 3200MHz",
    price: 650000,
    source: "Chợ Tốt",
    sourceBadge: "chotot",
    url: "https://www.chotot.com/1003.htm",
    image: "https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=600&q=80",
    location: "Tân Bình, TP.HCM",
    postedTime: Date.now() - 1000 * 60 * 8, // Mới đăng 8 phút
    sellerName: "Anh Đức",
    isShop: false,
    category: "pc",
    condition: "Hết bảo hành",
    description: "Kit ram hoạt động hoàn hảo, tản nhiệt nhôm đen bao mát."
  },

  // --- Nhóm Điện Thoại Cũ ---
  {
    id: "ct-1004",
    title: "iPhone 13 Pro Max 128GB Xanh Sierra quốc tế pin 86%",
    price: 11800000,
    source: "Chợ Tốt",
    sourceBadge: "chotot",
    url: "https://www.chotot.com/1004.htm",
    image: "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&w=600&q=80",
    location: "Đống Đa, Hà Nội",
    postedTime: Date.now() - 1000 * 60 * 12, // Kèo hời
    sellerName: "Nguyễn Hải Yến",
    isShop: false,
    category: "phone",
    condition: "98% zin all",
    description: "Máy nữ dùng ốp từ đầu, màn hình 120Hz mượt mà, bao thợ check 3uTools xanh lè. Số IMEI: 359201101234566 bao check bảo hành Apple."
  },
  {
    id: "cps-4001",
    title: "iPhone 13 Pro Max 128GB Cũ Đẹp - Bảo hành 6 tháng 1 đổi 1",
    price: 13990000,
    source: "CellphoneS Cũ",
    sourceBadge: "retail",
    url: "https://cellphones.com.vn/hang-cu/iphone-13-pro-max.html",
    image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80",
    location: "Hệ thống toàn quốc",
    postedTime: Date.now() - 1000 * 60 * 120,
    sellerName: "CellphoneS Thu Cũ",
    isShop: true,
    category: "phone",
    condition: "Đã kiểm định 30 bước",
    description: "Nguồn gốc rõ ràng, đã qua thẩm định kỹ thuật, tặng sạc nhanh. Serial: F2LX90KBMD6R tra cứu chính hãng Apple."
  },
  {
    id: "ct-1008",
    title: "iPhone 13 Pro Max 128GB Quốc Tế nguyên zin giá rẻ thanh lý gấp",
    price: 8900000,
    source: "Chợ Tốt",
    sourceBadge: "chotot",
    url: "https://www.chotot.com/1008.htm",
    image: "https://images.unsplash.com/photo-1603791440384-56cd371ee9a7?auto=format&fit=crop&w=600&q=80",
    location: "Quận 12, TP.HCM",
    postedTime: Date.now() - 1000 * 60 * 5,
    sellerName: "Kho Máy Giá Rẻ",
    isShop: true,
    category: "phone",
    condition: "99% like new",
    description: "Cần tiền bán gấp iPhone 13 Pro Max bản quốc tế, máy đẹp không tì vết. IMEI: 359201101234567 liên hệ trực tiếp trước khi qua."
  },
  {
    id: "nt-3002",
    title: "iPhone 13 Pro Max 128GB Gold VN/A nguyên bản",
    price: 12500000,
    source: "Nhật Tảo",
    sourceBadge: "nhattao",
    url: "https://nhattao.com/t/3002",
    image: "https://images.unsplash.com/photo-1603791440384-56cd371ee9a7?auto=format&fit=crop&w=600&q=80",
    location: "Quận 1, TP.HCM",
    postedTime: Date.now() - 1000 * 60 * 90,
    sellerName: "Táo Xanh Store",
    isShop: true,
    category: "phone",
    condition: "99% zin",
    description: "Bản chính hãng VN/A, tặng full phụ kiện ốp lưng cường lực."
  },
  {
    id: "ct-1005",
    title: "iPhone 13 Pro Max 128Gb dính icloud ẩn màn sọc bán xác",
    price: 2200000,
    source: "Chợ Tốt",
    sourceBadge: "chotot",
    url: "https://www.chotot.com/1005.htm",
    image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=600&q=80",
    location: "Gò Vấp, TP.HCM",
    postedTime: Date.now() - 1000 * 60 * 240,
    sellerName: "Thanh Lý Mobile",
    isShop: true,
    category: "phone",
    condition: "Máy lỗi/xác",
    description: "Quên mật khẩu icloud, màn hình có 1 sọc chỉ, bán xác cho anh em lấy camera, vỏ, linh kiện."
  },
  {
    id: "ct-1006",
    title: "Samsung Galaxy S23 Ultra 5G 256GB đen Phantom zin 100%",
    price: 12900000,
    source: "Chợ Tốt",
    sourceBadge: "chotot",
    url: "https://www.chotot.com/1006.htm",
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=600&q=80",
    location: "Ba Đình, Hà Nội",
    postedTime: Date.now() - 1000 * 60 * 35,
    sellerName: "Quang Huy",
    isShop: false,
    category: "phone",
    condition: "Like new 99%",
    description: "Bản chính hãng SSVN 2 sim vật lý, bút Spen nhạy, zoom 100x sắc nét, máy không 1 vết xước."
  },

  // --- Nhóm Laptop & Tablet Cũ ---
  {
    id: "voz-2003",
    title: "[HN] Bán ThinkPad T14 Gen 2 Ryzen 7 Pro 5850U / 16GB / 512GB",
    price: 8800000,
    source: "VoZ f68",
    sourceBadge: "voz",
    url: "https://voz.vn/t/2003",
    image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80",
    location: "Hà Đông, Hà Nội",
    postedTime: Date.now() - 1000 * 60 * 20, // Kèo hời
    sellerName: "thinkpad_fan (Join 2016)",
    isShop: false,
    category: "laptop",
    condition: "98% bàn phím sướng",
    description: "Máy người dùng văn phòng gõ phím ThinkPad bao phê, pin còn 92% dùng 6-7 tiếng, sạc type C zin theo máy."
  },
  {
    id: "ct-1007",
    title: "MacBook Air M1 2020 8GB / 256GB Xám Không Gian pin 90%",
    price: 11200000,
    source: "Chợ Tốt",
    sourceBadge: "chotot",
    url: "https://www.chotot.com/1007.htm",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80",
    location: "Quận 3, TP.HCM",
    postedTime: Date.now() - 1000 * 60 * 50,
    sellerName: "Thảo My",
    isShop: false,
    category: "laptop",
    condition: "Đẹp không cấn móp",
    description: "Dùng làm marketing nhẹ nhàng, pin cực trâu, màn Retina sáng đẹp không điểm chết."
  },
  {
    id: "cps-4002",
    title: "MacBook Air M1 8GB 256GB Cũ Đẹp - Thu cũ đổi mới CellphoneS",
    price: 12490000,
    source: "CellphoneS Cũ",
    sourceBadge: "retail",
    url: "https://cellphones.com.vn/hang-cu/macbook-air-m1.html",
    image: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=600&q=80",
    location: "Toàn quốc",
    postedTime: Date.now() - 1000 * 60 * 150,
    sellerName: "CellphoneS Thu Cũ",
    isShop: true,
    category: "laptop",
    condition: "Bảo hành 6 tháng",
    description: "Máy được kỹ thuật viên kiểm định linh kiện chính hãng Apple, đổi trả 30 ngày đầu."
  }
];

export function getMockResults(query = "", category = "all") {
  const q = (query || "").toLowerCase().trim();
  
  return MOCK_ITEMS.filter(item => {
    // Lọc theo danh mục nếu có
    if (category && category !== "all" && item.category !== category) {
      return false;
    }
    
    if (!q) return true;
    
    // Tìm kiếm mờ theo từ khóa
    const titleMatch = item.title.toLowerCase().includes(q);
    const descMatch = (item.description || "").toLowerCase().includes(q);
    
    // Hỗ trợ từ khóa viết tắt:
    // ví dụ "3060" khớp "RTX 3060", "13 prm" khớp "iPhone 13 Pro Max", "t14" khớp "ThinkPad T14"
    const words = q.split(/\s+/);
    const allWordsMatch = words.every(w => 
      item.title.toLowerCase().includes(w) || (item.description || "").toLowerCase().includes(w)
    );

    return titleMatch || descMatch || allWordsMatch;
  });
}
