import type { ReactNode } from 'react'
import { Seo } from '@/components/seo/Seo'
import { Container } from '@/components/layout/Container'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { ToolGrid } from '@/components/home/ToolGrid'
import { FaqSection } from './FaqSection'
import { getCategoryById, tools } from '@/lib/tools/toolsData'
import { SITE_NAME } from '@/lib/site'
import type { ToolMeta } from '@/lib/tools/types'

interface ToolPageLayoutProps {
  tool: ToolMeta
  children: ReactNode
}

/**
 * Generic shell every tool page renders through: SEO tags, breadcrumbs,
 * H1 + intro, the tool's interactive workbench (passed as children), then
 * "how it works" content and an FAQ section — all sourced from the tool's
 * registry entry, so a new tool needs data + a workbench, not a new layout.
 */
export function ToolPageLayout({ tool, children }: ToolPageLayoutProps) {
  const category = getCategoryById(tool.categoryId)
  const title = `${tool.name} – Free Online Tool | ${SITE_NAME}`
  const relatedTools = tools.filter((other) => other.categoryId === tool.categoryId && other.slug !== tool.slug)

  return (
    <>
      <Seo title={title} description={tool.metaDescription} path={`/tools/${tool.slug}/`} />

      <Container className="py-8 sm:py-12">
        <Breadcrumbs
          items={[{ label: 'Home', to: '/' }, { label: category?.name ?? 'Tools', to: '/' }, { label: tool.name }]}
        />

        <header className="mt-4 max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            {tool.h1}
          </h1>
          <div className="mt-4 space-y-3 text-base text-slate-600 dark:text-slate-400">
            {tool.intro.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </div>
        </header>

        <div className="mt-8">{children}</div>

        {tool.details.length > 0 && (
          <div className="mt-16 max-w-3xl space-y-10">
            {tool.details.map((section) => (
              <section key={section.heading}>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{section.heading}</h2>
                <div className="mt-3 space-y-3 text-slate-600 dark:text-slate-400">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {tool.faqs.length > 0 && (
          <div className="mt-16 max-w-3xl">
            <FaqSection faqs={tool.faqs} />
          </div>
        )}

        {relatedTools.length > 0 && (
          <div className="mt-16 max-w-3xl">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Related tools</h2>
            <div className="mt-4">
              <ToolGrid tools={relatedTools} />
            </div>
          </div>
        )}
      </Container>
    </>
  )
}
