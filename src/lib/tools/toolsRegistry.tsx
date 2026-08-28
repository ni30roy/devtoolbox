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
  base64: lazy(() => import('@/pages/tools/Base64ToolPage')),
  url: lazy(() => import('@/pages/tools/UrlToolPage')),
  jwt: lazy(() => import('@/pages/tools/JwtToolPage')),
  uuid: lazy(() => import('@/pages/tools/UuidToolPage')),
}

export function getToolPageComponent(kind: WorkbenchKind) {
  return workbenchPages[kind]
}
