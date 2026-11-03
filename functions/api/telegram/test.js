const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json; charset=UTF-8"
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequestPost(context) {
  try {
    const body = await context.request.json().catch(() => ({}));
    const { botToken, chatId } = body;

    if (!botToken || !chatId) {
      return new Response(JSON.stringify({ success: false, error: "Thiếu Bot Token hoặc Chat ID" }), {
        status: 400,
        headers: CORS_HEADERS
      });
    }

    const testMsg = "🎉 <b>Kết nối TechHunt thành công!</b>\nBot sẵn sàng gửi thông báo khi phát hiện thiết bị hoặc linh kiện giá hời cho bạn.";
    const tgUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

    const res = await fetch(tgUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: testMsg,
        parse_mode: "HTML"
      })
    });

    const data = await res.json();
    if (!res.ok || !data.ok) {
      return new Response(JSON.stringify({ success: false, error: data.description || "Gửi tin nhắn Telegram thất bại" }), {
        status: 400,
        headers: CORS_HEADERS
      });
    }

    return new Response(JSON.stringify({ success: true, messageId: data.result?.message_id }), {
      status: 200,
      headers: CORS_HEADERS
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: CORS_HEADERS
    });
  }
}
