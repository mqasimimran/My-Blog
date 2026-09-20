import { supabase } from '@/lib/supabase'

const SITE_URL = 'https://muhammadqasimimran.vercel.app'

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  const { data: articles } = await supabase
    .from('articles')
    .select('title, slug, excerpt, category, created_at')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(30)

  const items = (articles || [])
    .map((article) => {
      const url = `${SITE_URL}/blog/${article.slug}`
      return `
    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(article.created_at).toUTCString()}</pubDate>
      <category>${escapeXml(article.category || 'Blog')}</category>
      <description>${escapeXml(article.excerpt || '')}</description>
    </item>`
    })
    .join('')

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Muhammad Qasim Imran — Blog</title>
    <link>${SITE_URL}/blog</link>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <description>Writing on engineering, design, productivity, and the journey behind the projects.</description>
    <language>en-us</language>${items}
  </channel>
</rss>`

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  })
}
