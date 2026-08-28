/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Absolute production origin, e.g. "https://devtoolbox.dev" (no trailing slash). See .env.production. */
  readonly VITE_SITE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
