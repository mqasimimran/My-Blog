'use client'

import { useState } from 'react'
import ExperienceTimeline from '@/app/components/ExperienceTimeline'

export default function Resume() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const projects = [
    {
      title: "Bilingual AI Urdu Teaching Assistant (Final Year Project)",
      tech: "Python • Computer Vision • React • Node.js",
      description: "An AI-powered bilingual (Urdu/English) teaching assistant for under-resourced schools in Pakistan. Features facial recognition for student identification, cross-session progress memory, and a 3-portal architecture (Organization, Teacher, and Student with an 'Ask AI' homework helper)."
    },
    {
      title: "Brain Tumor MRI Classifier",
      tech: "Python • TensorFlow • CNN",
      description: "A convolutional neural network (CNN) based 4-class classifier built to accurately distinguish Glioma, Meningioma, Pituitary Tumor, and No Tumor states from MRI medical scans."
    },
    {
      title: "MiniLang++ Compiler (Compiler Construction)",
      tech: "Python • CS3045 Coursework",
      description: "Built a complete compiler front-end—including lexer, parser, and semantic analyzer—strictly optimized to meet professor-set architectural line-count constraints."
    },
    {
      title: "Agentic LinkedIn Automator",
      tech: "Node.js • React.js • Playwright",
      description: "A UI automation agent engineered for browser-based task execution and content distribution workflows."
    },
    {
      title: "NovaPay UI/UX Design",
      tech: "Figma • Mobile & Web",
      description: "Comprehensive end-to-end interface and user experience design for a modern digital finance application spanning multiple screen form factors."
    },
    {
      title: "Hospital of the Damned & Ball Blast",
      tech: "Unity • C# • 3D Physics",
      description: "Shipped indie game projects featuring custom character controllers, inventory management, save/load state mechanics, and physics-driven arcade gameplay."
    }
  ]

  const education = [
    {
      degree: "Bachelor of Science in Computer Science",
      institution: "University of Management and Technology (UMT), Lahore",
      period: "2023 – 2027",
      description: "Focusing on software architecture, algorithms, and advanced object-oriented programming. Attendee and presenter at the AI Summit hosted by IxDF at UCP."
    },
    {
      degree: "Intermediate in Computer Science (ICS)",
      institution: "Punjab Group of Colleges",
      period: "2021 – 2023",
      description: "Built foundational skills in programming, mathematics, and computational logic."
    }
  ]

  const certifications = [
    { title: "Introduction to Game Design", issuer: "Epic Games", date: "Dec 2025", image: "/images/cert-epic.jpg" },
    { title: "QuickStart: From Algorithm Design to Working Prototype", issuer: "HEC Pakistan", date: "Aug 2025", image: "/images/cert-hec-quickstart.jpg" },
    { title: "AI For Everyone", issuer: "DeepLearning.AI (Coursera)", date: "Aug 2025", image: "/images/cert-ai-everyone.jpg" },
    { title: "IoT for Everyone", issuer: "HEC Pakistan", date: "Jul 2025", image: "/images/cert-iot.jpg" },
    { title: "Introduction to Web Development", issuer: "UC Davis (Coursera)", date: "Jul 2025", image: "/images/cert-web-dev.jpg" },
    { title: "JavaScript Bootcamp", issuer: "LetsUpgrade", date: "May 2025", image: "/images/cert-js.jpg" },
    { title: "DSA with Java Bootcamp", issuer: "LetsUpgrade", date: "May 2025", image: "/images/cert-dsa.jpg" },
    { title: "Excel Bootcamp", issuer: "LetsUpgrade", date: "May 2025", image: "/images/cert-excel.jpg" },
    { title: "MOS: PowerPoint Associate", issuer: "Microsoft", date: "Jan 2023", image: "/images/cert-mos-ppt.jpg" },
    { title: "MOS: Word Associate", issuer: "Microsoft", date: "Dec 2022", image: "/images/cert-mos-word.jpg" },
    { title: "Graphic Designing", issuer: "Peak Solutions", date: "Jan 2022", image: "/images/cert-graphic-design.jpg" }
  ]

  return (
    <div className="max-w-4xl mx-auto px-6 py-20 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
        <div>
          <h1 className="text-4xl font-light tracking-widest text-gray-900 uppercase mb-2">Resume</h1>
          <p className="text-gray-500">Computer Science undergraduate, developer, and technical creator.</p>
        </div>
        
        {/* Download CV Button */}
        <a
          href="/resume.pdf"
          download="Muhammad_Qasim_Imran_Resume.pdf"
          className="inline-flex items-center gap-2 bg-gray-900 text-white text-xs font-bold uppercase tracking-[0.15em] px-5 py-3 rounded-md hover:bg-[#d9534f] transition-colors shadow-sm"
        >
          <span>Download CV</span>
          <span>↓</span>
        </a>
      </div>

      {/* Experience Timeline Section */}
      <section className="mb-16">
        <ExperienceTimeline />
      </section>

      {/* Projects Section */}
      <section className="mb-16">
        <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-gray-900 mb-8 border-b border-gray-100 pb-4">
          Key Projects
        </h2>
        <div className="space-y-10">
          {projects.map((item, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-xs font-medium text-[#d9534f] tracking-wider uppercase md:pt-1">
                {item.tech}
              </div>
              <div className="md:col-span-3">
                <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed mt-1">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Education Section */}
      <section className="mb-16">
        <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-gray-900 mb-8 border-b border-gray-100 pb-4">
          Education
        </h2>
        <div className="space-y-10">
          {education.map((item, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-xs font-medium text-gray-400 tracking-wider uppercase md:pt-1">
                {item.period}
              </div>
              <div className="md:col-span-3">
                <h3 className="text-lg font-medium text-gray-900">{item.degree}</h3>
                <p className="text-sm text-gray-500 mb-2">{item.institution}</p>
                <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Certifications Section */}
      <section>
        <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-gray-900 mb-8 border-b border-gray-100 pb-4">
          Licenses & Certifications
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certifications.map((cert, index) => (
            <div 
              key={index} 
              onClick={() => setSelectedImage(cert.image)}
              className="bg-white border border-gray-200 p-4 rounded-md shadow-sm hover:border-gray-400 transition-all flex flex-col justify-between cursor-pointer group"
            >
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="text-sm font-medium text-gray-900 group-hover:text-[#d9534f] transition-colors">
                    {cert.title}
                  </h3>
                  <span className="text-xs text-gray-400 group-hover:text-[#d9534f] transition-colors ml-2 font-mono">View ↗</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{cert.issuer}</p>
              </div>
              <div className="text-[10px] tracking-wider uppercase text-gray-400 mt-4">
                Issued {cert.date}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Lightbox Modal Popup */}
      {selectedImage && (
        <div 
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
        >
          <div className="relative max-w-4xl w-full bg-white p-2 rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white text-xl font-bold hover:text-gray-300"
            >
              ✕ Close
            </button>
            <div className="bg-gray-100 rounded overflow-hidden flex items-center justify-center min-h-[300px] relative">
              <img 
                src={selectedImage} 
                alt="Certificate Credential" 
                className="max-h-[80vh] w-auto object-contain mx-auto rounded"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}