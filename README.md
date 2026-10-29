# arn0.be

Source of [arn0.be](https://arn0.be), my personal website: writing, projects, what I'm up to and a short CV.

Built with [Astro](https://astro.build) as a static site: plain HTML and CSS, with one small script.

## Running locally

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # outputs to dist/
npm run check    # type-checks the project
```

## Structure

```
src/data/site.ts        All the content: profile, articles, projects, experience, links
src/pages/index.astro   The page
src/pages/llms.txt.ts   Generates /llms.txt from the same data
src/pages/sitemap.xml.ts Generates /sitemap.xml (lastmod = build date)
src/layouts/Base.astro  <head>: meta tags, JSON-LD, fonts, theme script
src/components/         Header, section titles, article rows, project cards, experience items
src/styles/global.css   Design tokens (dark and light themes) and layout
src/scripts/main.ts     Theme toggle, fade-in on scroll, Pi status and reading list
worker/                 Cloudflare Worker behind arn0.be/api/*: Pi status and Hardcover reading list
public/                 Copied as-is to the site root: CNAME, robots.txt, img/, cv/, habits/
```

## Deployment

A GitHub Action (`.github/workflows/deploy.yml`) builds the site and deploys it to GitHub Pages:

- on every push to `master`
- manually, from the Actions tab

The repository's Pages source must be set to **GitHub Actions** (Settings → Pages). The custom domain comes from `public/CNAME`, and DNS is on Cloudflare.

## Minecraft status (`worker/`)

The live status on the Pi project card comes from a Cloudflare Worker, the page fetches it once on load. The Worker calls the Pi's dashboard API, keeps only a few fields (online, state, player count, mood) and caches the result for 60 seconds. The credentials are Worker secrets: they never reach the repo or the browser. If the Worker or the Pi is unreachable, the status stays hidden.

Load on the Pi is bounded twice:

- **Worker cache:** at most one request a minute per Cloudflare data centre the visitors come through (in practice one or two).
- **Rate limiting rule:** configured in the Cloudflare dashboard, not in this repo (Security → WAF → Rate limiting rules). Blocked requests get a `429` and never reach the Worker.

It's deployed separately from the site, by `.github/workflows/deploy-worker.yml` on every push to `master` that touches `worker/` (or manually from the Actions tab). The workflow needs two repository secrets: `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.

The Pi's URL and credentials are Worker secrets, set once from `worker/` and kept across deploys.

## Habits support pages (`public/habits/`)

Two hand-written, bilingual (EN/FR) pages served at `arn0.be/habits/` and `arn0.be/habits/privacy/`. They are the Support URL and Privacy Policy URL declared in App Store Connect for the Habits iOS app, so **those paths must not change**. Plain HTML with their own inline styles: they sit in `public/`, outside the Astro build and the site's design tokens.

## Updating content

| Change | Where |
|---|---|
| Article, project, job, links or stack | `src/data/site.ts`. The page, `llms.txt` and the JSON-LD all update from it. The first article gets the `new` badge; set `wip: true` on a project for the `wip` badge |
| Reading list | Nothing: the Worker reads it from Hardcover at `/api/books`, cached 6h at the edge. No rebuild needed. If Hardcover is unreachable, the section stays hidden |
| New CV | Replace `public/cv/arnaud_etienne_CV.pdf`, keeping the exact file name (paths are case-sensitive) |
| Habits support or privacy text | `public/habits/index.html` and `public/habits/privacy/index.html`, in both languages |

CSS and JS file names include a content hash, so browsers pick up changes on the next deploy without any manual cache-busting.

## Design

Terminal-style design: a dark-first theme with monospace prompts (JetBrains Mono) over a readable sans body (IBM Plex Sans), with one amber accent.

- Colors are defined as `oklch` tokens at the top of `src/styles/global.css`, once per theme.
- The theme defaults to dark. The choice is saved in `localStorage` (`arn0-theme`) and applied by an inline script in `<head>` before first paint.
- Motion (fade-in, hover lift, blinking cursor) is disabled under `prefers-reduced-motion`.
- Section titles are real `h2` elements. The visible `$ command` part is hidden from screen readers, which hear a plain label instead ("Articles", "Projects", …).
