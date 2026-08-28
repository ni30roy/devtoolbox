/**
 * Post-build step: turns the single built `dist/index.html` into a static,
 * fully-formed HTML page per route (correct <title>, meta description,
 * canonical URL, Open Graph/Twitter tags, and JSON-LD) — plus sitemap.xml
 * and robots.txt. All from the same tool registry the app renders from, so
 * SEO content and on-page content can't drift apart.
 *
 * This keeps the site a pure static export (no server/backend): each route
 * gets its own pre-rendered `index.html` shell that a crawler (or a
 * no-JS fetch) sees immediately, while the same bundle rehydrates into the
 * normal client-rendered SPA for real visitors and in-app navigation.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { loadEnv } from 'vite'
import { getCategoryById, tools } from '../src/lib/tools/toolsData'
import { SITE_DESCRIPTION, SITE_NAME, getSiteFaqs, normalizeSiteUrl } from '../src/lib/site'

const distDir = path.resolve(process.cwd(), 'dist')

// This script runs as a plain Node process after `vite build`, so it can't
// read `import.meta.env` the way the app does — it resolves VITE_SITE_URL
// itself via Vite's own env-file loader (.env, .env.production, their
// .local overrides, and real process.env vars from a hosting provider all
// apply, same precedence `vite build` uses), so the static pages generated
// here always match what got baked into the client bundle.
const resolvedEnv = loadEnv('production', process.cwd(), '')
const SITE_URL = normalizeSiteUrl(resolvedEnv.VITE_SITE_URL)

function setTag(html: string, pattern: RegExp, replacement: string): string {
  if (!pattern.test(html)) {
    throw new Error(`build-seo: expected template tag not found: ${pattern}`)
  }
  return html.replace(pattern, replacement)
}

function setMeta(html: string, attr: 'name' | 'property', key: string, content: string): string {
  const pattern = new RegExp(`<meta ${attr}="${key}" content="[^"]*"\\s*/?>`)
  return setTag(html, pattern, `<meta ${attr}="${key}" content="${escapeAttr(content)}" />`)
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}

/** Sets the canonical link and og:url meta to an absolute URL under SITE_URL. */
function setUrls(html: string, url: string): string {
  let out = html
  out = setTag(out, /<link rel="canonical" href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${url}" />`)
  out = setMeta(out, 'property', 'og:url', url)
  return out
}

function applyCommonSeo(html: string, opts: { title: string; description: string; url: string }): string {
  let out = html
  out = setTag(out, /<title>[^<]*<\/title>/, `<title>${opts.title}</title>`)
  out = setMeta(out, 'name', 'description', opts.description)
  out = setUrls(out, opts.url)
  out = setMeta(out, 'property', 'og:title', opts.title)
  out = setMeta(out, 'property', 'og:description', opts.description)
  out = setMeta(out, 'name', 'twitter:title', opts.title)
  out = setMeta(out, 'name', 'twitter:description', opts.description)
  return out
}

function withStructuredData(html: string, json: unknown): string {
  const script = `<script type="application/ld+json">${JSON.stringify(json)}</script>`
  return html.replace('<!--seo:structured-data-->', script)
}

function faqPageData(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  }
}

function websiteStructuredData() {
  const graph: unknown[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      url: `${SITE_URL}/`,
      description: SITE_DESCRIPTION,
      publisher: {
        '@type': 'Organization',
        name: SITE_NAME,
        url: `${SITE_URL}/`,
        logo: `${SITE_URL}/favicon.svg`,
      },
    },
  ]
  const siteFaqs = getSiteFaqs(tools.map((tool) => tool.name))
  if (siteFaqs.length > 0) graph.push(faqPageData(siteFaqs))
  return graph
}

function breadcrumbStructuredData(tool: (typeof tools)[number]) {
  const category = getCategoryById(tool.categoryId)
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: category?.name ?? 'Tools', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 3, name: tool.name },
    ],
  }
}

function toolStructuredData(tool: (typeof tools)[number]) {
  const url = `${SITE_URL}/tools/${tool.slug}/`
  const graph: unknown[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: tool.name,
      url,
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Any (runs in the browser)',
      description: tool.metaDescription,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    breadcrumbStructuredData(tool),
  ]
  if (tool.faqs.length > 0) graph.push(faqPageData(tool.faqs))
  return graph
}

function buildRobots(): string {
  return `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`
}

function buildSitemap(): string {
  type Entry = { loc: string; changefreq: string; priority: string; lastmod?: string }
  const urls: Entry[] = [
    { loc: `${SITE_URL}/`, changefreq: 'weekly', priority: '1.0' },
    ...tools.map((tool) => ({
      loc: `${SITE_URL}/tools/${tool.slug}/`,
      changefreq: 'monthly',
      priority: '0.8',
      lastmod: tool.addedAt,
    })),
  ]
  const body = urls
    .map((entry) => {
      const lastmod = entry.lastmod ? `\n    <lastmod>${entry.lastmod}</lastmod>` : ''
      return `  <url>\n    <loc>${entry.loc}</loc>${lastmod}\n    <changefreq>${entry.changefreq}</changefreq>\n    <priority>${entry.priority}</priority>\n  </url>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`
}

async function main() {
  if (!resolvedEnv.VITE_SITE_URL) {
    console.warn(
      `\nbuild-seo: VITE_SITE_URL is not set — canonical URLs, sitemap.xml, robots.txt, Open Graph tags, and JSON-LD will all use the placeholder "${SITE_URL}".\n` +
        `Set VITE_SITE_URL (see .env.example, or your hosting provider's environment variables) before deploying. See README.md.\n`,
    )
  }

  const template = await readFile(path.join(distDir, 'index.html'), 'utf8')

  // Home page keeps the hand-authored title/description already in the
  // template; it only needs its URLs and the WebSite structured data set.
  const homeHtml = withStructuredData(setUrls(template, `${SITE_URL}/`), websiteStructuredData())
  await writeFile(path.join(distDir, 'index.html'), homeHtml, 'utf8')

  for (const tool of tools) {
    const title = `${tool.name} \u2013 Free Online Tool | ${SITE_NAME}`
    const url = `${SITE_URL}/tools/${tool.slug}/`
    let html = applyCommonSeo(template, { title, description: tool.metaDescription, url })
    html = withStructuredData(html, toolStructuredData(tool))

    const outDir = path.join(distDir, 'tools', tool.slug)
    await mkdir(outDir, { recursive: true })
    await writeFile(path.join(outDir, 'index.html'), html, 'utf8')
  }

  // Static 404 page for Cloudflare's `assets.not_found_handling: "404-page"`
  // (see wrangler.jsonc): served with a genuine HTTP 404 for any unmatched
  // path, so a bad/typo URL doesn't return 200 with the homepage's indexable
  // content — a "soft 404" that would otherwise confuse crawlers. It shares
  // the same JS bundle, so React Router still renders the app's own
  // NotFoundPage UI once it hydrates; this only fixes what a crawler sees
  // before any JS runs.
  let notFoundHtml = setTag(template, /<title>[^<]*<\/title>/, `<title>Page not found | ${SITE_NAME}</title>`)
  notFoundHtml = setMeta(notFoundHtml, 'name', 'robots', 'noindex, follow')
  notFoundHtml = setMeta(
    notFoundHtml,
    'name',
    'description',
    `The page you're looking for doesn't exist. Browse all free developer tools on ${SITE_NAME}.`,
  )
  await writeFile(path.join(distDir, '404.html'), notFoundHtml, 'utf8')

  await writeFile(path.join(distDir, 'robots.txt'), buildRobots(), 'utf8')
  await writeFile(path.join(distDir, 'sitemap.xml'), buildSitemap(), 'utf8')

  console.log(`build-seo: wrote ${tools.length} tool page(s), 404.html, sitemap.xml, and robots.txt`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
