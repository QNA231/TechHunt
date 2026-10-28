/**
 * Bộ lọc thông minh: Loại bỏ tin rác, giá ảo, máy lỗi/xác và lọc theo yêu cầu
 */

// Danh sách từ khóa cảnh báo hàng lỗi / máy xác / dính tài khoản
export const NEGATIVE_KEYWORDS = [
  "xác",
  "bán xác",
  "chết nguồn",
  "không lên nguồn",
  "icloud",
  "bpass",
  "bypass",
  "dính tài khoản",
  "màn sọc",
  "sọc màn",
  "chảy mực",
  "đốm màn",
  "mất face",
  "mất faceid",
  "không nhận sim",
  "máy lock",
  "lock sim ghép",
  "lỗi vram",
  "rác",
  "cháy nổ",
  "hư màn",
  "hỏng màn",
  "vỡ nát",
  "không lên hình",
  "chạy tắt"
];

// Từ khóa báo giá ảo trả góp hoặc linh kiện mập mờ
export const FAKE_PRICE_KEYWORDS = [
  "trả góp",
  "góp 0%",
  "trả trước 0đ",
  "chỉ cần trả trước",
  "hỗ trợ góp"
];

/**
 * Kiểm tra xem một tin có dấu hiệu là hàng lỗi / máy xác hay không
 */
export function isDamagedOrScam(item) {
  const text = `${item.title || ''} ${item.description || ''}`.toLowerCase();
  
  // Kiểm tra từ khóa tiêu cực
  for (const kw of NEGATIVE_KEYWORDS) {
    // So khớp từ hoàn chỉnh hoặc cụm từ
    const regex = new RegExp(`\\b${kw}\\b`, 'i');
    if (regex.test(text) || text.includes(kw)) {
      return { isScam: true, reason: `Chứa từ khóa máy lỗi/xác: "${kw}"` };
    }
  }

  // Giá quá rẻ bất thường (dưới 50k VNĐ thường là giá ảo hoặc bán phụ kiện linh tinh)
  if (item.price && item.price > 0 && item.price < 50000) {
    return { isScam: true, reason: "Giá ảo dưới 50.000đ (thường là báo giá giả)" };
  }

  // Kiểm tra giá trả góp trá hình
  for (const fp of FAKE_PRICE_KEYWORDS) {
    if (text.includes(fp) && item.price < 2000000) {
      return { isScam: true, reason: `Giá quảng cáo trả góp: "${fp}"` };
    }
  }

  // Kiểm tra nếu sản phẩm có mã IMEI/Serial bị phát hiện là giả/nhân bản
  if (item.hasFakeHardwareId) {
    return { isScam: true, reason: "Phát hiện mã IMEI/Serial giả hoặc sai chuẩn thuật toán Luhn" };
  }

  return { isScam: false, reason: null };
}

/**
 * Lọc và làm sạch danh sách sản phẩm theo bộ tiêu chí người dùng đặt
 */
export function filterItems(items, options = {}) {
  const {
    hideScam = true,
    userOnly = false,
    minPrice = 0,
    maxPrice = Infinity,
    region = "all",
    sources = []
  } = options;

  return items.filter(item => {
    // 1. Lọc nguồn dữ liệu
    if (sources && sources.length > 0 && !sources.includes(item.sourceBadge) && !sources.includes(item.source)) {
      return false;
    }

    // 2. Lọc tin rác / máy lỗi / giá ảo nếu bật tùy chọn hideScam
    if (hideScam) {
      const check = isDamagedOrScam(item);
      if (check.isScam) return false;
    }

    // 3. Lọc chỉ người dùng cá nhân (loại bớt thợ buôn / tiệm)
    if (userOnly && item.isShop) {
      return false;
    }

    // 4. Lọc khoảng giá
    const price = Number(item.price) || 0;
    if (minPrice && price < Number(minPrice)) return false;
    if (maxPrice && maxPrice < Infinity && price > Number(maxPrice)) return false;

    // 5. Lọc khu vực
    if (region && region !== "all") {
      const loc = (item.location || "").toLowerCase();
      const targetRegion = region.toLowerCase();
      if (!loc.includes(targetRegion)) {
        // Hỗ trợ alias khu vực
        if (targetRegion.includes("hà nội") && !loc.includes("hn") && !loc.includes("hà nội")) return false;
        if (targetRegion.includes("hồ chí minh") && !loc.includes("tphcm") && !loc.includes("hcm") && !loc.includes("sài gòn")) return false;
      }
    }

    return true;
  });
}
