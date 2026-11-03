import { validateIMEI, validateSerialNumber } from "../../src/services/hardwareVerifier.js";

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
    const code = (body.code || "").trim();
    if (!code) {
      return new Response(JSON.stringify({ error: "Vui lòng nhập mã IMEI hoặc Serial để kiểm tra" }), {
        status: 400,
        headers: CORS_HEADERS
      });
    }

    const cleanDigits = code.replace(/[\s\.\-]/g, "");
    let report;
    if (/^\d{14,16}$/.test(cleanDigits)) {
      report = validateIMEI(code);
    } else {
      report = validateSerialNumber(code);
    }

    return new Response(JSON.stringify(report), {
      status: 200,
      headers: CORS_HEADERS
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: CORS_HEADERS
    });
  }
}
