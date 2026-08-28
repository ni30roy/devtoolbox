/**
 * Site-wide constants. Single source of truth for SEO tags, sitemap
 * generation, and the static-page prerender script (all three read from
 * here, plus from `lib/tools/toolsData.ts`).
 */
export const SITE_NAME = 'DevToolBox'
export const SITE_TAGLINE = 'Free online developer tools'
export const SITE_DESCRIPTION =
  'Free, fast, privacy-friendly developer utilities that run entirely in your browser. No sign-up, no ads tracking your data, no file ever leaves your device.'
export const TWITTER_HANDLE = '@devtoolbox'

/**
 * Obviously-fake placeholder used whenever VITE_SITE_URL isn't configured,
 * so a missing env var shows up as a glaring "you forgot to set this" in
 * output instead of silently shipping a wrong-but-plausible domain.
 */
export const FALLBACK_SITE_URL = 'https://your-production-domain.example'

/** Trims a trailing slash and falls back to FALLBACK_SITE_URL when unset. */
export function normalizeSiteUrl(value: string | undefined | null): string {
  const trimmed = value?.trim()
  const url = trimmed && trimmed.length > 0 ? trimmed : FALLBACK_SITE_URL
  return url.replace(/\/+$/, '')
}

/**
 * The deployed site's absolute origin (no trailing slash), e.g.
 * "https://devtoolbox.dev". Configure via the VITE_SITE_URL env var —
 * see .env.example and README.md. Used by the client app (Seo.tsx) for
 * canonical/OG URLs during in-app navigation; scripts/build-seo.ts resolves
 * its own copy independently (it runs outside Vite) but from the same env.
 */
export const SITE_URL = normalizeSiteUrl(import.meta.env?.VITE_SITE_URL)
