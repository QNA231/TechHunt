import { getGroupSearchShortcuts } from "../../src/services/facebookGroups.js";

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

    const shortcuts = getGroupSearchShortcuts(q, category);
    return new Response(JSON.stringify(shortcuts), {
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
