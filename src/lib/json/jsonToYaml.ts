/**
 * Pure JSON→YAML conversion. No DOM/browser APIs, so this can run on the
 * main thread or inside a Web Worker unchanged — mirrors jsonEngine.ts.
 */
import { stringify } from 'yaml'
import { describeJsonError, type JsonErrorInfo } from './jsonEngine'

export interface YamlSuccess {
  ok: true
  output: string
  inputBytes: number
  outputBytes: number
}

export interface YamlFailure {
  ok: false
  error: JsonErrorInfo
}

export type YamlResult = YamlSuccess | YamlFailure

function byteLength(value: string): number {
  return new TextEncoder().encode(value).length
}

export function convertJsonToYaml(input: string): YamlResult {
  if (input.trim().length === 0) {
    return { ok: false, error: { message: 'Input is empty. Paste some JSON to convert.' } }
  }
  try {
    const data = JSON.parse(input)
    const output = stringify(data)
    return { ok: true, output, inputBytes: byteLength(input), outputBytes: byteLength(output) }
  } catch (error) {
    // Reuses the same line/column-aware error scanner the other JSON tools
    // use, so an invalid-JSON error looks identical everywhere on the site.
    return { ok: false, error: describeJsonError(error, input) }
  }
}
