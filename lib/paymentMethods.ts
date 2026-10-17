import { siteConfig } from '@/site.config'

// Shared by server and client code.
export type ManualMethodId = 'jazzcash' | 'easypaisa' | 'bank_transfer' | 'payoneer'
export type ManualMethod = { id: ManualMethodId; label: string; group: string; pkr: boolean }

/** The manual methods this site offers, from site.config.ts */
export const MANUAL_METHODS: readonly ManualMethod[] = siteConfig.payments.manualMethods

export function getManualMethod(id: string): ManualMethod | undefined {
  return MANUAL_METHODS.find((m) => m.id === id)
}

// Labels for every method that has EVER been possible, so old orders still
// read correctly in the admin even after a method is removed from the config.
const DEFAULT_LABELS: Record<string, string> = {
  jazzcash: 'JazzCash',
  easypaisa: 'EasyPaisa',
  bank_transfer: 'Bank Transfer',
  payoneer: 'Payoneer',
}
export function labelFor(id: string): string {
  return getManualMethod(id)?.label || DEFAULT_LABELS[id] || id
}
