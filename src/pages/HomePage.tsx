import { Seo } from '@/components/seo/Seo'
import { Container } from '@/components/layout/Container'
import { Hero } from '@/components/home/Hero'
import { ToolExplorer } from '@/components/home/ToolExplorer'
import { PopularTools } from '@/components/home/PopularTools'
import { RecentTools } from '@/components/home/RecentTools'
import { About } from '@/components/home/About'
import { FaqSection } from '@/components/tool-shell/FaqSection'
import { SITE_DESCRIPTION, SITE_NAME, getSiteFaqs } from '@/lib/site'
import { tools } from '@/lib/tools/toolsData'

export default function HomePage() {
  const faqs = getSiteFaqs(tools.map((tool) => tool.name))

  return (
    <>
      <Seo title={`${SITE_NAME} – Free Online Developer Tools`} description={SITE_DESCRIPTION} path="/" />
      <Hero />
      <Container>
        <ToolExplorer />
        <PopularTools />
        <RecentTools />
        <About />
        <div className="border-t border-slate-200 py-14 dark:border-slate-800">
          <FaqSection faqs={faqs} />
        </div>
      </Container>
    </>
  )
}
