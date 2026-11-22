import { socialProfile } from '@/lib/clientSocialLinks'

export default function ClientLinks({name, website, socials}: {name: string; website?: string | null; socials?: string[] | null}) {
  const profiles = (socials || []).map(socialProfile).filter(profile => profile !== null)
  if (!website && !profiles.length) return null
  return <div className="mt-4 flex flex-wrap gap-x-5 gap-y-3">
    {website && <a href={website} target="_blank" rel="noopener noreferrer" className="link-draw text-sm">Visit {name} &rarr;</a>}
    {profiles.map(profile => <a key={profile.href} href={profile.href} target="_blank" rel="noopener noreferrer"
      aria-label={profile.label + ' — ' + name} className="link-draw text-sm">{profile.label} &rarr;</a>)}
  </div>
}
