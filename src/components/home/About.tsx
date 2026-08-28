import { SITE_NAME } from '@/lib/site'
import { tools } from '@/lib/tools/toolsData'

export function About() {
  return (
    <section aria-labelledby="about-heading" className="border-t border-slate-200 py-14 dark:border-slate-800">
      <h2 id="about-heading" className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
        What is {SITE_NAME}?
      </h2>
      <div className="mt-4 max-w-3xl space-y-3 text-slate-600 dark:text-slate-400">
        <p>
          {SITE_NAME} is a free online developer toolbox — a growing collection of small, focused utilities for
          everyday development tasks. Instead of installing a CLI or a browser extension for something you need
          twice a month, open the tool you need and use it right away.
        </p>
        <p>
          Every tool runs entirely client-side, in your browser, using JavaScript's own built-in engines rather
          than uploading anything to a server. That means whatever you paste in — JSON, config files, or anything
          else — never leaves your device, and most tools keep working even without an internet connection once
          the page has loaded. There's no account to create and no usage limit to hit.
        </p>
        <p>
          Today {SITE_NAME} covers {tools.length} JSON tools —{' '}
          {tools.map((tool, index) => (
            <span key={tool.slug}>
              {index > 0 && (index === tools.length - 1 ? ', and ' : ', ')}
              <span className="font-medium text-slate-800 dark:text-slate-200">{tool.name}</span>
            </span>
          ))}{' '}
          — with more developer utilities on the way.
        </p>
      </div>
    </section>
  )
}
