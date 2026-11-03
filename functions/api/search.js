import { aggregateSearch } from "../../src/scrapers/index.js";

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
    const q = url.searchParams.get("q") || "";
    const category = url.searchParams.get("category") || "all";
    const minPrice = Number(url.searchParams.get("minPrice")) || 0;
    const maxPrice = Number(url.searchParams.get("maxPrice")) || Infinity;
    const region = url.searchParams.get("region") || "all";
    const hideScam = url.searchParams.get("hideScam") !== "false";
    const userOnly = url.searchParams.get("userOnly") === "true";
    const sortBy = url.searchParams.get("sortBy") || "deal";

    const rawSources = url.searchParams.get("sources");
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

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: CORS_HEADERS
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message, items: [] }), {
      status: 500,
      headers: CORS_HEADERS
    });
  }
}
