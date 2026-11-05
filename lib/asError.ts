export function asError(cause: unknown): Error {
  if (cause instanceof Error) return cause
  if (typeof cause === 'object' && cause && 'message' in cause) return new Error(String(cause.message))
  return new Error(String(cause))
}
