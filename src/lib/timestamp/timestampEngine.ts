/**
 * Pure Unix timestamp <-> date conversion using the browser's native Date
 * object. No library needed — Date already handles both directions and
 * correctly validates out-of-range values (returns an Invalid Date, whose
 * getTime() is NaN, rather than silently wrapping or corrupting data).
 */

export type TimestampUnit = 'seconds' | 'milliseconds'

export interface DateInfo {
  iso: string
  utc: string
  local: string
  timezone: string
}

export interface TimestampToDateSuccess {
  ok: true
  date: DateInfo
}

export interface TimestampToDateFailure {
  ok: false
  error: { message: string }
}

export type TimestampToDateResult = TimestampToDateSuccess | TimestampToDateFailure

export interface DateToTimestampSuccess {
  ok: true
  seconds: number
  milliseconds: number
  date: DateInfo
}

export type DateToTimestampResult = DateToTimestampSuccess | TimestampToDateFailure

function buildDateInfo(date: Date): DateInfo {
  return {
    iso: date.toISOString(),
    utc: date.toUTCString(),
    local: date.toString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }
}

export function timestampToDate(value: string, unit: TimestampUnit): TimestampToDateResult {
  const trimmed = value.trim()
  if (trimmed.length === 0) {
    return { ok: false, error: { message: 'Input is empty. Enter a Unix timestamp to convert.' } }
  }
  if (!/^-?\d+$/.test(trimmed)) {
    return { ok: false, error: { message: `Invalid timestamp: expected a whole number of ${unit}.` } }
  }
  const numeric = Number(trimmed)
  const milliseconds = unit === 'seconds' ? numeric * 1000 : numeric
  const date = new Date(milliseconds)
  if (Number.isNaN(date.getTime())) {
    return { ok: false, error: { message: 'Invalid timestamp: out of the range a JavaScript Date can represent.' } }
  }
  return { ok: true, date: buildDateInfo(date) }
}

/** `localDateTimeValue` is a `datetime-local` input value (e.g. "2024-01-15T10:30"),
 * which JavaScript's Date constructor correctly interprets as local time (no
 * timezone offset in the string means local, per the ECMAScript date-time spec). */
export function dateToTimestamp(localDateTimeValue: string): DateToTimestampResult {
  if (!localDateTimeValue) {
    return { ok: false, error: { message: 'Pick a date and time to convert.' } }
  }
  const date = new Date(localDateTimeValue)
  if (Number.isNaN(date.getTime())) {
    return { ok: false, error: { message: 'Invalid date/time.' } }
  }
  return {
    ok: true,
    seconds: Math.floor(date.getTime() / 1000),
    milliseconds: date.getTime(),
    date: buildDateInfo(date),
  }
}
