'use client'

import { useState } from 'react'

export default function TechStack() {
  const [activeTab, setActiveTab] = useState<'software' | 'hardware'>('software')

  const softwareCategories = [
    {
      title: "Languages & Frameworks",
      items: ["C#", "C++", "Python", "JavaScript", "TypeScript", "React", "Next.js", "Django", "Flask"]
    },
    {
      title: "Game Development",
      items: ["Unity Engine", "3D Physics", "Character Controllers", "Shader Graph", "Save/Load Systems"]
    },
    {
      title: "Design & Creative",
      items: ["Adobe Photoshop", "Adobe Illustrator", "Figma", "Canva", "DaVinci Resolve"]
    },
    {
      title: "Development Tools",
      items: ["VS Code", "Git & GitHub", "Vercel", "Node.js", "Playwright"]
    }
  ]

  const hardwareCategories = [
    {
      title: "Core Processing & Graphics",
      items: ["AMD Ryzen 5 7500F Processor", "AMD RX 6750 XT 12GB Graphics Card"]
    },
    {
      title: "Memory & Storage",
      items: ["16GB DDR5 RAM", "256GB NVMe SSD", "2TB HDD Storage"]
    },
    {
      title: "Audio & Camera Gear",
      items: ["Jmary MC-PW12 Microphone", "Cyber Acoustics WC-3000 Camera" ]
    }
  ]

  const activeData = activeTab === 'software' ? softwareCategories : hardwareCategories

  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-light tracking-widest text-gray-900 uppercase mb-2">Tech Stack</h1>
          <p className="text-gray-500">A curated view of the programming languages, software, and hardware I build with.</p>
        </div>

        {/* Interactive Toggle Buttons */}
        <div className="inline-flex bg-gray-100 p-1 rounded-md border border-gray-200">
          <button
            onClick={() => setActiveTab('software')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded transition-all ${
              activeTab === 'software'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Software & Tools
          </button>
          <button
            onClick={() => setActiveTab('hardware')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded transition-all ${
              activeTab === 'hardware'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            PC Specs & Hardware
          </button>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="space-y-12">
        {activeData.map((category, index) => (
          <div key={index} className="border-t border-gray-100 pt-8">
            <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-gray-900 mb-6">
              {category.title}
            </h2>
            <div className="flex flex-wrap gap-3">
              {category.items.map((item, itemIndex) => (
                <span 
                  key={itemIndex}
                  className="bg-white border border-gray-200 text-gray-700 text-xs px-4 py-2 rounded-md shadow-sm"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}