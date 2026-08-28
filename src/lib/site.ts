import type { ToolFaq } from './tools/types'

/**
 * Site-wide constants. Single source of truth for SEO tags, sitemap
 * generation, and the static-page prerender script (all three read from
 * here, plus from `lib/tools/toolsData.ts`).
 */
export const SITE_NAME = 'CodeTool'
export const SITE_TAGLINE = 'Free online developer tools'
export const SITE_DESCRIPTION =
  'CodeTool is a free online developer toolbox — fast, privacy-friendly utilities for JSON and more that run entirely in your browser. No sign-up, no ads, no file ever leaves your device.'

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
 * "https://codetool.co.in". Configure via the VITE_SITE_URL env var —
 * see .env.example and README.md. Used by the client app (Seo.tsx) for
 * canonical/OG URLs during in-app navigation; scripts/build-seo.ts resolves
 * its own copy independently (it runs outside Vite) but from the same env.
 */
export const SITE_URL = normalizeSiteUrl(import.meta.env?.VITE_SITE_URL)

/**
 * Site-level FAQ, shown on the homepage and mirrored into its FAQPage
 * structured data. Genuine, verifiable answers only (no fabricated claims).
 * `toolNames` is passed in rather than imported from toolsData so this stays
 * usable from both the React app and the Node build script without a
 * circular/duplicated dependency on the tool registry.
 */
export function getSiteFaqs(toolNames: string[]): ToolFaq[] {
  return [
    {
      question: 'Is CodeTool free to use?',
      answer: 'Yes — every tool is free, with no account, subscription, or usage limit.',
    },
    {
      question: 'Do I need to create an account?',
      answer: 'No. Open any tool and start using it immediately — there is nothing to sign up for.',
    },
    {
      question: 'Is my data safe when I use CodeTool?',
      answer:
        "Yes. Every tool runs entirely in your browser using JavaScript already built into it — nothing you paste or upload is ever sent to a server, logged, or stored anywhere.",
    },
    {
      question: 'What tools does CodeTool currently offer?',
      answer: `${toolNames.join(', ')} today, with more free developer utilities planned.`,
    },
  ]
}
