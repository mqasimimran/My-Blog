'use client'

import { useSyncExternalStore } from 'react'

const signal = 'portfolio-storage'
function subscribe(notify: () => void) {
  window.addEventListener('storage', notify)
  window.addEventListener(signal, notify)
  return () => {
    window.removeEventListener('storage', notify)
    window.removeEventListener(signal, notify)
  }
}

export function useStoredValue(key: string) {
  return useSyncExternalStore(subscribe, () => {
    try { return localStorage.getItem(key) } catch { return null }
  }, () => null)
}

export function storeValue(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
    window.dispatchEvent(new Event(signal))
  } catch { /* Storage can be disabled by the browser. */ }
}
