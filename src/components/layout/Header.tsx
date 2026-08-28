import { Link } from 'react-router-dom'
import { Container } from './Container'
import { ThemeToggle } from './ThemeToggle'
import { BracesIcon } from '@/components/icons/Icons'
import { SITE_NAME } from '@/lib/site'

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-slate-800 dark:bg-slate-950/80 dark:supports-[backdrop-filter]:bg-slate-950/60">
      <Container className="flex h-16 items-center justify-between">
        <Link to="/" className="focus-ring flex items-center gap-2 rounded-md">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <BracesIcon className="h-[18px] w-[18px]" />
          </span>
          <span className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">
            {SITE_NAME}
          </span>
        </Link>

        <nav className="flex items-center gap-4" aria-label="Primary">
          <Link
            to="/"
            className="focus-ring hidden rounded-md text-sm font-medium text-slate-600 hover:text-slate-900 sm:block dark:text-slate-300 dark:hover:text-white"
          >
            All tools
          </Link>
          <ThemeToggle />
        </nav>
      </Container>
    </header>
  )
}
