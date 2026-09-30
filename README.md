# arn0.be

Source of [arn0.be](https://arn0.be), my personal website: writing, projects, what I'm up to and a short CV.

Plain HTML, CSS and a little JavaScript.


## Running locally

Any static file server works, for example:

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000.

Use a server rather than opening `index.html` directly: the CV links use absolute paths (`/public/cv/…`), which don't resolve from `file://`.

## Deployment

The site is served by GitHub Pages from `master`, under the custom domain in `CNAME`. DNS is on Cloudflare. Pushing to `master` deploys.

## Updating content

Content lives in several places, so keep them in sync:

| Change | Where |
|---|---|
| New article | `index.html` (`#writing`, move the `new` badge to it) and `llms.txt` |
| Job, experience or stack | `index.html` (`#cv`), the JSON-LD in `<head>`, and `llms.txt` |
| Currently reading | `index.html` (`#now`) |
| New CV | Replace `public/cv/arnaud_etienne_CV.pdf`, keeping the exact file name (paths are case-sensitive) |
| Any content change | Bump `<lastmod>` in `sitemap.xml` |
| `styles.css` or `main.js` change | Bump the `?v=` number on both links in `index.html`, otherwise browsers keep the cached file for up to 4 hours |

## Design

Terminal-style design: a dark-first theme with monospace prompts (JetBrains Mono) over a readable sans body (IBM Plex Sans), with one amber accent.

- Colors are defined as `oklch` tokens at the top of `styles.css`, once per theme.
- The theme defaults to dark. The choice is saved in `localStorage` (`arn0-theme`) and applied by an inline script in `<head>` before first paint.
- Motion (fade-in, hover lift, blinking cursor) is disabled under `prefers-reduced-motion`.
- Section titles are real `h2` elements. The visible `$ command` part is hidden from screen readers, which hear a plain label instead ("Articles", "Projects", …).
