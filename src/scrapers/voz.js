/**
 * VoZ f68 Scraper Adapter (Đã nâng cấp bộ lọc thời gian nghiêm ngặt)
 * Chỉ giữ lại các bài đăng mới trong vòng 7 - 14 ngày, loại bỏ hoàn toàn các tin cũ từ nhiều năm trước
 */

export async function searchVoz(query = "", options = {}) {
  const url = `https://voz.vn/f/khu-thuong-mai.68/index.rss`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8"
      }
    });

    clearTimeout(timeout);
    if (!res.ok) return [];

    const xml = await res.text();
    return parseVozRss(xml, query);
  } catch (err) {
    return [];
  }
}

/**
 * Trích xuất danh sách bài đăng từ RSS feed của VoZ f68
 */
function parseVozRss(xml, query = "") {
  const results = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  const cleanQ = (query || "").toLowerCase().trim();

  // Giới hạn thời gian: Chỉ lấy các bài viết trong vòng 14 ngày gần nhất
  const MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;
  const now = Date.now();

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];

    // Lấy thời gian đăng bài
    const dateMatch = /<pubDate>([\s\S]*?)<\/pubDate>/i.exec(block);
    let postedTime = now;
    if (dateMatch) {
      const parsedDate = new Date(dateMatch[1]).getTime();
      if (!isNaN(parsedDate)) {
        postedTime = parsedDate;
      }
    }

    // LỌC THỜI GIAN: Bỏ qua hoàn toàn bài cũ quá 14 ngày
    if (now - postedTime > MAX_AGE_MS) {
      continue;
    }

    // Lấy tiêu đề
    const titleMatch = /<title>([\s\S]*?)<\/title>/i.exec(block);
    if (!titleMatch) continue;
    const title = titleMatch[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();

    // Bỏ qua các thread ghim / quy định / thông báo cũ
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes("nội quy") || lowerTitle.includes("chú ý") || lowerTitle.includes("thông báo box")) {
      continue;
    }

    // Lấy link
    const linkMatch = /<link>([\s\S]*?)<\/link>/i.exec(block);
    if (!linkMatch) continue;
    const rawLink = linkMatch[1].replace(/&amp;/g, '&').split('?')[0];

    // Lấy tác giả
    const authorMatch = /<author>[^<]*\(([^)]*)\)<\/author>/i.exec(block) || /<dc:creator>([\s\S]*?)<\/dc:creator>/i.exec(block);
    const sellerName = authorMatch ? authorMatch[1].trim() : "Thành viên VoZ";

    // Lấy mô tả tóm tắt
    const descMatch = /<description>([\s\S]*?)<\/description>/i.exec(block) || /<content:encoded>([\s\S]*?)<\/content:encoded>/i.exec(block);
    const rawDesc = descMatch ? descMatch[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/<[^>]+>/g, '').trim() : "";

    // Lọc theo từ khóa nếu có
    if (cleanQ) {
      const fullSearchText = `${title} ${rawDesc}`.toLowerCase();
      const words = cleanQ.split(/\s+/);
      const matchesAll = words.every(w => fullSearchText.includes(w));
      if (!matchesAll) continue;
    }

    // Bóc tách giá từ tiêu đề hoặc mô tả
    const price = extractPriceFromText(title) || extractPriceFromText(rawDesc.slice(0, 150));

    // Bóc tách địa điểm ([HN], [SG], [ĐN])
    const location = extractLocationFromText(title);

    // Lấy ID bài
    const idMatch = /t\/.*?\.(\d+)/.exec(rawLink);
    const id = idMatch ? `voz-${idMatch[1]}` : `voz-${Math.random().toString(36).substring(7)}`;

    results.push({
      id,
      title,
      price: price || 0,
      source: "VoZ f68",
      sourceBadge: "voz",
      url: rawLink,
      image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=600&q=80",
      location,
      postedTime,
      sellerName: `${sellerName} (VoZer)`,
      isShop: false,
      category: "pc",
      condition: "Đã qua sử dụng",
      description: rawDesc ? rawDesc.slice(0, 150) + "..." : "Tin đăng mới trong khu thương mại máy tính VoZ f68."
    });

    if (results.length >= 15) break;
  }

  return results;
}

function extractPriceFromText(text) {
  if (!text) return 0;
  const t = text.toLowerCase();
  
  const kMatch = /(\d{1,3}(?:[\.,]\d{3})*|\d+)\s*k\b/i.exec(t);
  if (kMatch) {
    const clean = kMatch[1].replace(/[\.,]/g, '');
    const val = parseInt(clean, 10);
    if (val > 0) return val * 1000;
  }

  const trMatch = /(\d+[\.,]?\d*)\s*(tr|triệu)/i.exec(t);
  if (trMatch) {
    const val = parseFloat(trMatch[1].replace(',', '.'));
    if (val > 0) return Math.round(val * 1000000);
  }

  const fullMatch = /(\d{1,3}(?:[\.,]\d{3})+)\s*(?:đ|vnd)?/i.exec(t);
  if (fullMatch) {
    const clean = fullMatch[1].replace(/[\.,]/g, '');
    const val = parseInt(clean, 10);
    if (val > 0) return val;
  }

  return 0;
}

function extractLocationFromText(text) {
  const t = (text || "").toLowerCase();
  if (t.includes("[hn]") || t.includes("hà nội") || t.includes("hn/")) return "Hà Nội";
  if (t.includes("[sg]") || t.includes("[hcm]") || t.includes("hồ chí minh") || t.includes("sài gòn")) return "TP.HCM";
  if (t.includes("[đn]") || t.includes("đà nẵng")) return "Đà Nẵng";
  return "Toàn quốc";
}
