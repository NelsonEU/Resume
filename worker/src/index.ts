// Public, cached proxy for the Minecraft server status on the Pi.
// The Pi API needs basic auth; the credentials stay here as Worker secrets,
// and only a few harmless fields are passed on to the browser.

interface Env {
  PI_API_URL: string;
  PI_USERNAME: string;
  PI_PASSWORD: string;
}

type Activity = {
  online?: boolean;
  process?: { state?: string | null } | null;
  players?: { online?: number; max?: number } | null;
  mood?: string | null;
};

export type PiStatus = {
  online: boolean;
  state: string | null;
  players: { online: number; max: number };
  mood: string | null;
};

// However many visitors, the Pi gets at most one request per TTL.
const TTL_SECONDS = 60;
const FAILURE_TTL_SECONDS = 15;
const UPSTREAM_TIMEOUT_MS = 5000;

export default {
  async fetch(request, env, ctx): Promise<Response> {
    if (request.method !== 'GET') {
      return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET' } });
    }

    // One cache entry, whatever query string a visitor adds.
    const cacheKey = new Request(new URL('/api/pi', request.url));
    const cached = await caches.default.match(cacheKey);
    if (cached) return noBrowserCache(cached);

    let response: Response;
    try {
      const status = await fetchStatus(env);
      response = Response.json(status, { headers: { 'Cache-Control': `public, max-age=${TTL_SECONDS}` } });
    } catch (err) {
      console.error('Pi status unavailable:', err);
      // Cached briefly too, so a failing Pi isn't hit on every page view.
      response = Response.json(
        { error: 'unavailable' },
        { headers: { 'Cache-Control': `public, max-age=${FAILURE_TTL_SECONDS}`, 'X-Pi-Status': 'unavailable' } },
      );
    }

    ctx.waitUntil(caches.default.put(cacheKey, response.clone()));
    return noBrowserCache(response);
  },
} satisfies ExportedHandler<Env>;

// The Cache-Control above sets how long the Worker's own cache keeps the status.
// Browsers must not keep it: the zone's Browser Cache TTL would otherwise stretch it to hours.
function noBrowserCache(response: Response): Response {
  const out = new Response(response.body, response);
  out.headers.set('Cache-Control', 'no-store');
  return out;
}

async function fetchStatus(env: Env): Promise<PiStatus> {
  const res = await fetch(env.PI_API_URL, {
    headers: { Authorization: `Basic ${btoa(`${env.PI_USERNAME}:${env.PI_PASSWORD}`)}` },
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`upstream returned ${res.status}`);

  // Whitelist: player names, latency and error details never leave the Worker.
  const data = (await res.json()) as Activity;
  return {
    online: data.online === true,
    state: data.process?.state ?? null,
    players: { online: data.players?.online ?? 0, max: data.players?.max ?? 0 },
    mood: data.mood ?? null,
  };
}
