'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

function ContactForm() {
  const searchParams = useSearchParams()
  const prefillSubject = searchParams.get('subject') || ''
  const prefillMessage = searchParams.get('message') || ''

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus({ type: null, message: '' })

    // Save the form reference BEFORE the await so it doesn't become null
    const form = e.currentTarget
    const formData = new FormData(form)

    // Honeypot — a real visitor never sees or fills this field in; a bot
    // filling out every input on the page will. If it's filled, pretend to
    // succeed without actually sending anything anywhere.
    const honeypot = formData.get('website') as string
    if (honeypot) {
      setSubmitStatus({ type: 'success', message: 'Message sent successfully! I will get back to you soon.' })
      form.reset()
      setIsSubmitting(false)
      return
    }
    
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const subject = formData.get('subject') as string
    const message = formData.get('message') as string

    try {
      const { error } = await supabase.from('messages').insert([
        { name, email, subject, message }
      ])

      if (!error) {
        setSubmitStatus({ type: 'success', message: 'Message sent successfully! I will get back to you soon.' })
        form.reset() // Use the saved reference here

        // Best-effort email notification — if this fails for any reason
        // (missing API key, network issue), the message is still safely
        // saved in Supabase/the admin inbox regardless.
        fetch('/api/notify-message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, subject, message }),
        }).catch((err) => console.error('Email notification failed (message was still saved):', err))
      } else {
        console.error('Supabase Error:', error)
        setSubmitStatus({ type: 'error', message: error.message || 'Something went wrong.' })
      }
    } catch (error: any) {
      console.error('Caught Exception:', error)
      setSubmitStatus({ type: 'error', message: `Error: ${error?.message || 'Check console for details'}` })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center py-20 px-6 font-sans">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side: Contact Information */}
        <div className="w-full md:w-5/12 bg-gray-900 text-white p-10 lg:p-12 flex flex-col justify-between">
          <div>
            <h1 className="text-3xl lg:text-4xl font-light tracking-wide uppercase mb-4">
              Get In Touch
            </h1>
            <p className="text-gray-400 text-sm leading-relaxed mb-10">
              Whether you are a recruiter looking for a software engineer, a founder needing full-stack architecture, or a collaborator for a 3D game project, I'd love to hear from you.
            </p>
            
            <div className="space-y-6">
              <div>
                <span className="block text-[10px] font-mono tracking-widest text-gray-500 uppercase mb-1">Email</span>
                <a href="mailto:m.qasimimran01@gmail.com" className="text-sm hover:text-[#aa002a] transition-colors">
                  m.qasimimran01@gmail.com
                </a>
              </div>
              <div>
                <span className="block text-[10px] font-mono tracking-widest text-gray-500 uppercase mb-1">Location</span>
                <span className="text-sm">Lahore, Pakistan</span>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <span className="block text-[10px] font-mono tracking-widest text-gray-500 uppercase mb-3">Connect</span>
            <div className="flex gap-6 text-xs font-bold tracking-widest uppercase">
              <a href="https://linkedin.com/in/muhammadqasimimran" target="_blank" rel="noopener noreferrer" className="hover:text-[#aa002a] transition-colors">
                LinkedIn
              </a>
              <a href="https://github.com/mqasimimran" target="_blank" rel="noopener noreferrer" className="hover:text-[#aa002a] transition-colors">
                GitHub
              </a>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-7/12 p-10 lg:p-12">
          <form onSubmit={handleSubmit} suppressHydrationWarning className="h-full flex flex-col justify-center space-y-8">

            {/* Honeypot field — hidden from real visitors via CSS, not just "display:none"
                (some bots skip display:none fields), but genuinely off-screen and
                unreachable by tab order so a human never notices or fills it in. */}
            <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }} aria-hidden="true">
              <label htmlFor="website">Leave this field empty</label>
              <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {/* Name Input */}
              <div className="relative">
                <input 
                  type="text" 
                  id="name" 
                  name="name"
                  placeholder=" " 
                  required
                  suppressHydrationWarning
                  className="peer w-full border-b border-gray-200 bg-transparent py-2 text-sm text-gray-900 focus:border-[#aa002a] focus:outline-none transition-colors"
                />
                <label 
                  htmlFor="name" 
                  className="absolute left-0 top-2 -translate-y-5 text-[10px] font-bold tracking-widest text-gray-400 uppercase transition-all peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-xs peer-placeholder-shown:font-normal peer-focus:-translate-y-5 peer-focus:text-[10px] peer-focus:font-bold peer-focus:text-[#aa002a]"
                >
                  Full Name
                </label>
              </div>

              {/* Email Input */}
              <div className="relative">
                <input 
                  type="email" 
                  id="email" 
                  name="email"
                  placeholder=" " 
                  required
                  suppressHydrationWarning
                  className="peer w-full border-b border-gray-200 bg-transparent py-2 text-sm text-gray-900 focus:border-[#aa002a] focus:outline-none transition-colors"
                />
                <label 
                  htmlFor="email" 
                  className="absolute left-0 top-2 -translate-y-5 text-[10px] font-bold tracking-widest text-gray-400 uppercase transition-all peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-xs peer-placeholder-shown:font-normal peer-focus:-translate-y-5 peer-focus:text-[10px] peer-focus:font-bold peer-focus:text-[#aa002a]"
                >
                  Email Address
                </label>
              </div>
            </div>

            {/* Subject Input */}
            <div className="relative mt-8">
              <input 
                type="text" 
                id="subject" 
                name="subject"
                placeholder=" " 
                required
                defaultValue={prefillSubject}
                suppressHydrationWarning
                className="peer w-full border-b border-gray-200 bg-transparent py-2 text-sm text-gray-900 focus:border-[#aa002a] focus:outline-none transition-colors"
              />
              <label 
                htmlFor="subject" 
                className="absolute left-0 top-2 -translate-y-5 text-[10px] font-bold tracking-widest text-gray-400 uppercase transition-all peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-xs peer-placeholder-shown:font-normal peer-focus:-translate-y-5 peer-focus:text-[10px] peer-focus:font-bold peer-focus:text-[#aa002a]"
              >
                Subject / Inquiry Type
              </label>
            </div>

            {/* Message Input */}
            <div className="relative mt-8">
              <textarea 
                id="message" 
                name="message"
                placeholder=" " 
                rows={4}
                required
                defaultValue={prefillMessage}
                suppressHydrationWarning
                className="peer w-full border-b border-gray-200 bg-transparent py-2 text-sm text-gray-900 focus:border-[#aa002a] focus:outline-none transition-colors resize-none"
              ></textarea>
              <label 
                htmlFor="message" 
                className="absolute left-0 top-2 -translate-y-5 text-[10px] font-bold tracking-widest text-gray-400 uppercase transition-all peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-xs peer-placeholder-shown:font-normal peer-focus:-translate-y-5 peer-focus:text-[10px] peer-focus:font-bold peer-focus:text-[#aa002a]"
              >
                Your Message
              </label>
            </div>

            {/* Submit Button & Status Message */}
            <div className="pt-4 flex flex-col items-start gap-4">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-gray-900 text-white text-xs font-bold tracking-[0.2em] uppercase px-8 py-4 rounded hover:bg-[#aa002a] transition-colors flex items-center gap-2 disabled:opacity-70"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'} <span>↗</span>
              </button>

              {/* Success / Error Feedback */}
              {submitStatus.type && (
                <p className={`text-xs font-medium tracking-wide ${
                  submitStatus.type === 'success' ? 'text-green-600' : 'text-[#aa002a]'
                }`}>
                  {submitStatus.message}
                </p>
              )}
            </div>
            
          </form>
        </div>
        
      </div>
    </main>
  )
}

export default function ContactPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-gray-400 text-xs font-mono uppercase tracking-widest">Loading...</p>
      </main>
    }>
      <ContactForm />
    </Suspense>
  )
}