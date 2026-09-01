import Link from 'next/link'
import fs from 'fs'
import path from 'path'

export default function BlogListing({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  // 1. Capture and format the search query from the URL
  const query = searchParams.q?.toLowerCase() || ''

  // 2. Locate the blog directory on the server
  const blogDir = path.join(process.cwd(), 'app/blog')
  
  let folders: string[] = []
  try {
    folders = fs.readdirSync(blogDir).filter((file) => {
      return fs.statSync(path.join(blogDir, file)).isDirectory()
    })
  } catch (e) {
    folders = []
  }

  // 3. Filter the articles based on the search term
  const articles = folders
    .filter((folder) => !folder.startsWith('['))
    .filter((folder) => {
      if (!query) return true // If no search query is active, show everything
      const readableTitle = folder.split('-').join(' ').toLowerCase()
      return readableTitle.includes(query) 
    })

  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      
      {/* Dynamic Header */}
      <div className="flex items-center justify-between mb-12">
        <h1 className="text-3xl font-light tracking-widest text-gray-900 uppercase">
          {query ? `Results for "${searchParams.q}"` : 'All Articles'}
        </h1>
        {query && (
          <Link href="/blog" className="text-xs font-bold tracking-[0.1em] text-gray-400 hover:text-[#d9534f] uppercase transition-colors">
            Clear Search ✕
          </Link>
        )}
      </div>
      
      {/* Search Results Display */}
      {articles.length === 0 ? (
        <div className="text-gray-500 py-10 border-t border-gray-100">
          No articles found matching your criteria.
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {articles.map((slug) => (
            <Link 
              key={slug}
              href={`/blog/${slug}`}
              className="group block p-8 bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all"
            >
              <h2 className="text-xl font-bold text-gray-900 group-hover:text-[#d9534f] transition-colors capitalize mb-3 tracking-wide">
                {slug.split('-').join(' ')}
              </h2>
              <p className="text-gray-400 text-[10px] font-bold tracking-[0.2em] uppercase flex items-center gap-2">
                Read Article 
                <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </p>
            </Link>
          ))}
        </div>
      )}
      
    </div>
  )
}