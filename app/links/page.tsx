import Link from 'next/link'

export default function Links() {
  return (
    <div className="max-w-md mx-auto px-6 py-20 flex flex-col items-center">
      
      {/* Profile Section */}
      <div className="w-28 h-28 rounded-full mb-6 overflow-hidden shadow-lg border-4 border-white">
         <img 
            src="/profile.jpg" 
            alt="Profile" 
            className="w-full h-full object-cover" 
         />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Muhammad Qasim Imran</h1>
      <p className="text-gray-500 mb-10 text-center font-medium">
        Software Engineer & Graphic Designer
      </p>

      {/* Links Section */}
      <div className="w-full flex flex-col gap-4">
        <a 
          href="https://youtube.com/@qasimdevelops" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-4 px-6 rounded-xl text-center transition-all hover:scale-[1.02] shadow-sm"
        >
          YouTube: qasimdevelops
        </a>
        
        <a 
          href="https://muhammadqasimimran1.myportfolio.com/" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-4 px-6 rounded-xl text-center transition-all hover:scale-[1.02] shadow-sm"
        >
          Visual Design Portfolio
        </a>
        
        <a 
          href="https://instagram.com/muhammadqasimimrann" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-4 px-6 rounded-xl text-center transition-all hover:scale-[1.02] shadow-sm"
        >
          Instagram
        </a>
        
        <Link 
          href="/blog" 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl text-center transition-all hover:scale-[1.02] shadow-md mt-4"
        >
          Read My Articles
        </Link>
      </div>
      
    </div>
  )
}