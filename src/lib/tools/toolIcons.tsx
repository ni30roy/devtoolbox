import { BracesIcon, ClockIcon, FileJsonIcon, HashIcon, LinkIcon, ShieldIcon, SparklesIcon, SwapIcon } from '@/components/icons/Icons'
import type { WorkbenchKind } from './types'

/** One icon per workbench kind — add an entry here when a new kind of tool ships. */
export const toolIcons: Record<WorkbenchKind, typeof FileJsonIcon> = {
  json: FileJsonIcon,
  'json-to-yaml': BracesIcon,
  base64: SwapIcon,
  url: LinkIcon,
  jwt: ShieldIcon,
  uuid: SparklesIcon,
  hash: HashIcon,
  'unix-timestamp': ClockIcon,
}
