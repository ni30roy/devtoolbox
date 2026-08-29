import { BracesIcon, ClockIcon, CodeIcon, DatabaseIcon, DiceIcon, FileJsonIcon, HashIcon, LinkIcon, LockIcon, PaletteIcon, RegexIcon, ShieldIcon, SparklesIcon, SwapIcon, TableIcon } from '@/components/icons/Icons'
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
  'xml-formatter': CodeIcon,
  'sql-formatter': DatabaseIcon,
  'regex-tester': RegexIcon,
  'color-converter': PaletteIcon,
  'html-entity': CodeIcon,
  'url-parser': LinkIcon,
  password: LockIcon,
  'lorem-ipsum': SparklesIcon,
  'random-number': DiceIcon,
  hex: HashIcon,
  binary: HashIcon,
  base64: SwapIcon,
  url: LinkIcon,
  jwt: ShieldIcon,
  uuid: SparklesIcon,
  hash: HashIcon,
  'unix-timestamp': ClockIcon,
}
