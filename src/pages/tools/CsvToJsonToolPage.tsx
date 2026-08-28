import { ToolPageLayout } from '@/components/tool-shell/ToolPageLayout'
import { CsvToJsonWorkbench } from '@/components/csv-to-json/CsvToJsonWorkbench'
import type { ToolMeta } from '@/lib/tools/types'

export default function CsvToJsonToolPage({ tool }: { tool: ToolMeta }) {
  return (
    <ToolPageLayout tool={tool}>
      <CsvToJsonWorkbench />
    </ToolPageLayout>
  )
}
