import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Muhammad Qasim Imran — Portfolio',
    short_name: 'MQ Imran',
    description: 'Software Engineer & Graphic Designer',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#aa002a',
    icons: [
      { src: '/icon', sizes: '32x32', type: 'image/png' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  }
}
