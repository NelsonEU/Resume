import type { APIRoute } from 'astro';
import { profile } from '../data/site';

// Single-page sitemap; lastmod is the build date.
export const GET: APIRoute = () => {
  const lastmod = new Date().toISOString().slice(0, 10);
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${profile.url}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>
</urlset>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
