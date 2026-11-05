// Next.js calls onRequestError when a page or API route throws on the server. It's recorded and you're
// emailed (at most once an hour per error). See lib/errors.ts and Admin -> Error Reports.
export async function onRequestError(err: unknown, request: { path: string; method: string }, context: { routePath?: string; routeType?: string }) {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { recordError } = await import('./lib/errors')
    const e = err instanceof Error ? err : new Error(String(err))
    await recordError({ source: 'server', message: e.message, url: request.path, detail: `${request.method} ${context.routePath || ''} (${context.routeType || ''})\n${e.stack || ''}` })
  }
}
