// Writes a new site.config.ts from the setup wizard's answers by changing ONLY the identity values in
// the existing file. Every comment and every other setting (payments, tech stack, helpers...) is kept
// exactly as it is. Values are escaped, so a name like O'Brien can't break the file.
const STR = String.raw`'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"|` + '`(?:[^`\\\\]|\\\\.)*`'

export const tsString = (v: string) => `'${v.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\r?\n/g, ' ').trim()}'`

export type SetupValues = {
  name: string; firstName: string; initials: string; shortName: string; jobTitle: string; location: string
  skillsLine: string; description: string; url: string; email: string; whatsapp: string
  youtube: string; linkedin: string; github: string; instagramPersonal: string; instagramDev: string
  tagline: string; roles: string[]; bio: string[]; contactIntro: string; accent: string; phone: string
  youtubeChannelId: string; adminUsername: string; adminEmail: string
}

// The text range of `  key: { ... }` (or the top of the config object when key is null).
function region(src: string, key: string | null): [number, number] {
  if (key === null) {
    const start = src.indexOf('export const siteConfig = {')
    const end = src.indexOf('\n  mail: {')
    if (start < 0 || end < 0) throw new Error('Could not find the top of siteConfig')
    return [start, end]
  }
  const start = src.indexOf(`\n  ${key}: {`)
  if (start < 0) throw new Error(`Could not find the "${key}" section`)
  let depth = 0
  for (let i = src.indexOf('{', start); i < src.length; i++) {
    if (src[i] === '{') depth++
    else if (src[i] === '}' && --depth === 0) return [start, i]
  }
  throw new Error(`Unclosed "${key}" section`)
}

function setField(src: string, key: string | null, field: string, value: string): string {
  const [a, b] = region(src, key)
  const part = src.slice(a, b)
  const re = new RegExp(`(\\n\\s+${field}:\\s*(?:\\n\\s*)?)(${STR})`)
  if (!re.test(part)) throw new Error(`Could not find ${key ? key + '.' : ''}${field}`)
  return src.slice(0, a) + part.replace(re, (_m, pre) => pre + tsString(value)) + src.slice(b)
}

function setArray(src: string, key: string, field: string, values: string[]): string {
  const [a, b] = region(src, key)
  const part = src.slice(a, b)
  const re = new RegExp(`(\\n(\\s+)${field}: \\[)((?:\\s|,|${STR})*)(\\])`)
  const m = part.match(re)
  if (!m) throw new Error(`Could not find ${key}.${field}`)
  const indent = m[2]
  const body = values.length ? '\n' + values.map((v) => `${indent}  ${tsString(v)},`).join('\n') + `\n${indent}` : ''
  return src.slice(0, a) + part.replace(re, (_x, open) => open + body + ']') + src.slice(b)
}

function setConst(src: string, name: string, value: string): string {
  const re = new RegExp(`^const ${name} = (${STR})$`, 'm')
  if (!re.test(src)) throw new Error(`Could not find const ${name}`)
  return src.replace(re, `const ${name} = ${tsString(value)}`)
}

export function writeConfig(src: string, v: SetupValues): string {
  const host = v.url.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '')
  let out = src
  out = setConst(out, 'name', v.name)
  out = setConst(out, 'firstName', v.firstName)
  out = setConst(out, 'mailDomain', host)
  for (const f of ['initials', 'shortName', 'jobTitle', 'location', 'skillsLine', 'description', 'email'] as const) out = setField(out, null, f, v[f])
  const urlRe = new RegExp(`(process\\.env\\.NEXT_PUBLIC_SITE_URL \\|\\| )(${STR})`)
  if (!urlRe.test(out)) throw new Error('Could not find the site URL')
  out = out.replace(urlRe, (_m, pre) => pre + tsString(v.url.replace(/\/+$/, '')))
  out = setField(out, 'whatsapp', 'number', v.whatsapp)
  for (const f of ['youtube', 'linkedin', 'github', 'instagramPersonal', 'instagramDev'] as const) out = setField(out, 'social', f, v[f])
  out = setField(out, 'social', 'youtubeHandle', v.youtube.match(/@([\w.-]+)/)?.[1] || '')
  out = setField(out, 'hero', 'tagline', v.tagline)
  out = setArray(out, 'hero', 'roles', v.roles)
  out = setArray(out, 'hero', 'bio', v.bio)
  out = setField(out, 'contact', 'intro', v.contactIntro)
  out = setField(out, 'brand', 'accent', v.accent)
  out = setField(out, 'resume', 'phone', v.phone)
  out = setField(out, 'videos', 'youtubeChannelId', v.youtubeChannelId)
  out = setField(out, 'admin', 'username', v.adminUsername)
  out = setField(out, 'admin', 'email', v.adminEmail)
  return out
}
