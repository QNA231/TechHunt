const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json; charset=UTF-8"
};

// Lưu trữ tạm trong bộ nhớ của Edge Worker instance nếu chưa cấu hình KV
let IN_MEMORY_WATCHDOGS = [];

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequestGet(context) {
  try {
    if (context.env?.WATCHDOGS_KV) {
      const stored = await context.env.WATCHDOGS_KV.get("watchdogs_list");
      const list = stored ? JSON.parse(stored) : [];
      return new Response(JSON.stringify(list), { status: 200, headers: CORS_HEADERS });
    }
    return new Response(JSON.stringify(IN_MEMORY_WATCHDOGS), { status: 200, headers: CORS_HEADERS });
  } catch (err) {
    return new Response(JSON.stringify([]), { status: 500, headers: CORS_HEADERS });
  }
}

export async function onRequestPost(context) {
  try {
    const body = await context.request.json().catch(() => ({}));
    if (!body.keyword) {
      return new Response(JSON.stringify({ error: "Từ khóa không được để trống" }), {
        status: 400,
        headers: CORS_HEADERS
      });
    }

    const newWd = {
      id: `wd-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      keyword: body.keyword.trim(),
      maxPrice: Number(body.maxPrice) || 0,
      category: body.category || "all",
      region: body.region || "all",
      telegramBotToken: body.telegramBotToken?.trim() || "",
      telegramChatId: body.telegramChatId?.trim() || "",
      enabled: true,
      createdAt: Date.now(),
      lastChecked: null,
      alertCount: 0,
      seenIds: []
    };

    if (context.env?.WATCHDOGS_KV) {
      const stored = await context.env.WATCHDOGS_KV.get("watchdogs_list");
      const list = stored ? JSON.parse(stored) : [];
      list.push(newWd);
      await context.env.WATCHDOGS_KV.put("watchdogs_list", JSON.stringify(list));
    } else {
      IN_MEMORY_WATCHDOGS.push(newWd);
    }

    return new Response(JSON.stringify(newWd), { status: 201, headers: CORS_HEADERS });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS_HEADERS });
  }
}

export async function onRequestDelete(context) {
  try {
    const url = new URL(context.request.url);
    const parts = url.pathname.split("/").filter(Boolean);
    const id = parts[parts.length - 1];

    if (context.env?.WATCHDOGS_KV) {
      const stored = await context.env.WATCHDOGS_KV.get("watchdogs_list");
      let list = stored ? JSON.parse(stored) : [];
      list = list.filter(w => w.id !== id);
      await context.env.WATCHDOGS_KV.put("watchdogs_list", JSON.stringify(list));
    } else {
      IN_MEMORY_WATCHDOGS = IN_MEMORY_WATCHDOGS.filter(w => w.id !== id);
    }

    return new Response(JSON.stringify({ success: true, id }), { status: 200, headers: CORS_HEADERS });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS_HEADERS });
  }
}

export async function onRequestPatch(context) {
  try {
    const url = new URL(context.request.url);
    // Path: /api/watchdogs/:id/toggle
    const parts = url.pathname.split("/").filter(Boolean);
    const id = parts[parts.length - 2] || parts[parts.length - 1];

    let updated = null;
    if (context.env?.WATCHDOGS_KV) {
      const stored = await context.env.WATCHDOGS_KV.get("watchdogs_list");
      let list = stored ? JSON.parse(stored) : [];
      const item = list.find(w => w.id === id);
      if (item) {
        item.enabled = !item.enabled;
        updated = item;
        await context.env.WATCHDOGS_KV.put("watchdogs_list", JSON.stringify(list));
      }
    } else {
      const item = IN_MEMORY_WATCHDOGS.find(w => w.id === id);
      if (item) {
        item.enabled = !item.enabled;
        updated = item;
      }
    }

    if (!updated) {
      return new Response(JSON.stringify({ error: "Không tìm thấy mục theo dõi" }), { status: 404, headers: CORS_HEADERS });
    }

    return new Response(JSON.stringify(updated), { status: 200, headers: CORS_HEADERS });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS_HEADERS });
  }
}
