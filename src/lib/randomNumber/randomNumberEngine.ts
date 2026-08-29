/**
 * Random integer generation using crypto.getRandomValues() with rejection
 * sampling — the same unbiased approach as the Password Generator. Not
 * strictly a security requirement here, but genuinely better than
 * Math.random() for anything where fairness matters (raffles, drawings,
 * sampling), and no more complex to implement correctly.
 */

export const MIN_COUNT = 1
export const MAX_COUNT = 100

export interface RandomNumberOptions {
  min: number
  max: number
  count: number
  unique: boolean
}

export interface RandomNumberSuccess {
  ok: true
  values: number[]
}

export interface RandomNumberFailure {
  ok: false
  error: { message: string }
}

export type RandomNumberResult = RandomNumberSuccess | RandomNumberFailure

/** Rejection-sampled random integer in [min, max], unbiased regardless of range size. */
function secureRandomInt(min: number, max: number): number {
  const range = max - min + 1
  const bitsNeeded = Math.ceil(Math.log2(range))
  const bytesNeeded = Math.max(1, Math.ceil(bitsNeeded / 8))
  const maxValue = 256 ** bytesNeeded
  const maxValid = maxValue - (maxValue % range)
  let value: number
  do {
    const bytes = new Uint8Array(bytesNeeded)
    crypto.getRandomValues(bytes)
    value = bytes.reduce((acc, b) => acc * 256 + b, 0)
  } while (value >= maxValid)
  return min + (value % range)
}

export function generateRandomNumbers(options: RandomNumberOptions): RandomNumberResult {
  const min = Math.trunc(options.min)
  const max = Math.trunc(options.max)
  const count = Math.min(MAX_COUNT, Math.max(MIN_COUNT, Math.trunc(options.count) || MIN_COUNT))

  if (min > max) {
    return { ok: false, error: { message: 'Min must be less than or equal to max.' } }
  }

  const range = max - min + 1
  if (options.unique && count > range) {
    return {
      ok: false,
      error: { message: `This range only has ${range} possible value${range === 1 ? '' : 's'} — can't generate ${count} unique numbers.` },
    }
  }

  if (options.unique) {
    const seen = new Set<number>()
    while (seen.size < count) seen.add(secureRandomInt(min, max))
    return { ok: true, values: [...seen] }
  }

  return { ok: true, values: Array.from({ length: count }, () => secureRandomInt(min, max)) }
}
