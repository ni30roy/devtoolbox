# DevToolBox

Free, fast developer utilities that run entirely in the browser. Built with React, Vite, TypeScript, and Tailwind CSS — static export, no backend.

## Getting started

```bash
npm install
npm run dev        # start the dev server
npm run typecheck  # tsc project references, no emit
npm run lint        # oxlint
npm run build       # typecheck, build, and generate SEO static pages/sitemap/robots.txt
npm run preview     # serve the production build locally, exactly as a static host would
```

## Environment variables

| Variable         | Required | Purpose                                                                                                                        |
| ---------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_SITE_URL`  | Yes, before deploying | Absolute origin the site is deployed at, e.g. `https://devtoolbox.dev` (no trailing slash). Drives canonical URLs, `sitemap.xml`, `robots.txt`, Open Graph/Twitter tags, and JSON-LD across the whole site. |

If `VITE_SITE_URL` isn't set, the build still succeeds using an obviously-fake placeholder (`https://your-production-domain.example`) and `npm run build` prints a warning telling you so — this is deliberate, so a missing config value is loud instead of silently shipping a wrong domain.

Set it one of two ways:

- **Local build**: copy `.env.example` to `.env.production.local` (already gitignored via the `*.local` rule) and fill in your real domain.
- **Hosting provider**: set `VITE_SITE_URL` as an environment variable in the provider's dashboard/CLI — it's picked up automatically by both the Vite build (baked into the client bundle) and `scripts/build-seo.ts` (used to generate the static SEO pages/sitemap/robots.txt), since both resolve it the same way.

## Deploying (Netlify — free tier)

This is a pure static export: `npm run build` produces a self-contained `dist/` folder with no server-side requirements, which is exactly what Netlify's free tier serves.

1. **Install the Netlify CLI** (one-time):
   ```bash
   npm install -g netlify-cli
   ```
2. **Build with your real site URL** (replace the domain with wherever you're deploying):
   ```bash
   VITE_SITE_URL=https://your-actual-domain.com npm run build
   ```
   On Windows PowerShell: `$env:VITE_SITE_URL="https://your-actual-domain.com"; npm run build`
3. **Log in** (opens a browser once):
   ```bash
   netlify login
   ```
4. **Deploy** `dist/` — first run will prompt you to link an existing site or create a new one:
   ```bash
   netlify deploy --prod --dir=dist
   ```
   Netlify prints the live URL when this finishes. If your real domain differs from what you built with in step 2, rebuild and redeploy with the corrected `VITE_SITE_URL`.

**Continuous deployment instead (recommended long-term):** push this project to a Git repo, then in the Netlify dashboard use "Add new site" → "Import an existing project", set:
- Build command: `npm run build`
- Publish directory: `dist`
- Environment variable: `VITE_SITE_URL` = your real domain (Site settings → Environment variables)

Netlify then rebuilds automatically on every push, with the env var injected into the build the same way as a local build.

**No hosting-specific rewrite rules are needed.** `public/_redirects` (already included, copied into `dist/` on build) contains a catch-all SPA fallback (`/*  /index.html  200`) as a safety net for any future client-only route; Netlify's static asset resolution takes priority over it, so it never interferes with the real prerendered pages under `dist/tools/<slug>/`.

**Other free static hosts** work too, with the same build command (`npm run build`) and output directory (`dist`), and the same `VITE_SITE_URL` environment variable: Vercel, Cloudflare Pages, and GitHub Pages are all common alternatives. Vercel and Cloudflare Pages auto-detect Vite projects; GitHub Pages needs `vite.config.ts`'s `base` option set to your repo path if you're not using a custom domain.

## Routing note (important for any static host)

Tool page URLs use a **trailing slash** — `/tools/json-formatter/`, not `/tools/json-formatter` — and every internal link, the sitemap, and canonical/OG tags all use this form consistently. This isn't cosmetic: `scripts/build-seo.ts` writes each tool's prerendered SEO page to `dist/tools/<slug>/index.html`, and most static file servers (this was verified directly against `vite preview`, which behaves the same way) only resolve a bare directory path like `/tools/json-formatter` (no slash) to that file when there's an explicit rewrite rule — without one, it falls through to the SPA's `index.html` instead and the visitor briefly sees the home page's title before React Router corrects the URL client-side. The trailing-slash form resolves directly to the correct prerendered file everywhere, no host-specific rewrite required. React Router matches both forms identically for in-app client-side navigation, so this only matters for the first, non-JS load — exactly the case that matters for crawlers and link previews.

## Architecture

Everything needed to add a new tool lives in `src/lib/tools/`:

- **`toolsData.ts`** — the single source of truth: one `ToolMeta` entry per tool (slug, SEO copy, intro/FAQ content, category, which workbench it uses). The home page, footer, sitemap, robots.txt, and every static SEO page are all generated from this list — nothing is hand-duplicated elsewhere.
- **`toolsRegistry.tsx`** — maps a *workbench kind* (e.g. `"json"`) to the lazily-loaded page component that renders it. `/tools/:slug` is a single generic route (`src/pages/ToolPage.tsx`) that resolves the slug against `toolsData`, looks up the right workbench, and renders it inside the shared `ToolPageLayout` (SEO tags, breadcrumbs, H1/intro, "how it works" sections, FAQ).

To add another JSON-family tool: add an entry to `toolsData.ts`. To add a new *kind* of tool (e.g. a Base64 encoder): build its workbench component, register it in `toolsRegistry.tsx`, and add its data — no router changes either way.

### JSON engine

`src/lib/json/jsonEngine.ts` has the pure format/validate/minify logic, including a small hand-written JSON grammar scanner used only to *locate* syntax errors (line/column/snippet) — browser-native `JSON.parse` error messages aren't consistent enough across engines/versions to rely on for this. It runs inside a Web Worker (`src/workers/json.worker.ts`) so large documents don't block the UI thread.

### SEO

This is a static export — no server. `scripts/build-seo.ts` runs after `vite build` and, for every tool in the registry, writes a fully-formed `dist/tools/<slug>/index.html` with the correct `<title>`, meta description, canonical URL, Open Graph/Twitter tags, and JSON-LD (SoftwareApplication + FAQPage), plus `sitemap.xml` and `robots.txt` — all resolved from the same `VITE_SITE_URL` the client bundle uses (see Environment variables above). Crawlers see correct per-page SEO tags immediately, with no JS execution required; the same bundle then hydrates into the normal client-rendered SPA.

## Known follow-ups

- No real Open Graph preview image is included (`og:image` is intentionally omitted rather than pointing at something that won't render on link-preview bots). Drop a 1200×630 image into `public/` and wire it up in `index.html` + `scripts/build-seo.ts` when one exists.
- No analytics or ads are wired up (intentionally, for now).
