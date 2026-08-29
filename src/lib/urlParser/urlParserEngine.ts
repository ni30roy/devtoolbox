/**
 * URL parsing via the browser's native URL/URLSearchParams — the same
 * parser the browser itself uses for navigation, so results (IDN
 * punycode normalization, IPv6 bracket handling, query-string `+`-as-
 * space semantics) match real browser behavior exactly rather than an
 * approximation.
 */

export interface QueryParam {
  key: string
  values: string[]
}

export interface UrlParts {
  href: string
  protocol: string
  username: string
  password: string
  host: string
  hostname: string
  port: string
  pathname: string
  search: string
  hash: string
  origin: string
  queryParams: QueryParam[]
}

export interface UrlParseSuccess {
  ok: true
  parts: UrlParts
}

export interface UrlParseFailure {
  ok: false
  error: { message: string }
}

export type UrlParseResult = UrlParseSuccess | UrlParseFailure

function extractQueryParams(searchParams: URLSearchParams): QueryParam[] {
  const order: string[] = []
  const byKey = new Map<string, string[]>()
  for (const [key, value] of searchParams) {
    if (!byKey.has(key)) {
      byKey.set(key, [])
      order.push(key)
    }
    byKey.get(key)!.push(value)
  }
  return order.map((key) => ({ key, values: byKey.get(key)! }))
}

function toParts(url: URL): UrlParts {
  return {
    href: url.href,
    protocol: url.protocol,
    username: url.username,
    password: url.password,
    host: url.host,
    hostname: url.hostname,
    port: url.port,
    pathname: url.pathname,
    search: url.search,
    hash: url.hash,
    origin: url.origin,
    queryParams: extractQueryParams(url.searchParams),
  }
}

export function parseUrl(input: string): UrlParseResult {
  const text = input.trim()
  if (text.length === 0) {
    return { ok: false, error: { message: 'Input is empty. Paste a URL to parse.' } }
  }

  try {
    return { ok: true, parts: toParts(new URL(text)) }
  } catch {
    // A bare "example.com/path" is the single most common reason this
    // throws — check whether adding a scheme would have worked, and say
    // so specifically instead of a generic "invalid URL".
    try {
      new URL(`https://${text}`)
      return {
        ok: false,
        error: {
          message: `This looks like a domain or path without a scheme. Try adding "https://" to the front — e.g. "https://${text}".`,
        },
      }
    } catch {
      return {
        ok: false,
        error: { message: "Invalid URL. Make sure it includes a scheme, like https://example.com." },
      }
    }
  }
}
