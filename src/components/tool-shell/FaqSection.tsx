import type { ToolFaq } from '@/lib/tools/types'

export function FaqSection({ faqs }: { faqs: ToolFaq[] }) {
  if (faqs.length === 0) return null

  return (
    <section aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="text-xl font-semibold text-slate-900 dark:text-white">
        Frequently asked questions
      </h2>
      <div className="mt-4 divide-y divide-slate-200 rounded-xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
        {faqs.map((faq) => (
          <details key={faq.question} className="group p-4 open:pb-4 [&_summary::-webkit-details-marker]:hidden">
            <summary className="focus-ring flex cursor-pointer list-none items-center justify-between gap-4 rounded-md text-sm font-medium text-slate-800 dark:text-slate-100">
              {faq.question}
              <span className="shrink-0 text-slate-400 transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-2.5 text-sm text-slate-600 dark:text-slate-400">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
