import { Link } from 'react-router-dom'
import { Container } from './Container'
import { ShieldIcon } from '@/components/icons/Icons'
import { tools } from '@/lib/tools/toolsData'
import { SITE_NAME, SITE_TAGLINE } from '@/lib/site'

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <Container className="grid gap-10 py-12 sm:grid-cols-3">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{SITE_NAME}</p>
          <p className="mt-2 max-w-xs text-sm text-slate-500 dark:text-slate-400">{SITE_TAGLINE}.</p>
          <p className="mt-4 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <ShieldIcon className="h-4 w-4 shrink-0 text-indigo-500" />
            All processing happens in your browser. Nothing you paste is ever uploaded.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Tools</p>
          <ul className="mt-3 space-y-2">
            {tools.map((tool) => (
              <li key={tool.slug}>
                <Link
                  to={`/tools/${tool.slug}/`}
                  className="focus-ring rounded text-sm text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
                >
                  {tool.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Site</p>
          <ul className="mt-3 space-y-2">
            <li>
              <Link
                to="/"
                className="focus-ring rounded text-sm text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
              >
                All tools
              </Link>
            </li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-slate-200 py-6 dark:border-slate-800">
        <Container>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            &copy; {new Date().getFullYear()} {SITE_NAME}. Free to use, no account required.
          </p>
        </Container>
      </div>
    </footer>
  )
}
