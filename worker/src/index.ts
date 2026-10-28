// Public, cached JSON API for arn0.be. Upstream credentials stay here as Worker
// secrets, and each handler passes on only the fields the page actually renders.
//
//   /api/pi     Minecraft server status on the Pi
//   /api/books  Reading list from Hardcover

import { handleBooks, type BooksEnv } from './books';
import { handlePi, type PiEnv } from './pi';

export interface Env extends PiEnv, BooksEnv {}

type Handler = (request: Request, env: Env, ctx: ExecutionContext) => Promise<Response>;

const routes: Record<string, Handler> = {
  '/api/pi': handlePi,
  '/api/books': handleBooks,
};

export default {
  async fetch(request, env, ctx): Promise<Response> {
    if (request.method !== 'GET') {
      return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET' } });
    }

    // Trailing slashes tolerated, so /api/books/ lands on the same handler.
    const handler = routes[new URL(request.url).pathname.replace(/\/+$/, '')];
    if (!handler) return new Response('Not found', { status: 404 });

    return handler(request, env, ctx);
  },
} satisfies ExportedHandler<Env>;
