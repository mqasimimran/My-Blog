// The site's AI calls (assistant, Urdu drafts...). Uses whichever key is set:
//   GEMINI_API_KEY (free tier) or ANTHROPIC_API_KEY (used if both are set).
export type Provider = 'anthropic' | 'gemini'
export const provider = (): Provider | null => (process.env.ANTHROPIC_API_KEY ? 'anthropic' : process.env.GEMINI_API_KEY ? 'gemini' : null)


// Sends the conversation to whichever provider is configured; returns the reply text.
export async function complete(system: string, messages: { role: 'user' | 'assistant'; content: string }[], maxTokens = 1024): Promise<string> {
  if (provider() === 'anthropic') {
    const res = await fetch(`${process.env.ANTHROPIC_API_URL || 'https://api.anthropic.com'}/v1/messages`, {
      method: 'POST',
      headers: { 'x-api-key': process.env.ANTHROPIC_API_KEY!, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: process.env.ASSISTANT_MODEL || 'claude-haiku-5-5', max_tokens: Math.min(maxTokens, 8192), system, messages }),
    })
    if (!res.ok) throw new AssistantError(res.status, 'Claude', await res.text())
    const data = await res.json()
    return (data.content || []).filter((b: any) => b.type === 'text').map((b: any) => b.text).join('\n').trim()
  }
  const callGemini = (model: string) =>
    fetch(`${process.env.GEMINI_API_URL || 'https://generativelanguage.googleapis.com'}/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'x-goog-api-key': process.env.GEMINI_API_KEY!.trim(), 'content-type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: messages.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
        // Room for the model's internal "thinking" as well as the short answer itself.
        generationConfig: { maxOutputTokens: maxTokens, temperature: 0.3 },
      }),
    })
  // Gemini Flash (smarter) first; if it's busy, over the free limit or unavailable, fall back to
  // Flash-Lite (higher free limits). Setting GEMINI_MODEL uses only that model.
  const models = process.env.GEMINI_MODEL ? [process.env.GEMINI_MODEL] : ['gemini-flash-latest', 'gemini-3.1-flash-lite', 'gemini-flash-lite-latest']
  let res = await callGemini(models[0])
  for (const next of models.slice(1)) {
    if (![404, 429, 500, 503].includes(res.status)) break
    res = await callGemini(next)
  }
  if (!res.ok) throw new AssistantError(res.status, 'Gemini', await res.text())
  const data = await res.json()
  return (data.candidates?.[0]?.content?.parts || []).filter((part: any) => !part.thought).map((part: any) => part.text || '').join('').trim()
}

// A provider error with Google's or Anthropic's own explanation, kept for the logs (and, while
// developing locally, shown in the chat so the problem is obvious).
export class AssistantError extends Error {
  constructor(public status: number, provider: string, body: string) {
    let reason = body.slice(0, 300)
    try { reason = JSON.parse(body)?.error?.message || reason } catch {}
    super(`${provider} ${status}: ${reason}`)
  }
}
