/**
 * Pure data types for the tool registry. Deliberately free of any
 * React/JSX import so `toolsData.ts` can be loaded by plain Node build
 * scripts (sitemap + static-page generation) as well as by the app.
 */

export type ToolCategoryId =
  | 'json'
  | 'text'
  | 'encoding'
  | 'formatting'
  | 'converters'
  | 'security'
  | 'generators'
  | 'date-time'

export interface ToolCategory {
  id: ToolCategoryId
  name: string
  description: string
}

/** Which workbench UI a tool page renders. One workbench can power several
 * routes (e.g. the JSON workbench powers formatter/validator/minifier/beautifier). */
export type WorkbenchKind = 'json' | 'json-to-yaml' | 'base64' | 'url' | 'jwt' | 'uuid' | 'hash' | 'unix-timestamp'

export type JsonToolMode = 'format' | 'validate' | 'minify'

export interface ToolFaq {
  question: string
  answer: string
}

export interface ToolMeta {
  slug: string
  name: string
  /** Short one-line description used on tool cards. */
  tagline: string
  /** <=160 chars, used as <meta name="description"> and og:description. */
  metaDescription: string
  categoryId: ToolCategoryId
  keywords: string[]
  h1: string
  /** Intro paragraphs rendered below the H1, above the workbench. */
  intro: string[]
  /** Optional "How it works" / "Why use this" paragraphs below the workbench. */
  details: { heading: string; paragraphs: string[] }[]
  faqs: ToolFaq[]
  popular: boolean
  /** ISO date (YYYY-MM-DD) — drives the "Recently added" section. */
  addedAt: string
  workbench: WorkbenchKind
  jsonMode?: JsonToolMode
}
