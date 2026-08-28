import { Seo } from '@/components/seo/Seo'
import { Container } from '@/components/layout/Container'
import { Hero } from '@/components/home/Hero'
import { ToolExplorer } from '@/components/home/ToolExplorer'
import { PopularTools } from '@/components/home/PopularTools'
import { RecentTools } from '@/components/home/RecentTools'
import { SITE_DESCRIPTION, SITE_NAME } from '@/lib/site'

export default function HomePage() {
  return (
    <>
      <Seo title={`${SITE_NAME} – Free Online Developer Tools`} description={SITE_DESCRIPTION} path="/" />
      <Hero />
      <Container>
        <ToolExplorer />
        <PopularTools />
        <RecentTools />
      </Container>
    </>
  )
}
