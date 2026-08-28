import { useEffect } from 'react'

export interface Hotkey {
  /** e.g. "mod+enter", "mod+shift+m". "mod" means Ctrl on Windows/Linux, Cmd on macOS. */
  combo: string
  handler: () => void
  /** Skip when focus is inside a text input/textarea (default: false — most of our shortcuts are meant to work while editing). */
  disabled?: boolean
}

function matches(event: KeyboardEvent, combo: string): boolean {
  const parts = combo.toLowerCase().split('+')
  const key = parts[parts.length - 1]
  const needsMod = parts.includes('mod')
  const needsShift = parts.includes('shift')
  const needsAlt = parts.includes('alt')

  const mod = event.ctrlKey || event.metaKey
  if (needsMod !== mod) return false
  if (needsShift !== event.shiftKey) return false
  if (needsAlt !== event.altKey) return false

  return event.key.toLowerCase() === key
}

/** Registers global keyboard shortcuts for the lifetime of the component. */
export function useHotkeys(hotkeys: Hotkey[]) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      for (const hotkey of hotkeys) {
        if (hotkey.disabled) continue
        if (matches(event, hotkey.combo)) {
          event.preventDefault()
          hotkey.handler()
          return
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })
}
