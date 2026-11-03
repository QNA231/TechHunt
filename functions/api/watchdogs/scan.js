import { searchChoTot } from "../../../src/scrapers/chotot.js";
import { formatVND } from "../../../src/services/analyzer.js";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json; charset=UTF-8"
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequest(context) {
  try {
    let watchdogsToScan = [];

    // Nếu người dùng gửi kèm danh sách watchdogs trong body POST
    if (context.request.method === "POST") {
      const body = await context.request.json().catch(() => ({}));
      if (Array.isArray(body.watchdogs)) {
        watchdogsToScan = body.watchdogs;
      }
    }

    // Hoặc lấy từ Cloudflare KV nếu có
    if (watchdogsToScan.length === 0 && context.env?.WATCHDOGS_KV) {
      const stored = await context.env.WATCHDOGS_KV.get("watchdogs_list");
      watchdogsToScan = stored ? JSON.parse(stored) : [];
    }

    // Chỉ quét các mục đang bật và có cấu hình Telegram
    const activeList = watchdogsToScan.filter(w => w.enabled && w.telegramBotToken && w.telegramChatId);
    let totalAlerts = 0;
    const scanReports = [];

    for (const wd of activeList) {
      try {
        const rawAds = await searchChoTot(wd.keyword, {
          category: wd.category || "all",
          region: wd.region || "all",
          limit: 15
        });

        const seenSet = new Set(wd.seenIds || []);
        const matchingDeals = rawAds.filter(item => {
          if (seenSet.has(item.id)) return false;
          if (wd.maxPrice > 0 && item.price > wd.maxPrice) return false;
          return true;
        });

        for (const deal of matchingDeals.slice(0, 3)) {
          const msg = `🎯 <b>[TechHunt] Phát hiện kèo mới!</b>\n\n` +
            `📱 <b>${deal.title}</b>\n` +
            `💰 <b>Giá:</b> <code>${formatVND(deal.price)}</code>\n` +
            `📍 <b>Nơi bán:</b> ${deal.location}\n` +
            `🔗 <a href="${deal.url}">Xem chi tiết bài đăng</a>\n\n` +
            `<i>Tìm kiếm tự động bởi TechHunt 24/7</i>`;

          const tgRes = await fetch(`https://api.telegram.org/bot${wd.telegramBotToken}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: wd.telegramChatId,
              text: msg,
              parse_mode: "HTML"
            })
          });

          if (tgRes.ok) {
            totalAlerts++;
            wd.seenIds = wd.seenIds || [];
            wd.seenIds.push(deal.id);
            if (wd.seenIds.length > 50) wd.seenIds.shift();
          }
        }

        wd.lastChecked = Date.now();
        wd.alertCount = (wd.alertCount || 0) + matchingDeals.length;
        scanReports.push({ keyword: wd.keyword, matches: matchingDeals.length });
      } catch (e) {
        scanReports.push({ keyword: wd.keyword, error: e.message });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      scannedCount: activeList.length,
      alertsSent: totalAlerts,
      reports: scanReports,
      timestamp: Date.now()
    }), {
      status: 200,
      headers: CORS_HEADERS
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: CORS_HEADERS
    });
  }
}
