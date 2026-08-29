/**
 * Pure color parsing and conversion. Deterministic math with no external
 * dependency and no ambiguity to worry about (unlike the parser-based
 * tools elsewhere on this site) — every format here is a well-defined,
 * lossless-within-rounding transform of the same RGBA value.
 */

export interface Rgba {
  r: number
  g: number
  b: number
  a: number
}

export interface ColorFormats {
  hex: string
  rgb: string
  hsl: string
  hsb: string
  cmyk: string
  rgba: Rgba
}

export interface ColorSuccess {
  ok: true
  formats: ColorFormats
}

export interface ColorFailure {
  ok: false
  error: { message: string }
}

export type ColorResult = ColorSuccess | ColorFailure

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function parsePercentOrNumber(raw: string, max: number): number {
  const trimmed = raw.trim()
  if (trimmed.endsWith('%')) return clamp((parseFloat(trimmed) / 100) * max, 0, max)
  return clamp(parseFloat(trimmed), 0, max)
}

function parseHue(raw: string): number {
  const trimmed = raw.trim()
  const value = parseFloat(trimmed)
  let deg = value
  if (trimmed.endsWith('turn')) deg = value * 360
  else if (trimmed.endsWith('rad')) deg = (value * 180) / Math.PI
  return ((deg % 360) + 360) % 360
}

export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  if (s === 0) {
    const v = Math.round(l * 255)
    return { r: v, g: v, b: v }
  }
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  let [r1, g1, b1] = [0, 0, 0]
  if (h < 60) [r1, g1, b1] = [c, x, 0]
  else if (h < 120) [r1, g1, b1] = [x, c, 0]
  else if (h < 180) [r1, g1, b1] = [0, c, x]
  else if (h < 240) [r1, g1, b1] = [0, x, c]
  else if (h < 300) [r1, g1, b1] = [x, 0, c]
  else [r1, g1, b1] = [c, 0, x]
  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255),
  }
}

function parseColorToRgba(input: string): Rgba | null {
  const text = input.trim()

  const hexMatch = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.exec(text)
  if (hexMatch) {
    let hex = hexMatch[1]
    if (hex.length === 3 || hex.length === 4) {
      hex = hex
        .split('')
        .map((c) => c + c)
        .join('')
    }
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)
    const a = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1
    return { r, g, b, a }
  }

  const rgbMatch =
    /^rgba?\(\s*([\d.]+%?)\s*[,\s]\s*([\d.]+%?)\s*[,\s]\s*([\d.]+%?)\s*(?:[,/]\s*([\d.]+%?)\s*)?\)$/i.exec(text)
  if (rgbMatch) {
    const r = Math.round(parsePercentOrNumber(rgbMatch[1], 255))
    const g = Math.round(parsePercentOrNumber(rgbMatch[2], 255))
    const b = Math.round(parsePercentOrNumber(rgbMatch[3], 255))
    const a = rgbMatch[4] !== undefined ? parsePercentOrNumber(rgbMatch[4], 1) : 1
    return { r, g, b, a }
  }

  const hslMatch =
    /^hsla?\(\s*([\d.]+(?:deg|turn|rad)?)\s*[,\s]\s*([\d.]+%)\s*[,\s]\s*([\d.]+%)\s*(?:[,/]\s*([\d.]+%?)\s*)?\)$/i.exec(
      text,
    )
  if (hslMatch) {
    const h = parseHue(hslMatch[1])
    const s = clamp(parseFloat(hslMatch[2]), 0, 100) / 100
    const l = clamp(parseFloat(hslMatch[3]), 0, 100) / 100
    const a = hslMatch[4] !== undefined ? parsePercentOrNumber(hslMatch[4], 1) : 1
    const { r, g, b } = hslToRgb(h, s, l)
    return { r, g, b, a }
  }

  const bareMatch = /^([\d.]+%?)\s*[,\s]\s*([\d.]+%?)\s*[,\s]\s*([\d.]+%?)$/.exec(text)
  if (bareMatch) {
    const r = Math.round(parsePercentOrNumber(bareMatch[1], 255))
    const g = Math.round(parsePercentOrNumber(bareMatch[2], 255))
    const b = Math.round(parsePercentOrNumber(bareMatch[3], 255))
    return { r, g, b, a: 1 }
  }

  return null
}

function rgbToHex(r: number, g: number, b: number, a: number): string {
  const toHex = (n: number) => Math.round(clamp(n, 0, 255)).toString(16).padStart(2, '0')
  let hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`
  if (a < 1) hex += toHex(Math.round(a * 255))
  return hex
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  let h = 0
  let s = 0
  const d = max - min
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1))
    switch (max) {
      case rn:
        h = ((gn - bn) / d) % 6
        break
      case gn:
        h = (bn - rn) / d + 2
        break
      default:
        h = (rn - gn) / d + 4
    }
    h *= 60
    if (h < 0) h += 360
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) }
}

function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const d = max - min
  let h = 0
  if (d !== 0) {
    switch (max) {
      case rn:
        h = ((gn - bn) / d) % 6
        break
      case gn:
        h = (bn - rn) / d + 2
        break
      default:
        h = (rn - gn) / d + 4
    }
    h *= 60
    if (h < 0) h += 360
  }
  const s = max === 0 ? 0 : d / max
  return { h: Math.round(h), s: Math.round(s * 100), v: Math.round(max * 100) }
}

function rgbToCmyk(r: number, g: number, b: number): { c: number; m: number; y: number; k: number } {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const k = 1 - Math.max(rn, gn, bn)
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 }
  const c = (1 - rn - k) / (1 - k)
  const m = (1 - gn - k) / (1 - k)
  const y = (1 - bn - k) / (1 - k)
  return { c: Math.round(c * 100), m: Math.round(m * 100), y: Math.round(y * 100), k: Math.round(k * 100) }
}

export function convertColor(input: string): ColorResult {
  if (input.trim().length === 0) {
    return { ok: false, error: { message: 'Input is empty. Enter a color to convert.' } }
  }

  const rgba = parseColorToRgba(input)
  if (!rgba) {
    return {
      ok: false,
      error: {
        message:
          "Couldn't recognize this as a color. Try a hex code (#3b82f6), rgb()/rgba(), hsl()/hsla(), or plain \"r, g, b\" values.",
      },
    }
  }

  const { r, g, b, a } = rgba
  const hsl = rgbToHsl(r, g, b)
  const hsv = rgbToHsv(r, g, b)
  const cmyk = rgbToCmyk(r, g, b)

  const hasAlpha = a < 1
  const formats: ColorFormats = {
    hex: rgbToHex(r, g, b, a),
    rgb: hasAlpha ? `rgba(${r}, ${g}, ${b}, ${a})` : `rgb(${r}, ${g}, ${b})`,
    hsl: hasAlpha ? `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${a})` : `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
    hsb: `hsb(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`,
    cmyk: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`,
    rgba: { r, g, b, a },
  }

  return { ok: true, formats }
}
