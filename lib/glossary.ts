// Term explainers: the first time a term appears in a blog post, readers can hover (or tap) it for a
// one-line definition. Add your own terms here; matching ignores capitals. Longer terms win.
export const GLOSSARY: { term: string; definition: string }[] = [
  { term: 'neural network', definition: 'A model made of layers of simple connected units that learns patterns from examples.' },
  { term: 'CNN', definition: 'Convolutional neural network: a neural network that scans images in small patches to find patterns like edges and shapes.' },
  { term: 'gradient descent', definition: 'How a model learns: it repeatedly nudges its settings in the direction that reduces its errors.' },
  { term: 'overfitting', definition: 'When a model memorises its training examples so closely that it does worse on new data.' },
  { term: 'training data', definition: 'The examples a model learns from.' },
  { term: 'machine learning', definition: 'Teaching computers to learn patterns from data instead of following hand-written rules.' },
  { term: 'API', definition: 'Application programming interface: a defined way for one program to ask another for data or actions.' },
  { term: 'database', definition: 'Organised storage for data that programs can search and update.' },
  { term: 'frontend', definition: 'The part of an app people see and use in the browser.' },
  { term: 'backend', definition: 'The server side of an app: data, logic and security behind the scenes.' },
  { term: 'Unity', definition: 'A popular engine for making 2D and 3D games.' },
  { term: 'UI/UX', definition: 'User interface (what people see) and user experience (how using it feels).' },
]

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** Wraps the first appearance of each glossary term in post HTML (never inside code, links or headings). */
export function addTermExplainers(html: string): string {
  if (!html) return html
  const terms = [...GLOSSARY].sort((a, b) => b.term.length - a.term.length)
  const used = new Set<string>()
  const parts = html.split(/(<[^>]+>)/)
  let skip = 0
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    if (part.startsWith('<')) {
      const m = /^<(\/?)(code|pre|a|h1|h2|h3|h4|h5|h6|button|script|style)\b/i.exec(part)
      if (m) skip += m[1] ? -1 : 1
      continue
    }
    if (skip > 0 || !part.trim()) continue
    let text = part
    for (const { term, definition } of terms) {
      if (used.has(term)) continue
      const re = new RegExp(`\\b(${term.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')})\\b`, 'i')
      const m = re.exec(text)
      if (!m) continue
      used.add(term)
      text = text.slice(0, m.index) + `<span class="term" tabindex="0">${m[1]}<span class="term-tip" role="tooltip">${escape(definition)}</span></span>` + text.slice(m.index + m[1].length)
      break // one term per text piece keeps the HTML simple
    }
    parts[i] = text
  }
  return parts.join('')
}
