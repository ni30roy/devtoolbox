import { lazy, type ComponentType } from 'react'
import type { ToolMeta, WorkbenchKind } from './types'

/**
 * Maps a workbench kind to the (lazily-loaded, code-split) page component
 * that renders it. Adding a new *kind* of tool means adding one entry here
 * and one page component — every route is still driven by `toolsData.ts`,
 * no router changes needed. Adding another tool of an *existing* kind
 * (e.g. a 4th JSON tool) needs nothing here at all.
 */
const workbenchPages: Record<WorkbenchKind, ComponentType<{ tool: ToolMeta }>> = {
  json: lazy(() => import('@/pages/tools/JsonToolPage')),
  'json-to-yaml': lazy(() => import('@/pages/tools/JsonToYamlToolPage')),
  'json-to-csv': lazy(() => import('@/pages/tools/JsonToCsvToolPage')),
  'csv-to-json': lazy(() => import('@/pages/tools/CsvToJsonToolPage')),
  'html-formatter': lazy(() => import('@/pages/tools/HtmlFormatterToolPage')),
  css: lazy(() => import('@/pages/tools/CssToolPage')),
  'js-minifier': lazy(() => import('@/pages/tools/JsMinifierToolPage')),
  'xml-formatter': lazy(() => import('@/pages/tools/XmlFormatterToolPage')),
  'sql-formatter': lazy(() => import('@/pages/tools/SqlFormatterToolPage')),
  'regex-tester': lazy(() => import('@/pages/tools/RegexTesterToolPage')),
  'color-converter': lazy(() => import('@/pages/tools/ColorConverterToolPage')),
  'html-entity': lazy(() => import('@/pages/tools/HtmlEntityToolPage')),
  base64: lazy(() => import('@/pages/tools/Base64ToolPage')),
  url: lazy(() => import('@/pages/tools/UrlToolPage')),
  jwt: lazy(() => import('@/pages/tools/JwtToolPage')),
  uuid: lazy(() => import('@/pages/tools/UuidToolPage')),
  hash: lazy(() => import('@/pages/tools/HashToolPage')),
  'unix-timestamp': lazy(() => import('@/pages/tools/TimestampToolPage')),
}

export function getToolPageComponent(kind: WorkbenchKind) {
  return workbenchPages[kind]
}
