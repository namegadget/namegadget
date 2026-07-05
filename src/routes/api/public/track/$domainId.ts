import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

// 1x1 transparent GIF
const PIXEL = new Uint8Array([
  0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00,
  0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0x21, 0xf9, 0x04, 0x01, 0x00,
  0x00, 0x00, 0x00, 0x2c, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00,
  0x00, 0x02, 0x02, 0x44, 0x01, 0x00, 0x3b,
]);

const PIXEL_HEADERS = {
  "Content-Type": "image/gif",
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  "Access-Control-Allow-Origin": "*",
};

export const Route = createFileRoute("/api/public/track/$domainId")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        try {
          const url = new URL(request.url);
          const h = request.headers;
          const country = h.get("cf-ipcountry") ?? url.searchParams.get("country");
          const city = h.get("cf-ipcity") ?? null;
          const region = h.get("cf-region") ?? null;
          const latStr = h.get("cf-iplatitude");
          const lonStr = h.get("cf-iplongitude");
          const referrer = h.get("referer") ?? null;
          const ua = h.get("user-agent") ?? "";
          const uaHash = ua ? await sha256(ua).then((x) => x.slice(0, 16)) : null;

          const client = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_PUBLISHABLE_KEY!,
            { auth: { persistSession: false, autoRefreshToken: false, storage: undefined } },
          );

          await client.from("visits").insert({
            domain_id: params.domainId,
            country,
            city,
            region,
            lat: latStr ? Number(latStr) : null,
            lon: lonStr ? Number(lonStr) : null,
            referrer,
            ua_hash: uaHash,
          });
        } catch {
          // swallow — never break landers
        }
        return new Response(PIXEL, { headers: PIXEL_HEADERS });
      },
    },
  },
});

async function sha256(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
