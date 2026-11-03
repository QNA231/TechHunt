import { DEFAULT_HARDWARE_PRICES } from "../../src/services/dailyPrices.js";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json; charset=UTF-8"
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequestGet(context) {
  try {
    const url = new URL(context.request.url);
    const category = (url.searchParams.get("category") || "all").toLowerCase().trim();
    const q = (url.searchParams.get("q") || "").toLowerCase().trim();

    const items = DEFAULT_HARDWARE_PRICES.filter(item => {
      if (category !== "all" && item.category !== category) return false;
      if (q) {
        const matchName = (item.name || "").toLowerCase().includes(q);
        const matchKeyword = (item.searchKeyword || "").toLowerCase().includes(q);
        const matchSpec = (item.spec || "").toLowerCase().includes(q);
        if (!matchName && !matchKeyword && !matchSpec) return false;
      }
      return true;
    });

    return new Response(JSON.stringify(items), {
      status: 200,
      headers: CORS_HEADERS
    });
  } catch (err) {
    return new Response(JSON.stringify([]), {
      status: 500,
      headers: CORS_HEADERS
    });
  }
}
