export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-white flex items-center">
      <div className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        <div className="space-y-8">
          <h1 className="text-5xl lg:text-7xl font-light tracking-wide text-gray-900 uppercase">
            About Me
          </h1>
          
          <div className="space-y-6 text-gray-500 leading-relaxed max-w-lg">
            <p>
              I am a Software Engineer and Graphic Designer bridging the gap between highly functional code and minimalist aesthetic design. Currently pursuing a BS in Computer Science, my focus lies in crafting seamless digital experiences.
            </p>
            <p>
              From engineering robust game mechanics in Unity and building scalable web architecture with Next.js, to designing complete brand identities utilizing the Adobe Suite, I thrive at the intersection of logic and creativity.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-bold tracking-[0.2em] text-gray-800 uppercase pt-4">
            <a href="https://youtube.com/@qasimdevelops" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">YouTube</a>
            <span className="text-gray-300">/</span>
            <a href="https://linkedin.com/in/your-profile" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">LinkedIn</a>
            <span className="text-gray-300">/</span>
            <a href="https://instagram.com/muhammadqasimimran" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">IG: Personal</a>
            <span className="text-gray-300">/</span>
            <a href="https://instagram.com/qasimdevelops" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">IG: Dev</a>
            <span className="text-gray-300">/</span>
            <a href="https://muhammadqasimimran1.myportfolio.com/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">Portfolio</a>
          </div>
        </div>

        <div className="relative h-[600px] w-full rounded-lg overflow-hidden shadow-2xl">
          <img 
            src="/profile.jpg" 
            alt="Portrait" 
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        </div>

      </div>
    </div>
  )
}