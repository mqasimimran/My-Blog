// Turns one brand colour into the full set of accent shades the site uses, for light and dark mode,
// and picks readable text for buttons in that colour. Used by the live picker in /admin/settings and
// by the layout, which applies the saved colour site-wide.
export const HEX = /^#[0-9a-fA-F]{6}$/

const toRgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
const toHex = (rgb: number[]) => '#' + rgb.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('')
const mix = (a: string, b: string, t: number) => {
  const x = toRgb(a), y = toRgb(b)
  return toHex(x.map((v, i) => v + (y[i] - v) * t))
}
const luminance = (hex: string) => {
  const [r, g, b] = toRgb(hex).map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((m, n) => n - m)
  return (hi + 0.05) / (lo + 0.05)
}

export function accentVars(hex: string, dark: boolean): Record<string, string> | null {
  if (!HEX.test(hex)) return null
  if (!dark) {
    const c600 = hex
    return {
      '--color-accent-50': mix(hex, '#efeeea', 0.9),
      '--color-accent-600': c600,
      '--color-accent-700': mix(hex, '#000000', 0.18),
      '--color-on-accent': contrast(c600, '#ffffff') >= 4.5 ? '#ffffff' : '#111110',
    }
  }
  const d600 = mix(hex, '#ffffff', 0.28)
  return {
    '--color-accent-50': mix(hex, '#0f0f0e', 0.82),
    '--color-accent-600': d600,
    '--color-accent-700': mix(hex, '#ffffff', 0.45),
    '--color-on-accent': contrast(d600, '#0f0f0e') >= 4.5 ? '#0f0f0e' : '#ffffff',
  }
}

/** CSS for the saved accent colour, or null if it isn't a valid #rrggbb colour. */
export function accentCss(hex: string): string | null {
  const light = accentVars(hex, false)
  const dark = accentVars(hex, true)
  if (!light || !dark) return null
  const decl = (v: Record<string, string>) => Object.entries(v).map(([k, val]) => `${k}:${val}`).join(';')
  return `:root{${decl(light)}}.dark{${decl(dark)}}`
}
