'use client'

export default function TechMarquee() {
  const tools = [
    "Unity 3D",
    "C#",
    "Python",
    "Next.js",
    "TypeScript",
    "Tailwind CSS",
    "Figma",
    "TensorFlow",
    "Node.js",
    "Playwright",
    "Django",
    "React.js"
  ]

  return (
    <div className="py-8 bg-paper border-y border-ink-100 overflow-hidden relative select-none">
      {/* Subtle fade edges for a polished look */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-paper to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-paper to-transparent z-10 pointer-events-none" />

      <div className="animate-marquee flex items-center space-x-12">
        {/* Render the array twice to create a seamless infinite loop effect */}
        {[...tools, ...tools].map((tool, index) => (
          <div 
            key={index} 
            className="flex items-center space-x-3 text-ink-300 font-mono text-xs tracking-[0.2em] uppercase hover:text-accent-600 transition-colors cursor-default group"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-ink-100 group-hover:bg-accent-600 transition-colors" />
            <span>{tool}</span>
          </div>
        ))}
      </div>
    </div>
  )
}