'use client'

import { useSyncExternalStore } from 'react'

const KEY = 'portfolio-design-brief'
const EVENT = 'portfolio-brief-change'
export const MAX_BRIEF_ITEMS = 12
const UUID = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i
let memory = '[]'
let storageBlocked = false

function snapshot() {
  if (storageBlocked) return memory
  try { return localStorage.getItem(KEY) || '[]' } catch { return memory }
}
function subscribe(listener: () => void) {
  window.addEventListener(EVENT, listener)
  window.addEventListener('storage', listener)
  return () => {
    window.removeEventListener(EVENT, listener)
    window.removeEventListener('storage', listener)
  }
}
function parse(value: string): string[] {
  try {
    const ids: unknown = JSON.parse(value)
    if (!Array.isArray(ids)) return []
    return [...new Set(ids.filter((id): id is string => typeof id === 'string' && UUID.test(id)))].slice(0, MAX_BRIEF_ITEMS)
  } catch { return [] }
}
export function useDesignBrief() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => '[]')
  const ids = parse(raw)
  function toggle(id: string) {
    if (!UUID.test(id)) return
    const current = parse(snapshot())
    const updated = current.includes(id) ? current.filter(item => item !== id) : [...current, id].slice(0, MAX_BRIEF_ITEMS)
    memory = JSON.stringify(updated)
    try { localStorage.setItem(KEY, memory) } catch { storageBlocked = true }
    window.dispatchEvent(new Event(EVENT))
  }
  return { ids, toggle }
}
