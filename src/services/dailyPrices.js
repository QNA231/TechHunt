import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { DEFAULT_HARDWARE_PRICES } from "./dailyPricesCatalog.js";

export { DEFAULT_HARDWARE_PRICES };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "../../data");
const DAILY_PRICES_FILE = path.join(DATA_DIR, "daily-prices.json");

async function ensureDataFile() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.access(DAILY_PRICES_FILE);
    } catch {
      await fs.writeFile(DAILY_PRICES_FILE, JSON.stringify(DEFAULT_HARDWARE_PRICES, null, 2), "utf8");
    }
  } catch (err) {
    // fallback
  }
}

/**
 * Lấy danh sách biến động giá linh kiện điện tử hàng ngày
 */
export async function getDailyPrices(category = "all", query = "") {
  await ensureDataFile();
  let list = [];
  try {
    const raw = await fs.readFile(DAILY_PRICES_FILE, "utf8");
    list = JSON.parse(raw);
  } catch {
    list = DEFAULT_HARDWARE_PRICES;
  }

  const q = (query || "").toLowerCase().trim();
  const cat = (category || "all").toLowerCase().trim();

  return list.filter(item => {
    if (cat !== "all" && item.category !== cat) return false;
    if (q) {
      const matchName = item.name.toLowerCase().includes(q);
      const matchKeyword = item.searchKeyword.toLowerCase().includes(q);
      const matchSpec = (item.spec || "").toLowerCase().includes(q);
      if (!matchName && !matchKeyword && !matchSpec) return false;
    }
    return true;
  });
}

/**
 * Cập nhật giá một món hoặc ghi nhận giá thị trường mới
 */
export async function updateDailyPrice(id, updateData) {
  await ensureDataFile();
  let list = [];
  try {
    const raw = await fs.readFile(DAILY_PRICES_FILE, "utf8");
    list = JSON.parse(raw);
  } catch {
    list = DEFAULT_HARDWARE_PRICES;
  }

  const index = list.findIndex(item => item.id === id);
  if (index !== -1) {
    list[index] = { ...list[index], ...updateData };
    await fs.writeFile(DAILY_PRICES_FILE, JSON.stringify(list, null, 2), "utf8");
    return list[index];
  }
  return null;
}
