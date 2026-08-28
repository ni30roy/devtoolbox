import { useEffect } from 'react'
import { SITE_URL } from '@/lib/site'

interface SeoProps {
  title: string
  description: string
  /** Path starting with "/", e.g. "/tools/json-formatter". */
  path: string
  /** Set for pages that shouldn't be indexed (e.g. 404). */
  noindex?: boolean
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

/**
 * Keeps the document head in sync during in-app (client-side) navigation.
 * The *initial* HTML for each route already has correct tags baked in by
 * scripts/build-seo.ts, so crawlers and link-preview bots that don't run
 * JS still see the right title/description/OG tags on first load — this
 * component only matters once React has taken over.
 */
export function Seo({ title, description, path, noindex }: SeoProps) {
  useEffect(() => {
    const url = `${SITE_URL}${path}`
    document.title = title
    upsertMeta('name', 'description', description)
    upsertMeta('property', 'og:title', title)
    upsertMeta('property', 'og:description', description)
    upsertMeta('property', 'og:url', url)
    upsertMeta('name', 'twitter:title', title)
    upsertMeta('name', 'twitter:description', description)
    upsertCanonical(url)
    upsertMeta('name', 'robots', noindex ? 'noindex,follow' : 'index,follow')
  }, [title, description, path, noindex])

  return null
}
