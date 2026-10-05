import sanitizeHtml from 'sanitize-html'

// Article and project bodies are rendered as raw HTML. They're written by
// you, but if your admin session were ever compromised — or you pasted
// content copied from a web page — a <script> or onerror= handler stored
// in a post would run for every visitor. Sanitizing at WRITE time (in the
// admin API) means whatever reaches the database is already safe,
// regardless of which page renders it.
const YOUTUBE_ONLY = ['www.youtube.com', 'youtube.com', 'www.youtube-nocookie.com', 'player.vimeo.com']

export function sanitizeRichHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      'p', 'br', 'hr', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'strong', 'b', 'em', 'i', 'u', 's', 'del', 'mark', 'sub', 'sup',
      'code', 'pre', 'blockquote', 'ul', 'ol', 'li',
      'a', 'img', 'figure', 'figcaption',
      'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
      'div', 'span', 'iframe',
    ],
    allowedAttributes: {
      a: ['href', 'name', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
      iframe: ['src', 'width', 'height', 'title', 'allow', 'allowfullscreen', 'frameborder'],
      td: ['colspan', 'rowspan'], th: ['colspan', 'rowspan'],
      '*': ['class', 'id', 'style'],
    },
    allowedStyles: { '*': { 'text-align': [/^(left|right|center|justify)$/] } },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesByTag: { img: ['http', 'https'] },
    allowedIframeHostnames: YOUTUBE_ONLY,
    transformTags: {
      // Links that open a new tab must not hand that tab control of this one.
      a: (tagName, attribs) => {
        const out = { ...attribs }
        if (out.target === '_blank') out.rel = 'noopener noreferrer'
        return { tagName, attribs: out }
      },
    },
  })
}
