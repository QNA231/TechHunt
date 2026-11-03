/**
 * Module Tích Hợp Tìm Kiếm Hội Nhóm Facebook (Facebook Groups Deep Search Engine)
 * Giải quyết bài toán: Facebook không có API mở và chặn quét bot tự động.
 * Giải pháp: Tạo Deep Search Link tự động kích hoạt bộ lọc "Bài đăng mới nhất" (Recent Posts)
 * trong các hội nhóm công nghệ lớn và uy tín nhất Việt Nam.
 */

// Danh sách các Hội Nhóm công nghệ uy tín nhất Việt Nam
export const VETTED_FACEBOOK_GROUPS = [
  // --- NHÓM LINH KIỆN PC & VGA ---
  {
    id: "cho-vga-pc",
    name: "Chợ VGA & linh kiện máy tính cũ",
    members: "480.000+ thành viên",
    category: "pc",
    groupId: "chovgapc",
    fbUrl: "https://www.facebook.com/groups/chovgapc/",
    description: "Nhóm giao dịch card màn hình, CPU, mainboard và đồ máy tính lớn nhất VN."
  },
  {
    id: "vietnam-gaming-drama",
    name: "Vietnam Gaming Show – Chợ đồ chơi PC",
    members: "320.000+ thành viên",
    category: "pc",
    groupId: "vietnamgamingshow",
    fbUrl: "https://www.facebook.com/groups/vietnamgamingshow/",
    description: "Nhiều kèo thanh lý dàn máy gaming, card đồ họa bóc máy giá hời."
  },
  {
    id: "cho-voz-fb",
    name: "Chợ VoZ – Mua bán đồ công nghệ Facebook",
    members: "250.000+ thành viên",
    category: "pc",
    groupId: "chovozfb",
    fbUrl: "https://www.facebook.com/groups/chovozfb/",
    description: "Cộng đồng VoZer chuyển sang giao dịch trên Facebook, nhiều linh kiện độc lạ."
  },

  // --- NHÓM ĐIỆN THOẠI & IPHONE ---
  {
    id: "cho-iphone-cu",
    name: "Hội mua bán iPhone cũ Hà Nội & TP.HCM",
    members: "390.000+ thành viên",
    category: "phone",
    groupId: "muabaniphonehanoi.tphcm",
    fbUrl: "https://www.facebook.com/groups/muabaniphonehanoi.tphcm/",
    description: "Chuyên điện thoại iPhone trao tay giữa người dùng, kiểm tra tại chỗ."
  },
  {
    id: "cho-smartphone-cu",
    name: "Chợ smartphone cũ & like new toàn quốc",
    members: "210.000+ thành viên",
    category: "phone",
    groupId: "chosmartphonecu",
    fbUrl: "https://www.facebook.com/groups/chosmartphonecu/",
    description: "Giao dịch điện thoại Samsung, Xiaomi, Pixel, iPhone người dùng lên đời."
  },

  // --- NHÓM LAPTOP & THINKPAD & MACBOOK ---
  {
    id: "hoi-thinkpad-vn",
    name: "Hội ThinkPad & laptop doanh nhân Việt Nam",
    members: "140.000+ thành viên",
    category: "laptop",
    groupId: "thinkpadvietnam",
    fbUrl: "https://www.facebook.com/groups/thinkpadvietnam/",
    description: "Hội chuyên trao đổi ThinkPad T14, X1 Carbon, Dell Latitude, HP xách tay Mỹ."
  },
  {
    id: "cho-macbook-cu",
    name: "Chợ mua bán MacBook cũ giá tốt",
    members: "180.000+ thành viên",
    category: "laptop",
    groupId: "chomacbookvietnam",
    fbUrl: "https://www.facebook.com/groups/chomacbookvietnam/",
    description: "Chuyên MacBook Air, Pro M1, M2, M3 người dùng văn phòng thanh lý."
  }
];

/**
 * Tạo link tìm kiếm sâu (Deep Search) trực tiếp vào nhóm Facebook
 * Kèm bộ lọc bắt buộc: "Bài đăng gần đây nhất" (Recent Posts)
 */
export function generateFacebookGroupSearchUrl(groupUrlOrId, query = "") {
  if (!query) {
    return groupUrlOrId.startsWith("http") ? groupUrlOrId : `https://www.facebook.com/groups/${groupUrlOrId}/`;
  }

  // Base group url
  const base = groupUrlOrId.startsWith("http") ? groupUrlOrId.replace(/\/$/, '') : `https://www.facebook.com/groups/${groupUrlOrId}`;
  
  // Facebook Filter Param mã hóa base64 cho "recent_posts"
  // Chuỗi: {"recent_posts:0":"{\"name\":\"recent_posts\",\"args\":\"\"}"}
  const recentFilterParam = "eyJyZWNlbnRfcG9zdHM6MCI6IntcIm5hbWVcIjpcInJlY2VudF9wb3N0c1wiLFwiYXJndXNcIjpcIlwifSJ9";

  return `${base}/search/?q=${encodeURIComponent(query)}&filters=${recentFilterParam}`;
}

/**
 * Trả về danh sách các link tìm kiếm nhanh vào từng nhóm theo từ khóa
 */
export function getGroupSearchShortcuts(query = "", category = "all") {
  const cleanQ = (query || "").trim();
  let groups = VETTED_FACEBOOK_GROUPS;

  if (category && category !== "all") {
    groups = groups.filter(g => g.category === category || g.category === "all");
  }

  return groups.map(g => ({
    id: g.id,
    name: g.name,
    members: g.members,
    category: g.category,
    description: g.description,
    searchUrl: generateFacebookGroupSearchUrl(g.fbUrl, cleanQ),
    query: cleanQ
  }));
}
