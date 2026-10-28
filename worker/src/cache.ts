// Shared edge cache for the public JSON endpoints.
// However many visitors, an upstream is asked at most once per TTL.

export type Endpoint<T> = {
  // One cache entry per endpoint, whatever query string a visitor adds.
  path: string;
  ttlSeconds: number;
  failureTtlSeconds: number;
  load: () => Promise<T>;
};

export async function cachedJson<T>(
  request: Request,
  ctx: ExecutionContext,
  { path, ttlSeconds, failureTtlSeconds, load }: Endpoint<T>,
): Promise<Response> {
  const cacheKey = new Request(new URL(path, request.url));
  const cached = await caches.default.match(cacheKey);
  if (cached) return noBrowserCache(cached);

  let response: Response;
  try {
    response = Response.json(await load(), {
      headers: { 'Cache-Control': `public, max-age=${ttlSeconds}` },
    });
  } catch (err) {
    console.error(`${path} unavailable:`, err);
    // Cached briefly too, so a failing upstream isn't hit on every page view.
    response = Response.json(
      { error: 'unavailable' },
      {
        headers: {
          'Cache-Control': `public, max-age=${failureTtlSeconds}`,
          'X-Upstream-Status': 'unavailable',
        },
      },
    );
  }

  ctx.waitUntil(caches.default.put(cacheKey, response.clone()));
  return noBrowserCache(response);
}

// The Cache-Control above sets how long the Worker's own cache keeps the payload.
// Browsers must not keep it: the zone's Browser Cache TTL would otherwise stretch it to hours.
function noBrowserCache(response: Response): Response {
  const out = new Response(response.body, response);
  out.headers.set('Cache-Control', 'no-store');
  return out;
}
