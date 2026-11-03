import http from "http";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { aggregateSearch } from "./scrapers/index.js";
import { validateIMEI, validateSerialNumber } from "./services/hardwareVerifier.js";
import { getDailyPrices, updateDailyPrice } from "./services/dailyPrices.js";
import { getGroupSearchShortcuts } from "./services/facebookGroups.js";
import { 
  getWatchdogs, 
  addWatchdog, 
  deleteWatchdog, 
  toggleWatchdog, 
  sendTelegramMessage, 
  runWatchdogScan 
} from "./services/watchdog.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.join(__dirname, "../public");
const PORT = process.env.PORT || 3000;

// Content types cho static files
const MIME_TYPES = {
  ".html": "text/html; charset=UTF-8",
  ".js": "text/javascript; charset=UTF-8",
  ".css": "text/css; charset=UTF-8",
  ".json": "application/json; charset=UTF-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // Helper hàm gửi JSON response
  const sendJson = (statusCode, data) => {
    res.writeHead(statusCode, { "Content-Type": "application/json; charset=UTF-8" });
    res.end(JSON.stringify(data));
  };

  // Helper hàm đọc JSON body
  const readJsonBody = () => new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });

  try {
    // === API ENDPOINTS ===

    // 1. Tìm kiếm tổng hợp đa nguồn
    if (pathname === "/api/search" && req.method === "GET") {
      const q = parsedUrl.searchParams.get("q") || "";
      const category = parsedUrl.searchParams.get("category") || "all";
      const minPrice = Number(parsedUrl.searchParams.get("minPrice")) || 0;
      const maxPrice = Number(parsedUrl.searchParams.get("maxPrice")) || Infinity;
      const region = parsedUrl.searchParams.get("region") || "all";
      const hideScam = parsedUrl.searchParams.get("hideScam") !== "false";
      const userOnly = parsedUrl.searchParams.get("userOnly") === "true";
      const sortBy = parsedUrl.searchParams.get("sortBy") || "deal";
      
      const rawSources = parsedUrl.searchParams.get("sources");
      const sources = rawSources ? rawSources.split(",").map(s => s.trim()) : [];

      const result = await aggregateSearch(q, {
        category,
        minPrice,
        maxPrice,
        region,
        hideScam,
        userOnly,
        sources,
        sortBy
      });

      sendJson(200, result);
      return;
    }

    // 2. Lấy danh sách Watchdog đang theo dõi
    if (pathname === "/api/watchdogs" && req.method === "GET") {
      const list = await getWatchdogs();
      sendJson(200, list);
      return;
    }

    // 3. Thêm mới một Watchdog
    if (pathname === "/api/watchdogs" && req.method === "POST") {
      const body = await readJsonBody();
      if (!body.keyword) {
        sendJson(400, { error: "Từ khóa không được để trống" });
        return;
      }
      const created = await addWatchdog(body);
      sendJson(201, created);
      return;
    }

    // 4. Xóa một Watchdog
    if (pathname.startsWith("/api/watchdogs/") && req.method === "DELETE") {
      const id = pathname.replace("/api/watchdogs/", "");
      await deleteWatchdog(id);
      sendJson(200, { success: true, id });
      return;
    }

    // 5. Bật/Tắt một Watchdog
    if (pathname.endsWith("/toggle") && req.method === "PATCH") {
      const parts = pathname.split("/");
      const id = parts[3];
      const updated = await toggleWatchdog(id);
      if (!updated) {
        sendJson(404, { error: "Không tìm thấy nhiệm vụ theo dõi" });
        return;
      }
      sendJson(200, updated);
      return;
    }

    // 5.5. Quét thủ công hoặc định kỳ Watchdogs
    if ((pathname === "/api/watchdogs/scan" || pathname === "/api/watchdog/scan") && (req.method === "POST" || req.method === "GET")) {
      const result = await runWatchdogScan();
      sendJson(200, { success: true, ...result });
      return;
    }

    // 6. Test kết nối Telegram Bot
    if (pathname === "/api/telegram/test" && req.method === "POST") {
      const body = await readJsonBody();
      const { botToken, chatId } = body;
      const testMsg = "🎉 <b>Kết nối TechHunt thành công!</b>\nBot sẵn sàng gửi thông báo khi phát hiện thiết bị hoặc linh kiện giá rẻ cho bạn.";
      const testRes = await sendTelegramMessage(botToken, chatId, testMsg);
      sendJson(testRes.success ? 200 : 400, testRes);
      return;
    }

    // 7. Thẩm định mã IMEI / Serial trực tiếp
    if (pathname === "/api/verify-hardware" && req.method === "POST") {
      const body = await readJsonBody();
      const code = (body.code || "").trim();
      if (!code) {
        sendJson(400, { error: "Vui lòng nhập mã IMEI hoặc Serial để kiểm tra" });
        return;
      }

      // Thử xác thực theo IMEI trước (nếu chủ yếu là số), nếu không thì theo Serial
      const cleanDigits = code.replace(/[\s\.\-]/g, "");
      let report;
      if (/^\d{14,16}$/.test(cleanDigits)) {
        report = validateIMEI(code);
      } else {
        report = validateSerialNumber(code);
      }

      sendJson(200, report);
      return;
    }

    // 8. Lấy danh sách tìm kiếm sâu Hội Nhóm Facebook (1-Click Deep Search)
    if (pathname === "/api/facebook-groups" && req.method === "GET") {
      const q = parsedUrl.searchParams.get("q") || "";
      const category = parsedUrl.searchParams.get("category") || "all";
      const shortcuts = getGroupSearchShortcuts(q, category);
      sendJson(200, shortcuts);
      return;
    }

    // 9. Lấy biến động bảng giá linh kiện điện tử hàng ngày
    if (pathname === "/api/daily-prices" && req.method === "GET") {
      const category = parsedUrl.searchParams.get("category") || "all";
      const q = parsedUrl.searchParams.get("q") || "";
      const prices = await getDailyPrices(category, q);
      sendJson(200, {
        date: new Date().toLocaleDateString("vi-VN"),
        items: prices
      });
      return;
    }

    // 10. Kiểm tra trạng thái hệ thống
    if (pathname === "/api/health" && req.method === "GET") {
      sendJson(200, { status: "ok", timestamp: Date.now(), uptime: process.uptime() });
      return;
    }

    // === SERVE STATIC FILES (FRONTEND) ===
    let filePath = pathname === "/" ? path.join(PUBLIC_DIR, "index.html") : path.join(PUBLIC_DIR, pathname);
    
    // Bảo vệ không thoát ra ngoài thư mục public
    if (!filePath.startsWith(PUBLIC_DIR)) {
      sendJson(403, { error: "Truy cập bị từ chối" });
      return;
    }

    try {
      const stat = await fs.stat(filePath);
      if (stat.isDirectory()) {
        filePath = path.join(filePath, "index.html");
      }
      const data = await fs.readFile(filePath);
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || "application/octet-stream";
      res.writeHead(200, { "Content-Type": contentType });
      res.end(data);
    } catch {
      // Fallback về index.html cho SPA
      const indexData = await fs.readFile(path.join(PUBLIC_DIR, "index.html"));
      res.writeHead(200, { "Content-Type": "text/html; charset=UTF-8" });
      res.end(indexData);
    }

  } catch (err) {
    sendJson(500, { error: err.message || "Lỗi máy chủ nội bộ" });
  }
});

// Chạy Watchdog Scanner định kỳ mỗi 5 phút
const SCAN_INTERVAL_MS = 5 * 60 * 1000;
setInterval(() => {
  runWatchdogScan().catch(err => console.error("Lỗi chạy watchdog ngầm:", err));
}, SCAN_INTERVAL_MS);

let currentPort = Number(PORT);

function startListening(port) {
  server.listen(port, "127.0.0.1", () => {
    console.log(`=======================================================`);
    console.log(`🚀 Tech Deal Hunter Web Server đang chạy tại:`);
    console.log(`👉 http://127.0.0.1:${port}`);
    console.log(`👉 http://localhost:${port}`);
    console.log(`=======================================================`);
  });
}

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.log(`⚠️ Cổng ${currentPort} đang bị chiếm dụng bởi tiến trình khác.`);
    currentPort += 1;
    console.log(`🔄 Tự động chuyển sang cổng mới: http://localhost:${currentPort}...`);
    startListening(currentPort);
  } else {
    console.error("Lỗi khởi động máy chủ:", err);
  }
});

startListening(currentPort);
