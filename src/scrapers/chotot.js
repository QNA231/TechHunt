/**
 * Chợ Tốt Scraper Adapter
 * Tận dụng Gateway Public API chính thức của Chợ Tốt (trả về JSON cấu trúc chuẩn 100% THỰC TẾ)
 */

export async function searchChoTot(query = "", options = {}) {
  const { limit = 30, category = "all", region = "all" } = options;

  // Bản đồ mã danh mục Chợ Tốt
  const CATEGORY_MAP = {
    all: 5000,     // Đồ điện tử tổng quát
    phone: 5010,   // Điện thoại
    laptop: 5020,  // Laptop, máy tính bảng
    pc: 5030       // Máy tính để bàn, linh kiện PC
  };

  // Bản đồ mã vùng Chợ Tốt
  const REGION_MAP = {
    "hà nội": 12000,
    "hn": 12000,
    "hồ chí minh": 13000,
    "tp.hcm": 13000,
    "tphcm": 13000,
    "đà nẵng": 10000
  };

  const cg = CATEGORY_MAP[category] || 5000;
  
  // Quan trọng: Nếu không có từ khóa (query rỗng), KHÔNG truyền tham số q= để Chợ Tốt trả về các tin mới nhất thực tế
  let url = `https://gateway.chotot.com/v1/public/ad-listing?limit=${limit}`;

  const cleanQuery = (query || "").trim();
  if (cleanQuery) {
    url += `&q=${encodeURIComponent(cleanQuery)}`;
    // Khi có từ khóa tìm kiếm, chỉ áp dụng cg nếu người dùng chọn rõ danh mục (phone, laptop, pc)
    if (category !== "all") {
      url += `&cg=${cg}`;
    }
  } else {
    // Khi không có từ khóa, giới hạn trong danh mục đồ điện tử
    url += `&cg=${cg}`;
  }

  if (region && region !== "all") {
    const regCode = REGION_MAP[region.toLowerCase()];
    if (regCode) {
      url += `&region_v2=${regCode}`;
    }
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000); // 7s timeout

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
        "Referer": "https://www.chotot.com/"
      }
    });

    clearTimeout(timeout);

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    const ads = data.ads || [];

    return ads.map(ad => {
      // Xác định link ảnh thực tế
      const realImage = ad.image || (ad.images && ad.images[0]) || ad.thumbnail_image || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80";

      // Link bài đăng thực tế 100% trên Chợ Tốt (hệ thống Chợ Tốt sẽ tự 301 chuyển tiếp vào link chi tiết của tin)
      const realUrl = `https://www.chotot.com/${ad.list_id}.htm`;

      return {
        id: `ct-${ad.list_id}`,
        listId: ad.list_id,
        title: ad.subject || "Không có tiêu đề",
        price: Number(ad.price) || 0,
        source: "Chợ Tốt",
        sourceBadge: "chotot",
        url: realUrl,
        image: realImage,
        location: `${ad.area_name ? ad.area_name + ', ' : ''}${ad.region_name || 'Toàn quốc'}`,
        postedTime: ad.list_time || (ad.date ? new Date(ad.date).getTime() : Date.now()),
        sellerName: ad.account_name || "Người bán Chợ Tốt",
        isShop: !!(ad.company_ad || ad.shop_id),
        category: category === "all" ? guessCategory(ad.subject) : category,
        condition: ad.elt_condition || ad.condition_ad_name || "Đã qua sử dụng",
        description: ad.body || ""
      };
    });
  } catch (err) {
    console.error("Lỗi cào Chợ Tốt live:", err.message);
    return [];
  }
}

function guessCategory(title = "") {
  const t = (title || "").toLowerCase();
  if (t.includes("iphone") || t.includes("samsung") || t.includes("xiaomi") || t.includes("oppo") || t.includes("điện thoại")) return "phone";
  if (t.includes("laptop") || t.includes("thinkpad") || t.includes("macbook") || t.includes("dell xps") || t.includes("ipad")) return "laptop";
  return "pc";
}
