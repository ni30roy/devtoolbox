import { Link } from 'react-router-dom'
import { Seo } from '@/components/seo/Seo'
import { Container } from '@/components/layout/Container'

export default function NotFoundPage() {
  return (
    <>
      <Seo title="Page not found | DevToolBox" description="This page doesn't exist." path="/404" noindex />
      <Container className="flex flex-col items-center py-24 text-center">
        <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">404</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          We couldn&apos;t find that page
        </h1>
        <p className="mt-3 max-w-md text-slate-600 dark:text-slate-400">
          The tool you're looking for may have moved or doesn't exist yet.
        </p>
        <Link
          to="/"
          className="focus-ring mt-6 inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500"
        >
          Back to all tools
        </Link>
      </Container>
    </>
  )
}
