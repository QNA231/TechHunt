import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "../../data");
const DAILY_PRICES_FILE = path.join(DATA_DIR, "daily-prices.json");

// Bảng dữ liệu giá thị trường chuẩn xác của linh kiện & thiết bị cũ / mới tại Việt Nam
export const DEFAULT_HARDWARE_PRICES = [
  // === 1. CARD ĐỒ HỌA (GPU) ===
  {
    id: "gpu-rtx3060-12g",
    name: "NVIDIA GeForce RTX 3060 12GB (Cũ 98-99%)",
    category: "gpu",
    categoryName: "Card đồ họa (GPU)",
    minPrice: 4800000,
    avgPrice: 5350000,
    prevAvgPrice: 5500000,
    changeAmount: -150000,
    changePercent: -2.7,
    trend: "down",
    recommendation: "buy_now",
    recommendationLabel: "🔥 Giá chạm đáy - Kèo hời",
    spec: "12GB GDDR6, 192-bit, TDP 170W, Fullbox / Hết BH hãng",
    searchKeyword: "RTX 3060 12GB",
    suggestedMaxPrice: 5400000
  },
  {
    id: "gpu-rtx3070-8g",
    name: "NVIDIA GeForce RTX 3070 8GB (Cũ)",
    category: "gpu",
    categoryName: "Card đồ họa (GPU)",
    minPrice: 6200000,
    avgPrice: 6850000,
    prevAvgPrice: 6850000,
    changeAmount: 0,
    changePercent: 0,
    trend: "stable",
    recommendation: "good_price",
    recommendationLabel: "✨ Giá ổn định",
    spec: "8GB GDDR6, 256-bit, chơi mượt 2K Ultra Settings",
    searchKeyword: "RTX 3070",
    suggestedMaxPrice: 6900000
  },
  {
    id: "gpu-rtx4060-8g",
    name: "NVIDIA GeForce RTX 4060 8GB (Lướt BH Dài)",
    category: "gpu",
    categoryName: "Card đồ họa (GPU)",
    minPrice: 6800000,
    avgPrice: 7300000,
    prevAvgPrice: 7500000,
    changeAmount: -200000,
    changePercent: -2.6,
    trend: "down",
    recommendation: "buy_now",
    recommendationLabel: "🔥 Giảm nhẹ - Đáng mua",
    spec: "Kiến trúc Ada Lovelace, hỗ trợ DLSS 3 Frame Gen, ăn cực ít điện (115W)",
    searchKeyword: "RTX 4060",
    suggestedMaxPrice: 7400000
  },
  {
    id: "gpu-gtx1660s-6g",
    name: "NVIDIA GeForce GTX 1660 Super 6GB (Cũ)",
    category: "gpu",
    categoryName: "Card đồ họa (GPU)",
    minPrice: 2200000,
    avgPrice: 2550000,
    prevAvgPrice: 2600000,
    changeAmount: -50000,
    changePercent: -1.9,
    trend: "down",
    recommendation: "buy_now",
    recommendationLabel: "🔥 Vua phân khúc giá rẻ",
    spec: "6GB GDDR6, chiến mượt Esport FO4, CS2, Valorant, GTA V",
    searchKeyword: "GTX 1660 Super",
    suggestedMaxPrice: 2600000
  },
  {
    id: "gpu-rx6600-8g",
    name: "AMD Radeon RX 6600 8GB (Cũ / Còn BH)",
    category: "gpu",
    categoryName: "Card đồ họa (GPU)",
    minPrice: 3200000,
    avgPrice: 3650000,
    prevAvgPrice: 3600000,
    changeAmount: 50000,
    changePercent: 1.4,
    trend: "up",
    recommendation: "good_price",
    recommendationLabel: "✨ Giá tốt P/P",
    spec: "8GB GDDR6, hiệu năng nhỉnh hơn RTX 2060, tiêu thụ 132W",
    searchKeyword: "RX 6600",
    suggestedMaxPrice: 3700000
  },

  // === 2. VI XỬ LÝ (CPU) ===
  {
    id: "cpu-i5-12400f",
    name: "Intel Core i5-12400F (Tray / Box Cũ)",
    category: "cpu",
    categoryName: "Vi xử lý (CPU)",
    minPrice: 2150000,
    avgPrice: 2450000,
    prevAvgPrice: 2500000,
    changeAmount: -50000,
    changePercent: -2.0,
    trend: "down",
    recommendation: "buy_now",
    recommendationLabel: "🔥 CPU quốc dân giá tốt",
    spec: "6 nhân 12 luồng, xung boost 4.4GHz, Socket LGA1700",
    searchKeyword: "i5 12400F",
    suggestedMaxPrice: 2500000
  },
  {
    id: "cpu-i5-13400f",
    name: "Intel Core i5-13400F (Lướt / BH)",
    category: "cpu",
    categoryName: "Vi xử lý (CPU)",
    minPrice: 3500000,
    avgPrice: 3950000,
    prevAvgPrice: 4100000,
    changeAmount: -150000,
    changePercent: -3.6,
    trend: "down",
    recommendation: "buy_now",
    recommendationLabel: "🔥 Giảm mạnh",
    spec: "10 nhân 16 luồng (6P + 4E), đa nhiệm và render khỏe",
    searchKeyword: "i5 13400F",
    suggestedMaxPrice: 4000000
  },
  {
    id: "cpu-i3-12100f",
    name: "Intel Core i3-12100F (Cũ / Tray)",
    category: "cpu",
    categoryName: "Vi xử lý (CPU)",
    minPrice: 1400000,
    avgPrice: 1650000,
    prevAvgPrice: 1650000,
    changeAmount: 0,
    changePercent: 0,
    trend: "stable",
    recommendation: "good_price",
    recommendationLabel: "✨ Giá rẻ mượt mà",
    spec: "4 nhân 8 luồng, đơn nhân rất khỏe cho game online",
    searchKeyword: "i3 12100F",
    suggestedMaxPrice: 1700000
  },
  {
    id: "cpu-ryzen-5-5600",
    name: "AMD Ryzen 5 5600 (AM4, Cũ / Tray)",
    category: "cpu",
    categoryName: "Vi xử lý (CPU)",
    minPrice: 2000000,
    avgPrice: 2300000,
    prevAvgPrice: 2350000,
    changeAmount: -50000,
    changePercent: -2.1,
    trend: "down",
    recommendation: "buy_now",
    recommendationLabel: "🔥 Best P/P cho dàn AM4",
    spec: "6 nhân 12 luồng, 32MB L3 Cache, xung boost 4.4GHz",
    searchKeyword: "Ryzen 5 5600",
    suggestedMaxPrice: 2350000
  },
  {
    id: "cpu-ryzen-7-5700x3d",
    name: "AMD Ryzen 7 5700X3D (Vua Gaming AM4)",
    category: "cpu",
    categoryName: "Vi xử lý (CPU)",
    minPrice: 4600000,
    avgPrice: 5100000,
    prevAvgPrice: 5200000,
    changeAmount: -100000,
    changePercent: -1.9,
    trend: "down",
    recommendation: "buy_now",
    recommendationLabel: "🔥 Đang hot - Cực khỏe",
    spec: "8 nhân 16 luồng, 96MB 3D V-Cache, FPS game esport cực cao",
    searchKeyword: "5700X3D",
    suggestedMaxPrice: 5200000
  },

  // === 3. RAM & Ổ CỨNG SSD ===
  {
    id: "ram-ddr4-16g-3200",
    name: "RAM Desktop DDR4 16GB (1x16G hoặc 2x8G) Bus 3200",
    category: "ram_ssd",
    categoryName: "RAM & SSD",
    minPrice: 600000,
    avgPrice: 750000,
    prevAvgPrice: 750000,
    changeAmount: 0,
    changePercent: 0,
    trend: "stable",
    recommendation: "good_price",
    recommendationLabel: "✨ Giá bình ổn",
    spec: "Kingston Fury, Corsair LPX, G.Skill Ripjaws Bus 3200MHz",
    searchKeyword: "RAM 16GB 3200",
    suggestedMaxPrice: 800000
  },
  {
    id: "ram-ddr5-32g-6000",
    name: "Kit RAM DDR5 32GB (2x16GB) Bus 5600 - 6000MHz",
    category: "ram_ssd",
    categoryName: "RAM & SSD",
    minPrice: 1950000,
    avgPrice: 2350000,
    prevAvgPrice: 2450000,
    changeAmount: -100000,
    changePercent: -4.0,
    trend: "down",
    recommendation: "buy_now",
    recommendationLabel: "🔥 Giảm sâu - Nên nâng cấp",
    spec: "Corsair Vengeance, Kingston Renegade, hỗ trợ Intel XMP 3.0 / AMD EXPO",
    searchKeyword: "RAM DDR5 32GB",
    suggestedMaxPrice: 2400000
  },
  {
    id: "ssd-nvme-1tb-gen4",
    name: "SSD NVMe M.2 1TB PCIe Gen 4x4 (Tốc độ 5000-7000MB/s)",
    category: "ram_ssd",
    categoryName: "RAM & SSD",
    minPrice: 1350000,
    avgPrice: 1650000,
    prevAvgPrice: 1600000,
    changeAmount: 50000,
    changePercent: 3.1,
    trend: "up",
    recommendation: "good_price",
    recommendationLabel: "✨ Ổn định",
    spec: "Samsung 980 Pro, Kingston KC3000, Kioxia Exceria Pro 1TB",
    searchKeyword: "SSD NVMe 1TB",
    suggestedMaxPrice: 1700000
  },
  {
    id: "ssd-nvme-500g",
    name: "SSD NVMe M.2 500GB Gen 3/Gen 4 (Cũ sức khỏe 95-100%)",
    category: "ram_ssd",
    categoryName: "RAM & SSD",
    minPrice: 650000,
    avgPrice: 820000,
    prevAvgPrice: 850000,
    changeAmount: -30000,
    changePercent: -3.5,
    trend: "down",
    recommendation: "buy_now",
    recommendationLabel: "🔥 Giá rất tốt",
    spec: "Sức khỏe Good 98-100%, ghi ít TBW, BH còn dài",
    searchKeyword: "SSD 500GB",
    suggestedMaxPrice: 850000
  },

  // === 4. ĐIỆN THOẠI CŨ ===
  {
    id: "phone-ip13-128",
    name: "Apple iPhone 13 128GB (Quốc tế Cũ 98-99%)",
    category: "phone",
    categoryName: "Điện thoại cũ",
    minPrice: 8800000,
    avgPrice: 9900000,
    prevAvgPrice: 10200000,
    changeAmount: -300000,
    changePercent: -2.9,
    trend: "down",
    recommendation: "buy_now",
    recommendationLabel: "🔥 Rớt giá tốt - Nên xúc",
    spec: "Màn 6.1 OLED Super Retina, chip A15 Bionic, pin 85-92%",
    searchKeyword: "iPhone 13 128GB",
    suggestedMaxPrice: 10000000
  },
  {
    id: "phone-ip14prm-128",
    name: "Apple iPhone 14 Pro Max 128GB (Cũ 99%)",
    category: "phone",
    categoryName: "Điện thoại cũ",
    minPrice: 17500000,
    avgPrice: 18900000,
    prevAvgPrice: 19300000,
    changeAmount: -400000,
    changePercent: -2.1,
    trend: "down",
    recommendation: "buy_now",
    recommendationLabel: "🔥 Kèo thơm cao cấp",
    spec: "Dynamic Island, màn 120Hz ProMotion, Camera 48MP, Pin trâu",
    searchKeyword: "iPhone 14 Pro Max",
    suggestedMaxPrice: 19000000
  },
  {
    id: "phone-ip12-64",
    name: "Apple iPhone 12 64GB (Cũ Quốc Tế)",
    category: "phone",
    categoryName: "Điện thoại cũ",
    minPrice: 5600000,
    avgPrice: 6300000,
    prevAvgPrice: 6400000,
    changeAmount: -100000,
    changePercent: -1.6,
    trend: "down",
    recommendation: "good_price",
    recommendationLabel: "✨ Giá rẻ dễ tiếp cận",
    spec: "Hỗ trợ 5G, chip A14 Bionic, thiết kế viền vuông sang trọng",
    searchKeyword: "iPhone 12",
    suggestedMaxPrice: 6400000
  },
  {
    id: "phone-ss-s23-5g",
    name: "Samsung Galaxy S23 5G 128GB / 256GB (Cũ SSVN)",
    category: "phone",
    categoryName: "Điện thoại cũ",
    minPrice: 8300000,
    avgPrice: 9100000,
    prevAvgPrice: 9300000,
    changeAmount: -200000,
    changePercent: -2.2,
    trend: "down",
    recommendation: "buy_now",
    recommendationLabel: "🔥 Flagship nhỏ gọn đáng mua",
    spec: "Snapdragon 8 Gen 2 for Galaxy mát mẻ, camera chụp đêm sắc nét",
    searchKeyword: "Samsung Galaxy S23",
    suggestedMaxPrice: 9200000
  },

  // === 5. LAPTOP CŨ ===
  {
    id: "laptop-macbook-air-m1",
    name: "Apple MacBook Air M1 2020 (8GB / 256GB Cũ Đẹp)",
    category: "laptop",
    categoryName: "Laptop cũ",
    minPrice: 11500000,
    avgPrice: 12800000,
    prevAvgPrice: 13200000,
    changeAmount: -400000,
    changePercent: -3.0,
    trend: "down",
    recommendation: "buy_now",
    recommendationLabel: "🔥 Vua văn phòng & sinh viên",
    spec: "Pin trâu 12-15 tiếng, màn Retina cực đẹp, loa hay, nhẹ 1.29kg",
    searchKeyword: "MacBook Air M1",
    suggestedMaxPrice: 13000000
  },
  {
    id: "laptop-thinkpad-t14-g2",
    name: "Lenovo ThinkPad T14 Gen 2 (Ryzen 5 Pro / Core i5 Cũ)",
    category: "laptop",
    categoryName: "Laptop cũ",
    minPrice: 7500000,
    avgPrice: 8600000,
    prevAvgPrice: 8700000,
    changeAmount: -100000,
    changePercent: -1.1,
    trend: "down",
    recommendation: "good_price",
    recommendationLabel: "✨ Bàn phím số 1 cho coder",
    spec: "RAM 16GB, SSD 512GB, độ bền tiêu chuẩn quân đội, bàn phím gõ sướng",
    searchKeyword: "ThinkPad T14",
    suggestedMaxPrice: 8800000
  },
  {
    id: "laptop-gaming-legion5-3060",
    name: "Lenovo Legion 5 (Ryzen 7 5800H / RTX 3060 Cũ)",
    category: "laptop",
    categoryName: "Laptop cũ",
    minPrice: 14500000,
    avgPrice: 16200000,
    prevAvgPrice: 16500000,
    changeAmount: -300000,
    changePercent: -1.8,
    trend: "down",
    recommendation: "good_price",
    recommendationLabel: "✨ Tản nhiệt ngon nhất phân khúc",
    spec: "Màn 15.6 inch 165Hz 100% sRGB, RTX 3060 130W bung hết công suất",
    searchKeyword: "Legion 5 RTX 3060",
    suggestedMaxPrice: 16500000
  },

  // === 6. MÀN HÌNH (MONITOR) ===
  {
    id: "mon-24-144hz",
    name: "Màn hình 24 inch IPS 144Hz - 165Hz FHD (Cũ Còn BH)",
    category: "monitor",
    categoryName: "Màn hình",
    minPrice: 1700000,
    avgPrice: 2150000,
    prevAvgPrice: 2200000,
    changeAmount: -50000,
    changePercent: -2.3,
    trend: "down",
    recommendation: "buy_now",
    recommendationLabel: "🔥 Rất rẻ cho góc chơi game",
    spec: "AOC, ViewSonic, MSI, LG 24GN650 tấm nền IPS viền mỏng",
    searchKeyword: "Màn hình 144Hz",
    suggestedMaxPrice: 2200000
  },
  {
    id: "mon-27-2k-165hz",
    name: "Màn hình 27 inch 2K QHD 165Hz - 180Hz IPS (Cũ / Lướt)",
    category: "monitor",
    categoryName: "Màn hình",
    minPrice: 3200000,
    avgPrice: 3850000,
    prevAvgPrice: 3900000,
    changeAmount: -50000,
    changePercent: -1.3,
    trend: "down",
    recommendation: "good_price",
    recommendationLabel: "✨ Nâng cấp trải nghiệm sắc nét",
    spec: "Độ phân giải 2560x1440, màu sắc chuẩn, chân đế nâng hạ xoay dọc",
    searchKeyword: "Màn hình 27 2K",
    suggestedMaxPrice: 3900000
  }
];

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
