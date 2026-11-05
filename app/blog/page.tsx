import { createClient } from '@supabase/supabase-js'
import BlogList, { type Article } from './BlogList'

// The blog list, fetched on the server so posts and the first cover are in the page's HTML (on phones
// the cover is the main content, so this makes it appear much sooner). Same order and visibility rules
// as before: the public key respects the database's rules, so drafts and scheduled posts stay hidden.
export default async function BlogPage() {
  let initial: Article[] | null = null
  try {
    const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    const query = (cols: string) => db.from('articles').select(cols).eq('published', true).order('created_at', { ascending: false })
    let { data, error } = await query('id, title, slug, category, excerpt, created_at, feature_image, title_ur, excerpt_ur')
    if (error && /_ur/.test(error.message)) ({ data, error } = await query('id, title, slug, category, excerpt, created_at, feature_image'))
    if (!error) initial = (data as unknown as Article[]) || []
  } catch { /* the list fetches in the browser instead */ }
  return <BlogList initialArticles={initial} day={new Date().getUTCDate()} />
}
