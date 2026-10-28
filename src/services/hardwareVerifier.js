/**
 * Module Xác Thực Mã Phần Cứng (IMEI, Serial Number, Part Number)
 * Tự động kiểm tra tính hợp lệ bằng thuật toán chuẩn quốc tế (Luhn checksum, TAC decode, Apple Serial format)
 * Phát hiện IMEI giả, IMEI nhân bản, hàng dựng, số serial bất hợp lệ.
 */

// Danh sách các IMEI mẫu/ảo thường xuất hiện trên máy nhái, máy test hoặc tool fake
const BLACKLISTED_FAKE_IMEIS = new Set([
  "000000000000000",
  "111111111111111",
  "222222222222222",
  "333333333333333",
  "444444444444444",
  "555555555555555",
  "666666666666666",
  "777777777777777",
  "888888888888888",
  "999999999999999",
  "123456789012345",
  "012345678901234",
  "860000000000000"
]);

// Bản đồ nhận diện dải TAC (Type Allocation Code - 8 số đầu của IMEI)
const TAC_PREFIX_MAP = [
  { prefix: "35", region: "Toàn cầu / Châu Âu", brands: ["Apple iPhone", "Samsung Galaxy", "Sony Xperia", "Google Pixel"] },
  { prefix: "01", region: "Bắc Mỹ / US Carrier", brands: ["Apple iPhone (Bản Mỹ LL/A)", "Samsung US"] },
  { prefix: "86", region: "Châu Á / Trung Quốc", brands: ["Xiaomi", "Huawei", "Oppo", "Vivo", "Realme", "iPhone (CH/A)"] },
  { prefix: "99", region: "CDMA / Đa Băng Tần", brands: ["Thiết bị CDMA / Global LTE"] }
];

/**
 * Kiểm tra tính hợp lệ của số IMEI theo Thuật toán Luhn (GSMA Standard)
 * Số IMEI gồm 14 số dữ liệu + 1 số kiểm tra (Check digit).
 */
export function verifyLuhnChecksum(imeiStr) {
  if (!/^\d{15}$/.test(imeiStr)) return false;

  let sum = 0;
  for (let i = 0; i < 15; i++) {
    let digit = parseInt(imeiStr.charAt(i), 10);
    // Vị trí chẵn từ trái qua (chỉ số 1, 3, 5, 7, 9, 11, 13) nhân đôi
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9; // tương đương cộng 2 chữ số (ví dụ: 14 -> 1+4 = 5 = 14-9)
      }
    }
    sum += digit;
  }

  return sum % 10 === 0;
}

/**
 * Tính số kiểm tra Luhn (số thứ 15) từ 14 số đầu
 */
export function calculateLuhnCheckDigit(first14Digits) {
  if (!/^\d{14}$/.test(first14Digits)) return null;

  let sum = 0;
  for (let i = 0; i < 14; i++) {
    let digit = parseInt(first14Digits.charAt(i), 10);
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }

  const remainder = sum % 10;
  return remainder === 0 ? 0 : 10 - remainder;
}

/**
 * Thẩm định chi tiết số IMEI
 */
export function validateIMEI(rawInput) {
  if (!rawInput) return null;
  const clean = String(rawInput).replace(/[\s\.\-]/g, '').trim();

  // Kiểm tra độ dài cơ bản
  if (!/^\d{14,16}$/.test(clean)) {
    return {
      type: "IMEI",
      raw: clean,
      isValid: false,
      status: "invalid_format",
      label: "Sai định dạng",
      message: "IMEI phải gồm 15 chữ số.",
      riskLevel: "danger"
    };
  }

  const imei15 = clean.slice(0, 15);

  // 1. Kiểm tra danh sách IMEI ảo phổ biến
  if (BLACKLISTED_FAKE_IMEIS.has(imei15) || /^(\d)\1{14}$/.test(imei15)) {
    return {
      type: "IMEI",
      raw: imei15,
      isValid: false,
      status: "fake_cloned",
      label: "CẢNH BÁO: IMEI ẢO / CLONE",
      message: "Dãy số IMEI này là số mẫu hoặc IMEI nhân bản thường gặp trên máy nhái / công cụ đổi IMEI.",
      riskLevel: "danger",
      isScam: true
    };
  }

  // 2. Kiểm tra thuật toán Luhn
  const luhnPassed = verifyLuhnChecksum(imei15);
  const calculatedCheckDigit = calculateLuhnCheckDigit(imei15.slice(0, 14));
  const actualCheckDigit = parseInt(imei15.charAt(14), 10);

  if (!luhnPassed) {
    return {
      type: "IMEI",
      raw: imei15,
      isValid: false,
      status: "failed_luhn",
      label: "CẢNH BÁO: IMEI SAI CHECK DIGIT",
      message: `Mã không vượt qua thuật toán GSMA Luhn (Số kiểm tra là ${actualCheckDigit}, chuẩn phải là ${calculatedCheckDigit}). Nguy cơ cao là người bán ghi số giả hoặc máy can thiệp phần cứng.`,
      riskLevel: "danger",
      isScam: true
    };
  }

  // 3. Phân tích TAC (Type Allocation Code - 8 số đầu)
  const tac = imei15.slice(0, 8);
  const rbi = imei15.slice(0, 2); // Reporting Body Identifier
  let brandHint = "Thiết bị di động toàn cầu";
  let regionHint = "Toàn cầu";

  for (const entry of TAC_PREFIX_MAP) {
    if (imei15.startsWith(entry.prefix)) {
      brandHint = entry.brands.join(", ");
      regionHint = entry.region;
      break;
    }
  }

  // Tạo liên kết tra cứu chính thức trực tiếp
  const lookupLinks = {
    appleCoverage: `https://checkcoverage.apple.com/`,
    sickw: `https://sickw.com/`,
    iunlocker: `https://iunlocker.com/check_imei.php`,
    imeiInfo: `https://www.imei.info/`
  };

  return {
    type: "IMEI",
    raw: imei15,
    formatted: `${imei15.slice(0, 2)}-${imei15.slice(2, 8)}-${imei15.slice(8, 14)}-${imei15.slice(14)}`,
    isValid: true,
    status: "valid_luhn",
    label: "IMEI HỢP LỆ (CHUẨN GSMA)",
    message: "Số IMEI đạt chuẩn cấu trúc quốc tế và vượt qua thuật toán Luhn Checksum.",
    riskLevel: "safe",
    tac,
    brandHint,
    regionHint,
    lookupLinks
  };
}

/**
 * Thẩm định số Serial (Apple Serial, Laptop Service Tag, PC part number)
 */
export function validateSerialNumber(rawInput) {
  if (!rawInput) return null;
  const clean = String(rawInput).toUpperCase().replace(/[\s\.\-]/g, '').trim();

  // Định dạng Apple Serial (12 ký tự kiểu cũ hoặc 10 ký tự kiểu mới từ iPhone 12 trở đi)
  const isApple12 = /^[A-Z0-9]{12}$/.test(clean);
  const isApple10 = /^[A-Z0-9]{10}$/.test(clean);

  // Dell Service Tag (7 ký tự Alphanumeric)
  const isDellServiceTag = /^[A-Z0-9]{7}$/.test(clean);

  // Lenovo Serial Number (8 ký tự)
  const isLenovoSN = /^[A-Z0-9]{8}$/.test(clean);

  if (isApple12 || isApple10) {
    return {
      type: "Apple Serial Number",
      raw: clean,
      isValid: true,
      status: "apple_valid_format",
      label: "Định Dạng Serial Apple Hợp Lệ",
      message: `Định dạng ${isApple12 ? '12 ký tự tiêu chuẩn' : '10 ký tự ngẫu nhiên thế hệ mới (2021+)'}.`,
      riskLevel: "safe",
      lookupLinks: {
        appleCoverage: `https://checkcoverage.apple.com/`,
        appleSupport: `https://support.apple.com/my-support`
      }
    };
  }

  if (isDellServiceTag) {
    return {
      type: "Dell Service Tag",
      raw: clean,
      isValid: true,
      status: "dell_valid_format",
      label: "Định Dạng Dell Service Tag Hợp Lệ",
      message: "Định dạng 7 ký tự chuẩn của Dell để tra cứu cấu hình xuất xưởng và bảo hành.",
      riskLevel: "safe",
      lookupLinks: {
        dellSupport: `https://www.dell.com/support/home/vi-vn/product-support/servicetag/${clean}/overview`
      }
    };
  }

  if (isLenovoSN) {
    return {
      type: "Lenovo Serial",
      raw: clean,
      isValid: true,
      status: "lenovo_valid_format",
      label: "Định Dạng Lenovo Serial Hợp Lệ",
      message: "Định dạng 8 ký tự chuẩn của Lenovo/ThinkPad.",
      riskLevel: "safe",
      lookupLinks: {
        lenovoSupport: `https://pcsupport.lenovo.com/vn/vi/products/search?query=${clean}`
      }
    };
  }

  return {
    type: "Serial / Part Number",
    raw: clean,
    isValid: clean.length >= 6 && clean.length <= 20,
    status: "generic_serial",
    label: "Số Định Danh Thiết Bị",
    message: "Định dạng chuỗi số hiệu hoặc mã linh kiện.",
    riskLevel: "neutral"
  };
}

/**
 * Tự động tìm kiếm và bóc tách IMEI / Serial từ tiêu đề và nội dung bài đăng
 */
export function extractAndVerifyIdentifiers(text = "") {
  if (!text) return [];
  const results = [];
  const seenRaw = new Set();

  // 1. Tìm kiếm IMEI (15 chữ số có từ khóa imei hoặc số 15 chữ số bắt đầu bằng 35, 86, 01)
  const imeiKeywordsRegex = /(?:imei|số imei|mã imei)[:\s\.\-]*([0-9]{15})\b/gi;
  let match;
  while ((match = imeiKeywordsRegex.exec(text)) !== null) {
    const rawImei = match[1];
    if (!seenRaw.has(rawImei)) {
      seenRaw.add(rawImei);
      const report = validateIMEI(rawImei);
      if (report) results.push(report);
    }
  }

  // Quét thêm nếu có dãy số 15 chữ số độc lập bắt đầu bằng 35, 86, 01
  const standaloneImeiRegex = /\b((?:35|86|01)\d{13})\b/g;
  while ((match = standaloneImeiRegex.exec(text)) !== null) {
    const rawImei = match[1];
    if (!seenRaw.has(rawImei)) {
      seenRaw.add(rawImei);
      const report = validateIMEI(rawImei);
      if (report) results.push(report);
    }
  }

  // 2. Tìm kiếm Serial Number (Serial/Seri/SN/Service tag)
  const serialRegex = /(?:serial|seri|sn|s\/n|service tag)[:\s\.\-]*([A-Z0-9]{7,15})\b/gi;
  while ((match = serialRegex.exec(text)) !== null) {
    const rawSerial = match[1];
    if (!seenRaw.has(rawSerial) && !/^\d{15}$/.test(rawSerial)) {
      seenRaw.add(rawSerial);
      const report = validateSerialNumber(rawSerial);
      if (report) results.push(report);
    }
  }

  return results;
}
