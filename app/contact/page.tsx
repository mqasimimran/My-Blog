"use client"

import { useState } from "react"

export default function Contact() {
  const [status, setStatus] = useState("idle")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus("submitting") // Changes the button text to let you know it clicked
    
    const formData = new FormData(e.currentTarget)
    
    // Replace this string with the actual key you get from Web3Forms.com
    formData.append("access_key", "5e1d89ca-5046-4196-a7a6-9d143c93fcd4")

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      })

      if (response.ok) {
        setStatus("submitted")
      } else {
        setStatus("idle")
        alert("Something went wrong. Please try again.")
      }
    } catch (error) {
      setStatus("idle")
      alert("Network error. Please check your connection.")
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-20 flex flex-col items-center">
      <h1 className="text-4xl font-light tracking-widest text-gray-900 uppercase mb-4">Contact</h1>
      <p className="text-gray-500 mb-10 text-center">Have a project in mind? Let's build something together.</p>

      {status === "submitted" ? (
        <div className="bg-green-50 text-green-800 p-6 rounded-lg text-center w-full border border-green-200 shadow-sm">
          Thank you! Your message has been received. I will be in touch shortly.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="w-full space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input 
              type="text" 
              name="name"
              placeholder="Name" 
              required 
              suppressHydrationWarning 
              className="w-full bg-white border border-gray-200 text-sm p-4 focus:outline-none focus:border-[#d9534f] transition-colors" 
            />
            <input 
              type="email" 
              name="email"
              placeholder="Email" 
              required 
              suppressHydrationWarning 
              className="w-full bg-white border border-gray-200 text-sm p-4 focus:outline-none focus:border-[#d9534f] transition-colors" 
            />
          </div>
          <textarea 
            name="message"
            placeholder="Message" 
            required 
            rows={6} 
            suppressHydrationWarning 
            className="w-full bg-white border border-gray-200 text-sm p-4 focus:outline-none focus:border-[#d9534f] transition-colors resize-none"
          ></textarea>
          
          <button 
            type="submit" 
            disabled={status === "submitting"} 
            className="bg-gray-900 text-white px-8 py-4 text-sm font-bold tracking-[0.15em] uppercase hover:bg-[#d9534f] transition-colors w-full disabled:bg-gray-400"
          >
            {status === "submitting" ? "Sending..." : "Send Message"}
          </button>
        </form>
      )}
    </div>
  )
}