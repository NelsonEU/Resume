// Public, cached proxy for the Minecraft server status on the Pi.
// The Pi API needs basic auth; the credentials stay here as Worker secrets,
// and only a few harmless fields are passed on to the browser.

import { cachedJson } from './cache';

export interface PiEnv {
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

// The status changes by the minute, so it is worth asking the Pi that often.
const TTL_SECONDS = 60;
const FAILURE_TTL_SECONDS = 15;
const UPSTREAM_TIMEOUT_MS = 5000;

export function handlePi(request: Request, env: PiEnv, ctx: ExecutionContext): Promise<Response> {
  return cachedJson(request, ctx, {
    path: '/api/pi',
    ttlSeconds: TTL_SECONDS,
    failureTtlSeconds: FAILURE_TTL_SECONDS,
    load: () => fetchStatus(env),
  });
}

async function fetchStatus(env: PiEnv): Promise<PiStatus> {
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
