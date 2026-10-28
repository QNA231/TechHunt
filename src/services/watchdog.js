import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { aggregateSearch } from "../scrapers/index.js";
import { formatVND } from "./analyzer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "../../data");
const WATCHDOG_FILE = path.join(DATA_DIR, "watchdogs.json");

// Đảm bảo thư mục lưu trữ data tồn tại
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.access(WATCHDOG_FILE);
    } catch {
      await fs.writeFile(WATCHDOG_FILE, JSON.stringify([], null, 2), "utf8");
    }
  } catch (err) {
    // ignore
  }
}

export async function getWatchdogs() {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(WATCHDOG_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function saveWatchdogs(list) {
  await ensureDataDir();
  await fs.writeFile(WATCHDOG_FILE, JSON.stringify(list, null, 2), "utf8");
}

export async function addWatchdog(data) {
  const list = await getWatchdogs();
  const newWatchdog = {
    id: `wd-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    keyword: data.keyword.trim(),
    maxPrice: Number(data.maxPrice) || 0,
    category: data.category || "all",
    region: data.region || "all",
    telegramBotToken: data.telegramBotToken?.trim() || "",
    telegramChatId: data.telegramChatId?.trim() || "",
    enabled: true,
    createdAt: Date.now(),
    lastChecked: null,
    alertCount: 0,
    seenIds: []
  };

  list.push(newWatchdog);
  await saveWatchdogs(list);
  return newWatchdog;
}

export async function deleteWatchdog(id) {
  const list = await getWatchdogs();
  const filtered = list.filter(w => w.id !== id);
  await saveWatchdogs(filtered);
  return true;
}

export async function toggleWatchdog(id) {
  const list = await getWatchdogs();
  const item = list.find(w => w.id === id);
  if (item) {
    item.enabled = !item.enabled;
    await saveWatchdogs(list);
    return item;
  }
  return null;
}

/**
 * Gửi tin nhắn kiểm tra hoặc thông báo đến Telegram Bot
 */
export async function sendTelegramMessage(botToken, chatId, text, options = {}) {
  if (!botToken || !chatId) {
    return { success: false, error: "Thiếu Telegram Bot Token hoặc Chat ID" };
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: false,
        ...options
      })
    });

    const data = await res.json();
    if (!res.ok || !data.ok) {
      return { success: false, error: data.description || "Gửi Telegram thất bại" };
    }
    return { success: true, result: data.result };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Quét định kỳ kiểm tra các Watchdog đang bật
 */
export async function runWatchdogScan() {
  const list = await getWatchdogs();
  const activeList = list.filter(w => w.enabled);
  if (activeList.length === 0) return;

  for (const wd of activeList) {
    try {
      const searchRes = await aggregateSearch(wd.keyword, {
        category: wd.category,
        region: wd.region,
        maxPrice: wd.maxPrice || Infinity,
        hideScam: true
      });

      wd.lastChecked = Date.now();
      const seenSet = new Set(wd.seenIds || []);

      // Lọc các món đồ mới và thoả mãn mức giá trần
      const newDeals = searchRes.items.filter(item => {
        if (seenSet.has(item.id)) return false;
        if (wd.maxPrice > 0 && item.price > wd.maxPrice) return false;
        return true;
      });

      for (const deal of newDeals) {
        // Gửi thông báo qua Telegram nếu người dùng cấu hình
        if (wd.telegramBotToken && wd.telegramChatId) {
          const msg = `🎯 <b>[SĂN KÈO CÔNG NGHỆ] PHÁT HIỆN DEAL MỚI!</b>\n\n` +
            `📱 <b>${escapeHtml(deal.title)}</b>\n` +
            `💰 <b>Giá:</b> <code>${formatVND(deal.price)}</code> (${deal.dealRating?.desc || "Giá tốt"})\n` +
            `📍 <b>Nơi bán:</b> ${deal.location}\n` +
            `🏷️ <b>Nguồn:</b> ${deal.source}\n` +
            `👤 <b>Người bán:</b> ${deal.sellerName} ${deal.isShop ? '<i>(Cửa hàng)</i>' : '<i>(Cá nhân)</i>'}\n\n` +
            `🔗 <a href="${deal.url}">Xem chi tiết bài đăng ngay</a>`;

          await sendTelegramMessage(wd.telegramBotToken, wd.telegramChatId, msg);
        }

        wd.seenIds.push(deal.id);
        wd.alertCount = (wd.alertCount || 0) + 1;
      }

      // Giữ tối đa 100 ID đã xem để tránh file json phình to
      if (wd.seenIds.length > 100) {
        wd.seenIds = wd.seenIds.slice(-100);
      }
    } catch (err) {
      // bỏ qua lỗi từng watchdog để không ảnh hưởng các watchdog khác
    }
  }

  await saveWatchdogs(list);
}

function escapeHtml(text = "") {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
