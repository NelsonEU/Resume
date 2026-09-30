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
src/lib/goodreads.ts    Fetches the reading list from Goodreads RSS at build time
src/pages/index.astro   The page
src/pages/llms.txt.ts   Generates /llms.txt from the same data
src/pages/sitemap.xml.ts Generates /sitemap.xml (lastmod = build date)
src/layouts/Base.astro  <head>: meta tags, JSON-LD, fonts, theme script
src/components/         Header, section titles, article rows, project cards, experience items
src/styles/global.css   Design tokens (dark and light themes) and layout
src/scripts/main.ts     Theme toggle and fade-in on scroll
public/                 Copied as-is to the site root: CNAME, robots.txt, img/, cv/
```

## Deployment

A GitHub Action (`.github/workflows/deploy.yml`) builds the site and deploys it to GitHub Pages:

- on every push to `master`
- every day at 05:00 UTC, to refresh the reading list
- manually, from the Actions tab

The repository's Pages source must be set to **GitHub Actions** (Settings → Pages). The custom domain comes from `public/CNAME`, and DNS is on Cloudflare.

## Updating content

| Change | Where |
|---|---|
| Article, project, job, links or stack | `src/data/site.ts`. The page, `llms.txt` and the JSON-LD all update from it. The first article gets the `new` badge; set `wip: true` on a project for the `wip` badge |
| Reading list | Nothing: it comes from Goodreads on each build. If Goodreads is unreachable, the build logs a warning and the list is left out |
| New CV | Replace `public/cv/arnaud_etienne_CV.pdf`, keeping the exact file name (paths are case-sensitive) |

CSS and JS file names include a content hash, so browsers pick up changes on the next deploy without any manual cache-busting.

## Design

Terminal-style design: a dark-first theme with monospace prompts (JetBrains Mono) over a readable sans body (IBM Plex Sans), with one amber accent.

- Colors are defined as `oklch` tokens at the top of `src/styles/global.css`, once per theme.
- The theme defaults to dark. The choice is saved in `localStorage` (`arn0-theme`) and applied by an inline script in `<head>` before first paint.
- Motion (fade-in, hover lift, blinking cursor) is disabled under `prefers-reduced-motion`.
- Section titles are real `h2` elements. The visible `$ command` part is hidden from screen readers, which hear a plain label instead ("Articles", "Projects", …).
