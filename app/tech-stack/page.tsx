'use client'
import SplitText from '@/app/components/ui/SplitText'


export default function TechStackPage() {
  const techCategories = [
    {
      category: "Hardware & Performance Workstation",
      items: [
        {
          name: "AMD Ryzen 5 7500F & RX 6750 XT",
          role: "Primary Rig",
          usage: "Handles heavy multi-threaded C# compilation, real-time lighting bakes in Unity 3D, and high-resolution graphic design workflows across Adobe Illustrator and Photoshop without frame drops."
        },
        {
          name: "Jmary MC-PW12 Microphone",
          role: "Audio Capture",
          usage: "Used for recording clear audio narration and voiceovers for tutorials published on the QasimDevelops YouTube channel."
        },
        {
          name: "Cyber Acoustics WC-3000 Webcam",
          role: "Video & Streaming",
          usage: "Powers video communication, live sessions, and collaborative virtual meetings."
        }
      ]
    },
    {
      category: "Game Development & Software Engineering",
      items: [
        {
          name: "Unity 3D & C#",
          role: "Game Engine",
          usage: "Engineered complex mechanics, custom inventory systems, and save/load logic for projects like 'Hospital of the Damned' and physics-driven simulations."
        },
        {
          name: "Next.js & TypeScript",
          role: "Web Architecture",
          usage: "Powers this high-performance portfolio, ensuring fast server-side rendering, smooth MDX blog integration, and strict type safety."
        },
        {
          name: "Python & TensorFlow",
          role: "AI & Machine Learning",
          usage: "Applied in building deep learning tools like the Brain Tumor MRI Classifier and backend logic for the bilingual AI Urdu Teaching Assistant."
        },
        {
          name: "Node.js & Playwright",
          role: "Automation",
          usage: "Utilized for script-driven browser task execution, web scraping, and automated content distribution tools like the LinkedIn Automator."
        }
      ]
    },
    {
      category: "Visual Design & Creative Branding",
      items: [
        {
          name: "Adobe Illustrator & Photoshop",
          role: "Vector & Raster Graphics",
          usage: "Employed during graphic design leadership roles (such as for TEDxUMTLahore) to build crisp brand identities, promotional assets, and UI components."
        },
        {
          name: "Figma",
          role: "UI/UX Prototyping",
          usage: "Used to blueprint modern application layouts, wireframes, and design systems for mobile and web apps like NovaPay."
        }
      ]
    }
  ]

  return (
    <main className="pb-24">
      <header className="container-page pb-12 pt-12 md:pb-16 md:pt-20">
        <h1 className="type-display max-w-[16ch] text-ink-900"><SplitText text={"Tech Stack & Hardware"} /></h1>
        <p className="type-lead mt-6 max-w-[52ch]">The hardware and software behind my development and creative work, and what each one is actually used for.</p>
      </header>

      <div className="container-page">
        {techCategories.map((group) => (
          <section key={group.category} className="grid gap-8 border-t border-ink-100 py-14 md:grid-cols-12 md:gap-10 md:py-16">
            <div className="md:col-span-4">
              <h2 className="type-h3 max-w-[18ch] text-ink-900 md:sticky md:top-28">{group.category}</h2>
            </div>
            <ul className="divide-y divide-ink-100 md:col-span-8">
              {group.items.map((tool) => (
                <li key={tool.name} className="py-6 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                    <h3 className="text-lg font-medium tracking-tight text-ink-900">{tool.name}</h3>
                    <span className="type-meta">{tool.role}</span>
                  </div>
                  <p className="mt-3 max-w-[62ch] text-[15px] leading-relaxed text-ink-700">{tool.usage}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  )
}
