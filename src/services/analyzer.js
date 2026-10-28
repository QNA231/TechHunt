/**
 * Phân tích khoảng giá thị trường và đánh giá mức độ hời ("Kèo thơm")
 */

export function analyzePrices(items) {
  if (!items || items.length === 0) {
    return {
      items: [],
      stats: {
        total: 0,
        minPrice: 0,
        maxPrice: 0,
        avgPrice: 0,
        medianPrice: 0,
        superDealCount: 0
      }
    };
  }

  // Lọc ra các sản phẩm có giá hợp lệ (> 0) để tính toán thống kê
  const validPrices = items
    .map(i => Number(i.price) || 0)
    .filter(p => p > 50000)
    .sort((a, b) => a - b);

  if (validPrices.length === 0) {
    return {
      items,
      stats: {
        total: items.length,
        minPrice: 0,
        maxPrice: 0,
        avgPrice: 0,
        medianPrice: 0,
        superDealCount: 0
      }
    };
  }

  const minPrice = validPrices[0];
  const maxPrice = validPrices[validPrices.length - 1];
  const avgPrice = Math.round(validPrices.reduce((sum, p) => sum + p, 0) / validPrices.length);

  // Tính trung vị (Median) - tránh bị lệch bởi một vài giá quá cao hoặc quá thấp
  const mid = Math.floor(validPrices.length / 2);
  const medianPrice = validPrices.length % 2 !== 0
    ? validPrices[mid]
    : Math.round((validPrices[mid - 1] + validPrices[mid]) / 2);

  let superDealCount = 0;

  // Gán nhãn đánh giá Deal cho từng sản phẩm
  const evaluatedItems = items.map(item => {
    const price = Number(item.price) || 0;
    if (price <= 50000) {
      return {
        ...item,
        dealRating: {
          level: "unknown",
          label: "Chưa rõ giá",
          badgeColor: "bg-gray-500",
          textColor: "text-gray-300",
          desc: "Giá không khả dụng",
          diffPercent: 0
        }
      };
    }

    const diffPercent = Math.round(((price - medianPrice) / medianPrice) * 100);

    let dealRating = {};

    if (diffPercent <= -20) {
      // Rẻ hơn trung vị thị trường từ 20% trở lên
      superDealCount++;
      dealRating = {
        level: "super_deal",
        label: "🔥 KÈO SIÊU THƠM",
        badgeColor: "bg-rose-500/20 border border-rose-500/40",
        textColor: "text-rose-400 font-bold",
        desc: `Rẻ hơn ${Math.abs(diffPercent)}% so với thị trường`,
        diffPercent
      };
    } else if (diffPercent <= -8) {
      // Rẻ hơn từ 8% đến 20%
      dealRating = {
        level: "good_deal",
        label: "✨ GIÁ TỐT",
        badgeColor: "bg-emerald-500/20 border border-emerald-500/40",
        textColor: "text-emerald-400 font-semibold",
        desc: `Rẻ hơn ${Math.abs(diffPercent)}% so với thị trường`,
        diffPercent
      };
    } else if (diffPercent <= 15) {
      // Khoảng giá phổ biến trên thị trường
      dealRating = {
        level: "fair",
        label: "⚖️ GIÁ HỢP LÝ",
        badgeColor: "bg-sky-500/20 border border-sky-500/40",
        textColor: "text-sky-300",
        desc: "Đúng khoảng giá mặt bằng chung",
        diffPercent
      };
    } else {
      // Cao hơn thị trường trên 15%
      dealRating = {
        level: "high",
        label: "📈 GIÁ HƠI CAO",
        badgeColor: "bg-amber-500/20 border border-amber-500/40",
        textColor: "text-amber-400",
        desc: `Cao hơn ${diffPercent}% so với thị trường`,
        diffPercent
      };
    }

    return {
      ...item,
      dealRating
    };
  });

  return {
    items: evaluatedItems,
    stats: {
      total: items.length,
      minPrice,
      maxPrice,
      avgPrice,
      medianPrice,
      superDealCount
    }
  };
}

/**
 * Định dạng tiền tệ VNĐ tiện đọc (VD: 4.200.000 đ hoặc 4.2 triệu)
 */
export function formatVND(amount) {
  if (!amount || isNaN(amount)) return "Liên hệ";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}
