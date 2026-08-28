import { ShieldIcon, ZapIcon } from '@/components/icons/Icons'
import { tools } from '@/lib/tools/toolsData'

export function Hero() {
  return (
    <section className="border-b border-slate-200 bg-gradient-to-b from-indigo-50/60 to-transparent dark:border-slate-800 dark:from-indigo-500/5">
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-24 lg:px-8">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-white px-3 py-1 text-xs font-medium text-indigo-700 dark:border-indigo-900 dark:bg-slate-900 dark:text-indigo-300">
          <ShieldIcon className="h-3.5 w-3.5" /> 100% client-side — your data never leaves your browser
        </span>

        <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl dark:text-white">
          Developer tools that just work
        </h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
          Free, fast utilities for everyday development tasks — format JSON, validate data, and more.
          No sign-up, no ads, no server round trip.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <ZapIcon className="h-4 w-4 text-indigo-500" /> Instant, in-browser processing
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldIcon className="h-4 w-4 text-indigo-500" /> Private by design
          </span>
          <span>{tools.length}+ tools and growing</span>
        </div>

        <div className="mt-8">
          <a
            href="#tools"
            className="focus-ring inline-flex items-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
          >
            Browse all tools
          </a>
        </div>
      </div>
    </section>
  )
}
