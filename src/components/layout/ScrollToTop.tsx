import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Resets scroll position on route changes, but leaves in-page #hash links (e.g. "#tools") alone. */
export function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) return
    window.scrollTo(0, 0)
  }, [pathname, hash])

  return null
}
