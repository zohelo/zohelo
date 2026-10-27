// GET /api/stocks/quote?symbol=XYZ — Finnhub quote proxy (Cloudflare Pages Function).
// The API key stays on the server (Pages secret FINNHUB_API_KEY, from the zohelo organisation
// secret SOURCE_FINNHUB_API_KEY). Without a key it answers 503 and the page shows its
// built-in fallback quotes. Answers are cached at the edge for 30 seconds.

type Env = { FINNHUB_API_KEY?: string };

const SYMBOL = /^[A-Za-z0-9.:^=_-]{1,32}$/;

export const onRequestGet: PagesFunction<Env> = async ({ request, env, waitUntil }) => {
  const symbol = new URL(request.url).searchParams.get("symbol") ?? "";
  if (!SYMBOL.test(symbol)) return Response.json({ error: "invalid symbol" }, { status: 400 });
  if (!env.FINNHUB_API_KEY) return Response.json({ error: "market data not configured" }, { status: 503 });

  const cache = (caches as unknown as { default: Cache }).default;
  const key = new Request(`https://cache.zohelo.com/stocks/quote/${encodeURIComponent(symbol)}`);
  const hit = await cache.match(key);
  if (hit) return hit;

  const upstream = await fetch(`https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}`, {
    headers: { "X-Finnhub-Token": env.FINNHUB_API_KEY },
  });
  if (!upstream.ok) return Response.json({ error: `upstream ${upstream.status}` }, { status: 502 });
  const response = new Response(await upstream.text(), {
    headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=30" },
  });
  waitUntil(cache.put(key, response.clone()));
  return response;
};
