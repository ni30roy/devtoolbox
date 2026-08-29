/**
 * Pure regex matching against JavaScript's own RegExp engine — this tool
 * deliberately tests against the real engine (not a custom regex
 * implementation) so results match what your code will actually do.
 */

export interface RegexMatch {
  match: string
  index: number
  groups: (string | undefined)[]
  namedGroups?: Record<string, string | undefined>
}

export interface RegexSuccess {
  ok: true
  matches: RegexMatch[]
  matchCount: number
}

export interface RegexFailure {
  ok: false
  error: { message: string }
}

export type RegexResult = RegexSuccess | RegexFailure

// A pathological pattern (catastrophic backtracking) combined with the
// wrong input can loop effectively forever. This is a last-resort
// iteration cap for the (rare) global-match loop itself; the real
// protection against a hang is the caller terminating the worker this
// runs in after a timeout — see useRegexWorker.ts.
const MAX_MATCHES = 100_000

export function testRegex(pattern: string, flags: string, testString: string): RegexResult {
  let regex: RegExp
  try {
    regex = new RegExp(pattern, flags)
  } catch (error) {
    return { ok: false, error: { message: error instanceof Error ? error.message : String(error) } }
  }

  const matches: RegexMatch[] = []

  if (regex.global) {
    let match: RegExpExecArray | null
    while ((match = regex.exec(testString)) !== null) {
      matches.push({
        match: match[0],
        index: match.index,
        groups: match.slice(1),
        namedGroups: match.groups ? { ...match.groups } : undefined,
      })
      // Zero-length matches (e.g. `a*`) don't advance lastIndex on their
      // own, which would loop forever — nudge past them manually.
      if (match[0].length === 0) regex.lastIndex++
      if (matches.length >= MAX_MATCHES) break
    }
  } else {
    const match = regex.exec(testString)
    if (match) {
      matches.push({
        match: match[0],
        index: match.index,
        groups: match.slice(1),
        namedGroups: match.groups ? { ...match.groups } : undefined,
      })
    }
  }

  return { ok: true, matches, matchCount: matches.length }
}
