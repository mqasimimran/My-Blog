// Display names only: stored titles and public URLs remain stable.
const titles: Record<string, string> = {
  'university-management-system-cpp': 'University Management System',
  'priority-hotel-system-dsa': 'Hotel Priority Management System',
}

export function projectTitle(title: string): string {
  return titles[title.toLowerCase()] || (/\s/.test(title) ? title : title.replace(/[_-]/g, ' ')).trim()
}

export function projectCategory(category: string): string {
  const labels: Record<string, string> = { 'SOFTWARE ENG': 'Software Engineering', 'GAME DEV': 'Game Development', 'WEB APPS': 'Web Applications', 'AI & ML': 'AI & Machine Learning', DESIGN: 'Design' }
  return labels[category.toUpperCase()] || category
}

export function projectMeta(stack: string | null, category: string): string {
  return [...(stack || '').split(/[,•·]/).map(s => s.trim()).filter(Boolean), projectCategory(category)].join(' · ')
}
