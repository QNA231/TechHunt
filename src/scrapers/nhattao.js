/**
 * Nhật Tảo Scraper Adapter
 * Diễn đàn công nghệ và mua bán đồ cũ uy tín tại Việt Nam
 * Hỗ trợ bóc tách giá đa nguồn: thẻ HTML, thuộc tính data-price, tiêu đề và nội dung bài viết
 */

export async function searchNhatTao(query = "", options = {}) {
  const cleanQ = (query || "").trim();
  // Bỏ &type=post để tìm kiếm cả chủ đề rao vặt (classified threads) có chứa trường giá
  const url = cleanQ
    ? `https://nhattao.com/search/search?keywords=${encodeURIComponent(cleanQ)}`
    : `https://nhattao.com/?tab=recent`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
      }
    });

    clearTimeout(timeout);
    if (!res.ok) return [];

    const html = await res.text();
    return parseNhatTaoHtml(html, cleanQ);
  } catch (err) {
    return [];
  }
}

function parseNhatTaoHtml(html, query = "") {
  const results = [];
  const itemRegex = /<li[^>]*class="[^"]*searchResult[^"]*"[^>]*>([\s\S]*?)<\/li>/gi;
  let match;

  while ((match = itemRegex.exec(html)) !== null) {
    const block = match[1];

    // Lấy link và tiêu đề
    const titleMatch = /<h3[^>]*class="title"[^>]*>[\s\S]*?<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/i.exec(block);
    if (!titleMatch) continue;

    const relUrl = titleMatch[1];
    const title = titleMatch[2].replace(/<[^>]+>/g, '').trim();

    // Lấy snippet mô tả
    const snippetMatch = /<blockquote[^>]*class="snippet"[^>]*>([\s\S]*?)<\/blockquote>/i.exec(block);
    const snippet = snippetMatch ? snippetMatch[1].replace(/<[^>]+>/g, '').trim() : "";

    // === BÓC TÁCH GIÁ BÁN TOÀN DIỆN ===
    let price = 0;

    // 1. Quét các thẻ HTML chứa class liên quan tới giá tiền trên Nhật Tảo (price, itemPrice, nhattao-price,...)
    const priceHtmlMatch = /<(?:span|div|b|strong|p)[^>]*class="[^"]*(?:price|itemPrice|threadPrice|nhattao-price|nhattao_item_price|cost|gia)[^"]*"[^>]*>([\s\S]*?)<\/(?:span|div|b|strong|p)>/i.exec(block);
    if (priceHtmlMatch) {
      const cleanDigits = priceHtmlMatch[1].replace(/[^\d]/g, '');
      if (cleanDigits) price = parseInt(cleanDigits, 10) || 0;
    }

    // 2. Kiểm tra thuộc tính data-price
    if (!price || price === 0) {
      const dataPriceMatch = /data-price="([^"]+)"/i.exec(block);
      if (dataPriceMatch) {
        const cleanDigits = dataPriceMatch[1].replace(/[^\d]/g, '');
        if (cleanDigits) price = parseInt(cleanDigits, 10) || 0;
      }
    }

    // 3. Nếu chưa có giá, trích xuất thông minh từ tiêu đề
    if (!price || price === 0) {
      price = extractPriceFromText(title);
    }

    // 4. Nếu tiêu đề không có giá, quét trích xuất giá từ đoạn trích mô tả (snippet)
    if (!price || price === 0) {
      price = extractPriceFromText(snippet);
    }

    // 5. Nếu vẫn chưa có, quét toàn bộ văn bản của khối (bao gồm các span/meta)
    if (!price || price === 0) {
      const blockCleanText = block.replace(/<[^>]+>/g, ' ');
      const priceContextMatch = /(?:giá|gia|bán\s*giá|pass\s*giá|tl\s*giá|mức\s*giá)[\s:]*([0-9\.,]+(?:\s*(?:k|tr|triệu|đ|vnd|củ|m|đồng))?)/i.exec(blockCleanText);
      if (priceContextMatch) {
        price = extractPriceFromText(priceContextMatch[1]) || extractPriceFromText(priceContextMatch[0]);
      }
    }

    // Lấy tác giả người đăng
    const authorMatch = /data-author="([^"]*)"/i.exec(block) || /class="username"[^>]*>([^<]*)</i.exec(block);
    const sellerName = authorMatch ? authorMatch[1].trim() : "Thành viên Nhật Tảo";

    // Lấy ảnh & làm sạch URL
    const imgMatch = /<img[^>]*src="([^"]*)"/i.exec(block);
    const rawImg = imgMatch ? imgMatch[1] : null;
    const image = cleanNhatTaoImageUrl(rawImg);

    // Phân tích khu vực
    const location = extractLocationFromText(title + " " + snippet);

    results.push({
      id: `nt-${Math.random().toString(36).substring(7)}`,
      title,
      price: price || 0,
      source: "Nhật Tảo",
      sourceBadge: "nhattao",
      url: relUrl.startsWith("http") ? relUrl : `https://nhattao.com/${relUrl.replace(/^\//, '')}`,
      image,
      location,
      postedTime: Date.now() - 1000 * 60 * (30 + Math.floor(Math.random() * 180)),
      sellerName,
      isShop: false,
      category: guessCategory(title),
      condition: "Đã qua sử dụng",
      description: snippet || "Tin rao trên diễn đàn công nghệ Nhật Tảo."
    });

    if (results.length >= 20) break;
  }

  return results;
}

/**
 * Trích xuất giá tiền thông minh từ mọi định dạng tiếng Việt:
 * VD: 16.800k, 4tr5, 4.5tr, 4 triệu 5, 4 củ, 4m5, 4.500.000đ
 */
function extractPriceFromText(text = "") {
  if (!text) return 0;
  const t = text.toLowerCase();

  // Dạng "4tr5", "4 củ 5", "4m5" (4 triệu 500 nghìn)
  const splitUnitMatch = /(\d+)\s*(?:tr|triệu|trieu|củ|cu|m)\s*(\d+)/i.exec(t);
  if (splitUnitMatch) {
    const main = parseInt(splitUnitMatch[1], 10);
    const sub = parseInt(splitUnitMatch[2], 10);
    if (main > 0) {
      const subMultiplier = sub < 10 ? 100000 : (sub < 100 ? 10000 : 1000);
      return main * 1000000 + sub * subMultiplier;
    }
  }

  // Dạng "4.5tr", "4.5 triệu", "4.5 củ", "4.5m", "4,5tr"
  const trDecimalMatch = /(\d+[\.,]\d+)\s*(?:tr|triệu|trieu|củ|cu|m|dong|đồng)\b/i.exec(t);
  if (trDecimalMatch) {
    const val = parseFloat(trDecimalMatch[1].replace(',', '.'));
    if (val > 0) return Math.round(val * 1000000);
  }

  // Dạng "4tr", "4 triệu", "4 củ", "4m"
  const trSingleMatch = /(\d+)\s*(?:tr|triệu|trieu|củ|cu|m)\b/i.exec(t);
  if (trSingleMatch) {
    const val = parseInt(trSingleMatch[1], 10);
    if (val > 0 && val < 500) return val * 1000000;
  }

  // Dạng "16.800k", "4500k", "500k"
  const kMatch = /(\d{1,3}(?:[\.,]\d{3})*|\d+)\s*k\b/i.exec(t);
  if (kMatch) {
    const clean = kMatch[1].replace(/[\.,]/g, '');
    const val = parseInt(clean, 10);
    if (val > 0) return val * 1000;
  }

  // Dạng đầy đủ "4.500.000", "4,500,000", "4500000đ"
  const fullMatch = /(\d{1,3}(?:[\.,]\d{3})+)\s*(?:đ|vnd|dong)?/i.exec(t);
  if (fullMatch) {
    const clean = fullMatch[1].replace(/[\.,]/g, '');
    const val = parseInt(clean, 10);
    if (val >= 10000) return val;
  }

  return 0;
}

function extractLocationFromText(text = "") {
  const t = text.toLowerCase();
  if (t.includes("[hn]") || t.includes("hà nội") || t.includes("hn/")) return "Hà Nội";
  if (t.includes("[sg]") || t.includes("[hcm]") || t.includes("hồ chí minh") || t.includes("sài gòn")) return "TP.HCM";
  if (t.includes("[đn]") || t.includes("đà nẵng")) return "Đà Nẵng";
  return "Toàn quốc";
}

function guessCategory(title = "") {
  const t = (title || "").toLowerCase();
  if (t.includes("iphone") || t.includes("samsung") || t.includes("xiaomi") || t.includes("oppo") || t.includes("điện thoại")) return "phone";
  if (t.includes("laptop") || t.includes("thinkpad") || t.includes("macbook") || t.includes("dell xps") || t.includes("ipad")) return "laptop";
  return "pc";
}

/**
 * Giải mã và làm sạch URL ảnh từ Nhật Tảo, loại bỏ thumbnail.php wrapper
 */
function cleanNhatTaoImageUrl(raw) {
  const defaultFallback = "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80";
  if (!raw) return defaultFallback;

  let url = raw.replace(/&amp;/g, '&').trim();

  // Bóc tách URL gốc từ wrapper thumbnail.php?url=...
  if (url.includes("thumbnail.php?url=")) {
    try {
      const match = /[?&]url=([^&]+)/i.exec(url);
      if (match && match[1]) {
        url = decodeURIComponent(match[1]);
      }
    } catch {
      // bỏ qua nếu lỗi giải mã
    }
  }

  // Chuẩn hóa giao thức và đường dẫn
  if (url.startsWith("//")) {
    url = "https:" + url;
  } else if (url.startsWith("/")) {
    url = "https://nhattao.com" + url;
  } else if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://nhattao.com/" + url;
  }

  // Lọc bỏ icon diễn đàn không phải ảnh sản phẩm
  if (
    url.includes("/styles/") || 
    url.includes("burger.png") || 
    url.includes("guest.png") || 
    url.includes("logo_mobile.png") ||
    url.includes("write.png")
  ) {
    return defaultFallback;
  }

  return url;
}
