'use client'

import { useEffect } from 'react'

export default function ConsoleEasterEgg() {
  useEffect(() => {
    console.log(
      '%c$ cat about-me.txt',
      'color: #aa002a; font-family: monospace; font-size: 14px; font-weight: bold;'
    )
    console.log(
      '%c' +
        'Muhammad Qasim Imran\n' +
        'Software Engineer & Graphic Designer\n' +
        '─────────────────────────────────────\n' +
        'Poking around in here? Good sign.\n' +
        'Resume:  ' + '/resume' + '\n' +
        'Contact: ' + '/contact' + '\n' +
        'Source:  https://github.com/mqasimimran/My-Blog',
      'color: #6b7280; font-family: monospace; font-size: 12px; line-height: 1.6;'
    )
  }, [])

  return null
}
