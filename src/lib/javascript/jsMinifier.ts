/**
 * JavaScript minification via terser — a real, AST-based minifier rather
 * than a regex-based rewrite. JS has enough sharp edges (automatic
 * semicolon insertion, regex literals vs. division, template literals,
 * ASI-dependent control flow) that a naive text transform can silently
 * change what code does. Terser parses a real AST and is the same
 * minifier Vite/Rollup use by default, so its correctness is proven at
 * far larger scale than anything hand-rolled here could be.
 */
import { minify } from 'terser'
import type { JsonErrorInfo } from '@/lib/json/jsonEngine'

export interface JsMinifySuccess {
  ok: true
  output: string
  inputBytes: number
  outputBytes: number
}

export interface JsMinifyFailure {
  ok: false
  error: JsonErrorInfo
}

export type JsMinifyResult = JsMinifySuccess | JsMinifyFailure

function byteLength(value: string): number {
  return new TextEncoder().encode(value).length
}

interface TerserSyntaxError {
  message: string
  line?: number
  col?: number
}

function isTerserSyntaxError(error: unknown): error is TerserSyntaxError {
  return typeof error === 'object' && error !== null && 'message' in error
}

export async function minifyJavaScript(input: string): Promise<JsMinifyResult> {
  if (input.trim().length === 0) {
    return { ok: false, error: { message: 'Input is empty. Paste some JavaScript to minify.' } }
  }

  try {
    const result = await minify(input, { sourceMap: false })
    const output = result.code ?? ''
    return {
      ok: true,
      output,
      inputBytes: byteLength(input),
      outputBytes: byteLength(output),
    }
  } catch (error) {
    if (isTerserSyntaxError(error)) {
      return {
        ok: false,
        error: {
          message: error.message,
          line: error.line,
          column: error.col,
        },
      }
    }
    return { ok: false, error: { message: error instanceof Error ? error.message : String(error) } }
  }
}
