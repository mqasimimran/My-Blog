'use client'

import { useEffect } from 'react'
import { siteConfig } from '@/site.config'

export default function ConsoleEasterEgg() {
  useEffect(() => {
    console.log(
      '%c$ cat about-me.txt',
      `color: ${siteConfig.brand.accent}; font-family: monospace; font-size: 14px; font-weight: bold;`
    )
    console.log(
      '%c' +
        siteConfig.name + '\n' +
        'Software Engineer & Graphic Designer\n' +
        '─────────────────────────────────────\n' +
        'Poking around in here? Good sign.\n' +
        'Resume:  ' + '/resume' + '\n' +
        'Contact: ' + '/contact' + '\n' +
        'Source:  ' + siteConfig.social.repo,
      'color: #6b7280; font-family: monospace; font-size: 12px; line-height: 1.6;'
    )
  }, [])

  return null
}
