'use client'

import { useState } from 'react'

export default function TechStackPage() {
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null)

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
    <div className="max-w-5xl mx-auto px-6 py-16 md:py-20">
      <div className="mb-12">
        <h1 className="text-4xl font-light tracking-widest text-gray-900 uppercase mb-2">Tech Stack & Hardware</h1>
        <p className="text-gray-500 text-sm sm:text-base">
          Hover over any hardware component or software tool to see how it powers my development and creative workflows.
        </p>
      </div>

      <div className="space-y-16">
        {techCategories.map((group, groupIdx) => (
          <div key={groupIdx}>
            <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-gray-900 mb-6 border-b border-gray-100 pb-3">
              {group.category}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {group.items.map((tool, itemIdx) => {
                const uniqueKey = groupIdx * 100 + itemIdx
                const isHovered = activeTooltip === uniqueKey

                return (
                  <div
                    key={itemIdx}
                    onMouseEnter={() => setActiveTooltip(uniqueKey)}
                    onMouseLeave={() => setActiveTooltip(null)}
                    className="relative bg-white border border-gray-200 p-6 rounded-md shadow-sm hover:border-[#aa002a] transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-base font-medium text-gray-900 group-hover:text-[#aa002a] transition-colors">
                          {tool.name}
                        </h3>
                        <span className="text-[10px] font-mono tracking-wider uppercase bg-gray-100 group-hover:bg-[#aa002a] group-hover:text-white px-2 py-1 rounded transition-colors">
                          {tool.role}
                        </span>
                      </div>
                    </div>

                    {/* Interactive Tooltip Reveal Area */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-600 leading-relaxed">
                        <span className="font-semibold text-gray-900">Workflow Usage: </span>
                        {tool.usage}
                      </p>
                    </div>

                  
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}