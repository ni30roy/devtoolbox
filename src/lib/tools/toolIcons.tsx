import { BracesIcon, ClockIcon, CodeIcon, FileJsonIcon, HashIcon, LinkIcon, PaletteIcon, ShieldIcon, SparklesIcon, SwapIcon, TableIcon } from '@/components/icons/Icons'
import type { WorkbenchKind } from './types'

/** One icon per workbench kind — add an entry here when a new kind of tool ships. */
export const toolIcons: Record<WorkbenchKind, typeof FileJsonIcon> = {
  json: FileJsonIcon,
  'json-to-yaml': BracesIcon,
  'json-to-csv': TableIcon,
  'csv-to-json': FileJsonIcon,
  'html-formatter': CodeIcon,
  css: PaletteIcon,
  'js-minifier': CodeIcon,
  base64: SwapIcon,
  url: LinkIcon,
  jwt: ShieldIcon,
  uuid: SparklesIcon,
  hash: HashIcon,
  'unix-timestamp': ClockIcon,
}
