import { Suspense, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { getToolBySlug } from '@/lib/tools/toolsData'
import { getToolPageComponent } from '@/lib/tools/toolsRegistry'
import { Container } from '@/components/layout/Container'
import NotFoundPage from './NotFoundPage'

function ToolPageSkeleton() {
  return (
    <Container className="py-8 sm:py-12">
      <div className="h-4 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      <div className="mt-4 h-9 w-80 max-w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      <div className="mt-3 h-16 max-w-2xl animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      <div className="mt-8 h-96 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
    </Container>
  )
}

/**
 * Every /tools/:slug route funnels through here. The slug is resolved
 * against the shared tool registry (src/lib/tools/toolsData.ts) — adding a
 * new tool is a data + component change, never a routing change.
 */
export default function ToolPage() {
  const { slug } = useParams<{ slug: string }>()
  const tool = slug ? getToolBySlug(slug) : undefined
  // Hooks must run unconditionally, so this is computed before the not-found
  // check below; the fallback kind is never actually rendered when tool is undefined.
  const Page = useMemo(() => getToolPageComponent(tool?.workbench ?? 'json'), [tool?.workbench])

  if (!tool) return <NotFoundPage />

  return (
    <Suspense fallback={<ToolPageSkeleton />}>
      {/* oxlint-disable-next-line react/static-components -- Page is a stable
          module-level lazy() reference from the registry lookup above, not a
          component freshly created on this render. */}
      <Page tool={tool} />
    </Suspense>
  )
}
