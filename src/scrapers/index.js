import { searchChoTot } from "./chotot.js";
import { searchNhatTao } from "./nhattao.js";
import { searchRetail } from "./retail.js";
import { filterItems } from "../services/filter.js";
import { analyzePrices } from "../services/analyzer.js";
import { extractAndVerifyIdentifiers } from "../services/hardwareVerifier.js";

/**
 * Bộ điều phối tìm kiếm đa nguồn song song (Chợ Tốt, Nhật Tảo, Hệ thống Bán Lẻ/Máy Cũ)
 */
export async function aggregateSearch(query = "", options = {}) {
  const startTime = Date.now();
  
  // Chạy các adapter song song lấy dữ liệu thực tế (đã loại bỏ VoZ theo yêu cầu)
  const promises = [
    searchChoTot(query, options).catch(() => []),
    searchNhatTao(query, options).catch(() => []),
    searchRetail(query, options).catch(() => [])
  ];

  const results = await Promise.allSettled(promises);
  
  let allItems = [];
  for (const r of results) {
    if (r.status === "fulfilled" && Array.isArray(r.value)) {
      allItems.push(...r.value);
    }
  }

  // Tự động kiểm tra và xác thực mã phần cứng (IMEI, Serial, Service Tag) cho từng bài đăng thực tế
  allItems = allItems.map(item => {
    const textToCheck = `${item.title || ''} ${item.description || ''}`;
    const verifications = extractAndVerifyIdentifiers(textToCheck);
    const hasFakeId = verifications.some(v => v.isScam || !v.isValid);
    return {
      ...item,
      hardwareVerifications: verifications,
      hasFakeHardwareId: hasFakeId
    };
  });

  // 1. Áp dụng bộ lọc chất lượng và tiêu chí (loại tin rác, giá ảo, máy xác)
  const filteredItems = filterItems(allItems, options);

  // 2. Phân tích khoảng giá & đánh giá mức độ hời
  const analyzed = analyzePrices(filteredItems);

  // 3. Sắp xếp kết quả theo yêu cầu (sortBy)
  const sortBy = options.sortBy || "deal";
  
  analyzed.items.sort((a, b) => {
    if (sortBy === "price_asc") {
      return (Number(a.price) || 0) - (Number(b.price) || 0);
    }
    if (sortBy === "price_desc") {
      return (Number(b.price) || 0) - (Number(a.price) || 0);
    }
    if (sortBy === "newest") {
      return (b.postedTime || 0) - (a.postedTime || 0);
    }
    
    // Mặc định: Ưu tiên KÈO THƠM lên đầu tiên
    const getDealPriority = (item) => {
      if (item.dealRating?.level === "super_deal") return 4;
      if (item.dealRating?.level === "good_deal") return 3;
      if (item.dealRating?.level === "fair") return 2;
      return 1;
    };

    const diffPriority = getDealPriority(b) - getDealPriority(a);
    if (diffPriority !== 0) return diffPriority;
    
    return (a.dealRating?.diffPercent || 0) - (b.dealRating?.diffPercent || 0);
  });

  const durationMs = Date.now() - startTime;

  return {
    query,
    durationMs,
    stats: analyzed.stats,
    items: analyzed.items
  };
}
