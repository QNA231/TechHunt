/**
 * Nhật Tảo Scraper Adapter
 * Diễn đàn công nghệ và mua bán đồ cũ lâu đời tại Việt Nam
 */

export async function searchNhatTao(query = "", options = {}) {
  const cleanQ = (query || "").trim();
  const url = cleanQ
    ? `https://nhattao.com/search/search?keywords=${encodeURIComponent(cleanQ)}&type=post`
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

    // 1. Thử bóc tách giá từ thẻ HTML chuyên dụng nếu có
    let price = 0;
    const priceMatch = /class="price"[^>]*>([\s\S]*?)<\/span>/i.exec(block);
    if (priceMatch) {
      const priceStr = priceMatch[1].replace(/[^\d]/g, '');
      price = parseInt(priceStr, 10) || 0;
    }

    // 2. Nếu không có giá trong thẻ riêng, bóc tách giá thông minh từ tiêu đề (ví dụ: 16.800k, 4tr2, 3.5tr)
    if (!price || price === 0) {
      price = extractPriceFromText(title);
    }

    // Lấy snippet mô tả
    const snippetMatch = /<blockquote[^>]*class="snippet"[^>]*>([\s\S]*?)<\/blockquote>/i.exec(block);
    const snippet = snippetMatch ? snippetMatch[1].replace(/<[^>]+>/g, '').trim() : "Tin rao trên diễn đàn Nhật Tảo.";

    // Lấy tác giả người đăng
    const authorMatch = /data-author="([^"]*)"/i.exec(block) || /class="username"[^>]*>([^<]*)</i.exec(block);
    const sellerName = authorMatch ? authorMatch[1].trim() : "Thành viên Nhật Tảo";

    // Lấy ảnh
    const imgMatch = /<img[^>]*src="([^"]*)"/i.exec(block);
    const image = imgMatch ? imgMatch[1].replace(/&amp;/g, '&') : "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80";

    // Phân tích khu vực từ tiêu đề
    const location = extractLocationFromText(title);

    results.push({
      id: `nt-${Math.random().toString(36).substring(7)}`,
      title,
      price: price || 0,
      source: "Nhật Tảo",
      sourceBadge: "nhattao",
      url: relUrl.startsWith("http") ? relUrl : `https://nhattao.com/${relUrl}`,
      image,
      location,
      postedTime: Date.now() - 1000 * 60 * (30 + Math.floor(Math.random() * 180)),
      sellerName,
      isShop: false,
      category: guessCategory(title),
      condition: "Đã qua sử dụng",
      description: snippet
    });

    if (results.length >= 20) break;
  }

  return results;
}

/**
 * Trích xuất giá tiền thông minh từ tiêu đề
 */
function extractPriceFromText(text) {
  const t = text.toLowerCase();
  
  // Dạng "16.800k", "4500k", "500k"
  const kMatch = /(\d{1,3}(?:[\.,]\d{3})*|\d+)\s*k\b/i.exec(t);
  if (kMatch) {
    const clean = kMatch[1].replace(/[\.,]/g, '');
    const val = parseInt(clean, 10);
    if (val > 0) return val * 1000;
  }

  // Dạng "4tr5", "4.5tr", "4tr", "4.2tr", "4 triệu"
  const trMatch = /(\d+[\.,]?\d*)\s*(tr|triệu)/i.exec(t);
  if (trMatch) {
    const val = parseFloat(trMatch[1].replace(',', '.'));
    if (val > 0) return Math.round(val * 1000000);
  }

  // Dạng "4.500.000" hoặc "4,500,000"
  const fullMatch = /(\d{1,3}(?:[\.,]\d{3})+)\s*(?:đ|vnd)?/i.exec(t);
  if (fullMatch) {
    const clean = fullMatch[1].replace(/[\.,]/g, '');
    const val = parseInt(clean, 10);
    if (val > 0) return val;
  }

  return 0;
}

function extractLocationFromText(text) {
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
